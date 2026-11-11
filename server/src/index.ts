import Anthropic from '@anthropic-ai/sdk';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';

import { contextBlock, SYSTEM_PROMPT } from './prompt.ts';
import { parseChatRequest, RateLimiter } from './validate.ts';

// Rush chat backend. Its only jobs: keep the Claude API key off the phone,
// check requests, limit abuse, and pass messages to Claude. It never stores
// or logs what people write.

const PORT = Number(process.env.PORT ?? 8787);
const MODEL = process.env.RUSH_MODEL ?? 'claude-opus-5-5';
const MAX_BODY = 64 * 1024;

const client = new Anthropic(); // reads ANTHROPIC_API_KEY
const perInstall = new RateLimiter(Number(process.env.RUSH_PER_HOUR ?? 30), Number(process.env.RUSH_PER_DAY ?? 120));
const perIp = new RateLimiter(Number(process.env.RUSH_IP_PER_HOUR ?? 120), Number(process.env.RUSH_IP_PER_DAY ?? 600));
setInterval(() => {
  perInstall.sweep();
  perIp.sweep();
}, 3_600_000).unref();

function send(res: ServerResponse, status: number, body: unknown, extra: Record<string, string> = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Cache-Control': 'no-store',
    ...extra,
  });
  res.end(JSON.stringify(body));
}

async function readBody(req: IncomingMessage): Promise<unknown> {
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > MAX_BODY) throw new Error('too_large');
    chunks.push(chunk as Buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

function clientIp(req: IncomingMessage): string {
  const fwd = req.headers['x-forwarded-for'];
  const first = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0]?.trim();
  return first || req.socket.remoteAddress || 'unknown';
}

const FRIENDLY_REFUSAL =
  "I'm not able to help with that one. If this is about your health, try asking in a different way, or speak to a pharmacist or health worker. In an emergency, call 112 or the ambulance on 193.";

async function chat(req: IncomingMessage, res: ServerResponse) {
  let body: unknown;
  try {
    body = await readBody(req);
  } catch (e) {
    return send(res, (e as Error).message === 'too_large' ? 413 : 400, { error: 'Invalid request body.' });
  }
  const parsed = parseChatRequest(body);
  if (!parsed.ok) return send(res, 400, { error: parsed.error });
  const { installId, messages, context } = parsed.value;

  const wait = Math.max(perIp.take(clientIp(req)), perInstall.take(installId));
  if (wait > 0) {
    return send(res, 429, { error: 'You have sent a lot of messages. Please wait a little and try again.', retryAfter: wait }, { 'Retry-After': String(wait) });
  }

  const system: Anthropic.Beta.BetaTextBlockParam[] = [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }];
  const ctx = contextBlock(context);
  if (ctx) system.push({ type: 'text', text: ctx });

  try {
    const response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4000, // replies are deliberately short; the prompt asks for under ~150 words
      output_config: { effort: 'medium' },
      // If Claude declines on safety grounds, the API retries on a suitable
      // fallback model inside the same call.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system,
      messages,
    });

    if (response.stop_reason === 'refusal') return send(res, 200, { reply: FRIENDLY_REFUSAL });
    const reply = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim();
    if (!reply) return send(res, 502, { error: 'Rush could not answer just now. Please try again.' });
    return send(res, 200, { reply, truncated: response.stop_reason === 'max_tokens' });
  } catch (error) {
    // Log the error type only, never the conversation.
    if (error instanceof Anthropic.RateLimitError) {
      console.error('anthropic rate limited');
      return send(res, 503, { error: 'Rush is very busy right now. Please try again in a minute.' });
    }
    if (error instanceof Anthropic.AuthenticationError) {
      console.error('anthropic authentication failed: check ANTHROPIC_API_KEY');
      return send(res, 503, { error: 'Rush chat is not set up correctly yet.' });
    }
    if (error instanceof Anthropic.BadRequestError) {
      console.error(`anthropic bad request: ${error.message.slice(0, 200)}`);
      return send(res, 400, { error: 'Rush could not read that conversation. Please start a new chat.' });
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`anthropic api error ${error.status}`);
      return send(res, 502, { error: 'Rush could not answer just now. Please try again.' });
    }
    console.error('unexpected error', (error as Error).name);
    return send(res, 500, { error: 'Something went wrong. Please try again.' });
  }
}

const server = createServer((req, res) => {
  if (req.method === 'OPTIONS') return send(res, 204, {});
  if (req.method === 'GET' && req.url === '/health') return send(res, 200, { ok: true });
  if (req.method === 'POST' && req.url === '/chat') {
    chat(req, res).catch(() => send(res, 500, { error: 'Something went wrong.' }));
    return;
  }
  send(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => console.log(`rush-server listening on ${PORT} (model ${MODEL})`));

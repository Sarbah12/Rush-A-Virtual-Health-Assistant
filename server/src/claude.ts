import Anthropic from '@anthropic-ai/sdk';

import { contextBlock, SYSTEM_PROMPT } from './prompt.ts';
import type { ChatTurn } from './validate.ts';

export const MODEL = process.env.RUSH_MODEL ?? 'claude-opus-5-5';

export const FRIENDLY_REFUSAL =
  "I'm not able to help with that one. If this is about your health, try asking in a different way, or speak to a pharmacist or health worker. In an emergency, call 112 or the ambulance on 193.";

export type RushReply = { reply: string; truncated: boolean; refused: boolean };

/** The one place Rush calls Claude: used by the server and by the eval script. */
export async function askRush(client: Anthropic, messages: ChatTurn[], context: string): Promise<RushReply> {
  const system: Anthropic.Beta.BetaTextBlockParam[] = [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }];
  const ctx = contextBlock(context);
  if (ctx) system.push({ type: 'text', text: ctx });

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

  if (response.stop_reason === 'refusal') return { reply: FRIENDLY_REFUSAL, truncated: false, refused: true };
  const reply = response.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
  return { reply, truncated: response.stop_reason === 'max_tokens', refused: false };
}

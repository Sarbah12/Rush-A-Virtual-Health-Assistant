// Validates what the Rush app sends. Pure, so it is tested without a network.

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

export type ChatRequest = {
  installId: string;
  messages: ChatTurn[];
  /** Optional health summary the user chose to share (medical ID, recent log). */
  context: string;
};

export const LIMITS = {
  maxMessages: 40,
  maxMessageChars: 4000,
  maxTotalChars: 40_000,
  maxContextChars: 4000,
} as const;

export type Parsed = { ok: true; value: ChatRequest } | { ok: false; error: string };

export function parseChatRequest(body: unknown): Parsed {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Body must be a JSON object.' };
  const o = body as Record<string, unknown>;

  if (typeof o.installId !== 'string' || !/^[A-Za-z0-9_-]{8,64}$/.test(o.installId)) {
    return { ok: false, error: 'Missing or invalid installId.' };
  }
  if (!Array.isArray(o.messages) || o.messages.length === 0) return { ok: false, error: 'messages must be a non-empty array.' };
  if (o.messages.length > LIMITS.maxMessages) return { ok: false, error: `At most ${LIMITS.maxMessages} messages.` };

  const messages: ChatTurn[] = [];
  let total = 0;
  for (const m of o.messages) {
    if (!m || typeof m !== 'object') return { ok: false, error: 'Each message must be an object.' };
    const mm = m as Record<string, unknown>;
    if (mm.role !== 'user' && mm.role !== 'assistant') return { ok: false, error: 'role must be user or assistant.' };
    if (typeof mm.content !== 'string' || mm.content.trim() === '') return { ok: false, error: 'content must be non-empty text.' };
    if (mm.content.length > LIMITS.maxMessageChars) return { ok: false, error: 'A message is too long.' };
    total += mm.content.length;
    messages.push({ role: mm.role, content: mm.content });
  }
  if (total > LIMITS.maxTotalChars) return { ok: false, error: 'Conversation is too long. Start a new chat.' };
  if (messages[0].role !== 'user') return { ok: false, error: 'The first message must be from the user.' };
  if (messages[messages.length - 1].role !== 'user') return { ok: false, error: 'The last message must be from the user.' };

  const context = typeof o.context === 'string' ? o.context.slice(0, LIMITS.maxContextChars) : '';
  return { ok: true, value: { installId: o.installId, messages, context } };
}

/** Sliding-window limiter kept in memory. Good enough for one small instance. */
export class RateLimiter {
  private hits = new Map<string, number[]>();
  private perHour: number;
  private perDay: number;
  constructor(perHour: number, perDay: number) {
    this.perHour = perHour;
    this.perDay = perDay;
  }

  /** Returns seconds to wait, or 0 if allowed (and records the hit). */
  take(key: string, now = Date.now()): number {
    const day = 86_400_000;
    const list = (this.hits.get(key) ?? []).filter((t) => now - t < day);
    const lastHour = list.filter((t) => now - t < 3_600_000);
    if (list.length >= this.perDay) return Math.ceil((list[0] + day - now) / 1000);
    if (lastHour.length >= this.perHour) return Math.ceil((lastHour[0] + 3_600_000 - now) / 1000);
    list.push(now);
    this.hits.set(key, list);
    return 0;
  }

  /** Drops keys with no recent hits so memory stays bounded. */
  sweep(now = Date.now()) {
    for (const [k, list] of this.hits) {
      if (list.every((t) => now - t >= 86_400_000)) this.hits.delete(k);
    }
  }
}

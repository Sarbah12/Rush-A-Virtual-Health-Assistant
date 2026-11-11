import { useState } from 'react';

import { useAppState } from './app-state';
import { buildContext, EMERGENCY_REPLY, EMPTY_CHAT, parseChat, SELF_HARM_REPLY, toApiMessages, type ChatMessage, type ChatState } from './chat';
import { scan } from './safety';
import { newId, readJson, usePersisted, writeJson } from './store';
import { useHealthLog } from './use-health-log';
import { useMeds } from './use-meds';

export const CHAT_KEY = 'rush.chat';
const INSTALL_KEY = 'rush.installId';

/** The Rush server URL, set at build time. Empty means chat is not connected. */
export const CHAT_API_URL = (process.env.EXPO_PUBLIC_RUSH_API_URL ?? '').replace(/\/+$/, '');

async function installId(): Promise<string> {
  const existing = await readJson<string | null>(INSTALL_KEY, (v) => (typeof v === 'string' && /^[A-Za-z0-9_-]{8,64}$/.test(v) ? v : null), null);
  if (existing) return existing;
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`.replace(/[^A-Za-z0-9]/g, '');
  await writeJson(INSTALL_KEY, id);
  return id;
}

const msg = (role: ChatMessage['role'], text: string, local?: ChatMessage['local']): ChatMessage => ({
  id: newId(),
  role,
  text,
  at: new Date().toISOString(),
  ...(local ? { local } : {}),
});

export function useChat() {
  const { value: state, save } = usePersisted<ChatState>(CHAT_KEY, parseChat, EMPTY_CHAT);
  const { medicalId } = useAppState();
  const { entries } = useHealthLog();
  const { data: meds } = useMeds();
  const [sending, setSending] = useState(false);

  async function ask(messages: ChatMessage[]) {
    if (!CHAT_API_URL) {
      await save((s) => ({ ...s, messages: [...s.messages, msg('assistant', 'Rush chat is not connected yet. You can still use the Symptoms Checker, Health Library and SOS.', 'error')] }));
      return;
    }
    setSending(true);
    try {
      const res = await fetch(`${CHAT_API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          installId: await installId(),
          messages: toApiMessages(messages),
          context: state.share ? buildContext(medicalId, entries, meds) : '',
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { reply?: string; error?: string };
      const reply = res.ok && body.reply ? msg('assistant', body.reply) : msg('assistant', body.error ?? 'Rush could not answer just now. Please try again.', 'error');
      await save((s) => ({ ...s, messages: [...s.messages, reply] }));
    } catch {
      await save((s) => ({ ...s, messages: [...s.messages, msg('assistant', 'No internet connection. Check your data or Wi-Fi and try again. In an emergency, call 112.', 'error')] }));
    } finally {
      setSending(false);
    }
  }

  return {
    state,
    sending,
    /** Sends a message, unless it shows danger signs; then shows help first. */
    async send(text: string, opts: { skipSafety?: boolean } = {}) {
      const clean = text.trim();
      if (!clean || sending) return;
      const userMsg = msg('user', clean);
      const hit = opts.skipSafety ? null : scan(clean);
      if (hit) {
        const alert = hit.kind === 'selfharm' ? msg('assistant', SELF_HARM_REPLY, 'selfharm') : msg('assistant', EMERGENCY_REPLY, 'emergency');
        await save((s) => ({ ...s, messages: [...s.messages, userMsg, alert] }));
        return;
      }
      const next = [...state.messages, userMsg];
      await save((s) => ({ ...s, messages: [...s.messages, userMsg] }));
      await ask(next);
    },
    /** After a safety alert, lets the person carry on talking to Rush. */
    async continueAfterAlert() {
      await ask(state.messages);
    },
    async retry() {
      const trimmed = [...state.messages];
      while (trimmed.length && trimmed[trimmed.length - 1].local === 'error') trimmed.pop();
      await save((s) => ({ ...s, messages: trimmed }));
      await ask(trimmed);
    },
    setShare: (share: boolean) => save((s) => ({ ...s, share })),
    clear: () => save((s) => ({ ...s, messages: [] })),
  };
}

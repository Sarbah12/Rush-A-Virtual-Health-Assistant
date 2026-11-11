// Chat conversation model and the request the app sends to the Rush server.
// Pure logic for Node tests; network code lives in use-chat.ts.

import { summaryForChat, type Entry } from './health-log.ts';
import { ageFrom, type MedicalId } from './medical-id.ts';
import { localDate, medsForChat, type MedsData } from './meds.ts';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  at: string;
  /** Set on local, app-generated messages (safety alerts, errors). Never sent to the server. */
  local?: 'emergency' | 'selfharm' | 'error';
};

export type ChatState = { messages: ChatMessage[]; share: boolean };

export const EMPTY_CHAT: ChatState = { messages: [], share: false };

export function parseChat(raw: unknown): ChatState {
  if (!raw || typeof raw !== 'object') return { messages: [], share: false };
  const o = raw as Record<string, unknown>;
  const messages: ChatMessage[] = [];
  for (const r of Array.isArray(o.messages) ? o.messages : []) {
    if (!r || typeof r !== 'object') continue;
    const m = r as Record<string, unknown>;
    if (typeof m.id !== 'string' || (m.role !== 'user' && m.role !== 'assistant') || typeof m.text !== 'string') continue;
    const local = m.local === 'emergency' || m.local === 'selfharm' || m.local === 'error' ? m.local : undefined;
    messages.push({ id: m.id, role: m.role, text: m.text.slice(0, 8000), at: typeof m.at === 'string' ? m.at : '', ...(local ? { local } : {}) });
  }
  return { messages: messages.slice(-200), share: o.share === true };
}

/**
 * The turns sent to Claude: only real user/assistant messages, the most
 * recent 30, starting with a user turn. Consecutive same-role turns are
 * merged so the conversation always alternates.
 */
export function toApiMessages(messages: ChatMessage[]): { role: 'user' | 'assistant'; content: string }[] {
  const real = messages.filter((m) => !m.local && m.text.trim() !== '');
  const out: { role: 'user' | 'assistant'; content: string }[] = [];
  for (const m of real.slice(-30)) {
    const last = out[out.length - 1];
    if (last && last.role === m.role) last.content += `\n\n${m.text}`;
    else out.push({ role: m.role, content: m.text.slice(0, 4000) });
  }
  while (out.length > 0 && out[0].role !== 'user') out.shift();
  return out;
}

/** Health summary shared with the assistant, only when the user turned sharing on. */
export function buildContext(id: MedicalId, log: Entry[], meds: MedsData, now = new Date()): string {
  const age = ageFrom(id.dateOfBirth, now);
  const lines = [
    age !== null ? `Age: ${age}` : '',
    id.sex ? `Sex: ${id.sex}` : '',
    id.location ? `Location: ${id.location}` : '',
    id.bloodGroup ? `Blood group: ${id.bloodGroup}` : '',
    id.sickleCell ? `Sickle cell status (genotype): ${id.sickleCell}` : '',
    id.allergies ? `Allergies: ${id.allergies}` : '',
    id.conditions ? `Conditions: ${id.conditions}` : '',
    id.medications ? `Medicines (from medical ID): ${id.medications}` : '',
    id.notes ? `Other: ${id.notes}` : '',
  ].filter(Boolean);
  const medList = medsForChat(meds, localDate(now));
  if (medList) lines.push(`Medicine schedule:\n${medList}`);
  const recent = summaryForChat(log, now);
  if (recent) lines.push(`Recent health log:\n${recent}`);
  // Name, phone numbers and emergency contact are never shared.
  return lines.join('\n').slice(0, 4000);
}

export const EMERGENCY_REPLY =
  'This sounds like it could be an emergency. Please call 112 or the ambulance on 193 now, or get someone to take you to the nearest hospital. Do not wait to see if it gets better.';

export const SELF_HARM_REPLY =
  "I'm really sorry you're going through this. You don't have to face it alone. Please reach out right now to someone you trust, a friend, family member or faith leader, and if you are in danger, call 112 or go to the nearest hospital. If you'd like, you can keep talking to me too.";

// Medicines and dose tracking. Pure logic (no React Native) for Node tests.

export type Medicine = {
  id: string;
  name: string;
  dose: string;
  /** Daily reminder times as "HH:MM" (24-hour), sorted. */
  times: string[];
  notes: string;
  remind: boolean;
  /** ISO date the course ends (inclusive), or '' for ongoing. */
  endDate: string;
  createdAt: string;
};

export type DoseStatus = 'taken' | 'skipped';

export type DoseRecord = {
  medId: string;
  /** Local date YYYY-MM-DD. */
  date: string;
  time: string;
  status: DoseStatus;
  at: string;
};

export type MedsData = { meds: Medicine[]; doses: DoseRecord[] };

export const EMPTY_MEDS: MedsData = { meds: [], doses: [] };

/** Accepts "8", "8:00", "08:00", "20:30", "8.30" and normalises to HH:MM. */
export function normalizeTime(input: string): string | null {
  const m = /^(\d{1,2})(?:[:.](\d{2}))?$/.exec(input.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  if (h > 23 || min > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h < 12 ? 'am' : 'pm';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

export function localDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export const TIME_PRESETS: Record<string, string[]> = {
  'Once a day': ['08:00'],
  'Twice a day': ['08:00', '20:00'],
  '3 times a day': ['07:00', '13:00', '19:00'],
  '4 times a day': ['07:00', '12:00', '17:00', '22:00'],
};

export type MedDraft = { name: string; dose: string; times: string[]; notes: string; remind: boolean; endDate: string };

export type MedResult = { ok: true; med: Omit<Medicine, 'id' | 'createdAt'> } | { ok: false; reason: string };

export function validateMed(d: MedDraft): MedResult {
  const name = d.name.trim();
  if (!name) return { ok: false, reason: 'Enter the medicine name.' };
  const times: string[] = [];
  for (const t of d.times) {
    const n = normalizeTime(t);
    if (!n) return { ok: false, reason: `“${t}” is not a time. Use 24-hour time like 08:00 or 20:30.` };
    if (!times.includes(n)) times.push(n);
  }
  if (times.length === 0) return { ok: false, reason: 'Add at least one time.' };
  if (times.length > 8) return { ok: false, reason: 'At most 8 times a day.' };
  const end = d.endDate.trim();
  if (end && !/^\d{4}-\d{2}-\d{2}$/.test(end)) return { ok: false, reason: 'End date must look like 2026-12-31.' };
  return {
    ok: true,
    med: { name: name.slice(0, 80), dose: d.dose.trim().slice(0, 80), times: times.sort(), notes: d.notes.trim().slice(0, 300), remind: d.remind, endDate: end },
  };
}

export function isActive(med: Medicine, today: string): boolean {
  return !med.endDate || med.endDate >= today;
}

export type TodayDose = {
  med: Medicine;
  time: string;
  status: DoseStatus | 'due' | 'upcoming' | 'missed';
};

/**
 * Today's doses in time order. A dose is "due" from its time until two hours
 * later, then "missed" if nothing was recorded.
 */
export function todaysDoses(data: MedsData, now: Date): TodayDose[] {
  const today = localDate(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const out: TodayDose[] = [];
  for (const med of data.meds) {
    if (!isActive(med, today)) continue;
    for (const time of med.times) {
      const rec = data.doses.find((d) => d.medId === med.id && d.date === today && d.time === time);
      const [h, m] = time.split(':').map(Number);
      const mins = h * 60 + m;
      const status: TodayDose['status'] = rec ? rec.status : nowMin < mins ? 'upcoming' : nowMin <= mins + 120 ? 'due' : 'missed';
      out.push({ med, time, status });
    }
  }
  return out.sort((a, b) => a.time.localeCompare(b.time) || a.med.name.localeCompare(b.med.name));
}

/** Records (or replaces) the status of one dose. */
export function recordDose(data: MedsData, medId: string, date: string, time: string, status: DoseStatus, at: Date): MedsData {
  const doses = data.doses.filter((d) => !(d.medId === medId && d.date === date && d.time === time));
  doses.push({ medId, date, time, status, at: at.toISOString() });
  // Keep about three months of history.
  const cutoff = localDate(new Date(at.getTime() - 92 * 86_400_000));
  return { ...data, doses: doses.filter((d) => d.date >= cutoff) };
}

export function undoDose(data: MedsData, medId: string, date: string, time: string): MedsData {
  return { ...data, doses: data.doses.filter((d) => !(d.medId === medId && d.date === date && d.time === time)) };
}

/** Share of scheduled doses marked taken over the last `days` full days (excluding today). */
export function adherence(data: MedsData, now: Date, days = 7): { taken: number; scheduled: number } {
  let taken = 0;
  let scheduled = 0;
  for (let i = 1; i <= days; i++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const date = localDate(day);
    for (const med of data.meds) {
      if (!isActive(med, date) || med.createdAt.slice(0, 10) > date) continue;
      for (const time of med.times) {
        scheduled++;
        if (data.doses.some((d) => d.medId === med.id && d.date === date && d.time === time && d.status === 'taken')) taken++;
      }
    }
  }
  return { taken, scheduled };
}

export function parseMeds(raw: unknown): MedsData {
  if (!raw || typeof raw !== 'object') return { meds: [], doses: [] };
  const o = raw as Record<string, unknown>;
  const meds: Medicine[] = [];
  for (const r of Array.isArray(o.meds) ? o.meds : []) {
    if (!r || typeof r !== 'object') continue;
    const m = r as Record<string, unknown>;
    if (typeof m.id !== 'string' || typeof m.name !== 'string') continue;
    const times = Array.isArray(m.times) ? m.times.map((t) => (typeof t === 'string' ? normalizeTime(t) : null)).filter((t): t is string => !!t) : [];
    meds.push({
      id: m.id,
      name: m.name.slice(0, 80),
      dose: typeof m.dose === 'string' ? m.dose.slice(0, 80) : '',
      times: [...new Set(times)].sort(),
      notes: typeof m.notes === 'string' ? m.notes.slice(0, 300) : '',
      remind: m.remind !== false,
      endDate: typeof m.endDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(m.endDate) ? m.endDate : '',
      createdAt: typeof m.createdAt === 'string' ? m.createdAt : new Date(0).toISOString(),
    });
  }
  const doses: DoseRecord[] = [];
  for (const r of Array.isArray(o.doses) ? o.doses : []) {
    if (!r || typeof r !== 'object') continue;
    const d = r as Record<string, unknown>;
    if (typeof d.medId !== 'string' || typeof d.date !== 'string' || typeof d.time !== 'string') continue;
    if (d.status !== 'taken' && d.status !== 'skipped') continue;
    doses.push({ medId: d.medId, date: d.date, time: d.time, status: d.status, at: typeof d.at === 'string' ? d.at : '' });
  }
  return { meds, doses };
}

/** One line per medicine, for the chat assistant. */
export function medsForChat(data: MedsData, today: string): string {
  return data.meds
    .filter((m) => isActive(m, today))
    .map((m) => `${m.name}${m.dose ? ` ${m.dose}` : ''} at ${m.times.join(', ')}`)
    .join('\n');
}

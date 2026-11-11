// Health log: blood pressure, blood sugar, weight, temperature, mood and
// symptoms. Pure logic (no React Native) so it can be tested with Node.
// Reference ranges follow WHO / American Heart Association adult guidance
// and are for general information, not diagnosis.

export const METRICS = ['bp', 'sugar', 'weight', 'temp', 'mood', 'symptom'] as const;
export type Metric = (typeof METRICS)[number];

export type Entry = {
  id: string;
  metric: Metric;
  /** ISO timestamp. */
  at: string;
  /** bp: systolic; sugar: mmol/L; weight: kg; temp: °C; mood: 1-5. */
  value: number;
  /** bp only: diastolic. */
  value2?: number;
  /** sugar only: measured fasting (before eating). */
  fasting?: boolean;
  /** symptom text, or an optional note for any metric. */
  note: string;
};

export type MetricInfo = {
  label: string;
  unit: string;
  icon: string;
  /** Inclusive range of believable readings, to catch typos. */
  min: number;
  max: number;
  min2?: number;
  max2?: number;
  decimals: number;
};

export const METRIC_INFO: Record<Metric, MetricInfo> = {
  bp: { label: 'Blood pressure', unit: 'mmHg', icon: 'heart-outline', min: 60, max: 260, min2: 30, max2: 160, decimals: 0 },
  sugar: { label: 'Blood sugar', unit: 'mmol/L', icon: 'water-outline', min: 1, max: 35, decimals: 1 },
  weight: { label: 'Weight', unit: 'kg', icon: 'barbell-outline', min: 2, max: 300, decimals: 1 },
  temp: { label: 'Temperature', unit: '°C', icon: 'thermometer-outline', min: 33, max: 43, decimals: 1 },
  mood: { label: 'Mood', unit: '/ 5', icon: 'happy-outline', min: 1, max: 5, decimals: 0 },
  symptom: { label: 'Symptoms', unit: '', icon: 'medkit-outline', min: 0, max: 10, decimals: 0 },
};

export const MOOD_LABELS = ['Very low', 'Low', 'Okay', 'Good', 'Great'] as const;

export type Level = 'ok' | 'watch' | 'high' | 'urgent' | 'low';

export type Assessment = { level: Level; label: string; advice: string };

/** Turns a reading into a plain-language band. Returns null for metrics without bands. */
export function assess(entry: Pick<Entry, 'metric' | 'value' | 'value2' | 'fasting'>): Assessment | null {
  const { metric, value: v, value2: d } = entry;
  switch (metric) {
    case 'bp': {
      const dia = d ?? 0;
      if (v >= 180 || dia >= 120)
        return { level: 'urgent', label: 'Very high', advice: 'Rest and measure again in 5 minutes. If it is still this high, or you have chest pain, a severe headache, weakness or trouble speaking, get emergency care now.' };
      if (v >= 140 || dia >= 90)
        return { level: 'high', label: 'High', advice: 'See a nurse or doctor soon to check your blood pressure, especially if several readings are this high.' };
      if (v >= 120 || dia >= 80)
        return { level: 'watch', label: 'Raised', advice: 'A little above the healthy range. Less salt, regular activity and keeping an eye on it help.' };
      if (v < 90 || dia < 60)
        return { level: 'low', label: 'Low', advice: 'Low readings are often fine, but if you feel dizzy or faint, sit down, drink water and see a health worker.' };
      return { level: 'ok', label: 'Healthy', advice: 'Within the healthy range.' };
    }
    case 'sugar': {
      if (v < 4) return { level: 'urgent', label: 'Low', advice: 'Low blood sugar. Take something sugary now (juice, sweets or a sugary drink), then eat. Get help if you feel confused or very weak.' };
      if (v >= 16.7) return { level: 'urgent', label: 'Very high', advice: 'Very high blood sugar. Drink water and contact a health worker today; get emergency care if you are vomiting, very drowsy or breathing fast.' };
      if (entry.fasting) {
        if (v >= 7) return { level: 'high', label: 'High (fasting)', advice: 'Fasting sugar in the diabetes range. See a health worker for a proper test.' };
        if (v >= 5.6) return { level: 'watch', label: 'Raised (fasting)', advice: 'Slightly raised. A health worker can check for prediabetes.' };
        return { level: 'ok', label: 'Healthy (fasting)', advice: 'Within the healthy fasting range.' };
      }
      if (v >= 11.1) return { level: 'high', label: 'High', advice: 'High for a reading after eating. See a health worker, especially if you often feel thirsty or pass urine a lot.' };
      if (v >= 7.8) return { level: 'watch', label: 'Raised', advice: 'A little raised after eating. Worth checking again.' };
      return { level: 'ok', label: 'Healthy', advice: 'Within the healthy range.' };
    }
    case 'temp': {
      if (v >= 39.5) return { level: 'urgent', label: 'High fever', advice: 'High fever. Get a malaria test today and see a health worker. Get emergency care if there is confusion, a stiff neck, fits or trouble breathing.' };
      if (v >= 38) return { level: 'high', label: 'Fever', advice: 'You have a fever. In Ghana, get a malaria test (RDT) at a pharmacy or clinic, rest and drink plenty of fluids.' };
      if (v >= 37.5) return { level: 'watch', label: 'Slightly raised', advice: 'Slightly above normal. Rest, drink fluids and check again in a few hours.' };
      if (v < 35) return { level: 'urgent', label: 'Very low', advice: 'Body temperature is very low. Warm up and get medical help now.' };
      return { level: 'ok', label: 'Normal', advice: 'Normal body temperature.' };
    }
    case 'mood': {
      if (v <= 2) return { level: 'watch', label: MOOD_LABELS[Math.round(v) - 1] ?? 'Low', advice: 'Sorry you are feeling low. Talking to someone you trust helps. If low moods last more than two weeks, see a health worker.' };
      return { level: 'ok', label: MOOD_LABELS[Math.round(v) - 1] ?? '', advice: '' };
    }
    default:
      return null;
  }
}

export type DraftResult = { ok: true; entry: Omit<Entry, 'id'> } | { ok: false; reason: string };

function num(s: string): number | null {
  const t = s.trim().replace(',', '.');
  if (!/^\d+(\.\d+)?$/.test(t)) return null;
  return Number(t);
}

/** Validates what someone typed into the add-reading form. */
export function makeEntry(
  metric: Metric,
  input: { value: string; value2?: string; fasting?: boolean; note?: string },
  at: Date = new Date(),
): DraftResult {
  const info = METRIC_INFO[metric];
  const note = (input.note ?? '').trim().slice(0, 300);
  if (metric === 'symptom') {
    if (!note) return { ok: false, reason: 'Describe the symptom.' };
    const sev = input.value.trim() === '' ? 0 : num(input.value);
    if (sev === null || sev < 0 || sev > 10) return { ok: false, reason: 'Severity is 0 to 10.' };
    return { ok: true, entry: { metric, at: at.toISOString(), value: Math.round(sev), note } };
  }
  const v = num(input.value);
  if (v === null) return { ok: false, reason: `Enter your ${info.label.toLowerCase()} as a number.` };
  if (v < info.min || v > info.max) {
    return { ok: false, reason: `That looks unlikely. ${info.label} is usually between ${info.min} and ${info.max} ${info.unit}.`.trim() };
  }
  if (metric === 'bp') {
    const d = num(input.value2 ?? '');
    if (d === null) return { ok: false, reason: 'Enter both numbers, e.g. 120 / 80.' };
    if (d < (info.min2 ?? 0) || d > (info.max2 ?? 999)) return { ok: false, reason: 'The bottom number looks unlikely. It is usually between 30 and 160.' };
    if (d >= v) return { ok: false, reason: 'The top number should be bigger than the bottom one.' };
    return { ok: true, entry: { metric, at: at.toISOString(), value: Math.round(v), value2: Math.round(d), note } };
  }
  const rounded = info.decimals === 0 ? Math.round(v) : Math.round(v * 10) / 10;
  return {
    ok: true,
    entry: { metric, at: at.toISOString(), value: rounded, note, ...(metric === 'sugar' ? { fasting: !!input.fasting } : {}) },
  };
}

export function formatValue(e: Pick<Entry, 'metric' | 'value' | 'value2'>): string {
  const info = METRIC_INFO[e.metric];
  if (e.metric === 'bp') return `${e.value}/${e.value2 ?? '?'} ${info.unit}`;
  if (e.metric === 'mood') return MOOD_LABELS[Math.round(e.value) - 1] ?? String(e.value);
  if (e.metric === 'symptom') return e.value > 0 ? `Severity ${e.value}/10` : '';
  return `${e.value.toFixed(info.decimals)} ${info.unit}`;
}

/** Parses stored entries, dropping anything malformed. */
export function parseEntries(raw: unknown): Entry[] {
  if (!Array.isArray(raw)) return [];
  const out: Entry[] = [];
  for (const r of raw) {
    if (!r || typeof r !== 'object') continue;
    const o = r as Record<string, unknown>;
    if (typeof o.id !== 'string' || !(METRICS as readonly unknown[]).includes(o.metric)) continue;
    if (typeof o.at !== 'string' || Number.isNaN(Date.parse(o.at))) continue;
    if (typeof o.value !== 'number' || !Number.isFinite(o.value)) continue;
    out.push({
      id: o.id,
      metric: o.metric as Metric,
      at: o.at,
      value: o.value,
      ...(typeof o.value2 === 'number' ? { value2: o.value2 } : {}),
      ...(typeof o.fasting === 'boolean' ? { fasting: o.fasting } : {}),
      note: typeof o.note === 'string' ? o.note.slice(0, 300) : '',
    });
  }
  return sortNewestFirst(out);
}

export function sortNewestFirst(entries: Entry[]): Entry[] {
  return [...entries].sort((a, b) => b.at.localeCompare(a.at));
}

export function latestByMetric(entries: Entry[]): Partial<Record<Metric, Entry>> {
  const out: Partial<Record<Metric, Entry>> = {};
  for (const e of sortNewestFirst(entries)) if (!out[e.metric]) out[e.metric] = e;
  return out;
}

/** Oldest-first points for a chart, limited to the last `days` days. */
export function series(entries: Entry[], metric: Metric, days: number, now = new Date()) {
  const since = now.getTime() - days * 86_400_000;
  return entries
    .filter((e) => e.metric === metric && Date.parse(e.at) >= since)
    .sort((a, b) => a.at.localeCompare(b.at))
    .map((e) => ({ t: Date.parse(e.at), y: e.value, y2: e.value2 }));
}

/** A short summary of recent readings for the chat assistant (never sent without permission). */
export function summaryForChat(entries: Entry[], now = new Date()): string {
  const recent = entries.filter((e) => now.getTime() - Date.parse(e.at) < 14 * 86_400_000).slice(0, 12);
  return recent
    .map((e) => {
      const day = e.at.slice(0, 10);
      const v = formatValue(e);
      const label = METRIC_INFO[e.metric].label;
      return `${day} ${label}: ${[v, e.note].filter(Boolean).join(' — ')}`;
    })
    .join('\n');
}

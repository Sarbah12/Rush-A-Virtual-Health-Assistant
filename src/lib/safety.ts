// On-phone danger-sign scanner. Runs before a chat message is sent, so an
// emergency gets the 112 / 193 buttons instantly, even with no internet.
// Deliberately broad: a false alarm costs one tap, a miss could cost a life.

export type SafetyHit = { kind: 'emergency' | 'selfharm'; matched: string };

const SELF_HARM: RegExp[] = [
  /\b(kill|hurt|harm)(ing)?\s+my\s?self\b/,
  /\bsuicid(e|al)\b/,
  /\bend(ing)?\s+(my|it)\s+(life|all)\b/,
  /\b(want|wanna|going)\s+to\s+die\b/,
  /\bdon'?t\s+want\s+to\s+(live|be alive)\b/,
  /\bself[-\s]?harm\b/,
  /\btake\s+my\s+(own\s+)?life\b/,
];

const EMERGENCY: [RegExp, string][] = [
  [/\bchest\s+(pain|pains|tightness|pressure)\b|\bpain\s+in\s+my\s+chest\b/, 'chest pain'],
  [/\b(can'?t|cannot|can not|unable to|struggling to|hard to)\s+breath(e)?\b|\b(difficulty|trouble)\s+breathing\b|\bnot\s+breathing\b|\bchoking\b/, 'trouble breathing'],
  [/\b(unconscious|passed out|collapsed|not waking|won'?t wake|fainted)\b/, 'unconscious or collapse'],
  [/\b(seizure|seizures|convulsion|convulsing|fitting)\b|\bhaving\s+(a\s+)?fits?\b/, 'seizure'],
  [/\bstroke\b|\bface\s+(is\s+)?droop|\bslurred\s+speech\b|\bone\s+side\s+(of\s+(my|his|her)\s+body\s+)?(is\s+)?(weak|numb|paralys)/, 'stroke signs'],
  [/\b(heavy|severe|lots? of|a lot of)\s+bleeding\b|\bbleeding\s+(heavily|a lot|won'?t stop|will not stop|non[-\s]?stop)\b|\bwon'?t\s+stop\s+bleeding\b/, 'heavy bleeding'],
  [/\b(vomit(ing)?|coughing|throwing up)\s+blood\b/, 'vomiting or coughing blood'],
  [/\b(overdose|overdosed|swallowed\s+(poison|bleach|kerosene|chemicals?|tablets))\b|\bpoison(ed|ing)\b/, 'poisoning'],
  [/\bsnake\s?bite\b|\bbitten\s+by\s+a\s+snake\b/, 'snake bite'],
  [/\bsevere\s+burns?\b|\bburnt\s+badly\b/, 'severe burn'],
  [/\b(baby|newborn|infant)\b.*\b(not\s+feeding|won'?t\s+feed|floppy|blue|not\s+breathing|fever)\b/, 'very sick baby'],
  [/\bpregnan\w*\b.*\b(bleeding|fits?|seizure|severe headache)\b/, 'pregnancy danger sign'],
];

export function scan(text: string): SafetyHit | null {
  const t = text.toLowerCase().replace(/[’`]/g, "'");
  for (const re of SELF_HARM) {
    const m = t.match(re);
    if (m) return { kind: 'selfharm', matched: m[0] };
  }
  for (const [re, label] of EMERGENCY) {
    if (re.test(t)) return { kind: 'emergency', matched: label };
  }
  return null;
}

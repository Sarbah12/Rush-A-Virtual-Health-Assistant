// Builds docs/medical-review.md: every piece of health guidance Rush gives,
// pulled straight from the code, for a clinician to review.
//
//   npm run review-pack

import { writeFileSync } from 'node:fs';

import { SYSTEM_PROMPT } from '../server/src/prompt.ts';
import { DANGER_SIGNS, EMERGENCY_LINES } from '../src/constants/emergency.ts';
import { ARTICLES } from '../src/constants/library.ts';
import { RECIPES } from '../src/constants/recipes.ts';
import { assess, METRIC_INFO } from '../src/lib/health-log.ts';
import { EMERGENCY_REPLY, SELF_HARM_REPLY } from '../src/lib/chat.ts';
import { CONCERNS, EMPTY_ANSWERS, GENERAL_DANGER_SIGNS, triage, type Answers } from '../src/lib/triage.ts';

const out: string[] = [];
const p = (...lines: string[]) => out.push(...lines);

p(
  '# Rush: medical content review pack',
  '',
  'Rush is a health app for the general public in Ghana. This document contains every piece of health guidance the app gives, generated from the app’s code so it matches exactly what ships. Please mark anything that is wrong, unsafe, out of date for Ghana, or unclear, and return it to the developer.',
  '',
  'Reviewer name: ____________________  Qualification: ____________________  Date: ____________',
  '',
);

p('## 1. Emergency numbers and danger signs (SOS screen)', '');
for (const l of EMERGENCY_LINES) p(`- **${l.number}**: ${l.name} (${l.detail})`);
p('', 'Shown as "Call for help now if you see":', '', ...DANGER_SIGNS.map((s) => `- ${s}`), '');

p('## 2. Symptoms Checker rules', '', 'Step 1 asks about these general danger signs. Any one leads straight to "Get emergency care now":', '', ...GENERAL_DANGER_SIGNS.map((s) => `- ${s}`), '');
p('Then: who is unwell (adult, child under 5, pregnant, over 65) → main problem → follow-up questions → how long → how bad.', '', 'Follow-up questions (🔴 = emergency, 🟠 = see a health worker today):', '');
for (const c of CONCERNS) {
  p(`**${c.label}**`, ...c.questions.map((q) => `- ${q.flag === 'emergency' ? '🔴' : '🟠'} ${q.text}`), '');
}
p('Other rules: any fever → malaria test advice and "see a health worker today" (also for fever in child under 5 / pregnancy / over 65). Diarrhoea in a child under 5, or belly pain or headache in pregnancy → today. Severe → today. More than a week → book a visit. 4–7 days and not mild → book a visit. Moderate → pharmacist.', '');
p('### Example results', '');
const examples: [string, Partial<Answers>][] = [
  ['Adult, headache, today, mild', { who: 'adult', concern: 'headache', duration: 'today', severity: 'mild' }],
  ['Adult, fever, 1–3 days, moderate', { who: 'adult', concern: 'fever', duration: 'days', severity: 'moderate' }],
  ['Child under 5, diarrhoea, today, mild', { who: 'child', concern: 'diarrhoea', duration: 'today', severity: 'mild' }],
  ['Adult, cough, more than a week, mild', { who: 'adult', concern: 'breathing', duration: 'longer', severity: 'mild' }],
  ['Adult, pain passing urine, 1–3 days, moderate', { who: 'adult', concern: 'urine', duration: 'days', severity: 'moderate' }],
];
for (const [label, a] of examples) {
  const r = triage({ ...EMPTY_ANSWERS, ...a });
  p(`**${label}** → ${r.title}`, '', ...r.advice.map((x) => `- ${x}`), '');
}

p('## 3. Health log ranges', '', 'Readings are labelled with these bands and advice:', '');
const samples: [string, Parameters<typeof assess>[0]][] = [
  ['BP 115/75', { metric: 'bp', value: 115, value2: 75 }],
  ['BP 125/78', { metric: 'bp', value: 125, value2: 78 }],
  ['BP 145/92', { metric: 'bp', value: 145, value2: 92 }],
  ['BP 185/110', { metric: 'bp', value: 185, value2: 110 }],
  ['BP 85/55', { metric: 'bp', value: 85, value2: 55 }],
  ['Sugar 3.5 mmol/L', { metric: 'sugar', value: 3.5 }],
  ['Sugar 6.0 fasting', { metric: 'sugar', value: 6.0, fasting: true }],
  ['Sugar 7.2 fasting', { metric: 'sugar', value: 7.2, fasting: true }],
  ['Sugar 12 after eating', { metric: 'sugar', value: 12 }],
  ['Sugar 18', { metric: 'sugar', value: 18 }],
  ['Temp 37.7 °C', { metric: 'temp', value: 37.7 }],
  ['Temp 38.4 °C', { metric: 'temp', value: 38.4 }],
  ['Temp 39.8 °C', { metric: 'temp', value: 39.8 }],
  ['Temp 34.5 °C', { metric: 'temp', value: 34.5 }],
];
p('| Reading | Label | Advice shown |', '| --- | --- | --- |');
for (const [label, e] of samples) {
  const a = assess(e);
  p(`| ${label} | ${a?.label ?? ''} | ${a?.advice ?? ''} |`);
}
p('', `Accepted ranges (to catch typos): ${Object.values(METRIC_INFO).filter((m) => m.unit && m.unit !== '/ 5').map((m) => `${m.label} ${m.min}–${m.max} ${m.unit}`).join('; ')}.`, '');

p('## 4. Chat assistant', '', 'Messages are checked on the phone first. If they suggest an emergency or self-harm, the app shows this and the 112/193 buttons before anything is sent:', '', `> ${EMERGENCY_REPLY}`, '', `> ${SELF_HARM_REPLY}`, '', 'Otherwise the AI (Claude) answers using these instructions:', '', '```', SYSTEM_PROMPT, '```', '');

p('## 5. Health Library articles', '');
for (const a of ARTICLES) {
  p(`### ${a.title}`, `_${a.summary}_ (Source: ${a.source})`, '');
  for (const s of a.sections) {
    if (s.heading) p(`**${s.heading}**`);
    p(...s.body.map((b) => (s.body.length > 1 ? `- ${b}` : b)), '');
  }
}

p('## 6. Healthy Recipes', '');
for (const r of RECIPES) {
  p(`### ${r.title} (${r.tags.join(', ')})`, r.summary, '', '**Ingredients:** ' + r.ingredients.join('; '), '', '**Tip:** ' + r.tip, '');
}

writeFileSync('docs/medical-review.md', out.join('\n'));
console.log(`Wrote docs/medical-review.md (${out.length} lines)`);

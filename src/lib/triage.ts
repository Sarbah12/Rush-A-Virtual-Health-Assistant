// Symptoms checker: a short, rule-based triage that suggests where to go
// next. Deliberately cautious: any danger sign leads to emergency care, and
// higher-risk people (young children, pregnancy, older adults) are sent to a
// clinic sooner. Pure logic, tested in tests/triage.test.ts.
//
// Based on WHO IMCI danger signs and Ghana Health Service malaria guidance
// (test every fever). It is guidance, not a diagnosis.

export const GENERAL_DANGER_SIGNS = [
  'Severe difficulty breathing',
  'Chest pain or pressure',
  'Fainting, a fit (seizure) or very hard to wake',
  'Confusion or slurred speech',
  'Heavy bleeding that will not stop',
  'Face drooping or sudden weakness on one side',
  'Vomiting everything, or unable to drink',
  'Thoughts of ending your life',
] as const;

export type Who = 'adult' | 'child' | 'pregnant' | 'older';

export const WHO_OPTIONS: { key: Who; label: string }[] = [
  { key: 'adult', label: 'Me or another adult' },
  { key: 'child', label: 'A child under 5' },
  { key: 'pregnant', label: 'Someone pregnant' },
  { key: 'older', label: 'Someone over 65' },
];

export type Concern = 'fever' | 'headache' | 'breathing' | 'diarrhoea' | 'bellypain' | 'rash' | 'urine' | 'other';

export type Flag = 'emergency' | 'clinic';

export type Question = { id: string; text: string; flag: Flag };

export const CONCERNS: { key: Concern; label: string; icon: string; questions: Question[] }[] = [
  {
    key: 'fever',
    label: 'Fever or feeling hot',
    icon: 'thermometer-outline',
    questions: [
      { id: 'stiffneck', text: 'Stiff neck, or a rash that does not fade when pressed?', flag: 'emergency' },
      { id: 'yellow', text: 'Yellow eyes or very dark urine?', flag: 'clinic' },
      { id: 'veryhigh', text: 'Temperature 39.5°C or higher?', flag: 'clinic' },
    ],
  },
  {
    key: 'headache',
    label: 'Headache',
    icon: 'sad-outline',
    questions: [
      { id: 'worst', text: 'Sudden, severe "worst ever" headache?', flag: 'emergency' },
      { id: 'vision', text: 'Blurred vision, or a headache in late pregnancy?', flag: 'emergency' },
      { id: 'fever', text: 'Also a fever?', flag: 'clinic' },
    ],
  },
  {
    key: 'breathing',
    label: 'Cough or breathing',
    icon: 'cloud-outline',
    questions: [
      { id: 'fast', text: 'Breathing fast, or the chest pulls in with each breath?', flag: 'emergency' },
      { id: 'blood', text: 'Coughing up blood?', flag: 'clinic' },
      { id: 'weeks', text: 'Cough for more than 2 weeks, or night sweats and weight loss?', flag: 'clinic' },
    ],
  },
  {
    key: 'diarrhoea',
    label: 'Diarrhoea or vomiting',
    icon: 'water-outline',
    questions: [
      { id: 'dry', text: 'Very thirsty, sunken eyes, or little or no urine?', flag: 'emergency' },
      { id: 'blood', text: 'Blood in the stool?', flag: 'clinic' },
      { id: 'rice', text: 'Lots of watery "rice-water" stool?', flag: 'emergency' },
    ],
  },
  {
    key: 'bellypain',
    label: 'Belly pain',
    icon: 'body-outline',
    questions: [
      { id: 'severe', text: 'Severe pain, or a hard, swollen belly?', flag: 'emergency' },
      { id: 'pregnant', text: 'Pregnant or might be, with pain or bleeding?', flag: 'emergency' },
      { id: 'fever', text: 'Also a fever?', flag: 'clinic' },
    ],
  },
  {
    key: 'rash',
    label: 'Skin rash',
    icon: 'hand-left-outline',
    questions: [
      { id: 'swelling', text: 'Swelling of the lips, face or tongue?', flag: 'emergency' },
      { id: 'blisters', text: 'Blisters, peeling skin, or sores in the mouth or eyes?', flag: 'emergency' },
      { id: 'spreading', text: 'Red, hot, spreading skin, or a fever?', flag: 'clinic' },
    ],
  },
  {
    key: 'urine',
    label: 'Pain passing urine',
    icon: 'flask-outline',
    questions: [
      { id: 'back', text: 'Pain in the side or back, with fever or shivering?', flag: 'clinic' },
      { id: 'blood', text: 'Blood in the urine?', flag: 'clinic' },
      { id: 'pregnant', text: 'Pregnant?', flag: 'clinic' },
    ],
  },
  {
    key: 'other',
    label: 'Something else',
    icon: 'help-circle-outline',
    questions: [{ id: 'worse', text: 'Getting worse quickly?', flag: 'clinic' }],
  },
];

export type Duration = 'today' | 'days' | 'week' | 'longer';
export const DURATIONS: { key: Duration; label: string }[] = [
  { key: 'today', label: 'Started today' },
  { key: 'days', label: '1 to 3 days' },
  { key: 'week', label: '4 to 7 days' },
  { key: 'longer', label: 'More than a week' },
];

export type Severity = 'mild' | 'moderate' | 'severe';
export const SEVERITIES: { key: Severity; label: string; hint: string }[] = [
  { key: 'mild', label: 'Mild', hint: 'Can do normal things' },
  { key: 'moderate', label: 'Moderate', hint: 'Hard to work or study' },
  { key: 'severe', label: 'Severe', hint: 'Cannot get out of bed' },
];

export type Answers = {
  dangerSigns: string[];
  who: Who | null;
  concern: Concern | null;
  /** Question ids answered "yes". */
  yes: string[];
  duration: Duration | null;
  severity: Severity | null;
};

export const EMPTY_ANSWERS: Answers = { dangerSigns: [], who: null, concern: null, yes: [], duration: null, severity: null };

export type Outcome = 'emergency' | 'today' | 'soon' | 'pharmacy' | 'selfcare';

export type TriageResult = {
  outcome: Outcome;
  title: string;
  summary: string;
  reasons: string[];
  advice: string[];
  malariaTest: boolean;
};

const TITLES: Record<Outcome, { title: string; summary: string }> = {
  emergency: { title: 'Get emergency care now', summary: 'Call 112 or the ambulance on 193, or go to the nearest hospital emergency unit straight away.' },
  today: { title: 'See a health worker today', summary: 'Visit a clinic, health centre or CHPS compound today.' },
  soon: { title: 'Book a clinic visit', summary: 'This has gone on long enough to be checked. See a nurse or doctor in the next few days.' },
  pharmacy: { title: 'Talk to a pharmacist', summary: 'A pharmacist can advise on safe medicines. See a clinic if it gets worse or does not improve in 2 to 3 days.' },
  selfcare: { title: 'Care for yourself at home', summary: 'This sounds manageable at home for now. Watch for the warning signs below.' },
};

const SELF_CARE: Record<Concern, string[]> = {
  fever: ['Drink plenty of clean water.', 'Paracetamol can bring the fever down. Follow the dose on the pack.', 'Rest, and wear light clothing.'],
  headache: ['Drink water and rest in a quiet, dark room.', 'Paracetamol can help. Avoid taking painkillers every day.', 'Check your blood pressure if you can.'],
  breathing: ['Drink warm fluids. Honey in warm water soothes a cough (not for babies under 1).', 'Rest and avoid smoke.', 'Sleep propped up if breathing is uncomfortable.'],
  diarrhoea: ['Drink ORS (oral rehydration salts) after every loose stool.', 'Keep eating light foods such as rice water or koko.', 'Children: give zinc tablets for 10 to 14 days if available.', 'Wash hands with soap after the toilet.'],
  bellypain: ['Rest and sip water.', 'Eat small, plain meals.', 'Avoid painkillers like ibuprofen or diclofenac on an empty stomach.'],
  rash: ['Keep the skin clean and dry.', 'Avoid scratching. Calamine lotion can soothe itching.', 'Stop any new cream, soap or medicine that may have caused it.'],
  urine: ['Drink plenty of water.', 'Do not hold urine for long.', 'Urine infections usually need antibiotics prescribed by a health worker.'],
  other: ['Rest and drink water.', 'Keep a note of your symptoms in the Rush health log.'],
};

const WATCH_FOR = 'Go to hospital at once if you notice any danger sign: trouble breathing, chest pain, fainting, confusion, a fit, heavy bleeding or being unable to drink.';

export function triage(a: Answers): TriageResult {
  const concern = CONCERNS.find((c) => c.key === a.concern);
  const reasons: string[] = [];
  // Widened on purpose: raise() changes it inside a closure.
  let outcome = 'selfcare' as Outcome;
  const raise = (o: Outcome, reason: string) => {
    const order: Outcome[] = ['selfcare', 'pharmacy', 'soon', 'today', 'emergency'];
    if (order.indexOf(o) > order.indexOf(outcome)) outcome = o;
    reasons.push(reason);
  };

  for (const s of a.dangerSigns) raise('emergency', s);

  for (const q of concern?.questions ?? []) {
    if (a.yes.includes(q.id)) raise(q.flag === 'emergency' ? 'emergency' : 'today', q.text.replace(/\?$/, ''));
  }

  const fever = a.concern === 'fever' || a.yes.includes('fever');
  const vulnerable = a.who === 'child' || a.who === 'pregnant' || a.who === 'older';
  if (fever && vulnerable) {
    raise('today', a.who === 'child' ? 'Fever in a child under 5' : a.who === 'pregnant' ? 'Fever during pregnancy' : 'Fever in someone over 65');
  } else if (fever) {
    raise('today', 'Fever needs a malaria test');
  }
  if (a.who === 'child' && a.concern === 'diarrhoea') raise('today', 'Diarrhoea or vomiting in a young child');
  if (a.who === 'pregnant' && (a.concern === 'bellypain' || a.concern === 'headache')) raise('today', 'This symptom during pregnancy');

  if (a.severity === 'severe') raise('today', 'Severe symptoms');
  if (a.duration === 'longer') raise('soon', 'Symptoms for more than a week');
  else if (a.duration === 'week' && a.severity !== 'mild') raise('soon', 'Symptoms for most of a week');
  if (a.severity === 'moderate') raise('pharmacy', 'Moderate symptoms');

  const malariaTest = fever && outcome !== 'emergency';
  const advice: string[] = [];
  if (outcome === 'emergency') {
    advice.push('Do not wait to see if it gets better.', 'If you can, bring your medicines and your Rush medical ID.');
  } else {
    if (malariaTest) advice.push('Get a malaria test (RDT). Pharmacies, chemical shops and clinics can test you in 15 minutes. Do not take malaria medicine without a test.');
    advice.push(...SELF_CARE[a.concern ?? 'other']);
    advice.push(WATCH_FOR);
  }

  return { outcome, ...TITLES[outcome], reasons: [...new Set(reasons)], advice, malariaTest };
}

/** Which step the stepper should show next. */
export type Step = 'danger' | 'who' | 'concern' | 'questions' | 'duration' | 'severity' | 'result';

export function nextStep(a: Answers, current: Step): Step {
  switch (current) {
    case 'danger':
      return a.dangerSigns.length > 0 ? 'result' : 'who';
    case 'who':
      return 'concern';
    case 'concern':
      return 'questions';
    case 'questions': {
      const c = CONCERNS.find((x) => x.key === a.concern);
      const emergency = c?.questions.some((q) => q.flag === 'emergency' && a.yes.includes(q.id));
      return emergency ? 'result' : 'duration';
    }
    case 'duration':
      return 'severity';
    default:
      return 'result';
  }
}

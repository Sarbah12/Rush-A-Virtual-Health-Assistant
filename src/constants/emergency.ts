// Ghana emergency numbers. 112 is the national emergency line and works
// from any phone; the others reach a single service directly.

export type EmergencyLine = {
  number: string;
  name: string;
  detail: string;
  primary: boolean;
};

export const EMERGENCY_LINES: readonly EmergencyLine[] = [
  { number: '112', name: 'National emergency', detail: 'Police, fire or ambulance', primary: true },
  { number: '193', name: 'Ambulance', detail: 'National Ambulance Service', primary: true },
  { number: '191', name: 'Police', detail: 'Ghana Police Service', primary: false },
  { number: '192', name: 'Fire', detail: 'Ghana National Fire Service', primary: false },
];

/** Signs that mean "call for help now", shown on the SOS screen. */
export const DANGER_SIGNS: readonly string[] = [
  'Chest pain or pressure, especially spreading to the arm, jaw or back',
  'Struggling to breathe, or lips turning blue',
  'Face drooping, arm weakness or slurred speech (possible stroke)',
  'Fainting, a seizure, or being very hard to wake',
  'Heavy bleeding that will not stop',
  'Fever with a stiff neck, confusion or a rash that does not fade when pressed',
  'A baby under 3 months with a fever',
  'Severe pain in the belly, or vomiting blood',
  'Thoughts of ending your life',
];

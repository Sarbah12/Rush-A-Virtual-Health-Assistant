// The user's profile and medical ID: what a first responder or doctor needs
// if you cannot speak for yourself. Pure logic only (no React Native imports)
// so it can be tested with plain Node.

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number] | '';

export const SEXES = ['Female', 'Male'] as const;
export type Sex = (typeof SEXES)[number] | '';

// Haemoglobin genotype, which is routinely tested in Ghana.
export const SICKLE_STATUSES = ['AA', 'AS', 'SS', 'SC'] as const;
export type SickleStatus = (typeof SICKLE_STATUSES)[number] | '';

export type EmergencyContact = {
  name: string;
  relationship: string;
  phone: string;
};

export type MedicalId = {
  name: string;
  phone: string;
  location: string;
  /** ISO date YYYY-MM-DD, or '' when not given. */
  dateOfBirth: string;
  sex: Sex;
  bloodGroup: BloodGroup;
  sickleCell: SickleStatus;
  allergies: string;
  conditions: string;
  medications: string;
  notes: string;
  contact: EmergencyContact;
};

export function emptyMedicalId(): MedicalId {
  return {
    name: '',
    phone: '',
    location: '',
    dateOfBirth: '',
    sex: '',
    bloodGroup: '',
    sickleCell: '',
    allergies: '',
    conditions: '',
    medications: '',
    notes: '',
    contact: { name: '', relationship: '', phone: '' },
  };
}

/** Frozen reference copy; use emptyMedicalId() for a mutable one. */
export const EMPTY_MEDICAL_ID: Readonly<MedicalId> = Object.freeze(emptyMedicalId());

const MAX_FIELD = 500;

function str(value: unknown, max = MAX_FIELD): string {
  return typeof value === 'string' ? value.slice(0, max) : '';
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[]): T | '' {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value) ? (value as T) : '';
}

/**
 * Turns whatever was stored (possibly from an older version, or damaged)
 * into a complete MedicalId. Never throws.
 */
export function parseMedicalId(raw: unknown): MedicalId {
  let value: unknown = raw;
  if (typeof raw === 'string') {
    try {
      value = JSON.parse(raw);
    } catch {
      return emptyMedicalId();
    }
  }
  const o = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const c = o.contact && typeof o.contact === 'object' ? (o.contact as Record<string, unknown>) : {};
  const dob = str(o.dateOfBirth, 10);
  return {
    name: str(o.name, 120),
    phone: str(o.phone, 30),
    location: str(o.location, 120),
    dateOfBirth: isIsoDate(dob) ? dob : '',
    sex: oneOf(o.sex, SEXES),
    bloodGroup: oneOf(o.bloodGroup, BLOOD_GROUPS),
    sickleCell: oneOf(o.sickleCell, SICKLE_STATUSES),
    allergies: str(o.allergies),
    conditions: str(o.conditions),
    medications: str(o.medications),
    notes: str(o.notes),
    contact: {
      name: str(c.name, 120),
      relationship: str(c.relationship, 60),
      phone: str(c.phone, 30),
    },
  };
}

/** True when nothing useful has been filled in yet. */
export function isMedicalIdEmpty(id: MedicalId): boolean {
  const { contact, ...rest } = id;
  return (
    Object.values(rest).every((v) => v.trim() === '') &&
    Object.values(contact).every((v) => v.trim() === '')
  );
}

export function firstName(id: MedicalId): string {
  return id.name.trim().split(/\s+/)[0] ?? '';
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase();
}

// ---------- Dates ----------

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function isIsoDate(s: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
}

export type DobResult = { ok: true; iso: string } | { ok: false; reason: string };

/**
 * Builds a date of birth from day / month / year boxes (Ghana writes dates
 * day first). All three empty means "not given", which is allowed.
 */
export function parseDob(day: string, month: string, year: string, today = new Date()): DobResult {
  const [d, m, y] = [day.trim(), month.trim(), year.trim()];
  if (!d && !m && !y) return { ok: true, iso: '' };
  if (!/^\d{1,2}$/.test(d) || !/^\d{1,2}$/.test(m) || !/^\d{4}$/.test(y)) {
    return { ok: false, reason: 'Enter day, month and a 4-digit year, e.g. 14 / 03 / 1990.' };
  }
  const iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  if (!isIsoDate(iso)) return { ok: false, reason: 'That date does not exist.' };
  const age = ageFrom(iso, today);
  if (age === null || age < 0) return { ok: false, reason: 'Date of birth cannot be in the future.' };
  if (age > 120) return { ok: false, reason: 'Please check the year.' };
  return { ok: true, iso };
}

/** Splits an ISO date back into the three boxes. */
export function dobParts(iso: string): { day: string; month: string; year: string } {
  if (!isIsoDate(iso)) return { day: '', month: '', year: '' };
  const [y, m, d] = iso.split('-');
  return { day: d, month: m, year: y };
}

export function ageFrom(iso: string, today = new Date()): number | null {
  if (!isIsoDate(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  let age = today.getFullYear() - y;
  const beforeBirthday = today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d);
  if (beforeBirthday) age--;
  return age;
}

export function formatDob(iso: string): string {
  if (!isIsoDate(iso)) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

// ---------- Phones ----------

export type PhoneResult =
  | { ok: true; dial: string; display: string }
  | { ok: false; reason: string };

/**
 * Normalises a phone number for dialling. Ghana numbers may be typed as
 * "024 123 4567", "+233 24 123 4567" or "233241234567"; all become
 * +233241234567. Other international numbers must start with +.
 */
export function normalizePhone(input: string): PhoneResult {
  const trimmed = input.trim();
  if (trimmed === '') return { ok: false, reason: 'Enter a phone number.' };
  if (/[^\d\s+()\-.]/.test(trimmed)) {
    return { ok: false, reason: 'Use only numbers, spaces and +.' };
  }
  const plus = trimmed.startsWith('+') || trimmed.startsWith('00');
  let digits = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('00')) digits = digits.slice(2);

  let national: string | null = null;
  if (plus || (digits.startsWith('233') && digits.length === 12)) {
    if (digits.startsWith('233')) {
      national = digits.slice(3);
      if (national.startsWith('0')) national = national.slice(1);
    } else {
      if (digits.length < 7 || digits.length > 15) {
        return { ok: false, reason: 'That international number looks the wrong length.' };
      }
      return { ok: true, dial: `+${digits}`, display: `+${digits}` };
    }
  } else if (digits.startsWith('0') && digits.length === 10) {
    national = digits.slice(1);
  } else if (digits.length === 9) {
    national = digits;
  }

  if (national === null || national.length !== 9 || !/^[235]/.test(national)) {
    return { ok: false, reason: 'Enter a Ghana number like 024 123 4567, or start with +.' };
  }
  const display = `0${national.slice(0, 2)} ${national.slice(2, 5)} ${national.slice(5)}`;
  return { ok: true, dial: `+233${national}`, display };
}

// ---------- Validation ----------

export type MedicalIdErrors = Partial<Record<'name' | 'phone' | 'contactPhone', string>>;

export function validateMedicalId(id: MedicalId, opts: { requireName?: boolean } = {}): MedicalIdErrors {
  const errors: MedicalIdErrors = {};
  if (opts.requireName && id.name.trim() === '') errors.name = 'Tell Rush what to call you.';
  if (id.phone.trim() !== '') {
    const p = normalizePhone(id.phone);
    if (!p.ok) errors.phone = p.reason;
  }
  if (id.contact.phone.trim() !== '') {
    const p = normalizePhone(id.contact.phone);
    if (!p.ok) errors.contactPhone = p.reason;
  }
  return errors;
}

/** Trims every text field before saving. */
export function cleanMedicalId(id: MedicalId): MedicalId {
  const trimmed = Object.fromEntries(
    Object.entries(id).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]),
  );
  return parseMedicalId({
    ...trimmed,
    contact: {
      name: id.contact.name.trim(),
      relationship: id.contact.relationship.trim(),
      phone: id.contact.phone.trim(),
    },
  });
}

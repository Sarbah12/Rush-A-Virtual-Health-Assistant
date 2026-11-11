/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  ageFrom,
  cleanMedicalId,
  dobParts,
  EMPTY_MEDICAL_ID,
  emptyMedicalId,
  firstName,
  formatDob,
  initials,
  isMedicalIdEmpty,
  normalizePhone,
  parseDob,
  parseMedicalId,
  validateMedicalId,
} from '../src/lib/medical-id.ts';

const TODAY = new Date(2026, 10, 11); // 11 Nov 2026

test('Ghana numbers in every common shape become +233', () => {
  for (const input of ['024 123 4567', '0241234567', '+233 24 123 4567', '233241234567', '00233241234567', '+233 (0)24-123-4567', '241234567']) {
    const r = normalizePhone(input);
    if (!r.ok) assert.fail(`${input} should be valid: ${r.reason}`);
    assert.equal(r.dial, '+233241234567', input);
    assert.equal(r.display, '024 123 4567', input);
  }
});

test('Ghana landlines and 05x numbers are accepted', () => {
  const landline = normalizePhone('030 221 2345');
  assert.ok(landline.ok && landline.dial === '+233302212345');
  const mtn = normalizePhone('0551234567');
  assert.ok(mtn.ok && mtn.dial === '+233551234567');
});

test('other international numbers are kept when they start with +', () => {
  const r = normalizePhone('+44 20 7946 0958');
  if (!r.ok) assert.fail(r.reason);
  assert.equal(r.dial, '+442079460958');
});

test('bad numbers are rejected with a reason', () => {
  for (const input of ['', '12345', '024 123', '0141234567', 'call me', '+1 2']) {
    const r = normalizePhone(input);
    assert.equal(r.ok, false, input);
    if (!r.ok) assert.ok(r.reason.length > 0);
  }
});

test('parseMedicalId survives damaged or old data', () => {
  assert.deepEqual(parseMedicalId('not json'), EMPTY_MEDICAL_ID);
  assert.deepEqual(parseMedicalId(null), EMPTY_MEDICAL_ID);
  assert.deepEqual(parseMedicalId(42), EMPTY_MEDICAL_ID);
  const partial = parseMedicalId('{"name":"Ama","bloodGroup":"Z+","sex":"other","sickleCell":"XX","contact":{"phone":5}}');
  assert.equal(partial.name, 'Ama');
  assert.equal(partial.bloodGroup, '');
  assert.equal(partial.sex, '');
  assert.equal(partial.sickleCell, '');
  assert.equal(partial.contact.phone, '');
});

test('records saved by the first Phase 1 build still load', () => {
  // That build stored dateOfBirth as free text and had no sex/genotype.
  const old = parseMedicalId({ name: 'Kofi Mensah', dateOfBirth: '14 March 1990', allergies: 'Penicillin', contact: { name: 'Ama', relationship: 'Sister', phone: '024 123 4567' } });
  assert.equal(old.name, 'Kofi Mensah');
  assert.equal(old.dateOfBirth, '');
  assert.equal(old.allergies, 'Penicillin');
  assert.equal(old.contact.phone, '024 123 4567');
});

test('parseMedicalId keeps valid choices and caps long text', () => {
  const id = parseMedicalId({ bloodGroup: 'O+', sex: 'Female', sickleCell: 'AS', dateOfBirth: '1990-03-14', notes: 'x'.repeat(2000) });
  assert.equal(id.bloodGroup, 'O+');
  assert.equal(id.sex, 'Female');
  assert.equal(id.sickleCell, 'AS');
  assert.equal(id.dateOfBirth, '1990-03-14');
  assert.equal(id.notes.length, 500);
});

test('the empty template cannot be changed by accident', () => {
  const a = parseMedicalId('bad');
  a.contact.name = 'changed';
  assert.equal(EMPTY_MEDICAL_ID.contact.name, '');
  assert.ok(Object.isFrozen(EMPTY_MEDICAL_ID));
});

test('empty detection ignores whitespace', () => {
  assert.equal(isMedicalIdEmpty(emptyMedicalId()), true);
  assert.equal(isMedicalIdEmpty({ ...emptyMedicalId(), name: '   ' }), true);
  assert.equal(isMedicalIdEmpty({ ...emptyMedicalId(), sex: 'Male' }), false);
});

test('validation: name only when required, phones only when typed', () => {
  assert.deepEqual(validateMedicalId(emptyMedicalId()), {});
  assert.ok(validateMedicalId(emptyMedicalId(), { requireName: true }).name);
  const bad = { ...emptyMedicalId(), phone: '99', contact: { name: '', relationship: '', phone: '123' } };
  const errors = validateMedicalId(bad);
  assert.ok(errors.phone);
  assert.ok(errors.contactPhone);
});

test('cleanMedicalId trims every field', () => {
  const id = cleanMedicalId({
    ...emptyMedicalId(),
    name: '  Kofi Mensah ',
    location: ' Kumasi ',
    contact: { name: ' Ama ', relationship: ' Sister ', phone: ' 024 123 4567 ' },
  });
  assert.equal(id.name, 'Kofi Mensah');
  assert.equal(id.location, 'Kumasi');
  assert.deepEqual(id.contact, { name: 'Ama', relationship: 'Sister', phone: '024 123 4567' });
});

test('date of birth from day / month / year boxes', () => {
  assert.deepEqual(parseDob('', '', '', TODAY), { ok: true, iso: '' });
  assert.deepEqual(parseDob('4', '3', '1990', TODAY), { ok: true, iso: '1990-03-04' });
  assert.equal(parseDob('31', '02', '1990', TODAY).ok, false); // no 31 February
  assert.equal(parseDob('29', '02', '2001', TODAY).ok, false); // not a leap year
  assert.equal(parseDob('29', '02', '2000', TODAY).ok, true);
  assert.equal(parseDob('12', '12', '2026', TODAY).ok, false); // future
  assert.equal(parseDob('1', '1', '90', TODAY).ok, false); // 2-digit year
  assert.equal(parseDob('1', '', '1990', TODAY).ok, false); // incomplete
  assert.equal(parseDob('1', '1', '1850', TODAY).ok, false); // too old
});

test('age counts birthdays correctly', () => {
  assert.equal(ageFrom('1990-11-11', TODAY), 36);
  assert.equal(ageFrom('1990-11-12', TODAY), 35);
  assert.equal(ageFrom('', TODAY), null);
});

test('dates round-trip and read naturally', () => {
  assert.deepEqual(dobParts('1990-03-04'), { day: '04', month: '03', year: '1990' });
  assert.deepEqual(dobParts('junk'), { day: '', month: '', year: '' });
  assert.equal(formatDob('1990-03-04'), '4 March 1990');
});

test('names: first name and initials', () => {
  assert.equal(firstName({ ...emptyMedicalId(), name: '  Sarbah Richmond ' }), 'Sarbah');
  assert.equal(initials('Sarbah Kwame Richmond'), 'SR');
  assert.equal(initials('ama'), 'A');
  assert.equal(initials('  '), '');
});

/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { adherence, formatTime, normalizeTime, parseMeds, recordDose, todaysDoses, undoDose, validateMed, type MedsData } from '../src/lib/meds.ts';

test('times are normalised to HH:MM', () => {
  assert.equal(normalizeTime('8'), '08:00');
  assert.equal(normalizeTime('8:30'), '08:30');
  assert.equal(normalizeTime('20.15'), '20:15');
  assert.equal(normalizeTime('24:00'), null);
  assert.equal(normalizeTime('7:75'), null);
  assert.equal(normalizeTime('morning'), null);
  assert.equal(formatTime('00:05'), '12:05 am');
  assert.equal(formatTime('13:00'), '1:00 pm');
  assert.equal(formatTime('12:00'), '12:00 pm');
});

test('validateMed', () => {
  assert.equal(validateMed({ name: ' ', dose: '', times: ['08:00'], notes: '', remind: true, endDate: '' }).ok, false);
  assert.equal(validateMed({ name: 'A', dose: '', times: [], notes: '', remind: true, endDate: '' }).ok, false);
  assert.equal(validateMed({ name: 'A', dose: '', times: ['8pm'], notes: '', remind: true, endDate: '' }).ok, false);
  const r = validateMed({ name: ' Amlodipine ', dose: '5mg', times: ['20:00', '8', '08:00'], notes: '', remind: true, endDate: '' });
  assert.ok(r.ok);
  if (r.ok) assert.deepEqual(r.med.times, ['08:00', '20:00']);
});

const base: MedsData = {
  meds: [
    { id: 'a', name: 'Amlodipine', dose: '5mg', times: ['08:00', '20:00'], notes: '', remind: true, endDate: '', createdAt: '2026-11-01T00:00:00Z' },
    { id: 'b', name: 'Amoxicillin', dose: '', times: ['09:00'], notes: '', remind: true, endDate: '2026-11-05', createdAt: '2026-11-01T00:00:00Z' },
  ],
  doses: [],
};

test("today's doses: upcoming, due, missed, taken; finished courses hidden", () => {
  const at = (h: number, m = 0) => new Date(2026, 10, 11, h, m);
  assert.deepEqual(todaysDoses(base, at(7)).map((d) => d.status), ['upcoming', 'upcoming']);
  assert.deepEqual(todaysDoses(base, at(8, 30)).map((d) => d.status), ['due', 'upcoming']);
  assert.deepEqual(todaysDoses(base, at(11)).map((d) => d.status), ['missed', 'upcoming']);
  const taken = recordDose(base, 'a', '2026-11-11', '08:00', 'taken', at(8, 5));
  assert.deepEqual(todaysDoses(taken, at(11)).map((d) => d.status), ['taken', 'upcoming']);
  assert.deepEqual(todaysDoses(undoDose(taken, 'a', '2026-11-11', '08:00'), at(11)).map((d) => d.status), ['missed', 'upcoming']);
});

test('recording twice replaces the earlier status', () => {
  const at = new Date(2026, 10, 11, 9);
  let d = recordDose(base, 'a', '2026-11-11', '08:00', 'skipped', at);
  d = recordDose(d, 'a', '2026-11-11', '08:00', 'taken', at);
  assert.equal(d.doses.length, 1);
  assert.equal(d.doses[0].status, 'taken');
});

test('adherence over the last 7 days', () => {
  const now = new Date(2026, 10, 11, 12);
  let d = base;
  d = recordDose(d, 'a', '2026-11-10', '08:00', 'taken', now);
  d = recordDose(d, 'a', '2026-11-10', '20:00', 'taken', now);
  d = recordDose(d, 'a', '2026-11-09', '08:00', 'skipped', now);
  const r = adherence(d, now, 7);
  // Window is 4-10 Nov. Amlodipine: 2/day x 7 days = 14; Amoxicillin (ended 5 Nov): 4 and 5 Nov = 2.
  assert.equal(r.scheduled, 16);
  assert.equal(r.taken, 2);
});

test('parseMeds survives damaged data', () => {
  assert.deepEqual(parseMeds(null), { meds: [], doses: [] });
  const p = parseMeds({ meds: [{ id: 'x', name: 'X', times: ['8', 'bad', '08:00'] }, { name: 'no id' }], doses: [{ medId: 'x', date: '2026-11-11', time: '08:00', status: 'eaten' }] });
  assert.equal(p.meds.length, 1);
  assert.deepEqual(p.meds[0].times, ['08:00']);
  assert.equal(p.meds[0].remind, true);
  assert.equal(p.doses.length, 0);
});

/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { assess, formatValue, latestByMetric, makeEntry, parseEntries, series, summaryForChat, type Entry } from '../src/lib/health-log.ts';

const AT = new Date('2026-11-11T08:00:00Z');

test('blood pressure bands', () => {
  assert.equal(assess({ metric: 'bp', value: 115, value2: 75 })?.level, 'ok');
  assert.equal(assess({ metric: 'bp', value: 125, value2: 78 })?.level, 'watch');
  assert.equal(assess({ metric: 'bp', value: 145, value2: 85 })?.level, 'high');
  assert.equal(assess({ metric: 'bp', value: 130, value2: 92 })?.level, 'high'); // diastolic alone
  assert.equal(assess({ metric: 'bp', value: 185, value2: 100 })?.level, 'urgent');
  assert.equal(assess({ metric: 'bp', value: 150, value2: 121 })?.level, 'urgent');
  assert.equal(assess({ metric: 'bp', value: 85, value2: 55 })?.level, 'low');
});

test('blood sugar bands depend on fasting', () => {
  assert.equal(assess({ metric: 'sugar', value: 3.5 })?.level, 'urgent');
  assert.equal(assess({ metric: 'sugar', value: 6.0, fasting: true })?.level, 'watch');
  assert.equal(assess({ metric: 'sugar', value: 6.0, fasting: false })?.level, 'ok');
  assert.equal(assess({ metric: 'sugar', value: 7.2, fasting: true })?.level, 'high');
  assert.equal(assess({ metric: 'sugar', value: 12, fasting: false })?.level, 'high');
  assert.equal(assess({ metric: 'sugar', value: 18 })?.level, 'urgent');
});

test('temperature: fever advice mentions a malaria test', () => {
  const fever = assess({ metric: 'temp', value: 38.4 });
  assert.equal(fever?.level, 'high');
  assert.match(fever?.advice ?? '', /malaria/i);
  assert.equal(assess({ metric: 'temp', value: 36.8 })?.level, 'ok');
  assert.equal(assess({ metric: 'temp', value: 40 })?.level, 'urgent');
  assert.equal(assess({ metric: 'weight', value: 70 }), null);
});

test('makeEntry validates typed readings', () => {
  const bp = makeEntry('bp', { value: '128', value2: '84' }, AT);
  assert.ok(bp.ok && bp.entry.value === 128 && bp.entry.value2 === 84);
  assert.equal(makeEntry('bp', { value: '80', value2: '120' }, AT).ok, false); // reversed
  assert.equal(makeEntry('bp', { value: '120', value2: '' }, AT).ok, false);
  assert.equal(makeEntry('bp', { value: '1200', value2: '80' }, AT).ok, false); // typo
  const sugar = makeEntry('sugar', { value: '5,64', fasting: true }, AT);
  assert.ok(sugar.ok && sugar.entry.value === 5.6 && sugar.entry.fasting === true);
  assert.equal(makeEntry('temp', { value: 'hot' }, AT).ok, false);
  assert.equal(makeEntry('temp', { value: '98.6' }, AT).ok, false); // Fahrenheit
  assert.equal(makeEntry('symptom', { value: '', note: '' }, AT).ok, false);
  const sym = makeEntry('symptom', { value: '', note: ' Headache ' }, AT);
  assert.ok(sym.ok && sym.entry.note === 'Headache' && sym.entry.value === 0);
  assert.equal(makeEntry('mood', { value: '6' }, AT).ok, false);
});

test('formatting', () => {
  assert.equal(formatValue({ metric: 'bp', value: 120, value2: 80 }), '120/80 mmHg');
  assert.equal(formatValue({ metric: 'temp', value: 37 }), '37.0 °C');
  assert.equal(formatValue({ metric: 'mood', value: 4 }), 'Good');
});

const entries: Entry[] = [
  { id: '1', metric: 'bp', at: '2026-11-01T08:00:00Z', value: 130, value2: 85, note: '' },
  { id: '2', metric: 'bp', at: '2026-11-10T08:00:00Z', value: 125, value2: 82, note: 'after walk' },
  { id: '3', metric: 'weight', at: '2026-09-01T08:00:00Z', value: 70, note: '' },
  { id: '4', metric: 'symptom', at: '2026-11-09T08:00:00Z', value: 6, note: 'Headache' },
];

test('parseEntries drops junk and sorts newest first', () => {
  const parsed = parseEntries([...entries, null, { id: 'x', metric: 'nope', at: 'x', value: 1 }, { id: 'y', metric: 'bp', at: '2026-01-01', value: 'high' }]);
  assert.deepEqual(parsed.map((e) => e.id), ['2', '4', '1', '3']);
  assert.deepEqual(parseEntries('bad'), []);
});

test('latest per metric and chart series window', () => {
  const latest = latestByMetric(entries);
  assert.equal(latest.bp?.id, '2');
  assert.equal(latest.temp, undefined);
  const s = series(entries, 'bp', 7, AT);
  assert.deepEqual(s.map((p) => p.y), [125]);
  assert.equal(series(entries, 'bp', 30, AT).length, 2);
  assert.ok(series(entries, 'bp', 30, AT)[0].t < series(entries, 'bp', 30, AT)[1].t);
});

test('chat summary only includes the last two weeks', () => {
  const s = summaryForChat(entries, AT);
  assert.match(s, /125\/82/);
  assert.match(s, /Headache/);
  assert.doesNotMatch(s, /Weight/);
});

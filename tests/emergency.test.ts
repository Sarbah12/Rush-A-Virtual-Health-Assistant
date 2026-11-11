/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { DANGER_SIGNS, EMERGENCY_LINES } from '../src/constants/emergency.ts';

test('Ghana emergency numbers are correct and unique', () => {
  const byNumber = Object.fromEntries(EMERGENCY_LINES.map((l) => [l.number, l.name]));
  assert.equal(byNumber['112'], 'National emergency');
  assert.equal(byNumber['193'], 'Ambulance');
  assert.equal(byNumber['191'], 'Police');
  assert.equal(byNumber['192'], 'Fire');
  assert.equal(new Set(EMERGENCY_LINES.map((l) => l.number)).size, EMERGENCY_LINES.length);
});

test('112 and the ambulance are the big buttons, in that order', () => {
  assert.deepEqual(
    EMERGENCY_LINES.filter((l) => l.primary).map((l) => l.number),
    ['112', '193'],
  );
});

test('every danger sign is a readable sentence', () => {
  assert.ok(DANGER_SIGNS.length >= 6);
  for (const s of DANGER_SIGNS) assert.ok(s.length > 10 && s.length < 120, s);
});

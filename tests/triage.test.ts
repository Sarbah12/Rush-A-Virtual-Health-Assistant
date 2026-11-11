/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CONCERNS, EMPTY_ANSWERS, nextStep, triage, type Answers } from '../src/lib/triage.ts';

const a = (over: Partial<Answers>): Answers => ({ ...EMPTY_ANSWERS, who: 'adult', concern: 'headache', duration: 'today', severity: 'mild', ...over });

test('any general danger sign means emergency, and skips the rest', () => {
  const ans = { ...EMPTY_ANSWERS, dangerSigns: ['Chest pain or pressure'] };
  assert.equal(triage(ans).outcome, 'emergency');
  assert.equal(nextStep(ans, 'danger'), 'result');
  assert.equal(nextStep(EMPTY_ANSWERS, 'danger'), 'who');
});

test('concern-specific emergency questions', () => {
  const r = triage(a({ concern: 'fever', yes: ['stiffneck'] }));
  assert.equal(r.outcome, 'emergency');
  assert.equal(r.malariaTest, false);
  assert.equal(nextStep(a({ concern: 'fever', yes: ['stiffneck'] }), 'questions'), 'result');
  assert.equal(nextStep(a({ concern: 'fever', yes: ['yellow'] }), 'questions'), 'duration');
});

test('every fever gets a malaria test and same-day care', () => {
  const r = triage(a({ concern: 'fever' }));
  assert.equal(r.outcome, 'today');
  assert.ok(r.malariaTest);
  assert.match(r.advice.join(' '), /malaria test/i);
  assert.ok(triage(a({ concern: 'headache', yes: ['fever'] })).malariaTest);
});

test('vulnerable groups are sent sooner', () => {
  assert.equal(triage(a({ concern: 'diarrhoea', who: 'child' })).outcome, 'today');
  assert.equal(triage(a({ concern: 'diarrhoea', who: 'adult' })).outcome, 'selfcare');
  assert.equal(triage(a({ concern: 'headache', who: 'pregnant' })).outcome, 'today');
});

test('duration and severity', () => {
  assert.equal(triage(a({})).outcome, 'selfcare');
  assert.equal(triage(a({ severity: 'moderate' })).outcome, 'pharmacy');
  assert.equal(triage(a({ duration: 'longer' })).outcome, 'soon');
  assert.equal(triage(a({ duration: 'week', severity: 'mild' })).outcome, 'selfcare');
  assert.equal(triage(a({ duration: 'week', severity: 'moderate' })).outcome, 'soon');
  assert.equal(triage(a({ severity: 'severe' })).outcome, 'today');
});

test('outcome never goes down when more flags are added', () => {
  const order = ['selfcare', 'pharmacy', 'soon', 'today', 'emergency'];
  const lo = triage(a({ concern: 'rash', yes: ['spreading'] }));
  const hi = triage(a({ concern: 'rash', yes: ['spreading', 'swelling'] }));
  assert.ok(order.indexOf(hi.outcome) >= order.indexOf(lo.outcome));
  assert.equal(hi.outcome, 'emergency');
});

test('every non-emergency result includes the warning-signs reminder', () => {
  for (const c of CONCERNS) {
    const r = triage(a({ concern: c.key }));
    if (r.outcome !== 'emergency') assert.match(r.advice.join(' '), /danger sign/, c.key);
  }
});

/// <reference types="node" />
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildContext, parseChat, toApiMessages, type ChatMessage } from '../src/lib/chat.ts';
import { exportText } from '../src/lib/export.ts';
import { emptyMedicalId } from '../src/lib/medical-id.ts';
import { scan } from '../src/lib/safety.ts';

test('scanner catches emergencies in everyday wording', () => {
  for (const t of [
    'I have chest pain since morning',
    "I can't breathe properly",
    'my father collapsed',
    'my baby is not feeding and has fever',
    'She is having fits',
    'bleeding won’t stop',
    'He swallowed kerosene',
    'I think it is a stroke, his face is drooping',
    'pregnant and bleeding',
  ]) {
    assert.equal(scan(t)?.kind, 'emergency', t);
  }
});

test('scanner catches self-harm first', () => {
  for (const t of ['I want to die', 'thinking of suicide', 'I want to kill myself', "I don't want to live anymore"]) {
    assert.equal(scan(t)?.kind, 'selfharm', t);
  }
});

test('scanner leaves ordinary questions alone', () => {
  for (const t of ['I have a mild headache', 'my BP is 130/85', 'Is it ok to eat kenkey with diabetes?', 'I feel tired after work', 'My breathing exercises help me relax']) {
    assert.equal(scan(t), null, t);
  }
});

const m = (role: ChatMessage['role'], text: string, local?: ChatMessage['local']): ChatMessage => ({ id: text, role, text, at: '', ...(local ? { local } : {}) });

test('API messages drop local alerts, merge same-role turns and start with the user', () => {
  const out = toApiMessages([
    m('assistant', 'stray'),
    m('user', 'chest pain'),
    m('assistant', 'Call 112', 'emergency'),
    m('user', 'it is gone now'),
    m('assistant', 'Glad'),
    m('assistant', 'No internet', 'error'),
  ]);
  assert.deepEqual(out, [
    { role: 'user', content: 'chest pain\n\nit is gone now' },
    { role: 'assistant', content: 'Glad' },
  ]);
});

test('parseChat is defensive and keeps sharing off by default', () => {
  assert.deepEqual(parseChat(null), { messages: [], share: false });
  const p = parseChat({ messages: [{ id: '1', role: 'user', text: 'hi' }, { id: '2', role: 'system', text: 'x' }], share: 'yes' });
  assert.equal(p.messages.length, 1);
  assert.equal(p.share, false);
});

test('shared context never contains name, phone or emergency contact', () => {
  const id = { ...emptyMedicalId(), name: 'Kofi Mensah', phone: '0241234567', bloodGroup: 'O+' as const, sickleCell: 'AS' as const, allergies: 'Penicillin', contact: { name: 'Ama', relationship: 'Sister', phone: '0551234567' } };
  const ctx = buildContext(id, [], { meds: [], doses: [] }, new Date(2026, 10, 11));
  assert.match(ctx, /O\+/);
  assert.match(ctx, /Penicillin/);
  assert.match(ctx, /AS/);
  for (const secret of ['Kofi', 'Mensah', '0241234567', 'Ama', '0551234567']) assert.doesNotMatch(ctx, new RegExp(secret));
});

test('export includes the medical ID, medicines and log', () => {
  const id = { ...emptyMedicalId(), name: 'Kofi Mensah', dateOfBirth: '1990-03-04', bloodGroup: 'O+' as const };
  const text = exportText(
    id,
    [{ id: '1', metric: 'bp', at: '2026-11-10T08:00:00Z', value: 125, value2: 82, note: '' }],
    { meds: [{ id: 'a', name: 'Amlodipine', dose: '5mg', times: ['08:00'], notes: '', remind: true, endDate: '', createdAt: '' }], doses: [] },
    new Date(2026, 10, 11),
  );
  assert.match(text, /Kofi Mensah/);
  assert.match(text, /4 March 1990/);
  assert.match(text, /Amlodipine, 5mg at 8:00 am/);
  assert.match(text, /125\/82 mmHg/);
  assert.match(text, /Not a clinical record/);
});

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { contextBlock, SYSTEM_PROMPT } from '../src/prompt.ts';
import { LIMITS, parseChatRequest, RateLimiter } from '../src/validate.ts';

const ok = { installId: 'abcd1234efgh', messages: [{ role: 'user', content: 'I have a headache' }] };

test('accepts a normal request', () => {
  const r = parseChatRequest(ok);
  assert.ok(r.ok);
  if (r.ok) assert.equal(r.value.context, '');
});

test('rejects bad shapes', () => {
  assert.equal(parseChatRequest(null).ok, false);
  assert.equal(parseChatRequest({ ...ok, installId: 'x' }).ok, false);
  assert.equal(parseChatRequest({ ...ok, messages: [] }).ok, false);
  assert.equal(parseChatRequest({ ...ok, messages: [{ role: 'system', content: 'hi' }] }).ok, false);
  assert.equal(parseChatRequest({ ...ok, messages: [{ role: 'user', content: '   ' }] }).ok, false);
  assert.equal(parseChatRequest({ ...ok, messages: [{ role: 'assistant', content: 'hi' }] }).ok, false);
  assert.equal(parseChatRequest({ ...ok, messages: [...ok.messages, { role: 'assistant', content: 'ok' }] }).ok, false);
});

test('enforces size limits', () => {
  const long = 'x'.repeat(LIMITS.maxMessageChars + 1);
  assert.equal(parseChatRequest({ ...ok, messages: [{ role: 'user', content: long }] }).ok, false);
  const many = Array.from({ length: LIMITS.maxMessages + 1 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'hi' }));
  assert.equal(parseChatRequest({ ...ok, messages: many }).ok, false);
});

test('context is optional and capped', () => {
  const r = parseChatRequest({ ...ok, context: 'y'.repeat(10_000) });
  assert.ok(r.ok && r.value.context.length === LIMITS.maxContextChars);
  assert.equal(contextBlock('  '), null);
  assert.match(contextBlock('Blood group: O+') ?? '', /O\+/);
});

test('rate limiter: per hour, then recovers', () => {
  const rl = new RateLimiter(2, 10);
  const t = 1_000_000_000;
  assert.equal(rl.take('a', t), 0);
  assert.equal(rl.take('a', t + 1), 0);
  assert.ok(rl.take('a', t + 2) > 0);
  assert.equal(rl.take('b', t + 2), 0);
  assert.equal(rl.take('a', t + 3_600_001), 0);
});

test('rate limiter: per day', () => {
  const rl = new RateLimiter(100, 3);
  const t = 2_000_000_000;
  for (let i = 0; i < 3; i++) assert.equal(rl.take('a', t + i * 4_000_000), 0);
  assert.ok(rl.take('a', t + 13_000_000) > 0);
});

test('system prompt is stable (cacheable) and names the emergency numbers', () => {
  assert.doesNotMatch(SYSTEM_PROMPT, /\d{4}-\d{2}-\d{2}/);
  assert.match(SYSTEM_PROMPT, /112/);
  assert.match(SYSTEM_PROMPT, /193/);
});

import { privacyPage } from '../src/privacy.ts';

test('privacy page escapes the contact and states the key promises', () => {
  const html = privacyPage('a<b>@example.com');
  assert.match(html, /a&lt;b&gt;@example\.com/);
  assert.match(html, /not store or log/);
  assert.match(html, /never sent/);
  assert.match(privacyPage(''), /store listing/);
});

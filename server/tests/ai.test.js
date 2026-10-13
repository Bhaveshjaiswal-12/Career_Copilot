import test from 'node:test';
import assert from 'node:assert';
import { classifyAiError } from '../src/services/ai.service.js';

test('AI Error Classification', async (t) => {
  await t.test('classifies 429 quota exhaustion properly', () => {
    const err = new Error('Quota exceeded for resource: gemini-2.0-flash (RESOURCE_EXHAUSTED)');
    err.status = 429;

    const classified = classifyAiError(err);
    assert.strictEqual(classified.code, 'AI_QUOTA_EXHAUSTED');
    assert.strictEqual(classified.statusCode, 429);
    assert.strictEqual(classified.retryable, false);
    assert.ok(classified.message.includes('usage limit'));
  });

  await t.test('classifies transient rate limit properly', () => {
    const err = new Error('Rate limit exceeded. Please slow down.');
    err.status = 429;

    const classified = classifyAiError(err);
    assert.strictEqual(classified.code, 'AI_RATE_LIMITED');
    assert.strictEqual(classified.statusCode, 429);
    assert.strictEqual(classified.retryable, true);
  });

  await t.test('classifies safety block', () => {
    const err = new Error('Candidate response was blocked due to SAFETY filters.');

    const classified = classifyAiError(err);
    assert.strictEqual(classified.code, 'AI_SAFETY_REFUSAL');
    assert.strictEqual(classified.statusCode, 400);
    assert.strictEqual(classified.retryable, false);
  });

  await t.test('classifies 503 unavailable as retryable', () => {
    const err = new Error('The service is temporarily unavailable');
    err.status = 503;

    const classified = classifyAiError(err);
    assert.strictEqual(classified.code, 'AI_SERVICE_UNAVAILABLE');
    assert.strictEqual(classified.statusCode, 503);
    assert.strictEqual(classified.retryable, true);
  });
});

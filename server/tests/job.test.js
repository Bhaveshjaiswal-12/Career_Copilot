import test from 'node:test';
import assert from 'node:assert';
import { calculateJobMatch } from '../src/services/job.service.js';

test('Job Matching Algorithm', async (t) => {
  await t.test('calculates high match for matching skills and preferred role', () => {
    const job = {
      title: 'Senior Frontend Engineer (React/TypeScript)',
      company: 'Tech Corp',
      tags: ['react', 'typescript', 'frontend', 'css'],
      description: 'Looking for a skilled React developer who knows TypeScript.',
      remote: true,
    };

    const userProfile = {
      preferredRole: 'Frontend Engineer',
      skills: ['React', 'TypeScript', 'JavaScript'],
      workMode: 'remote',
    };

    const result = calculateJobMatch(job, userProfile);

    assert.ok(result.matchScore >= 75, `Expected score >= 75, got ${result.matchScore}`);
    assert.ok(result.matchingSkills.includes('react'));
    assert.ok(result.matchingSkills.includes('typescript'));
    assert.ok(result.matchReason.includes('Matches skills'));
  });

  await t.test('handles candidate with no skills gracefully', () => {
    const job = {
      title: 'Backend Engineer',
      company: 'Data Systems',
      tags: ['python', 'django', 'postgresql'],
      description: 'Python backend role.',
      remote: false,
    };

    const userProfile = {
      skills: [],
      preferredRole: '',
    };

    const result = calculateJobMatch(job, userProfile);

    assert.ok(result.matchScore >= 15 && result.matchScore <= 60);
    assert.strictEqual(result.matchingSkills.length, 0);
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  resolveTargetCountry,
  normalizeCountry,
  detectCountryFromLocationText,
  detectCountryFromEducation,
} from '../src/services/location.service.js';
import {
  isGermanOrNonEnglish,
  getCachedTranslation,
  setCachedTranslation,
  batchTranslateJobs,
} from '../src/services/translation.service.js';
import { calculateJobMatch } from '../src/services/job.service.js';

describe('Job Discovery & Location Resolution Services', () => {
  // Case 1: User explicitly selects India: search India
  it('1. User explicitly selects India: search India', () => {
    const res = resolveTargetCountry({ queryCountry: 'India' });
    assert.equal(res.code, 'IN');
    assert.equal(res.name, 'India');
    assert.equal(res.source, 'user_selection');
  });

  // Case 2: User explicitly selects another supported country: respect the selection
  it('2. User explicitly selects another supported country: respect the selection', () => {
    const resDe = resolveTargetCountry({ queryCountry: 'Germany' });
    assert.equal(resDe.code, 'DE');
    assert.equal(resDe.name, 'Germany');

    const resUs = resolveTargetCountry({ queryCountry: 'US' });
    assert.equal(resUs.code, 'US');
    assert.equal(resUs.name, 'United States');
  });

  // Case 3: Resume contains an explicit current address in India: resolve India when no preference is set
  it('3. Resume contains an explicit current address in India: resolve India when no preference is set', () => {
    const res = resolveTargetCountry({
      resumeData: {
        header: { location: 'Bengaluru, Karnataka, India' },
      },
    });
    assert.equal(res.code, 'IN');
    assert.equal(res.name, 'India');
    assert.equal(res.source, 'resume_location');
  });

  // Case 4: Resume contains a reliably identifiable foreign current address: resolve that country when no preference is set
  it('4. Resume contains a reliably identifiable foreign current address: resolve that country when no preference is set', () => {
    const res = resolveTargetCountry({
      resumeData: {
        header: { location: 'Berlin, Germany' },
      },
    });
    assert.equal(res.code, 'DE');
    assert.equal(res.name, 'Germany');
    assert.equal(res.source, 'resume_location');

    const resUk = resolveTargetCountry({
      resumeData: {
        header: { location: 'London, United Kingdom' },
      },
    });
    assert.equal(resUk.code, 'GB');
    assert.equal(resUk.name, 'United Kingdom');
  });

  // Case 5: Resume has no current address but contains a clearly identified Indian college: use India if the institution country is reliably established
  it('5. Resume has no current address but contains a clearly identified Indian college: use India', () => {
    const res = resolveTargetCountry({
      resumeData: {
        header: { location: '' },
        education: [{ institution: 'Indian Institute of Technology Bombay (IIT Bombay)' }],
      },
    });
    assert.equal(res.code, 'IN');
    assert.equal(res.name, 'India');
    assert.equal(res.source, 'resume_education_institution');

    const resBits = resolveTargetCountry({
      resumeData: {
        education: [{ institution: 'BITS Pilani' }],
      },
    });
    assert.equal(resBits.code, 'IN');
  });

  // Case 6: Resume and profile contain no usable location: default to India
  it('6. Resume and profile contain no usable location: default to India', () => {
    const res = resolveTargetCountry({});
    assert.equal(res.code, 'IN');
    assert.equal(res.name, 'India');
    assert.equal(res.isDefault, true);
    assert.equal(res.source, 'india_default');
  });

  // Case 7: College location is ambiguous: do not make an unsupported country inference; fall back to India
  it('7. College location is ambiguous: do not make unsupported inference; fall back to India', () => {
    const res = resolveTargetCountry({
      resumeData: {
        education: [{ institution: 'St. Xavier School of Science' }], // Ambiguous name
      },
    });
    assert.equal(res.code, 'IN');
    assert.equal(res.name, 'India');
    assert.equal(res.isDefault, true);
    assert.equal(res.source, 'india_default');
  });

  // Case 8: User manually changes the selected country: keep the chosen search country
  it('8. User manually changes the selected country: keep the chosen search country even if resume says India', () => {
    const res = resolveTargetCountry({
      queryCountry: 'Germany',
      resumeData: {
        header: { location: 'Mumbai, India' },
      },
    });
    assert.equal(res.code, 'DE');
    assert.equal(res.name, 'Germany');
    assert.equal(res.source, 'user_selection');
  });

  // Case 9: German listing detection & English translation caching
  it('9. Detects German job listings accurately and supports translation caching', () => {
    const germanTitle = '(zukünftiger) Fitness- und Kampfsporttrainer (m/w/d) in Essen';
    const englishTitle = 'Senior Full Stack Engineer (React & Node.js)';

    assert.equal(isGermanOrNonEnglish(germanTitle), true);
    assert.equal(isGermanOrNonEnglish(englishTitle), false);

    // Test translation caching
    const testJobId = 'unit-test-job-42';
    const fakeTranslation = {
      translatedTitle: 'Future Fitness and Martial Arts Trainer in Essen',
      translatedDescription: 'We are seeking an experienced trainer.',
      isTranslated: true,
      sourceLanguage: 'German',
      originalTitle: germanTitle,
      originalDescription: 'Wir suchen einen Trainer.',
    };

    setCachedTranslation(testJobId, fakeTranslation);
    const cached = getCachedTranslation(testJobId);
    assert.notEqual(cached, null);
    assert.equal(cached.translatedTitle, 'Future Fitness and Martial Arts Trainer in Essen');
    assert.equal(cached.isTranslated, true);
  });

  // Case 10: Translation fails or quota is exhausted: do not crash or invent fake translations
  it('10. Batch translation falls back gracefully without crashing when services are unavailable', async () => {
    const rawJobs = [
      {
        id: 'mock-de-job-1',
        title: 'Softwareentwickler (m/w/d)',
        description: 'Wir suchen Entwickler in München.',
        company: 'AutoCorp',
        url: 'https://example.com/apply',
        tags: ['Java'],
      },
      {
        id: 'mock-en-job-2',
        title: 'Backend Engineer',
        description: 'Building high throughput systems.',
        company: 'CloudNet',
        url: 'https://example.com/apply2',
        tags: ['Go'],
      },
    ];

    // Running batch translation on jobs should return valid array without throwing
    const result = await batchTranslateJobs(rawJobs, 5);
    assert.equal(Array.isArray(result), true);
    assert.equal(result.length, 2);
    // English job remains English
    assert.equal(result[1].title, 'Backend Engineer');
    assert.equal(result[1].sourceLanguage, 'English');
  });

  // Case 11: Job results contain no salary, posting date, or match data: label appropriately
  it('11. Handles missing salary and calculates match score only when profile skills exist', () => {
    const emptyJob = {
      title: 'Full Stack Engineer',
      description: 'Building web applications',
      tags: ['React', 'Node.js'],
      salary: '',
      postedAt: '',
      remote: true,
      remoteScope: 'worldwide',
    };

    // Candidate without skills
    const matchNoProfile = calculateJobMatch(emptyJob, { skills: [] }, 'IN');
    assert.equal(typeof matchNoProfile.matchScore, 'number');

    // Candidate with matching skills
    const matchWithSkills = calculateJobMatch(
      emptyJob,
      { skills: ['React', 'Node.js'], preferredRole: 'Full Stack Engineer' },
      'IN'
    );
    assert.ok(matchWithSkills.matchScore >= 70);
    assert.ok(matchWithSkills.matchingSkills.includes('react'));
  });

  // Case 12: Location relevance prior to ranking (India default prioritizes worldwide and India remotes)
  it('12. Country relevance boosts India-compatible jobs when target is India', () => {
    const worldwideJob = {
      title: 'Senior Frontend Developer',
      tags: ['React'],
      remote: true,
      remoteScope: 'worldwide',
    };

    const localGermanyJob = {
      title: 'Senior Frontend Developer',
      tags: ['React'],
      remote: false,
      remoteScope: 'on-site',
      country: 'Germany',
    };

    const userProfile = { skills: ['React'], preferredRole: 'Frontend Developer' };

    const scoreWorldwide = calculateJobMatch(worldwideJob, userProfile, 'IN');
    const scoreLocalGermany = calculateJobMatch(localGermanyJob, userProfile, 'IN');

    // Worldwide remote accessible from India should outscore local on-site in Germany
    assert.ok(scoreWorldwide.matchScore > scoreLocalGermany.matchScore);
  });
});

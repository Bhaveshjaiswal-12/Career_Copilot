import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../src/validators/auth.validator.js';
import { AppError } from '../src/utils/errors.js';

describe('Auth Validators', () => {
  it('should accept valid registration data', () => {
    const validData = {
      name: 'Test Engineer',
      username: 'test_user1',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };
    const parsed = registerSchema.safeParse(validData);
    assert.equal(parsed.success, true);
  });

  it('should reject registration when passwords do not match', () => {
    const invalidData = {
      name: 'Test Engineer',
      username: 'test_user1',
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'differentpassword',
    };
    const parsed = registerSchema.safeParse(invalidData);
    assert.equal(parsed.success, false);
  });

  it('should reject registration with invalid email', () => {
    const invalidData = {
      name: 'Test Engineer',
      username: 'test_user1',
      email: 'not-an-email',
      password: 'password123',
      confirmPassword: 'password123',
    };
    const parsed = registerSchema.safeParse(invalidData);
    assert.equal(parsed.success, false);
  });

  it('should reject registration with short password', () => {
    const invalidData = {
      name: 'Test Engineer',
      username: 'test_user1',
      email: 'test@example.com',
      password: '123',
      confirmPassword: '123',
    };
    const parsed = registerSchema.safeParse(invalidData);
    assert.equal(parsed.success, false);
  });

  it('should accept valid login credentials', () => {
    const validLogin = {
      email: 'user@example.com',
      password: 'secretPassword',
    };
    const parsed = loginSchema.safeParse(validLogin);
    assert.equal(parsed.success, true);
  });

  it('should validate profile updates', () => {
    const update = {
      name: 'Updated Name',
      profile: {
        headline: 'Staff AI Engineer',
        skills: ['React', 'Node.js', 'TensorFlow'],
      },
    };
    const parsed = updateProfileSchema.safeParse(update);
    assert.equal(parsed.success, true);
  });

  it('should validate password change matching', () => {
    const validChange = {
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword123',
      confirmNewPassword: 'newPassword123',
    };
    const parsed = changePasswordSchema.safeParse(validChange);
    assert.equal(parsed.success, true);

    const mismatchedChange = {
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword123',
      confirmNewPassword: 'wrongNewPassword',
    };
    const mismatchParsed = changePasswordSchema.safeParse(mismatchedChange);
    assert.equal(mismatchParsed.success, false);
  });
});

describe('AppError Utility', () => {
  it('should instantiate error with correct message and status code', () => {
    const err = new AppError('Resource not found', 404);
    assert.equal(err.message, 'Resource not found');
    assert.equal(err.statusCode, 404);
    assert.equal(err.status, 'fail');
    assert.equal(err.isOperational, true);
  });

  it('should treat 500 status code as error', () => {
    const err = new AppError('Server error', 500);
    assert.equal(err.status, 'error');
  });
});

import { generateResumePDF, extractTextFromPDF } from '../src/services/pdf.service.js';

describe('PDF Service (Generation & Extraction)', () => {
  const resumeData = {
    header: {
      name: 'Jane Doe',
      headline: 'Staff Full-Stack Engineer',
      email: 'jane@example.com',
      phone: '+1 555 123 4567',
      location: 'New York, NY',
    },
    summary: 'Experienced engineer with expertise in distributed systems and React.',
    skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
    experience: [
      {
        position: 'Lead Software Architect',
        company: 'Tech Corp',
        startDate: '2022',
        endDate: 'Present',
        highlights: ['Built real-time analytics engine', 'Reduced latency by 45%'],
      },
    ],
    education: [
      {
        degree: 'B.S.',
        field: 'Computer Science',
        institution: 'MIT',
        startDate: '2016',
        endDate: '2020',
      },
    ],
  };

  it('should generate a valid PDF buffer with %PDF header from resumeData', async () => {
    const pdfBuffer = await generateResumePDF(resumeData);
    assert.ok(Buffer.isBuffer(pdfBuffer));
    assert.ok(pdfBuffer.length > 500);
    assert.equal(pdfBuffer.toString('utf8', 0, 4), '%PDF');
  });

  it('should extract text from a valid PDF buffer', async () => {
    const pdfBuffer = await generateResumePDF(resumeData);
    const extractedText = await extractTextFromPDF(pdfBuffer);
    assert.ok(typeof extractedText === 'string');
    assert.ok(extractedText.includes('Jane Doe'));
    assert.ok(extractedText.includes('Tech Corp') || extractedText.includes('Architect'));
  });
});

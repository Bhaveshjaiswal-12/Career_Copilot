import { AppError } from '../utils/errors.js';

/**
 * Middleware factory that validates request body against a Zod schema.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const issues = result.error.issues || result.error.errors || [];
    const messages = issues.map((err) => err.message);
    throw new AppError(messages[0] || 'Validation failed.', 400);
  }

  req.body = result.data; // Use the parsed/cleaned data
  next();
};

export default validate;

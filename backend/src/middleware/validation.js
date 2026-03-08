import { body, validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate
];

export const userValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('first_name').notEmpty().trim(),
  body('last_name').notEmpty().trim(),
  body('role').isIn(['admin', 'doctor', 'nurse', 'patient']),
  validate
];

export const clinicalRecordValidation = [
  body('blood_pressure_systolic').optional().isInt({ min: 60, max: 250 }),
  body('blood_pressure_diastolic').optional().isInt({ min: 40, max: 150 }),
  body('heart_rate').optional().isInt({ min: 30, max: 250 }),
  body('temperature').optional().isFloat({ min: 30, max: 45 }),
  body('oxygen_saturation').optional().isInt({ min: 50, max: 100 }),
  validate
];
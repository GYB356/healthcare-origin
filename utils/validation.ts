/**
 * Validation utilities for form data
 */

interface LoginData {
  email: string;
  password: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: {
    email?: string;
    password?: string;
    [key: string]: string | undefined;
  };
}

/**
 * Validates login form data
 * @param data Login form data containing email and password
 * @returns Validation result with errors if any
 */
export const validateLoginData = (data: LoginData): ValidationResult => {
  const errors: ValidationResult["errors"] = {};

  // Validate email
  if (!data.email) {
    errors.email = "Email is required";
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = "Email is invalid";
  }

  // Validate password
  if (!data.password) {
    errors.password = "Password is required";
  } else if (data.password.length < 6) {
    errors.password = "Password must be at least 6 characters";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Generic field validator
 * @param value Field value
 * @param validators Array of validator functions
 * @returns Error message or empty string if valid
 */
export const validateField = (
  value: any,
  validators: Array<(val: any) => string | null>,
): string => {
  for (const validator of validators) {
    const error = validator(value);
    if (error) {
      return error;
    }
  }
  return "";
};

// Common validators
export const required =
  (fieldName: string) =>
  (value: any): string | null =>
    !value ? `${fieldName} is required` : null;

export const minLength =
  (fieldName: string, min: number) =>
  (value: string): string | null =>
    value && value.length < min ? `${fieldName} must be at least ${min} characters` : null;

export const maxLength =
  (fieldName: string, max: number) =>
  (value: string): string | null =>
    value && value.length > max ? `${fieldName} cannot exceed ${max} characters` : null;

export const isEmail = (value: string): string | null =>
  value && !/\S+@\S+\.\S+/.test(value) ? "Email is invalid" : null;

export const isNumeric =
  (fieldName: string) =>
  (value: any): string | null =>
    value && isNaN(Number(value)) ? `${fieldName} must be a number` : null;

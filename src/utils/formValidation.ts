
interface ValidationResult {
  valid: boolean;
  message?: string;
}

/**
 * Validates sign-in form data
 * 
 * @param email - User's email address
 * @param password - User's password
 * @returns Validation result with status and optional error message
 */
export const validateSignInForm = (email: string, password: string): ValidationResult => {
  if (!email || !password) {
    return {
      valid: false,
      message: "Email and password are required"
    };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      message: "Please enter a valid email address"
    };
  }
  
  if (password.length < 6) {
    return {
      valid: false,
      message: "Password must be at least 6 characters"
    };
  }
  
  return { valid: true };
};

/**
 * Validates sign-up form data
 * 
 * @param email - User's email address
 * @param password - User's password
 * @param username - User's chosen username (optional)
 * @returns Validation result with status and optional error message
 */
export const validateSignUpForm = (
  email: string, 
  password: string, 
  username?: string
): ValidationResult => {
  // First run standard sign-in validations
  const baseValidation = validateSignInForm(email, password);
  if (!baseValidation.valid) {
    return baseValidation;
  }
  
  // Add sign-up specific validations
  if (username && username.length < 3) {
    return {
      valid: false,
      message: "Username must be at least 3 characters"
    };
  }
  
  return { valid: true };
};

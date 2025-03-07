
/**
 * Form validation utility functions
 */

export const validateEmail = (email: string): { valid: boolean; message?: string } => {
  if (!email) {
    return { valid: false, message: "Email is required" };
  }
  
  if (!email.includes('@')) {
    return { valid: false, message: "Please enter a valid email address" };
  }
  
  return { valid: true };
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (!password) {
    return { valid: false, message: "Password is required" };
  }
  
  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters long" };
  }
  
  return { valid: true };
};

export const validateSignInForm = (email: string, password: string): { 
  valid: boolean; 
  message?: string 
} => {
  if (!email || !password) {
    return { valid: false, message: "Please fill in all required fields" };
  }
  
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return emailValidation;
  }
  
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return passwordValidation;
  }
  
  return { valid: true };
};

import DOMPurify from 'dompurify';

// Utility functions for input validation and sanitization

export const sanitizeHtml = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u'],
    ALLOWED_ATTR: []
  });
};

export const sanitizeText = (text: string): string => {
  // Remove potential XSS patterns
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePassword = (password: string): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateYouTubeUrl = (url: string): boolean => {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  return youtubeRegex.test(url);
};

export const validateChannelId = (channelId: string): boolean => {
  // YouTube channel IDs are typically 24 characters starting with UC
  const channelIdRegex = /^UC[a-zA-Z0-9_-]{22}$/;
  return channelIdRegex.test(channelId);
};

export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 255);
};

export const validateTextLength = (text: string, maxLength: number): boolean => {
  return text.length <= maxLength;
};

export const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const validateAdminPin = (pin: string): { isValid: boolean; error?: string } => {
  if (!pin || pin.trim().length === 0) {
    return { isValid: false, error: 'PIN is required' };
  }
  
  if (pin.length < 4) {
    return { isValid: false, error: 'PIN must be at least 4 characters' };
  }
  
  if (pin.length > 50) {
    return { isValid: false, error: 'PIN is too long' };
  }
  
  // Check for common weak patterns
  if (/^(\d)\1+$/.test(pin)) {
    return { isValid: false, error: 'PIN cannot be all the same digit' };
  }
  
  if (/^(0123|1234|2345|3456|4567|5678|6789|9876|8765|7654|6543|5432|4321|3210)/.test(pin)) {
    return { isValid: false, error: 'PIN cannot be a simple sequence' };
  }
  
  return { isValid: true };
};

export const rateLimitKey = (identifier: string, type: string): string => {
  return `rate_limit:${type}:${identifier}`;
};

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};
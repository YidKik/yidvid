// CSRF Protection utilities for forms
import React from 'react';

export class CSRFProtection {
  private static token: string | null = null;
  private static readonly TOKEN_KEY = 'csrf_token';
  private static readonly TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

  // Generate a new CSRF token
  static generateToken(): string {
    const token = crypto.randomUUID();
    const expiryTime = Date.now() + this.TOKEN_EXPIRY;
    
    sessionStorage.setItem(this.TOKEN_KEY, JSON.stringify({
      token,
      expiryTime
    }));
    
    this.token = token;
    return token;
  }

  // Get current valid token
  static getToken(): string | null {
    try {
      const stored = sessionStorage.getItem(this.TOKEN_KEY);
      if (!stored) return this.generateToken();
      
      const { token, expiryTime } = JSON.parse(stored);
      
      if (Date.now() > expiryTime) {
        return this.generateToken();
      }
      
      this.token = token;
      return token;
    } catch {
      return this.generateToken();
    }
  }

  // Validate token
  static validateToken(providedToken: string): boolean {
    const currentToken = this.getToken();
    return currentToken === providedToken;
  }

  // Create CSRF protected headers
  static getProtectedHeaders(): Record<string, string> {
    return {
      'X-CSRF-Token': this.getToken() || ''
    };
  }

  // Clear token (on logout)
  static clearToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    this.token = null;
  }
}

// HOC for protecting form components
export function withCSRFProtection<T extends object>(
  WrappedComponent: React.ComponentType<T>
): React.ComponentType<T> {
  return function CSRFProtectedComponent(props: T) {
    // Generate token on component mount
    React.useEffect(() => {
      CSRFProtection.getToken();
    }, []);

    return React.createElement(WrappedComponent, props);
  };
}

// Hook for CSRF protection in forms
export function useCSRFProtection() {
  const [token, setToken] = React.useState<string>('');

  React.useEffect(() => {
    setToken(CSRFProtection.getToken() || '');
  }, []);

  const getProtectedHeaders = React.useCallback(() => {
    return CSRFProtection.getProtectedHeaders();
  }, []);

  const validateSubmission = React.useCallback((formToken: string) => {
    return CSRFProtection.validateToken(formToken);
  }, []);

  return {
    token,
    getProtectedHeaders,
    validateSubmission
  };
}
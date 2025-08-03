import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { validateEmail, validatePassword, sanitizeText } from '@/utils/security/inputValidation';

interface AuthCredentials {
  email: string;
  password: string;
}

interface SignUpData extends AuthCredentials {
  confirmPassword: string;
  name?: string;
}

export const useSecureAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const checkRateLimit = async (identifier: string, attemptType: 'login' | 'signup') => {
    try {
      const response = await supabase.functions.invoke('secure-rate-limit', {
        body: {
          identifier,
          attemptType,
          action: 'check'
        }
      });

      if (response.error || response.data?.blocked) {
        const message = response.data?.message || 'Too many attempts. Please try again later.';
        setAuthError(message);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return true; // Allow if rate limit service is down
    }
  };

  const incrementRateLimit = async (identifier: string, attemptType: 'login' | 'signup') => {
    try {
      await supabase.functions.invoke('secure-rate-limit', {
        body: {
          identifier,
          attemptType,
          action: 'increment'
        }
      });
    } catch (error) {
      console.error('Failed to increment rate limit:', error);
    }
  };

  const resetRateLimit = async (identifier: string, attemptType: 'login' | 'signup') => {
    try {
      await supabase.functions.invoke('secure-rate-limit', {
        body: {
          identifier,
          attemptType,
          action: 'reset'
        }
      });
    } catch (error) {
      console.error('Failed to reset rate limit:', error);
    }
  };

  const logSecurityEvent = async (eventType: string, details: any, severity: 'info' | 'warning' | 'critical' = 'info') => {
    try {
      await supabase.functions.invoke('log-security-event', {
        body: {
          eventType,
          details,
          severity
        }
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  const signIn = async ({ email, password }: AuthCredentials): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      // Validate inputs
      const cleanEmail = sanitizeText(email.toLowerCase().trim());
      const cleanPassword = sanitizeText(password);

      if (!validateEmail(cleanEmail)) {
        setAuthError('Please enter a valid email address');
        return false;
      }

      if (!cleanPassword) {
        setAuthError('Password is required');
        return false;
      }

      // Check rate limiting
      if (!(await checkRateLimit(cleanEmail, 'login'))) {
        return false;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        console.error('Sign in error:', error);
        
        // Log failed attempt
        await Promise.all([
          logSecurityEvent('failed_login', { 
            email: cleanEmail, 
            error: error.message,
            timestamp: new Date().toISOString()
          }, 'warning'),
          incrementRateLimit(cleanEmail, 'login')
        ]);

        // User-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          setAuthError('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setAuthError('Please check your email and click the confirmation link before signing in.');
        } else if (error.message.includes('Too many requests')) {
          setAuthError('Too many login attempts. Please try again later.');
        } else {
          setAuthError('Unable to sign in. Please try again later.');
        }
        return false;
      }

      if (data.user) {
        // Reset rate limit on successful login
        await resetRateLimit(cleanEmail, 'login');
        
        // Log successful login
        await logSecurityEvent('successful_login', { 
          userId: data.user.id,
          email: cleanEmail,
          timestamp: new Date().toISOString()
        }, 'info');

        toast.success('Welcome back!');
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Unexpected sign in error:', error);
      setAuthError('An unexpected error occurred. Please try again.');
      
      await logSecurityEvent('auth_error', { 
        error: error.message,
        type: 'signin',
        timestamp: new Date().toISOString()
      }, 'critical');
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async ({ email, password, confirmPassword, name }: SignUpData): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      // Validate inputs
      const cleanEmail = sanitizeText(email.toLowerCase().trim());
      const cleanPassword = sanitizeText(password);
      const cleanConfirmPassword = sanitizeText(confirmPassword);
      const cleanName = name ? sanitizeText(name.trim()) : undefined;

      if (!validateEmail(cleanEmail)) {
        setAuthError('Please enter a valid email address');
        return false;
      }

      const passwordValidation = validatePassword(cleanPassword);
      if (!passwordValidation.isValid) {
        setAuthError(passwordValidation.errors[0]);
        return false;
      }

      if (cleanPassword !== cleanConfirmPassword) {
        setAuthError('Passwords do not match');
        return false;
      }

      if (cleanName && cleanName.length > 100) {
        setAuthError('Name must be less than 100 characters');
        return false;
      }

      // Check rate limiting
      if (!(await checkRateLimit(cleanEmail, 'signup'))) {
        return false;
      }

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: cleanPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: cleanName || '',
            email_notifications: false
          }
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        
        // Log failed attempt
        await Promise.all([
          logSecurityEvent('failed_signup', { 
            email: cleanEmail, 
            error: error.message,
            timestamp: new Date().toISOString()
          }, 'warning'),
          incrementRateLimit(cleanEmail, 'signup')
        ]);

        if (error.message.includes('User already registered')) {
          setAuthError('An account with this email already exists. Please sign in instead.');
        } else if (error.message.includes('Password should be')) {
          setAuthError('Password does not meet security requirements. Please choose a stronger password.');
        } else {
          setAuthError('Unable to create account. Please try again later.');
        }
        return false;
      }

      if (data.user) {
        // Reset rate limit on successful signup
        await resetRateLimit(cleanEmail, 'signup');
        
        // Log successful signup
        await logSecurityEvent('successful_signup', { 
          userId: data.user.id,
          email: cleanEmail,
          timestamp: new Date().toISOString()
        }, 'info');

        if (data.user.email_confirmed_at) {
          toast.success('Account created successfully! Welcome!');
        } else {
          toast.success('Account created! Please check your email to confirm your account.');
        }
        return true;
      }

      return false;
    } catch (error: any) {
      console.error('Unexpected sign up error:', error);
      setAuthError('An unexpected error occurred. Please try again.');
      
      await logSecurityEvent('auth_error', { 
        error: error.message,
        type: 'signup',
        timestamp: new Date().toISOString()
      }, 'critical');
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const cleanEmail = sanitizeText(email.toLowerCase().trim());

      if (!validateEmail(cleanEmail)) {
        setAuthError('Please enter a valid email address');
        return false;
      }

      const redirectUrl = `${window.location.origin}/auth/reset-password`;

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: redirectUrl
      });

      if (error) {
        console.error('Password reset error:', error);
        setAuthError('Unable to send password reset email. Please try again later.');
        return false;
      }

      toast.success('Password reset email sent! Please check your inbox.');
      return true;
    } catch (error: any) {
      console.error('Unexpected password reset error:', error);
      setAuthError('An unexpected error occurred. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    signUp,
    resetPassword,
    isLoading,
    authError,
    setAuthError
  };
};
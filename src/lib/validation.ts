/**
 * Validation utilities for auth forms
 */

/**
 * Validates email format using regex
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Password strength levels
 */
export type PasswordStrengthLevel = 'weak' | 'medium' | 'strong';

export interface PasswordStrength {
  score: number; // 0-4
  label: PasswordStrengthLevel;
  color: string;
}

/**
 * Calculates password strength based on multiple criteria
 * - Length (8+ chars)
 * - Uppercase letters
 * - Lowercase letters
 * - Numbers
 * - Special characters
 */
export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;

  if (!password) {
    return { score: 0, label: 'weak', color: '#EF4444' }; // red
  }

  // Length check (8+ characters)
  if (password.length >= 8) {
    score += 1;
  }

  // Has uppercase
  if (/[A-Z]/.test(password)) {
    score += 1;
  }

  // Has lowercase
  if (/[a-z]/.test(password)) {
    score += 1;
  }

  // Has numbers
  if (/[0-9]/.test(password)) {
    score += 1;
  }

  // Has special characters
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 1;
  }

  // Map score to label and color
  if (score <= 2) {
    return { score, label: 'weak', color: '#EF4444' }; // red
  } else if (score <= 3) {
    return { score, label: 'medium', color: '#F59E0B' }; // yellow/amber
  } else {
    return { score, label: 'strong', color: '#22C55E' }; // green
  }
}

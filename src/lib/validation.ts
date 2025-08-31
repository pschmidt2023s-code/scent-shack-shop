/**
 * Security validation utilities
 */

// Enhanced input sanitization to prevent XSS
export const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/[<>'"&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[char] || char;
    })
    // Remove potentially dangerous patterns
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/style\s*=/gi, '')
    .trim();
};

// Sanitize HTML content more aggressively
export const sanitizeHtml = (html: string): string => {
  if (typeof html !== 'string') {
    return '';
  }
  
  // Remove all HTML tags except safe ones
  return html
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<style[^>]*>.*?<\/style>/gis, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gis, '')
    .replace(/<object[^>]*>.*?<\/object>/gis, '')
    .replace(/<embed[^>]*>/gis, '')
    .replace(/<form[^>]*>.*?<\/form>/gis, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gis, '')
    .replace(/javascript:/gis, '')
    .replace(/data:/gis, '')
    .replace(/vbscript:/gis, '')
    .trim();
};

// Validate email format
export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'Email is required' };
  }
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const sanitizedEmail = sanitizeInput(email);
  
  if (!emailRegex.test(sanitizedEmail)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  if (sanitizedEmail !== email) {
    return { isValid: false, message: 'Email contains invalid characters' };
  }
  
  return { isValid: true };
};

// Phone number validation (international format)
export const validatePhoneNumber = (phone: string): { isValid: boolean; message?: string } => {
  if (!phone || phone.trim().length === 0) {
    return { isValid: true }; // Optional field
  }

  // Remove all non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Check length (7-15 digits for international numbers)
  if (cleanPhone.length < 7 || cleanPhone.length > 15) {
    return { 
      isValid: false, 
      message: 'Phone number must be between 7-15 digits' 
    };
  }

  // Basic format check (allow common formats)
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,20}$/;
  if (!phoneRegex.test(phone)) {
    return { 
      isValid: false, 
      message: 'Please enter a valid phone number' 
    };
  }

  return { isValid: true };
};

// Postal code validation by country
export const validatePostalCode = (postalCode: string, country: string = 'Germany'): { isValid: boolean; message?: string } => {
  if (!postalCode || postalCode.trim().length === 0) {
    return { isValid: false, message: 'Postal code is required' };
  }

  const cleanCode = postalCode.trim();
  
  // Country-specific validation
  const patterns: Record<string, { regex: RegExp; message: string }> = {
    'Germany': {
      regex: /^\d{5}$/,
      message: 'German postal code must be 5 digits'
    },
    'Austria': {
      regex: /^\d{4}$/,
      message: 'Austrian postal code must be 4 digits'
    },
    'Switzerland': {
      regex: /^\d{4}$/,
      message: 'Swiss postal code must be 4 digits'
    },
    'France': {
      regex: /^\d{5}$/,
      message: 'French postal code must be 5 digits'
    },
    'Netherlands': {
      regex: /^\d{4}\s?[A-Z]{2}$/i,
      message: 'Dutch postal code format: 1234 AB'
    },
    'United Kingdom': {
      regex: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
      message: 'UK postal code format: SW1A 1AA'
    },
    'United States': {
      regex: /^\d{5}(-\d{4})?$/,
      message: 'US ZIP code format: 12345 or 12345-6789'
    }
  };

  const pattern = patterns[country];
  if (!pattern) {
    // Generic validation for unsupported countries
    if (cleanCode.length < 3 || cleanCode.length > 10) {
      return { 
        isValid: false, 
        message: 'Postal code must be between 3-10 characters' 
      };
    }
    return { isValid: true };
  }

  if (!pattern.regex.test(cleanCode)) {
    return { 
      isValid: false, 
      message: pattern.message 
    };
  }

  return { isValid: true };
};

// Password strength validation
export const validatePasswordStrength = (password: string): { isValid: boolean; message?: string; strength: 'weak' | 'medium' | 'strong' } => {
  if (!password) {
    return { isValid: false, message: 'Password is required', strength: 'weak' };
  }

  if (password.length < 8) {
    return { 
      isValid: false, 
      message: 'Password must be at least 8 characters long', 
      strength: 'weak' 
    };
  }

  let score = 0;
  const checks = {
    length: password.length >= 12,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /\d/.test(password),
    symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  // Calculate strength score
  Object.values(checks).forEach(check => {
    if (check) score++;
  });

  if (score < 3) {
    return { 
      isValid: false, 
      message: 'Password must contain at least 3 of: uppercase, lowercase, numbers, symbols', 
      strength: 'weak' 
    };
  }

  const strength = score >= 4 ? 'strong' : 'medium';
  return { isValid: true, strength };
};
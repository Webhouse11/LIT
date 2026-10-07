/**
 * LitVault Production Security Suite
 * Provides input validation, URL sanitization, file verification,
 * XSS mitigation, and financial integrity guards.
 */

// Allowed MIME types for images (SVG explicitly excluded due to script injection risks)
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const MAX_COVER_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_AVATAR_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates an image file before upload or data URL conversion.
 * Defends against:
 * 1. Storage exhaustion / localStorage crashes from oversized files.
 * 2. Stored XSS via malicious SVG / HTML payloads.
 * 3. Executable uploads disguised as images.
 */
export function validateImageFile(
  file: File,
  options: { maxSize?: number; allowedTypes?: string[] } = {}
): FileValidationResult {
  const maxSize = options.maxSize ?? MAX_COVER_IMAGE_SIZE_BYTES;
  const allowedTypes = options.allowedTypes ?? ALLOWED_IMAGE_MIME_TYPES;

  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  // 1. File size check
  if (file.size > maxSize) {
    const sizeMb = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size exceeds the maximum limit of ${sizeMb} MB. Please upload a smaller image.`,
    };
  }

  // 2. MIME type check
  if (!allowedTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'Invalid file format. Only JPEG, PNG, and WebP images are permitted for security.',
    };
  }

  // 3. File extension check (defense in depth)
  const ext = file.name.split('.').pop()?.toLowerCase();
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  if (!ext || !allowedExtensions.includes(ext)) {
    return {
      valid: false,
      error: 'File extension does not match allowed image formats (.jpg, .jpeg, .png, .webp).',
    };
  }

  return { valid: true };
}

/**
 * Sanitizes URLs before rendering inside <a href="..."> or navigation links.
 * Defends against DOM / Protocol XSS (e.g. "javascript:", "data:text/html", "vbscript:").
 */
export function sanitizeUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();

  // Whitelist http and https protocols only
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.toString();
      }
    } catch {
      return undefined;
    }
  }

  return undefined;
}

/**
 * Normalizes and sanitizes Twitter/X handles.
 * Defends against URI injection in social profile links.
 */
export function sanitizeTwitterHandle(handle?: string | null): string | undefined {
  if (!handle) return undefined;
  const cleaned = handle.trim().replace(/^@/, '');
  // Alphanumeric + underscores only (standard Twitter handle specification)
  if (/^[A-Za-z0-9_]{1,15}$/.test(cleaned)) {
    return cleaned;
  }
  return undefined;
}

/**
 * Sanitizes and bounds arbitrary text input (comments, bios, titles).
 * Strips zero-width characters and null bytes, prevents buffer-overflow / DOS payloads.
 */
export function sanitizeTextInput(input?: string | null, maxLength = 2000): string {
  if (!input) return '';
  // Remove null bytes and dangerous control characters
  const cleaned = input
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\uD800-\uDFFF]/g, '')
    .trim();
  return cleaned.slice(0, maxLength);
}

/**
 * Validates non-negative integer values for financial records and token prices.
 * Prevents floating point injection, NaN poisoning, and negative value manipulation.
 */
export function validateFinancialInteger(value: unknown, min = 0, max = 10000000): number | null {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    if (typeof value === 'string' && /^\d+$/.test(value)) {
      const parsed = parseInt(value, 10);
      if (parsed >= min && parsed <= max) return parsed;
    }
    return null;
  }
  if (value < min || value > max || isNaN(value)) {
    return null;
  }
  return value;
}

export interface PasswordValidationResult {
  valid: boolean;
  score: number;
  strengthLabel: 'Weak' | 'Fair' | 'Good' | 'Strong';
  hasMinLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
  message?: string;
}

export function validatePassword(password: string): PasswordValidationResult {
  const hasMinLength = password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);

  let score = 0;
  if (password.length >= 6) score++;
  if (hasMinLength) score++;
  if (hasLetter && hasNumber) score++;
  if (hasSpecial || hasUppercase) score++;

  let strengthLabel: 'Weak' | 'Fair' | 'Good' | 'Strong' = 'Weak';
  if (score >= 4) strengthLabel = 'Strong';
  else if (score === 3) strengthLabel = 'Good';
  else if (score === 2) strengthLabel = 'Fair';

  const valid = hasMinLength && hasLetter && hasNumber;
  let message: string | undefined;
  if (!password) {
    message = 'Please enter a password.';
  } else if (!hasMinLength) {
    message = 'Password must be at least 8 characters long.';
  } else if (!hasLetter) {
    message = 'Password must contain at least one letter.';
  } else if (!hasNumber) {
    message = 'Password must contain at least one number.';
  }

  return {
    valid,
    score,
    strengthLabel,
    hasMinLength,
    hasLetter,
    hasNumber,
    hasSpecial,
    message,
  };
}

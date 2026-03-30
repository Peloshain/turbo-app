// Client-side validation — runs before any network call

export const EMAIL_RULES = {
  minPasswordLength: 8,
  maxPasswordLength: 128,
};

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < EMAIL_RULES.minPasswordLength)
    return `Password must be at least ${EMAIL_RULES.minPasswordLength} characters`;
  return null;
}

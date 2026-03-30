export const MAGIC_LINK_CONFIG = {
  expiresInMinutes: 15,
};

export function validateMagicLinkEmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email";
  return null;
}

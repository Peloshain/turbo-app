// packages/auth/src/validators.ts

export function validateEmail(email: string): string | null {
  if (!email) return "Email es requerido";

  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) return "Email inválido";

  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password es requerido";
  if (password.length < 6) return "Mínimo 6 caracteres";

  return null;
}

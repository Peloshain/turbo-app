import { authClient } from "../auth/client";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Wrapper around fetch that automatically injects the Better Auth
// session cookie from SecureStore into every request header.
// Use this instead of plain fetch() for all authenticated API calls.
export async function authedFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const cookies = authClient.getCookie();

  return fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      ...(cookies ? { Cookie: cookies } : {}),
    },
  });
}

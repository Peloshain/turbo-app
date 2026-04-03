import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import { magicLinkClient } from "better-auth/client/plugins";
import * as SecureStore from "expo-secure-store";
import { clientEnv } from "./env";

// Single authClient instance shared across the entire mobile app.
// - expoClient handles SecureStore cookies + OAuth deep links automatically
// - magicLinkClient adds authClient.signIn.magicLink()
export const authClient = createAuthClient({
  baseURL: clientEnv.API_URL,
  plugins: [
    expoClient({
      scheme: "wardrobe", // Must match scheme in app.json
      storagePrefix: "wardrobe", // Prefix for SecureStore keys
      storage: SecureStore,
    }),
    magicLinkClient(),
  ],
});

// Re-export the inferred types for use in hooks
export type Session = typeof authClient.$Infer.Session;
export type User = typeof authClient.$Infer.Session.user;

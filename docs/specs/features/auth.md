# Spec: Authentication

**Status:** Approved
**Author:** [you]
**Last Updated:** 2026-05-26
**Audit Ref:** Retroactive spec — documents existing implementation

---

## Problem

Users need to create an account and sign in to access their personal wardrobe and outfits. All wardrobe and outfit data is private and user-scoped.

## Out of Scope

- Social auth (Google, Apple) — post-MVP, see ADR-002
- Password reset flow — post-MVP
- Email verification — post-MVP
- Multi-device session management UI

## User Stories

- As a new user, I want to create an account with email and password so I can start building my wardrobe.
- As a returning user, I want to sign in so I can access my saved items and outfits.

---

## Requirements

### Functional

- SHALL allow registration with email and password
- SHALL allow sign in with email and password
- SHALL reject registration if email is already in use
- SHALL reject sign in if credentials are invalid
- SHALL create a session on successful sign in or registration
- SHALL allow sign out, which invalidates the current session
- SHALL redirect unauthenticated users to the sign-in screen
- SHALL NOT expose session tokens in plain AsyncStorage
- MAY show a loading state while auth requests are in flight

### Non-Functional

- Session must persist across app restarts
- Failed auth requests must surface a user-facing error message (not a silent failure)

---

## oRPC Procedures

Auth is handled entirely by Better Auth at `/api/auth/*` on the server.
No custom oRPC procedures exist for auth — do not add any.
Better Auth manages session creation, validation, and invalidation internally.

**Mobile client:** `lib/auth-client.ts` — Better Auth client config.
All auth actions go through this client. Never call `/api/auth/*` directly with raw fetch.

---

## Screens / UI States

### Sign In (`app/(auth)/sign-in.tsx`)

- [ ] Default state — email + password fields, sign in button
- [ ] Loading state — button disabled/loading while request is in flight
- [ ] Error state — `AuthErrorBar` displays message (invalid credentials, network error)
- [ ] Success — navigates to `(tabs)` root

### Sign Up (`app/(auth)/sign-up.tsx`)

- [ ] Default state — email + password fields, sign up button
- [ ] Loading state — button disabled/loading
- [ ] Error state — `AuthErrorBar` displays message (email taken, validation error)
- [ ] Success — navigates to `(tabs)` root

### Auth Gate (`app/_layout.tsx`)

- [ ] On app launch: validates session before rendering
- [ ] No session → redirect to `(auth)/sign-in`
- [ ] Valid session → render `(app)` / `(tabs)`

---

## Edge Cases

- User submits form with empty fields — validate client-side with Zod before calling auth client
- Network failure during sign in — surface error, do not leave user on blank screen
- Session expires mid-session — auth gate should catch this on next navigation and redirect to sign-in
- User navigates back to sign-in while already authenticated — redirect to tabs

---

## Open Questions

- [ ] Should session expiry trigger a silent re-auth attempt before redirecting to sign-in?

---

## Acceptance Criteria

- [ ] User can register with a new email and password
- [ ] User can sign in with valid credentials
- [ ] Invalid credentials show a user-facing error via `AuthErrorBar`
- [ ] Successful auth navigates to the main tab screen
- [ ] Session persists across app restarts
- [ ] Unauthenticated users cannot access any `(tabs)` screen
- [ ] Sign out clears session and redirects to sign-in

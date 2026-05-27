# Spec: Edit Profile

**Status:** Approved
**Author:** [you]
**Last Updated:** 2026-05-26
**Related:** [profile.md](./profile.md) — `profile.update` procedure is defined there

---

## Problem

Users need to update their display name so their profile reflects who they are.

## Out of Scope

- Email change (requires re-verification — post-MVP)
- Password change (post-MVP)
- Avatar / profile photo upload (post-MVP)
- Username or handle

## User Stories

- As a user, I want to update my display name so my profile shows the right name.

---

## Requirements

### Functional

- SHALL pre-populate the name field with the user's current name on load
- SHALL allow the user to edit and submit a new name
- SHALL validate that name is not empty before submitting
- SHALL call `profile.update` on submit
- SHALL navigate back to the profile screen on success
- SHALL show a loading state on the submit button while the request is in flight
- SHALL show an inline error if the update fails
- SHALL NOT allow submission while a request is already in flight

### Non-Functional

- Form should feel instant — no unnecessary loading states on mount
- Error message must be user-facing, not a raw API error string

---

## oRPC Procedure

Uses `profile.update` — defined in [profile.md](./profile.md#orpc-procedures).

No new procedures required for this screen.

---

## Screen: Edit Profile (`app/edit-profile/index.tsx`)

### Layout

- Single text input pre-filled with current name
- Save button
- Cancel / back navigation (header back button or explicit cancel)

### UI States

- [ ] Loading (initial) — input pre-filled from session/cache, no extra loading state needed if data is already in memory from profile screen
- [ ] Idle — input editable, Save button active
- [ ] Submitting — Save button shows loading indicator, input disabled
- [ ] Error — inline error message below input
- [ ] Success — navigates back to profile screen, profile screen refetches via `useFocusEffect`

---

## Edge Cases

- User clears the name field entirely — Save button disabled or submit blocked by Zod validation
- User submits the same name unchanged — allowed (no diff check required)
- Network failure during save — show error, keep user on screen with their edits intact
- User navigates back without saving — no changes persisted, profile unchanged

---

## Open Questions

- [ ] Should the screen use a stack header back button only, or also show an explicit "Cancel" button?

---

## Acceptance Criteria

- [ ] Name input is pre-populated with current user name on mount
- [ ] Empty name is rejected with a validation error before calling the server
- [ ] Successful save navigates back to profile
- [ ] Profile screen reflects the updated name after navigating back
- [ ] Submit button is disabled/loading during request
- [ ] Server error surfaces as a user-facing inline message
- [ ] Navigating back without saving leaves the profile unchanged

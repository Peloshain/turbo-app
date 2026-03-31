export { withAuth } from "./middleware";
export { getSessionUser } from "./session";

// Re-export AuthUser so API route handlers don't need to
// import from auth-core directly
export type { AuthUser } from "@repo/auth-core";

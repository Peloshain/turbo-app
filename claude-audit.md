Read the following files before doing anything else:

- CLAUDE.md
- apps/server/CLAUDE.md
- apps/mobile/CLAUDE.md
- docs/specs/\_decisions.md
- docs/specs/packages-api.md

Then perform a remediation audit across the entire monorepo.

Produce a single file at:
docs/specs/remediation/2026-05-26-initial-audit.md

Analyze these areas in order:

1. SECURITY
   - Unprotected routes in apps/server/src/routes/ (these bypass oRPC auth entirely)
   - Missing input validation
   - Env vars accessed via process.env directly (should use @repo/env)
   - Insecure storage on mobile (tokens in AsyncStorage)
   - Secrets or keys hardcoded anywhere

2. KNOWN BUGS — investigate these specifically
   - packages/api/src/context.ts: catch block may return undefined instead of { auth: null, session: null }
   - context.auth is always null — dead field, assess impact
   - console.log statements in production request paths (context.ts, index.ts)
   - healthCheck and privateData in appRouter are scaffolding — assess whether they should be removed

3. SPEC COMPLIANCE
   - Code in apps/server/src/routes/ that diverges from specs in docs/specs/features/
   - Any behavior in the codebase not covered by an existing spec

4. CODE QUALITY
   - Missing error handling
   - Inconsistent patterns between apps/server and apps/mobile
   - Dead code

5. ENHANCEMENTS
   - Performance concerns
   - Missing edge case handling

For each finding use exactly this format:

---

**ID:** 2026-05-26-NNN
**Severity:** Critical | High | Medium | Low
**Area:** Security | Bug | Spec | Quality | Enhancement
**Location:** `file/path.ts` line X–Y
**Problem:** what's wrong and why it matters
**Recommendation:** what to fix
**Effort:** Small | Medium | Large

---

Do NOT fix anything. Only analyze and document.
After all findings, add a ## Priority Matrix section that sorts findings by Severity then Effort.

# Run the audit with Claude Code

Open Claude Code in your repo root and paste this prompt:

```
You are performing an initial remediation audit on this monorepo.
Read CLAUDE.md, apps/server/CLAUDE.md, and apps/mobile/CLAUDE.md before starting.

Produce a remediation plan at:
docs/specs/remediation/2026-05-26-initial-audit.md

Analyze these areas in order:

1. SECURITY
   - Unprotected routes (especially legacy Hono routes in apps/server/src/routes/)
   - Missing auth checks
   - Input validation gaps
   - Exposed secrets or env var access outside @repo/env
   - Insecure storage on mobile

2. KNOWN BUGS (investigate these specifically)
   - createContext in packages/api/src/context.ts: catch block may return undefined
   - context.auth field in createContext is always null — dead field, assess impact
   - console.log statements in production request paths

3. SPEC COMPLIANCE
   - Features with no spec in docs/specs/features/
   - Code that diverges from any existing spec

4. CODE QUALITY
   - Missing error handling
   - Inconsistent patterns
   - Dead code

5. ENHANCEMENTS
   - Performance concerns
   - Missing edge case handling

For each finding use this format:
- ID: YYYY-MM-DD-NNN (e.g. 2026-05-26-001)
- Severity: Critical | High | Medium | Low
- Area: Security | Bug | Spec | Quality | Enhancement
- Location: file path + line range
- Problem: what's wrong and why it matters
- Recommendation: what to fix
- Effort: Small | Medium | Large

Do NOT fix anything. Only analyze and document.
```

# Review the output, then triage

Once the audit file is created, go through it and decide for each finding:

```
Critical + Small effort  → fix immediately (same day)
Critical + Large effort  → create a fix spec, prioritize this sprint
High                     → create a fix spec, schedule soon
Medium / Low             → backlog, create spec when you get to it
```

# Fix with spec-first discipline

For each fix, create a spec file first, then tell Claude Code to implement against it:

```
docs/specs/remediation/fix-context-undefined-return.md

# Fix: createContext undefined return on error

**Status:** Approved
**Severity:** High
**Audit ref:** 2026-05-26-001

## Problem
createContext in packages/api/src/context.ts swallows errors in the catch
block without returning a value. This causes oRPC to receive undefined as
context, leading to cryptic runtime errors instead of clean 401 responses.

## Fix
Return { auth: null, session: null } in the catch block.

## Acceptance Criteria
- [ ] catch block always returns a valid Context shape
- [ ] A failed getSession results in a 401 UNAUTHORIZED, not a 500
```

## Then in Claude Code:

```
Using docs/specs/remediation/fix-context-undefined-return.md as the spec,
implement the fix. Only change packages/api/src/context.ts.
Do not modify any other files.

The scope constraint (only change X) is important — it prevents Claude Code from going wide.
```

# The Rhythm Going Forward

Audit finding → write fix spec → implement against spec → commit both together

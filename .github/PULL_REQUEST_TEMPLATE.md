## What changed

<!--
1–3 sentences. What does this PR do?
-->

## Spec

- [ ] A spec exists and is **Approved** for this change
- [ ] Spec link: `docs/specs/`
- [ ] If behavior changed, the spec was updated in this PR

## Checklist

- [ ] No `process.env` accessed directly — all env vars go through `@repo/env`
- [ ] No new plain Hono routes added — new features use oRPC procedures in `packages/api`
- [ ] New oRPC procedures use `protectedProcedure` if they touch user data
- [ ] All new screens handle loading, error, empty, and success states
- [ ] New env vars (if any) added to `packages/env` with Zod validation
- [ ] `docs/specs/INDEX.md` updated if a spec was added or status changed

## Remediation (if applicable)

- [ ] Remediation spec linked: `docs/specs/remediation/`
- [ ] Root cause noted in the remediation doc
- [ ] Prevention step added to stop this class of issue recurring

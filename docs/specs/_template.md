# Spec: [Feature Name]

**Status:** Draft <!-- Draft | RFC | Approved | Deprecated -->
**Author:** [you]
**Last Updated:** YYYY-MM-DD
**Audit Ref:** <!-- link to remediation doc if this spec was created retroactively -->

---

## Problem

<!--
What user problem does this solve? 1–3 sentences.
Focus on the "why", not the "how".
-->

## Out of Scope

<!--
Explicit exclusions — what this feature does NOT do.
If it's a future consideration, note it here.
-->

## User Stories

<!--
- As a [user], I want to [action] so that [outcome].
Keep to 1–3 stories max. If you have more, split into multiple specs.
-->

---

## Requirements

### Functional

<!--
Use SHALL (required), SHALL NOT (prohibited), MAY (optional).
Be specific — vague requirements produce vague software.
-->

- SHALL ...
- SHALL NOT ...
- MAY ...

### Non-Functional

<!--
Performance, offline behavior, error recovery, etc.
Only include what's actually relevant to this feature.
-->

- Performance: ...
- Offline: ...

---

## oRPC Procedures

<!--
For any server-side work. Define the procedure name, input, output, and auth requirement.
These shapes are the source of truth for types in packages/api.
Skip this section for mobile-only changes.
-->

### `router.procedureName`

**Auth:** public | protected

**Input**

```ts
z.object({
  field: z.string(),
});
```

**Output**

```ts
{
  id: string;
}
```

**Error Cases**
| Code | Reason |
|------|--------|
| UNAUTHORIZED | No session |
| NOT_FOUND | Resource doesn't exist |

---

## Screens / UI States

<!--
For any mobile UI work. List every screen or component involved
and the states it must handle.
Skip this section for server-only changes.
-->

### [Screen Name]

- [ ] Loading state — use Skeleton component
- [ ] Error state — use ErrorCard component
- [ ] Empty state — meaningful message + action
- [ ] Success / happy path

---

## Edge Cases

<!--
Non-obvious scenarios that must be handled.
Think: what happens if the user does X at the wrong time?
What if a network request fails halfway through?
-->

- ...

---

## Open Questions

<!--
Unresolved decisions. Each must be resolved before status moves to Approved.
-->

- [ ] [Question] — resolve by [date or event]

---

## Acceptance Criteria

<!--
Binary, verifiable. Each item is either done or not done.
These become your manual or automated test cases.
-->

- [ ] ...
- [ ] ...

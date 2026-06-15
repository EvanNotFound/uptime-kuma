## Context

Custom status page domains are stored in `status_page_cname` and loaded into `StatusPage.domainMappingList` for request routing. The authenticated status page save handler replaces all domain rows for the page with the submitted `config.domainNameList`.

`StatusPage.vue` first loads public status page data from preload/API. Public config does not include `domainNameList`, so the component currently fills the field with an empty array for convenience. If edit mode is entered before authenticated config is loaded, saving that public-derived config can submit an empty domain list and delete existing custom domain mappings.

## Goals / Non-Goals

**Goals:**
- Keep custom domain mappings intact when a user edits unrelated status page settings.
- Ensure edit mode has an authenticated config snapshot before saving domain-related fields.
- Preserve deliberate domain removal when the authenticated edit form shows the existing domain list and the user removes entries.
- Add a server-side safety check so malformed or public-derived save payloads cannot silently wipe domains.

**Non-Goals:**
- Change the `status_page_cname` schema or domain uniqueness behavior.
- Add domain ownership verification or DNS validation.
- Change custom-domain routing behavior beyond preserving mappings.

## Decisions

1. **Explicitly hydrate admin config when entering edit mode.**
   - `edit()` should request `getStatusPage` after initializing the socket, instead of relying only on the `$root.loggedIn` watcher.
   - Rationale: `$root.loggedIn` may already be true before the status page component watcher observes a change.
   - Alternative considered: expose `domainNameList` in public config. Rejected because domain mappings are admin configuration and public status page payloads should remain minimal.

2. **Treat domain list hydration as part of save readiness.**
   - The UI should avoid saving while authenticated config is still loading for edit mode.
   - Rationale: an empty list is a valid intentional value only after the admin config has loaded.
   - Alternative considered: merge only `domainNameList` from private config into the public config. This is acceptable if simpler, but replacing config with the authenticated response keeps all admin-only editable fields consistent.

3. **Reject unsafe backend saves rather than preserving domains implicitly.**
   - The save handler should require `config.domainNameList` to be an array before replacing domain rows.
   - Rationale: missing/non-array domain data indicates the client did not submit a complete authenticated edit payload. Failing loudly is safer than silently accepting partial state.
   - Alternative considered: skip `updateDomainNameList()` when the field is missing. Rejected because it can hide client bugs and produce saves where most fields update but domains do not.

## Risks / Trade-offs

- **Edit mode may wait for socket/admin config before saving** → Use existing loading/disabled patterns where possible and show errors through existing toast handling.
- **Backend validation could reject older/custom clients that omit `domainNameList`** → This is intentional because those clients could otherwise delete or desynchronize domain mappings.
- **Race between public data and admin data** → Admin config should be requested when edit mode starts and save should only proceed after it is loaded.

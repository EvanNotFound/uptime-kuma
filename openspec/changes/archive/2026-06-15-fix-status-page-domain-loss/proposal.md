## Why

Editing a status page can accidentally remove its custom domain mappings when the admin-only domain list is not loaded before saving. This causes requests to custom status page domains to fall back to the default page until the domains are manually added again.

## What Changes

- Ensure status page edit mode loads private/admin configuration, including `domainNameList`, before a save can replace domain mappings.
- Prevent a status page save from clearing custom domains when the domain list was not safely hydrated.
- Preserve the ability to intentionally add, change, or remove status page custom domains from the edit UI.
- Add targeted validation for saving a status page after loading only public status page data.

## Capabilities

### New Capabilities
- `status-page-custom-domains`: Covers assigning custom domains to status pages and preserving those mappings during status page edits.

### Modified Capabilities

## Impact

- Affected frontend: `src/pages/StatusPage.vue` edit and save flow.
- Affected backend: `server/socket-handlers/status-page-socket-handler.js` status page save handling, and possibly `server/model/status_page.js` domain-list update validation.
- Affected data: existing `status_page_cname` rows must be preserved unless an authenticated edit explicitly changes the domain list.
- No database schema or dependency changes expected.

## Why

Existing public status page endpoints expose the information needed for programmatic status reads, but consumers must combine multiple Uptime Kuma-specific payloads to derive a page-level summary and component statuses. A conventional read-only summary endpoint will make status pages easier to consume from scripts, dashboards, and browser applications.

## What Changes

- Add a public, read-only status page summary API with a Statuspage-style response shape.
- Return page metadata, public components, active incidents, scheduled maintenances, and an overall status summary from one endpoint.
- Use conventional status fields such as `status.indicator`, `status.description`, and component `status` values.
- Allow cross-origin browser reads for the new endpoint.
- Return 404 for missing or unpublished status pages.
- Ensure public monitor display names are used and private monitor names are not exposed.

## Capabilities

### New Capabilities
- `status-page-summary-api`: Public read-only status page summary API using a conventional Statuspage-style JSON format.

### Modified Capabilities
- `status-page-monitor-display-names`: Public status page summary responses must preserve the existing requirement that public monitor names are display names rather than private monitor names.

## Impact

- Affected API: new `GET /api/status-page/:slug/summary.json` endpoint.
- Affected backend code: status page router, status page model, public monitor/group serialization paths, and related tests.
- No database migration or new runtime dependency is expected.

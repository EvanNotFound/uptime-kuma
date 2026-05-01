## 1. Backend Summary Model

- [x] 1.1 Add status mapping helpers for Statuspage-style page indicators and component statuses.
- [x] 1.2 Add a status page summary builder that returns `page`, `components`, `incidents`, `scheduled_maintenances`, and `status`.
- [x] 1.3 Build components from existing public group/monitor serialization so display names are used and private monitor names are not exposed.
- [x] 1.4 Include latest heartbeat-derived component status and `updated_at` values without exposing heartbeat history.

## 2. Public Summary Route

- [x] 2.1 Add `GET /api/status-page/:slug/summary.json` to the status page router with one-minute caching.
- [x] 2.2 Return 404 for missing or unpublished status pages.
- [x] 2.3 Set `Access-Control-Allow-Origin: *` for the summary endpoint.
- [x] 2.4 Return the summary JSON with the conventional Statuspage-style response shape.

## 3. Validation

- [x] 3.1 Add backend tests for status and component status mappings.
- [x] 3.2 Add or extend status page API coverage for published, missing, and unpublished summary requests.
- [x] 3.3 Add coverage that a public display name appears in the summary and the private monitor name does not.
- [x] 3.4 Run the relevant backend/status page validation and fix failures caused by this change.

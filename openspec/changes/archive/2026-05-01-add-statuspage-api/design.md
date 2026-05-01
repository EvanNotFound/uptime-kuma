## Context

Public status pages currently load data from multiple unauthenticated endpoints under `/api/status-page/`: the page configuration and public monitor groups come from `GET /api/status-page/:slug`, heartbeat and uptime data come from `GET /api/status-page/heartbeat/:slug`, and incident history has its own endpoint. This is workable for the bundled UI, but awkward for external consumers that want a single programmatic status summary.

The fork also has a local customization for status page monitor display names. Any new public status payload must use the same public serialization path so a configured display name is exposed as `name` and the private monitor name is not added anywhere else.

## Goals / Non-Goals

**Goals:**
- Provide a single public read-only JSON endpoint for a status page summary.
- Use a Statuspage-style response shape that is familiar to status page API consumers.
- Include enough data for common dashboard/script consumption: page metadata, components, active incidents, scheduled maintenances, and overall status.
- Allow browser applications on other origins to fetch the summary endpoint.
- Hide missing and unpublished pages behind the same 404 behavior.
- Preserve public display-name behavior for monitors.

**Non-Goals:**
- Do not add authenticated API keys, write endpoints, webhooks, pagination, or a versioned API namespace.
- Do not redesign existing status page UI data loading.
- Do not replace existing public endpoints or RSS/badge endpoints.
- Do not expose raw heartbeat history in the summary response.
- Do not add database schema changes or new dependencies.

## Decisions

### Add `GET /api/status-page/:slug/summary.json`

Expose a new route beside the existing public status page routes. The `.json` suffix mirrors the common public Statuspage endpoint style while fitting the current route structure.

Alternatives considered:
- `GET /api/status-page/:slug/status`: rejected because it is less recognizable for status page integrations and sounds like only the overall status.
- `GET /api/v2/summary.json`: rejected because Uptime Kuma status pages are slug-scoped and adding a new versioned API namespace is broader than needed.

### Use a Statuspage-style JSON shape

Return top-level `page`, `components`, `incidents`, `scheduled_maintenances`, and `status` keys. Keep fields intentionally small and stable:

- `page`: `id`, `name`, `url`, `updated_at`
- `components`: public monitor entries with `id`, `name`, `status`, `created_at`, `updated_at`, `position`, `description`, `group_id`, `page_id`, `group`, and `only_show_if_degraded`
- `incidents`: active public incidents already shown on the status page
- `scheduled_maintenances`: public maintenance entries already shown on the status page
- `status`: `indicator` and `description`

Alternatives considered:
- IETF `application/health+json`: rejected for this use case because it is centered on service health checks and uses `pass`/`warn`/`fail`, while public status pages conventionally expose page/component status summaries.
- Existing Uptime Kuma payloads combined as-is: rejected because the goal is a conventional external API, not just fewer requests.

### Map Uptime Kuma statuses to Statuspage-style strings

Use existing Uptime Kuma status calculations as the source of truth, then map to public strings:

Overall status indicators:
- all up → `none`
- partial down → `minor`
- all down → `critical`
- maintenance → `maintenance`
- no services → `none`

Component statuses:
- up → `operational`
- down → `major_outage`
- pending → `degraded_performance`
- maintenance → `under_maintenance`
- no heartbeat → `major_outage`

The overall description should come from the existing `StatusPage.getStatusDescription()` helper so wording stays aligned with the current UI/RSS behavior.

Alternatives considered:
- Return Uptime Kuma numeric status codes: rejected because external consumers asked for a conventional format.
- Return both numeric and string statuses: rejected to keep the summary response lean.

### Build components from public monitor serialization

Generate component names and public monitor metadata from `Group.toPublicJSON()` / `Monitor.toPublicJSON()` rather than raw monitor rows. This preserves the fork's display-name behavior and avoids leaking private monitor names.

Alternatives considered:
- Query monitor and monitor_group rows directly for fewer calls: rejected because it increases the chance of bypassing public serialization and leaking private names.

### Allow all origins only for the new summary endpoint

Set `Access-Control-Allow-Origin: *` on `summary.json` because the endpoint is intentionally public and read-only. Existing public endpoints can keep their current development-only CORS behavior to avoid changing unrelated API contracts.

Alternatives considered:
- Change CORS on all public status page endpoints: rejected as broader than requested.
- Require same-origin reads: rejected because browser dashboards are a primary target for the new endpoint.

### Return 404 for unpublished pages

If a status page is missing or not published, return the same 404 error shape. This avoids exposing whether an unpublished slug exists.

Alternatives considered:
- Return 403 for unpublished pages: rejected because it leaks existence.
- Match existing permissive endpoint behavior: rejected because the new endpoint is explicitly a public API.

## Risks / Trade-offs

- Public data leakage through direct monitor access → Build components through existing public JSON serialization and add tests for display-name behavior.
- Consumers expect exact Atlassian Statuspage fields → Use the recognizable top-level shape and core field names, but document that this is Statuspage-style rather than a full compatibility clone.
- No-heartbeat monitors may look like outages → Use `major_outage` for conservative signaling; consumers can inspect `updated_at` being null if they need to distinguish never-checked components.
- Many monitors cause extra queries → Follow existing status page patterns for a small scoped change; optimize later only if real usage shows a problem.
- CORS broadens access to public data → Limit `Access-Control-Allow-Origin: *` to the new read-only endpoint and keep unpublished pages hidden.

## Migration Plan

1. Deploy the new backend code; no database migration is required.
2. Existing status page UI and endpoints continue working unchanged.
3. Consumers can begin reading `/api/status-page/:slug/summary.json` for published status pages.
4. Rollback is removing the route/helper code; no persisted data changes need reverting.

## Open Questions

- Should maintenance entries be named `scheduled_maintenances` only, or should active maintenances also be included there to match existing Uptime Kuma status page display behavior? Default to including the existing public maintenance list.

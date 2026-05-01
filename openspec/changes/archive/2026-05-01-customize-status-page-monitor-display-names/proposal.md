## Why

This fork needs status pages to show visitor-facing service names without revealing the private monitor names used by the owner. The fork also needs a simple deployment path that stays easy to rebase against upstream Uptime Kuma.

## What Changes

- Add a per-status-page monitor display name used for public status page rendering and public status page APIs.
- Initialize existing status page monitor display names from the current monitor name during migration so existing pages keep the same visible labels after upgrade.
- Let authenticated status page editors customize the public display name for each listed monitor without changing the underlying monitor name.
- Ensure unauthenticated visitors do not receive the original private monitor name through the public status page payload.
- Replace the upstream `AGENTS.md` with fork-specific maintenance guidance for the personal customization and upstream sync workflow.
- Add a simple GitHub Actions workflow that publishes a rolling `edge` Docker image to GHCR for every push to `master`.

## Capabilities

### New Capabilities
- `status-page-monitor-display-names`: Public status pages can use per-status-page monitor display names that hide private monitor names from visitors.
- `fork-edge-image-publishing`: The fork publishes a simple rolling GHCR Docker image from the `master` branch.

### Modified Capabilities
- None.

## Impact

- Database schema and migrations for the `monitor_group` relation.
- Public status page serialization and API responses.
- Status page editor UI and save socket handler.
- Existing status page e2e coverage for monitor display behavior.
- Repository guidance in `AGENTS.md`.
- GitHub Actions workflow configuration for GHCR publishing.

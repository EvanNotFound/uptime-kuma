# Repository Notes

This repository is a personal fork of upstream Uptime Kuma:

https://github.com/louislam/uptime-kuma.git

The fork keeps local changes small so upstream can be synced with minimal conflicts. Prefer isolated, direct changes over broad refactors.

## Local Customizations

- Status page monitors can have public display names that differ from private monitor names.
- Public status page payloads must not expose private monitor names when a public display name is configured.
- A rolling Docker image is published to GHCR with the `edge` tag from the `master` branch.

## Upstream Sync

Use an `upstream` remote for the original project when syncing:

```bash
git remote add upstream https://github.com/louislam/uptime-kuma.git
```

Keep fork-only work grouped and documented so rebases are easy to review.

## Validation Expectations

Before deploying status page display-name changes, verify:

- Existing status page monitor names migrate without changing visible labels.
- Editing a status page monitor display name does not rename the private monitor.
- Public/incognito status page views show the public display name only.
- The `edge` image workflow builds the release image for `linux/amd64` and pushes to GHCR.

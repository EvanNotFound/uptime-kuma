# Uptime Kuma Fork

This repository is a personal fork of [Uptime Kuma](https://github.com/louislam/uptime-kuma), an easy-to-use self-hosted monitoring tool.

The fork keeps local changes small so it can stay close to upstream while supporting a few status-page and deployment customizations.

## What This Fork Changes

- **Public status page monitor names**
  - Status page monitor entries can have visitor-facing display names that differ from private monitor names.
  - Public status page views and public status page payloads use the display name and avoid exposing the private monitor name when one is configured.

- **Statuspage-style summary API**
  - Public status pages expose `GET /api/status-page/:slug/summary.json`.
  - The response includes page metadata, components, incidents, scheduled maintenances, and an overall status using conventional Statuspage-style field names.

- **Safer custom domain editing**
  - Status page custom domain mappings are preserved when editing unrelated status page settings.
  - Saves are guarded so an edit form that has not loaded the admin-only domain list cannot accidentally clear existing custom domains.

- **Rolling GHCR image**
  - Pushes to `master` publish a release image to GitHub Container Registry.
  - Image: `ghcr.io/evannotfound/uptime-kuma:edge`
  - Platform: `linux/amd64`

## Run This Fork

Docker Compose:

```yaml
services:
  uptime-kuma:
    image: ghcr.io/evannotfound/uptime-kuma:edge
    restart: unless-stopped
    volumes:
      - ./data:/app/data
    ports:
      - "3001:3001"
```

Then open `http://localhost:3001`.

> [!WARNING]
> File systems like NFS are not supported for Uptime Kuma's data directory. Use a local directory or Docker volume.

## Upstream Documentation

Most Uptime Kuma features, setup instructions, troubleshooting notes, and support discussions are maintained upstream:

- Upstream repository: <https://github.com/louislam/uptime-kuma>
- Install guide: <https://github.com/louislam/uptime-kuma/wiki/%F0%9F%94%A7-How-to-Install>
- Update guide: <https://github.com/louislam/uptime-kuma/wiki/%F0%9F%86%99-How-to-Update>

For issues unrelated to this fork's customizations, check upstream documentation and discussions first.

## Maintaining This Fork

Keep fork-only changes isolated and documented so upstream can be synced with minimal conflicts.

Add the upstream remote when needed:

```bash
git remote add upstream https://github.com/louislam/uptime-kuma.git
```

Before deploying fork-specific status page changes, verify:

- Existing status page monitor names keep their visible labels after migration.
- Editing a public display name does not rename the private monitor.
- Public/incognito status page views show only public display names.
- Editing status page settings does not clear custom domain mappings.
- The `edge` workflow builds and pushes `ghcr.io/evannotfound/uptime-kuma:edge`.

## License and Attribution

This fork follows the upstream Uptime Kuma license and keeps attribution to the original project:

<https://github.com/louislam/uptime-kuma>

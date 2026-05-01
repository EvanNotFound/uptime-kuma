## Context

Status page monitor entries are stored through the `monitor_group` relation. That relation already contains status-page-specific monitor settings such as clickable-link visibility (`send_url`) and custom public URL (`custom_url`). Public status page rendering currently loads monitor rows through `server/model/group.js`, serializes them through `Monitor.toPublicJSON()`, and exposes `monitor.name` directly to unauthenticated visitors.

This fork should keep changes small and easy to rebase against upstream. The main customization should therefore live at the existing status page monitor relation boundary rather than changing global monitor behavior.

## Goals / Non-Goals

**Goals:**
- Store a per-status-page public display name for each monitor listed on a status page.
- Use the public display name in unauthenticated status page responses and UI.
- Preserve existing status page labels after upgrade by migrating display names from current monitor names.
- Keep the private monitor name unchanged for authenticated monitor management.
- Add simple fork maintenance guidance and a simple GHCR `edge` image publishing workflow.

**Non-Goals:**
- Do not rename monitors globally.
- Do not add multiple alias fields or per-language names.
- Do not redesign the status page editor.
- Do not replace upstream release workflows.
- Do not add Docker Hub publishing or multi-architecture builds for the fork workflow.

## Decisions

### Store display names on `monitor_group`

Add a `display_name` column to `monitor_group` and expose it as the public monitor `name` when rendering status pages.

Alternatives considered:
- `monitor.display_name`: rejected because the alias needs to be status-page-specific and should not affect all uses of a monitor.
- Separate alias table: rejected because `monitor_group` already owns per-status-page monitor settings and adding another table would increase rebase and maintenance cost.

### Preserve the existing public JSON shape

Continue returning a `name` field from public monitor JSON, but populate it from `display_name`. The original monitor name must not be added to public JSON under another field.

Alternatives considered:
- Return both `name` and `displayName`: rejected because public clients would still receive the private name if `name` remained unchanged.
- Rename the public field to `displayName`: rejected because it would require larger frontend/API changes and could break existing consumers.

### Backfill aliases from current monitor names

The migration should initialize `monitor_group.display_name` with the associated `monitor.name` for existing rows.

Alternatives considered:
- Leave aliases blank: rejected because existing status pages would become visually incomplete until edited.
- Use a generic placeholder: rejected because existing pages would lose useful labels immediately after upgrade.

### Keep the editor data model simple

In the status page editor, the public group monitor object should continue using `name` as the visible status page label. When adding a monitor to a status page, clone the selected monitor object before editing so alias edits do not mutate the private monitor object held in frontend state.

Alternatives considered:
- Add a parallel frontend-only `displayName` property: rejected because it would require mapping between public and private names in more places.
- Fetch separate private/public monitor lists: rejected as unnecessary for this small fork customization.

### Add a new fork workflow instead of changing upstream release workflows

Create a small `.github/workflows/publish-edge.yml` workflow that builds and pushes `ghcr.io/${GITHUB_REPOSITORY,,}:edge` on `master` pushes for `linux/amd64` only.

Alternatives considered:
- Reuse `release-nightly.yml`: rejected because it is tied to upstream repository guards, Docker Hub credentials, and nightly tags.
- Multi-architecture workflow: rejected for now because the deployment target is a typical amd64 VPS and the user wants the workflow simple.

## Risks / Trade-offs

- Public name leak through another endpoint → Review public status page APIs and tests to ensure public monitor payloads only expose the alias as `name`.
- Migration compatibility across SQLite and MariaDB → Use Knex migration patterns and avoid dialect-specific SQL where practical.
- Empty alias from malformed input → Treat empty editor input as a display value decision, but keep migration defaults populated from monitor names.
- Frontend accidental private monitor rename → Clone selected monitor objects before adding them to public groups.
- GHCR image naming failure with uppercase owner/repo → Lowercase `GITHUB_REPOSITORY` before tagging.
- Rebase conflicts with upstream status page changes → Keep edits localized to existing status page model, socket handler, component, migration, and one new workflow.

## Migration Plan

1. Add `monitor_group.display_name` to fresh database initialization.
2. Add a Knex migration that adds the column to existing databases and backfills from joined `monitor.name` values.
3. Deploy the new image; Uptime Kuma should apply migrations on startup.
4. Verify existing status pages show the same names after startup.
5. Edit aliases as needed from the authenticated status page editor.

Rollback requires restoring a database backup taken before migration or running the migration down path in a controlled environment. The application should not depend on the column after rolling back code.

## Open Questions

- None. The initial migration default is current monitor name, the fork workflow target is `linux/amd64`, and `AGENTS.md` should be replaced with fork-specific guidance.

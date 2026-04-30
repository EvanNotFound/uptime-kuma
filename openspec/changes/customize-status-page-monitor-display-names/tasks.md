## 1. Database

- [x] 1.1 Add `display_name` to the fresh `monitor_group` schema in `db/knex_init_db.js`.
- [x] 1.2 Add a Knex migration that creates `monitor_group.display_name` and backfills existing rows from `monitor.name`.
- [x] 1.3 Add a down migration that drops `monitor_group.display_name`.

## 2. Status Page Public Data

- [x] 2.1 Update `Group.getMonitorList()` to load `monitor_group.display_name` with status page monitor relation data.
- [x] 2.2 Update public monitor serialization so public JSON uses `display_name` as `name` and does not include the private monitor name separately.
- [x] 2.3 Update status page saving so each `monitor_group` relation persists the edited public display name.

## 3. Status Page Editor UI

- [x] 3.1 Clone selected monitors before adding them to a public group to avoid mutating the private monitor object in frontend state.
- [x] 3.2 Add a display name field to the monitor settings dialog and bind it to the public group monitor name.
- [x] 3.3 Ensure the status page monitor list and badge dialog continue to use the public display name where appropriate.

## 4. Fork Deployment and Guidance

- [x] 4.1 Replace `AGENTS.md` with fork-specific guidance covering status page display names, upstream sync, validation, and GHCR `edge` deployment.
- [x] 4.2 Add a simple GitHub Actions workflow that builds the `linux/amd64` release image and pushes `ghcr.io/<owner>/<repository>:edge` on `master` pushes.
- [x] 4.3 Ensure the GHCR image name is lowercased and uses `GITHUB_TOKEN` package permissions instead of Docker Hub credentials.

## 5. Validation

- [x] 5.1 Update the status page e2e test to customize a monitor display name and verify visitors see the alias.
- [x] 5.2 Verify the e2e test asserts the original private monitor name is not visible on the public status page after aliasing.
- [x] 5.3 Run the relevant validation commands for lint, frontend build, and the status page e2e test, or document any environment blockers.

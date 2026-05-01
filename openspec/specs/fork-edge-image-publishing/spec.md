## Purpose

This fork publishes a simple rolling Docker image for deployment and documents fork-specific maintenance expectations.

## Requirements

### Requirement: Rolling GHCR edge image
The repository SHALL publish a Docker image tagged `edge` to GitHub Container Registry for pushes to the `master` branch.

#### Scenario: Push to master publishes edge image
- **WHEN** a commit is pushed to `master`
- **THEN** GitHub Actions builds the application Docker image
- **AND** pushes it to `ghcr.io/<owner>/<repository>:edge`

### Requirement: Simple fork image workflow
The edge image publishing workflow SHALL build only the `linux/amd64` release image and use GitHub-provided package permissions for GHCR authentication.

#### Scenario: Workflow builds amd64 release target
- **WHEN** the edge image workflow runs
- **THEN** it builds the `release` target from `docker/dockerfile` for `linux/amd64`
- **AND** it does not require Docker Hub credentials

### Requirement: Fork maintenance guidance
The repository SHALL contain fork-specific `AGENTS.md` guidance describing the local customization, upstream sync intent, and validation expectations.

#### Scenario: Maintainer reads repository guidance
- **WHEN** a maintainer or agent reads `AGENTS.md`
- **THEN** the guidance identifies this repository as a personal Uptime Kuma fork
- **AND** describes the status page monitor display name customization and rolling GHCR `edge` deployment path

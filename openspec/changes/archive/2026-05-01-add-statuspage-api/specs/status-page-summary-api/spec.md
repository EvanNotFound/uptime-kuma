## ADDED Requirements

### Requirement: Public status page summary endpoint
The system SHALL expose a public read-only Statuspage-style JSON summary endpoint for each status page at `GET /api/status-page/:slug/summary.json`.

#### Scenario: Published status page summary is requested
- **WHEN** an unauthenticated client requests `GET /api/status-page/:slug/summary.json` for a published status page
- **THEN** the system returns HTTP 200 with a JSON object containing `page`, `components`, `incidents`, `scheduled_maintenances`, and `status`

#### Scenario: Missing status page summary is requested
- **WHEN** an unauthenticated client requests the summary endpoint for a slug that does not exist
- **THEN** the system returns HTTP 404

#### Scenario: Unpublished status page summary is requested
- **WHEN** an unauthenticated client requests the summary endpoint for an unpublished status page
- **THEN** the system returns HTTP 404

### Requirement: Summary endpoint allows public browser reads
The system SHALL allow browser applications from any origin to read the status page summary endpoint.

#### Scenario: Cross-origin summary request
- **WHEN** a client requests `GET /api/status-page/:slug/summary.json` for a published status page
- **THEN** the response includes `Access-Control-Allow-Origin: *`

### Requirement: Summary response includes page metadata
The summary response SHALL include page metadata using conventional Statuspage-style field names.

#### Scenario: Page metadata is returned
- **WHEN** a published status page summary is returned
- **THEN** the `page` object contains `id`, `name`, `url`, and `updated_at`

### Requirement: Summary response includes public components
The summary response SHALL include public status page monitors as Statuspage-style components.

#### Scenario: Public monitor is returned as component
- **WHEN** a published status page includes a public monitor
- **THEN** the `components` array contains an entry for that monitor with `id`, `name`, `status`, `created_at`, `updated_at`, `position`, `description`, `group_id`, `page_id`, `group`, and `only_show_if_degraded`

#### Scenario: Non-public monitor is omitted
- **WHEN** a monitor is not part of a public status page group
- **THEN** the `components` array does not include that monitor

### Requirement: Summary response includes overall status
The summary response SHALL include an overall Statuspage-style status indicator and description derived from the public components' latest statuses.

#### Scenario: All public monitors are up
- **WHEN** all public monitors on the status page have latest status UP
- **THEN** `status.indicator` is `none`
- **AND** `status.description` is `All Systems Operational`

#### Scenario: Some public monitors are down
- **WHEN** at least one public monitor has latest status UP and at least one public monitor has latest status DOWN
- **THEN** `status.indicator` is `minor`
- **AND** `status.description` is `Partially Degraded Service`

#### Scenario: All public monitors are down
- **WHEN** every public monitor with a latest heartbeat has latest status DOWN
- **THEN** `status.indicator` is `critical`
- **AND** `status.description` is `Degraded Service`

#### Scenario: Public monitor is under maintenance
- **WHEN** at least one public monitor has latest status MAINTENANCE
- **THEN** `status.indicator` is `maintenance`
- **AND** `status.description` is `Under maintenance`

#### Scenario: Status page has no public services
- **WHEN** the status page has no public monitors with usable latest status data
- **THEN** `status.indicator` is `none`
- **AND** `status.description` is `No Services`

### Requirement: Summary response maps component statuses
The summary response SHALL map Uptime Kuma monitor statuses to conventional Statuspage-style component statuses.

#### Scenario: Up monitor component status
- **WHEN** a public monitor's latest status is UP
- **THEN** the corresponding component `status` is `operational`

#### Scenario: Down monitor component status
- **WHEN** a public monitor's latest status is DOWN
- **THEN** the corresponding component `status` is `major_outage`

#### Scenario: Pending monitor component status
- **WHEN** a public monitor's latest status is PENDING
- **THEN** the corresponding component `status` is `degraded_performance`

#### Scenario: Maintenance monitor component status
- **WHEN** a public monitor's latest status is MAINTENANCE
- **THEN** the corresponding component `status` is `under_maintenance`

#### Scenario: Monitor has no heartbeat
- **WHEN** a public monitor has no latest heartbeat
- **THEN** the corresponding component `status` is `major_outage`
- **AND** the component `updated_at` is null

### Requirement: Summary response includes public incidents and maintenances
The summary response SHALL include the status page's public active incidents and public maintenance entries.

#### Scenario: Active incident is returned
- **WHEN** a published status page has an active pinned incident
- **THEN** the `incidents` array includes that incident in its public JSON form

#### Scenario: Maintenance is returned
- **WHEN** a published status page has a public maintenance entry
- **THEN** the `scheduled_maintenances` array includes that maintenance in its public JSON form

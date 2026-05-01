## Purpose

Public status pages can present visitor-facing monitor names that differ from private monitor names.

## Requirements

### Requirement: Status page monitor display name
The system SHALL store a public display name for each monitor entry on a status page independently from the monitor's private name.

#### Scenario: Existing status page monitor entries are migrated
- **WHEN** an existing database is upgraded to include public display names
- **THEN** each existing status page monitor entry has its public display name initialized from the current private monitor name

#### Scenario: New status page monitor entry defaults to monitor name
- **WHEN** an authenticated user adds a monitor to a status page
- **THEN** the new status page monitor entry uses the current monitor name as its initial public display name

### Requirement: Public status page uses display name
The system SHALL use the status page monitor display name when rendering monitor labels for visitors.

#### Scenario: Visitor views status page
- **WHEN** an unauthenticated visitor opens a status page that contains a monitor with a customized public display name
- **THEN** the page shows the customized public display name for that monitor

#### Scenario: Public API returns monitor name
- **WHEN** an unauthenticated client requests public status page data for a monitor with a customized public display name
- **THEN** the monitor `name` value in the public response is the customized public display name

### Requirement: Private monitor name remains hidden from visitors
The system SHALL NOT expose the private monitor name to unauthenticated visitors through public status page monitor payloads when a public display name is configured.

#### Scenario: Customized display name hides private name
- **WHEN** an unauthenticated client requests public status page data for a monitor with private name `Private Origin` and public display name `Public Service`
- **THEN** the public monitor payload contains `Public Service` as the monitor name
- **AND** the public monitor payload does not contain `Private Origin`

### Requirement: Editor can customize public display name
The system SHALL allow authenticated status page editors to change the public display name of a monitor entry without changing the monitor's private name.

#### Scenario: Authenticated editor changes display name
- **WHEN** an authenticated editor changes a status page monitor display name and saves the status page
- **THEN** subsequent public status page views use the new display name
- **AND** the monitor's private name remains unchanged in monitor management

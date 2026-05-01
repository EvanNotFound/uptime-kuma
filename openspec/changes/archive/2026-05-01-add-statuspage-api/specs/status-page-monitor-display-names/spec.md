## MODIFIED Requirements

### Requirement: Public status page uses display name
The system SHALL use the status page monitor display name when rendering monitor labels for visitors.

#### Scenario: Visitor views status page
- **WHEN** an unauthenticated visitor opens a status page that contains a monitor with a customized public display name
- **THEN** the page shows the customized public display name for that monitor

#### Scenario: Public API returns monitor name
- **WHEN** an unauthenticated client requests public status page data for a monitor with a customized public display name
- **THEN** the monitor `name` value in the public response is the customized public display name

#### Scenario: Public summary API returns monitor name
- **WHEN** an unauthenticated client requests the public status page summary for a monitor with a customized public display name
- **THEN** the component `name` value in the summary response is the customized public display name

### Requirement: Private monitor name remains hidden from visitors
The system SHALL NOT expose the private monitor name to unauthenticated visitors through public status page monitor payloads when a public display name is configured.

#### Scenario: Customized display name hides private name
- **WHEN** an unauthenticated client requests public status page data for a monitor with private name `Private Origin` and public display name `Public Service`
- **THEN** the public monitor payload contains `Public Service` as the monitor name
- **AND** the public monitor payload does not contain `Private Origin`

#### Scenario: Public summary hides private name
- **WHEN** an unauthenticated client requests the public status page summary for a monitor with private name `Private Origin` and public display name `Public Service`
- **THEN** the summary component contains `Public Service` as the component name
- **AND** the summary response does not contain `Private Origin`

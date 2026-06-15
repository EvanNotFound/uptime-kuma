## ADDED Requirements

### Requirement: Preserve custom domains during status page edits
The system SHALL preserve existing custom domain mappings when an authenticated user saves unrelated status page settings.

#### Scenario: Save after authenticated domain list loads
- **WHEN** a status page has one or more custom domains and an authenticated user edits a non-domain setting after the admin status page configuration has loaded
- **THEN** the system MUST keep the existing custom domain mappings for that status page

#### Scenario: Save with public-derived incomplete config
- **WHEN** a save request does not include a valid admin-loaded domain name list
- **THEN** the system MUST reject the save instead of replacing existing custom domain mappings with an empty list

### Requirement: Support intentional custom domain changes
The system SHALL continue to allow authenticated users to add, update, and remove custom domains from the status page edit UI.

#### Scenario: Intentional domain removal
- **WHEN** an authenticated user opens edit mode, the existing domain list is loaded, and the user removes a domain before saving
- **THEN** the system MUST remove that domain mapping from the status page

#### Scenario: Intentional domain addition
- **WHEN** an authenticated user opens edit mode, adds a new domain, and saves
- **THEN** the system MUST map the new domain to that status page

### Requirement: Hydrate admin status page config before edit save
The status page edit UI SHALL load authenticated status page configuration before allowing a status page save from edit mode.

#### Scenario: User already logged in before opening edit mode
- **WHEN** an already-authenticated user opens a status page edit view
- **THEN** the UI MUST request the authenticated status page configuration including `domainNameList` before saving is allowed

#### Scenario: User logs in after public status page load
- **WHEN** a user opens a public status page, then authenticates and enters edit mode
- **THEN** the UI MUST request the authenticated status page configuration including `domainNameList` before saving is allowed

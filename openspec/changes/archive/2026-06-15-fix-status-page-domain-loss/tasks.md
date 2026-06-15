## 1. Frontend Edit Hydration

- [x] 1.1 Add a reusable admin status page config load path in `StatusPage.vue` that emits `getStatusPage` and stores the returned config.
- [x] 1.2 Call the admin config load path when entering edit mode, including when the user is already logged in before opening `?edit`.
- [x] 1.3 Prevent saving while edit-mode admin config is still loading or has not loaded a valid `domainNameList`.
- [x] 1.4 Keep intentional domain add/remove behavior working after admin config has loaded.

## 2. Backend Save Safety

- [x] 2.1 Add server-side validation so `saveStatusPage` rejects missing or non-array `config.domainNameList` before updating domain mappings.
- [x] 2.2 Ensure rejected saves do not delete existing `status_page_cname` rows or refresh `StatusPage.domainMappingList` with lost mappings.

## 3. Validation

- [x] 3.1 Add or update tests covering a status page save attempt with missing/unsafe domain list data.
- [x] 3.2 Manually or automatically verify that editing a non-domain field after custom domains exist preserves the mappings.
- [x] 3.3 Manually or automatically verify that intentionally removing a loaded domain still removes the mapping.
- [x] 3.4 Run the relevant frontend/backend checks for the changed files.

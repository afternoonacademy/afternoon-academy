# Changelog

## [0.2.0] - 2025-09-12
### Added
- Debug logging for full auth cycle (login, fetch user, logout) on web.
- Redirect logic for unauthenticated web sessions.

### Fixed
- Web stuck in loading state due to missing Appwrite exports.
- Web login not redirecting after successful sign-in.
- Export conflicts between `appwrite.web.ts` and `appwrite.native.ts`.

### Notes
- Mobile auth flow remains unchanged and stable.
- Both platforms now share consistent logout behaviour and debug logs.

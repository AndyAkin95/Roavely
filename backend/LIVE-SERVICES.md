# Roavely: Live-service integration plan (not activated)

The Phase 3/4 frontend is a device-local PWA. **No actual synchronized accounts, private cloud albums, price-provider polling, ticket status service, email/push notifications, or booking actions are active.** These are the technical requirements for turning the preview into a multi-person service.

## Account and group service
1. Provision a brand-new Supabase project called Roavely in the organization selected by the owner. Do not reuse the DeckVault database.
2. Review the existing `schema-draft.sql` and `ACTIVATION.md`. Fix all cross-trip foreign key consistency risks, RLS, invitation rate limiting and ownership/authorization checks.
3. Implement passwordless email login/sign-up, a linked personal profile, trip create/join/leave, secure time-limited invite links, and per-user settings.
4. Move locally saved records from localStorage into authenticated tables only after mapping record ownership and obtaining user consent; never interpret seeded demo votes as real user votes.
5. Implement per-trip subscriptions for votes, comments, chat, date proposals, board stage transitions, bookings and actual-expense ledger. Manage concurrent edits and reconnection conflict handling.
6. Test with multiple real accounts including a non-member to verify no data leakage.

## New data models required
- `wishlist_items`: owned by user, visible only to permitted group members via explicit sharing.
- `travel_stamps`: owned by user, optional public/private visibility; do not collect actual passport numbers.
- `adventure_workflows`: idea id, state, deadline, assigned owner, approval count, event log.
- `expense_splits`: row-level ownership validation and immutable audit trail of settlement receipts.
- `reservations`: trip-scoped non-sensitive booking metadata; more sensitive document files require private storage and signed URLs.
- `price_watches`/`price_observations`: provider, itinerary, query, target, snapshots, timestamps and source; never label manual quotes as live.
- `transport_segments`: flight/train number, date, station/airport codes, status provider metadata and observation timestamp.
- `travel_memories`: private trip-member media with consent, thumbnail metadata, storage quotas, and deletion cascade.
- `checkins`: opt-in user sharing, auto-expiry, revocation, no background precise location retention without consent.
- `notification_preferences` and `notification_deliveries`: opt-in push/email and provider delivery status.
- `packing_items`: traveler-specific lists; never share prescriptions or personal entries by default.

## Provider-dependent additions
- Live flight/hotel pricing requires a licensed commercial API with suitable search coverage and costs. Fetch server-side, cache responses and show exact observation timestamps.
- Flight and train operational status requires carrier or licensed status provider; never suggest a terminal is confirmed without a source.
- Map routing requires geocoded place IDs, a routing API and opening-hours data. Use a user-visible API attribution and validate travel-mode constraints.
- Weather-based packing requires forecast data and location/time windows. Current offline heuristics are not forecasts.
- Push alerts require user permission and a secure delivery service; background conditions require a server scheduler, not a browser interval.
- Media sync requires private cloud object storage, user-consented sharing and secure expiring downloads. Add a safe archive/export path, plus metadata/photo deletion.
- Payment reimbursement links may be added for convenience but must not move money without a user's explicit action.

## Release gates
1. Select Supabase organization and confirm any quoted billing before provisioning.
2. Run RLS/advisor checks, validate invitation flow and live-chat isolation.
3. Add data migration with opt-in and a rollback plan; don't silently upload local photos or check-in history.
4. Validate Chrome Android, Safari iOS PWA install, offline caching, refresh, camera/upload permissions and accessibility.
5. Validate prices and costs with independently verifiable data, no made-up offers, and clear estimate labeling.
6. Deploy and confirm the actual public site serves the latest assets before announcing availability.

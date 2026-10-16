# Roavely real collaboration — activation checklist

**Status:** not provisioned. Phase 3 browser demo remains local-only.

## 1. Create a NEW project
Create a dedicated Supabase project **Roavely** in the Supabase organization chosen by the owner. Do not use DeckVault's existing database. Check provider cost before accepting any nonzero charge.

## 2. Secure data model
Review `schema-draft.sql` before applying it. It is a design draft, not an audited production migration. Tighten these points first:

- Use composite foreign keys (or secure triggers) to ensure a suggestion vote's `trip_id` matches the suggestion's trip; poll votes match their choices; itinerary items match their parent day; expense shares match parent expense.
- Ensure group members cannot edit another member's expense share or create options for unrelated polls.
- Enforce that each trip owner is in the trip_members table, and avoid orphan memberships.
- Keep invitation tokens long, random, hashed, short-lived, revocable and rate limited; invite generation must be explicit host action.
- Prevent abusive large messages, spam and excessive invite attempts.
- Add timestamps, performant indexes and user-scoped deletion rules.
- Enable RLS on every exposed table and confirm policies with three test identities: two in one group, one outside it.
- Run database security and performance advisors, fix findings, and review schema in a migration system.

## 3. Accounts and live collaboration
Enable confirmed-email authentication and a login/signup page. The browser may contain a **publishable** client key, but must never contain secret or service role keys. Connect secure profiles, trip creation, membership and accept-invite flows. Save new suggestions, votes and comments to database records keyed by authenticated user ID. Use the same approach for chat, availability polls, itinerary, budgets, and savings.

Enable scoped Realtime subscriptions for tables after validating read policies. Add optimistic edits with rollback on failed database writes and live per-trip invalidation. Add user-friendly offline pending changes, if desired.

## 4. Payments, pricing, routing and notifications
- Live flight/hotel costs: choose licensed providers with API access, quotas, terms and rate limits; keep indicative totals separate from booking prices.
- Precise route planning: geocode to structured lat/lon and integrate a directions API, then handle opening hours, transfers, and time windows.
- Push/email alerts: consent-based device push/email provider, background push subscriptions, notification preferences, secure event fanout and opt-out.
- Confirm no booking reservations or purchases are initiated without explicit user action.

## 5. Release test
Test mobile browsers, keyboard accessibility, deep links/invite redemption, offline/reconnection, duplicate votes, concurrent edits, group deletion, profile privacy, invalid invites, payment arithmetic, timezone/date changes, and correct cache invalidation.

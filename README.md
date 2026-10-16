## Membership approvals, registration and trip themes (October 2026)

- New Supabase Auth users are stored in `account_access` with `status='pending'`, `role='member'`. RLS trip functions now require a confirmed email, accepted Terms version `2026-10`, and `status='approved'`. Even valid invite tokens cannot bypass approval.
- The signup screen requires agreement to [Terms & Conditions](./terms.html). Terms are recorded at sign-up and can be accepted again by already-registered members through an authenticated RPC.
- Sign-in panels show pending / rejected / suspended states, a Terms consent prompt if missing, and the ability to check approval status. A confirmation-email resend is available.
- Only an approved administrator can view the authenticated application queue and approve, decline or suspend a member; member self-approval is impossible through the client.
- **No administrator has been assigned automatically.** To bootstrap the first admin, the owner must first verify the correct real account has a confirmed email and accepted terms, then grant `role='admin'` and `status='approved'` using trusted Supabase dashboard administrative access (never from a client or a publicly accessible RPC). Do not assign the role based solely on an unconfirmed registration or an email typed into chat.
- Account email delivery uses Supabase's built-in service until a production SMTP provider is configured. Built-in SMTP is restricted and unsuitable for public launch. Enable leaked-password protection and configure Site URL/redirects in Supabase Auth dashboard.
- Trip themes are selected automatically from the current destination: Japan has cherry blossoms, Mount Fuji and a torii gate; Australia, Iceland, Italy and related destinations have matching background scenery. The theme works in the existing PWA without a separate theme download.
- UI source: `trip-theme.js`, `trip-theme.css`; illustrations: `themes/*.svg`; installable bundle: `roavely-bundle.js`.
- **QA:** Script syntax and 28 local-render screens, signup Terms, pending approval, and admin queue mock states were checked. Email verification callbacks, actual iOS layout, and multi-user cross-account approval require live testing.

---

## Supabase project provisioned (October 16, 2026)

- **Supabase project:** [Roavely](https://supabase.com/dashboard/project/nnpydavlkfzbpwetyclf)
- **Project ID:** `nnpydavlkfzbpwetyclf`
- **Organization:** AndyAkin (`doclysfbqnorjlxiemlu`)
- **Region:** `us-east-1`
- **Cost quoted during creation:** $0/month (this was the project creation quote; usage may have other plan limits/fees).
- **Separate from DeckVault:** `lretqhaattgtwpfwsxbc`. No DeckVault tables or settings were modified.

**Provisioned backend:** 11 public tables with row-level security: profiles, trips, trip_members, suggestions, suggestion_votes, suggestion_comments, trip_chat, date_options, date_votes, itinerary_days, itinerary_activities. The owner-membership trigger, cross-trip composite FKs, basic indexes and policies are deployed. Supabase security advisors reported no findings on the initial scan. Trip data is empty.

**Not yet integrated into browser app:** The HTML/JS demo currently uses localStorage and IndexedDB. The public GitHub Pages app does **not** automatically sign users in or sync to Supabase. No live invites have been issued; direct enrollment of other members was disabled pending a secure opt-in invitation workflow. Do not run the old `backend/schema-draft.sql` on this live project: it is an unreviewed alternative, not the deployed schema.

**Next integration gates:** Set the Supabase Auth Site URL and redirect allowlist to `https://andyakin95.github.io/Roavely/`; implement email sign-in and session handling with the publishable key (never a secret/service key), authenticated trip creation/invite acceptance, first-login profile creation, per-trip realtime data sync and privacy testing across independent user accounts. No demo votes should be uploaded as real friend responses.

---

# Phase 4 — Adventure planning toolkit (October 15, 2026)

The mobile PWA has these additional **working local-preview screens**:

- **Adventure Board:** every idea can progress through Suggested → Voting → Approved → Booked → Done. Set minimum positive-vote threshold, deadline, responsible traveler and notes; approved ideas can be scheduled.
- **Advanced expenses:** equal or custom per-person split, who-paid tracking, mark shares settled, and simplified repayment recommendations. This is a distinct actual-payments ledger, *not* automatically added to trip estimates.
- **Booking vault:** non-sensitive booking names, dates, status, links and references; local-only and unencrypted in the prototype. **Do not enter sensitive IDs, payment card data, passports or passwords.**
- **Travel transport tracker:** manually entered flight/train routes, dates and terminals; **not** connected to real-time departures.
- **Manual price watch:** record flights/hotels price snapshots and target thresholds; no background price search or automatic notifications.
- **Bucket list:** personal dreams that can be converted into trip suggestions.
- **Travel passport:** personal record of places actually visited.
- **Packing checklist:** generated from the user's interest profile and editable with checkboxes and custom items; not a live-weather or entry-requirements service.
- **Temporary check-ins:** manually entered meeting-point notes expire after two hours. Not visible to friends until shared sync exists; no GPS is collected by this screen.
- **Nearby:** prompts for browser geolocation only after a tap and opens an external maps search. Does not store coordinates.
- **Trip memories:** photo/video uploads stored in that browser's IndexedDB, not in localStorage or a remote cloud; keep original photos backed up.
- **Trip recap/export:** summary of trip planning, a route to the media album, and local JSON export of trip-planning data. Media are not part of the JSON export; no automatic video editing yet.

**Important: prototype limitations have not changed.** Friends cannot use separate live-synced accounts. Demo friend votes and preferences must not be represented as real votes. No real-time flight/hotel quotes, precise in-app routing, push/email notification service, synced photo storage, confirmed booking availability, or purchase flow is active. A browser reload can preserve local data, but clearing browser data can delete it.

Source modules: `phase4-board.js`, `phase4-finance.js`, `phase4-personal.js`, `phase4-packing.js`, `phase4-location.js`, `phase4-memories.js` and `phase4.css`. The existing `app.js` and `phase3-*.js` remain loaded.

**Separate live backend still pending:** `backend/schema-draft.sql` is an unexecuted, non-production-reviewed Supabase draft. The owner must select the Supabase organization for the new Roavely project, independent of DeckVault; security review, RLS consistency fixes and cross-account tests are required before launch.

---

# Phase 3 — Collaborative planning preview (October 2026)

The current app now includes a **group destination compatibility engine** (interests + estimated budget fit), **swipe-based destination votes**, **Wildcard** adventures, **local group chat**, **availability date voting**, **city-grouped smart itinerary shortcuts**, **personal monthly savings tracking**, **date-aware Trip Mode**, **OpenStreetMap searches**, and an **in-app activity feed**.

These screens are part of the local demo only. **Friends do not yet have synchronized accounts or live group updates**. Other travelers' profiles are illustrative and are labeled demo. The UI has no real-time hotel/flight pricing, route timings, external booking APIs, or remote push notifications. The dedicated database starting point is `backend/schema-draft.sql` and **has not been deployed**. It still requires security review and an independent Roavely Supabase project; never reuse DeckVault's database.

# Roavely

**Plan together. Go anywhere.**

Roavely is a mobile-first progressive web app (PWA) prototype for planning trips with friends. Open the GitHub Pages site in a phone browser and use **Add to Home Screen** to test it like an app.

## Implemented in the local preview

- **Travel profile:** display name, home airport, travel pace, travel style, and multiple interests (food, adventure, history, photography, etc.).
- **Discover:** curated destinations and trip activities ranked by the profile's interests, with per-person illustrative cost estimates and one-tap suggestions to the group.
- **Group Ideas:** users can suggest activities and places, vote ❤️ / 👍 / 🤷 / 👎, remove a vote, and comment in an idea's discussion thread. The existing separate group polls remain available.
- **Itinerary:** add days and timed activities, schedule a group idea, and remove activities; activity costs roll into the trip estimate.
- **Budget:** editable forecasts for flights, accommodation, local transportation, meals, activities and miscellaneous costs; compare estimated cost per person against the trip target and see a combined group estimate. Activity costs use the **greater** of itinerary activity costs or the activity allowance, avoiding double-counting.
- **Existing prototype tools:** multiple trips, checklist, trip mode, mock map, reservation placeholders, and group wallet.
- **Offline-first local storage:** prototype data stays on the device; the service worker caches the app for offline fallback and checks online for new assets first.

## Important prototype limitations

**This is not yet a synced multi-user service.** The demo's other travelers and their pre-filled votes are sample data; new comments, votes, profiles, and trip changes are saved to the current browser only. The displayed invite codes are placeholders, not functioning invitations.

Recommendations are curated demo suggestions, **not** live Google/Maps search or real-time flight/hotel pricing. Budget figures are editable planning estimates in USD, not booking quotes. The map is a visual placeholder, not geocoded navigation.

## Next build: friend accounts and real collaboration

Add a dedicated **Roavely** Supabase project (kept separate from DeckVault), email authentication, secure per-user profiles and preferences, invite links, group membership with row-level security, synced suggestions/votes/comments, shared itineraries, and live updates. Then connect live location lookup and travel cost feeds, add bookings and expense settling.

## Where to test

Source: https://github.com/AndyAkin95/Roavely

Expected GitHub Pages project URL (when enabled): https://andyakin95.github.io/Roavely/

Use **Profile** via the round avatar, **Discover** to find matches, **Group** to suggest/vote/discuss, **Itinerary** to schedule activities, and **Budget** for the cost forecast.

If an older screen is cached, close/reopen the installed home-screen app or reload the site online; the updated service worker fetches current app assets.

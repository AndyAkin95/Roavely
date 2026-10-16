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

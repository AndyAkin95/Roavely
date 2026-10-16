# Roavely cloud setup and mobile installation

The live Supabase project is **Roavely**, project ID `nnpydavlkfzbpwetyclf`, separate from DeckVault.

## What has been connected in the GitHub repository

The latest `index.html` now loads `cloud-core.js` and `cloud-actions.js`, which use Supabase's **publishable** key (safe for browsers) to support:

- Create an email/password account, sign in, sign out, and persist the session.
- Edit a cloud profile and create your own trip.
- Generate owner-authorized, 7-day invite links; authenticated friends can redeem and join securely.
- Load member names, trip suggestions, positive/negative votes, discussion comments, group chat, date proposals and votes, and itinerary days/activities from PostgreSQL.
- Update these records through RLS-authorized writes; Realtime listens for member changes to shared trip data.

The existing personal/local tools (photo albums, detailed ledger, bucket lists, etc.) are **not yet cloud synchronized**. The demo records are deliberately **not uploaded** as another person's votes or as a real live group.

## Required one-time dashboard settings (manual)

### Supabase authentication redirect
1. Open [Roavely Supabase Auth URL Configuration](https://supabase.com/dashboard/project/nnpydavlkfzbpwetyclf/auth/url-configuration).
2. Set **Site URL** to `https://andyakin95.github.io/Roavely/`.
3. Add the same exact URL in **Redirect URLs** and save.
4. In **Authentication > Providers > Email**, check that Email provider is enabled, and decide whether new accounts require email confirmation. For a real public app, leave email confirmation on.
5. For dependable delivery as the user base grows, configure a production email sending service. Supabase built-in email limits can prevent messages from reaching all friends.

### GitHub Pages
1. Open [Roavely GitHub Pages settings](https://github.com/AndyAkin95/Roavely/settings/pages).
2. Set **Build and deployment > Source** to **GitHub Actions**. The repository includes `.github/workflows/publish.yml`.
3. Check the [Actions tab](https://github.com/AndyAkin95/Roavely/actions) for **Publish Roavely PWA** success and confirm that `https://andyakin95.github.io/Roavely/` actually loads the latest app.
4. Do not invite friends before the website and authentication redirects have been checked in a real browser.

## Install it like an app

**iPhone:** Open the GitHub Pages URL in **Safari**, tap **Share**, choose **Add to Home Screen**, then **Add**. Open Roavely from the new home-screen icon.

**Android:** Open the URL in Chrome, choose the menu (⋮), tap **Install app** or **Add to Home screen**, and confirm. Availability of **Install app** depends on the browser's PWA criteria.

This is a **PWA**, not an iOS App Store or Android Play Store binary.

## Testing before sharing with friends
- Create a brand new Roavely account and confirm its email.
- Sign in again and create a fresh live trip; the toolbar must say **Shared online trip**.
- From the trip owner's Cloud panel generate a private invite link.
- Using a DIFFERENT real account on a different device, accept the invite.
- Add a suggestion, vote and comment as both users, and verify real-time change delivery.
- Verify that a user who has not joined the trip cannot read any trip data.
- Confirm that adding a travel day or activity remains visible after sign-out, sign-in and reload.
- Inspect Supabase [Database Security Advisor](https://supabase.com/dashboard/project/nnpydavlkfzbpwetyclf/database/advisors) again after any policy changes.

The GitHub Pages live deployment and real-email login flow cannot be confirmed purely by repository/code checks; those must be browser-tested after the dashboard URL settings are saved.

# TransitWake Board Brief

## 1. Company & Core Concept
**TransitWake** is a privacy-first, 4.0 km geofence destination wake alarm and transit companion application for daily commuters traveling by train, bus, and underground metro. It alerts riders before their destination stop with Cockpit Dark sirens, earphone voice callouts, and subterranean offline map tile caching.

## 2. Target Customer
- Primary: Daily train, subway, and bus commuters in dense urban metros (India suburban networks like Mumbai/Bangalore/Delhi, NYC Subway, London Underground, Tokyo commuter rail).
- Personas: Office commuters traveling 45-90 minutes each way, university students, and late-night shift workers who want to sleep or read on their commute without fear of missing their stop.

## 3. Product Features & Technical Architecture
- **Geofence Alarm Engine**: Real-time geodesic distance calculation with customizable wake radius (default 4.0 km).
- **Subway Tunnel Offline Mode**: PWA Service Worker (`/sw.js`) with LRU caching for CartoDB Voyager tiles and OpenStreetMap Nominatim station queries, allowing continuous navigation even in cellular deadzones underground.
- **Smart GPS Battery Saver**: Dynamic 3-tier polling (>10 km @ 30s, 5–10 km @ 10s, <5 km @ 1s) with velocity compensation (>75 km/h on express trains), saving up to ~78% battery compared to legacy 1s GPS apps.
- **Hands-Free Earphone Callouts**: Text-to-speech audio ducking announcing milestones (10 km, 5 km, arrival zone, 1 km) into commuter earphones.
- **Display Over Other Apps**: Floating mini HUD (`SYSTEM_ALERT_WINDOW`) with collapsed pill and expanded card view.
- **Privacy & Compliance**: Ephemeral RAM-only GPS location computation; zero coordinate tracking or remote logging; 20-point regulatory store compliance (GDPR Art. 17, Apple Guideline 5.1.1, COPPA 13+).

## 4. Monetization & Business Model
- **Core App (100% Free Forever)**: Ad-supported via Google AdMob banners and route-start interstitial ads (strictly blocked during emergency wake-up alarms).
- **TransitWake Prime**: Optional micro-subscription priced at **₹26 per month** (~$0.31 USD) for complete ad removal, 14-day statutory refund guarantee, and 1-tap cancellation with 30-day grace period retention.

## 5. Current Progress & Traction
- Codebase: Production React Native / Expo application with 14 automated test suites (100 passing unit/integration tests, 85%+ coverage).
- Live Deployments: Local web server running on port 8081 (`http://localhost:8081`), companion 3D Virtual Agent Office (`/3d-office.html`), and UI showcase (`/showcase.html`).
- Mobile Distribution: Configured in `eas.json` for Android standalone `.apk` / Google Play `.aab` and iOS App Store `.ipa`.

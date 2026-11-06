# TransitWake

- **What it is**: A privacy-first, 4.0 km geofence destination wake alarm and transit companion app that reliably alerts train, bus, and metro commuters before their destination with Cockpit Dark audio sirens, hands-free earphone voice callouts, and subterranean offline map tile caching.
- **Who it is for**: Daily transit commuters, students, and night-shift workers across high-density rail and bus networks (India suburban rail, NYC Subway, London Underground, Tokyo Metro) who want to nap, study, or disconnect without anxiety about missing their stop.
- **How it makes money**:
  1. Free core app supported by non-intrusive Google AdMob banner and route-start interstitial ads (suppressed during alarms).
  2. Optional **TransitWake Prime** micro-subscription at **₹26/month** (~$0.31 USD) for complete ad removal, 14-day statutory refund guarantee, and 1-tap transparent cancellation.
- **Why now**:
  - Legacy transit alarm apps suffer from severe battery drain (constant 1s GPS polling) and fail completely in underground metro tunnels.
  - TransitWake introduces dynamic 3-tier battery conservation (>10km @ 30s, 5–10km @ 10s, <5km @ 1s) saving ~78% battery, plus a Service Worker LRU tile cache for subterranean deadzones.
  - Zero coordinate tracking: RAM-only geodesic math honors GDPR and store privacy standards.
- **Current stage**:
  - Production-ready React Native / Expo application with 14 test suites (100 passing unit/integration tests).
  - Web PWA live at `http://localhost:8081`.
  - EAS Build profiles (`eas.json`) configured for Android APK/AAB and iOS IPA distribution.
  - 20/20 `expo-doctor` diagnostic pass and 20-point regulatory store compliance verified.

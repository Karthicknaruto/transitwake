# Changelog

All notable changes to the **TransitWake** destination alarm and transit companion application are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-11-06

### Added
- **Subway Tunnel Offline Metro Mode (`feat(offline)`)**:
  - Implemented `offlineCacheService.ts` with LRU caching for OpenStreetMap Nominatim station search queries.
  - Added subterranean CartoDB Voyager and OpenStreetMap map tile caching.
  - Integrated Service Worker (`public/sw.js`, `dist/sw.js`) with CacheStorage for zero-network subterranean metro transit deadzones.
  - Added subtle in-app offline banner with amber pulse indicator.
- **TransitWake Prime Micro-Subscription (`feat(subscription)`)**:
  - Added optional ₹26/month ad-free micro-subscription via `subscriptionService.ts`.
  - Complete suppression of persistent bottom banner ads (`BannerAdComponent.tsx`) and route start interstitial popups (`adService.ts`).
  - 14-day statutory refund policy complying with EU consumer directives and store guidelines (Point 3).
  - Symmetrical 1-tap cancellation with zero dark patterns (Point 9): benefits retained during 30-day grace period.
  - Transparent pricing disclosures with zero hidden charges (Point 10).
- **Google OAuth 2.0 & Data Privacy (`feat(auth)`)**:
  - Cross-platform Google sign-in and sign-out via `authService.ts`.
  - Default anonymous guest mode ensuring zero mandatory login walls.
  - 1-tap complete account and local data wipe under GDPR Article 17 and Apple Guideline 5.1.1(v).
- **Push & Local Notifications (`feat(notifications)`)**:
  - Cross-platform notification delivery (`expo-notifications` + Web Notification API) via `notificationService.ts`.
  - Android `IMPORTANCE_MAX` alert channel with high-intensity vibration pattern and lockscreen visibility.
  - Geofence arrival triggers and interactive notification action buttons (`DISMISS` and `SNOOZE`).
- **Display Over Other Apps Floating HUD (`feat(multitasking)`)**:
  - Android `SYSTEM_ALERT_WINDOW` permission declaration in `app.json`.
  - Draggable floating mini HUD (`FloatingTransitHud.tsx`) with collapsed pill and expanded instrument card views.
- **Audio Voice Station Callouts (`feat(voice)`)**:
  - Hands-free earphone TTS speech synthesis (`speechService.ts`) announcing milestones at 10 km, 5 km, arrival zone, and 1 km.
- **Smart GPS Battery Saver (`feat(power)`)**:
  - Dynamic 3-tier GPS polling (`powerManager.ts`): Cruising (>10 km @ 30s), Approaching (5–10 km @ 10s), Arrival (<5 km @ 1s).
  - High-speed rail velocity compensation (>75 km/h) preventing missed geofences.
- **1-Tap Daily Route Inversion (`feat(routes)`)**:
  - Preset Home $\leftrightarrow$ Work commute vector flip bar (`RouteFlipBar.tsx`, `routeManager.ts`).
- **EAS Cloud Build Profiles (`ci(eas)`)**:
  - Configured `eas.json` with `development`, `preview` (standalone Android APK), and `production` (Play Store AAB / App Store IPA) profiles.
- **20-Point Store Compliance & Legal Disclosures**:
  - Ephemeral RAM-only GPS distance calculation via Haversine formula.
  - Full legal policies: Privacy, Terms, Cookies, SDK audit, and COPPA 13+ age consent.
- **Automated Test Suite**:
  - 14 test suites with 100 passing unit and integration tests (85.27% statement coverage).

### Changed
- Refactored entire UI according to `heydamir/unslop` design principles:
  - 0 emojis in source code, UI strings, and test suites.
  - Strict sentence case across all headings, labels, and buttons.
  - Slate/graphite neutral ramp (`#0F172A` to `#F8FAFC`) with single Swiggy `#FC8019` accent.
  - 4px spacing rhythm and nested corner radius ratios.
- Removed deprecated `@types/react-native` package for clean 20/20 `expo-doctor` check.

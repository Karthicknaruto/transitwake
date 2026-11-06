# ⏰ TransitWake - GPS 4 km Destination Stop Alarm

A smart location-based wake-up alarm mobile application built with **React Native (Expo)** and **TypeScript**. Designed for commuters, train passengers, bus riders, and daily travelers who want to sleep or relax without missing their stop.

---

## 🌟 Key Features

1. **4 km Geofence Alarm Trigger**:
   - Automatically tracks your distance to your destination stop using device GPS.
   - Triggers a loud, persistent wake-up alarm as soon as you enter the 4 km radius (customizable from 1 km to 10 km).
   - Battery-adaptive GPS tracking to conserve battery on long rides.
   - Completely offline-safe Haversine geodesic calculation engine.

2. **Destination Selection**:
   - **Search Bar**: Autocomplete search for stations, landmarks, and addresses worldwide powered by OpenStreetMap (Nominatim).
   - **Interactive Map & Radar**: Live visual map displaying your position, destination pin, and the circular 4 km alert boundary.
   - **Quick Presets**: 1-tap selection for popular transit hubs (Central Station, Airport, Downtown, University).

3. **Wake-Up Alarm System**:
   - Full-screen high-urgency wake-up alert modal.
   - Dual-tone loud audio siren playback.
   - Heavy repeating vibration pulses.
   - Large "I AM AWAKE / DISMISS" button and 1-minute Snooze option.

4. **💰 Ad Monetization System (Generate Money)**:
   - **Sticky Banner Ad**: Fixed at the bottom of the dashboard screen for continuous impression revenue.
   - **Interstitial Popup Ads**: High-converting popup ads displayed when activating tracking or after completing trips.
   - **Google AdMob Ready**: Pre-configured with official Google AdMob test unit IDs for development, with a 1-step swap to your real production IDs in `src/config/admob.ts`.
   - **Zero-Delay Safety Rule**: Emergency waking alarms always override ads — no ad will ever delay or block your wake-up alarm.

5. **🧪 Built-in Commute Simulator**:
   - Test the entire app lifecycle from home without traveling!
   - Simulates a commute from 8.5 km away approaching your stop.
   - Or click "⚡ Jump to 3.8 km" to hear the alarm and see the modal instantly.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the App

- **On your Computer / Browser**:
  ```bash
  npm run web
  ```
- **On your Mobile Phone (Android or iOS)**:
  ```bash
  npm start
  ```
  Install the free **Expo Go** app on your phone, then scan the QR code displayed in your terminal.

---

## 🧪 Running Automated Tests

Run the Jest unit test suite:
```bash
npm test
```
Verifies:
- Haversine geodesic distance algorithms across global coordinates.
- 4 km trigger threshold accuracy and boundary logic.
- Adaptive battery-saving intervals.
- AdMob safety guardrails and frequency capping.

---

## 💵 How to Setup Real Google AdMob for Monetization

1. Sign up for [Google AdMob](https://admob.google.com).
2. In the AdMob console, create an App (Android & iOS).
3. Create a **Banner** ad unit and an **Interstitial** ad unit.
4. Open [`src/config/admob.ts`](./src/config/admob.ts):
   - Replace the `ADMOB_PRODUCTION_IDS` with your real AdMob Ad Unit IDs.
   - Set `IS_DEV_MODE = false` before publishing your app to Google Play Store or Apple App Store.

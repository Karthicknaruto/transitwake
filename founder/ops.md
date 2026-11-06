# TransitWake Operations Manual: Day One, Suppliers, People, SOPs, and Risk Register

This operations manual defines how TransitWake functions as a real-world software utility and commercial business on day one. It outlines the daily operational rhythm, verified suppliers with public pricing, team responsibilities, standard operating procedures (SOPs), software tooling, regulatory permits and compliance requirements for India and global app distribution, and a prioritized risk register.

---

## 1. Daily Operating Cycle

As an asynchronous mobile transit utility, the daily operating rhythm is synchronized with peak commuter rail windows:

```
                            DAILY COMMUTE OPERATING CYCLE
  ┌───────────────┬────────────────────────────┬─────────────────────────────┐
  │ 05:00 - 06:00 │ Pre-Flight Health Check    │ VPS, tile cache, geocoding  │
  │ 06:30 - 10:00 │ Morning Commuter Rush      │ Real-time alarm monitoring  │
  │ 10:30 - 13:00 │ Customer Support & Triage  │ Missed stops, refund queue  │
  │ 14:00 - 16:30 │ Infrastructure & Analytics │ Sentry logs, cache hit rate │
  │ 17:00 - 20:30 │ Evening Commuter Rush      │ Sequential transfer alarms  │
  │ 21:00 - 22:30 │ Night Shift Verification   │ Subterranean tile fallbacks │
  │ 23:00 - 23:30 │ Financial Reconciliation   │ UPI mandates, break-even    │
  └───────────────┴────────────────────────────┴─────────────────────────────┘
```

### Step-by-Step Schedule

1. **05:00 - 06:00 IST: Pre-flight system check**
   - Automated heartbeat ping against the tile proxy and Nominatim mirror.
   - Verify server memory headroom and TLS certificate validity.
2. **06:30 - 10:00 IST: Morning commuter peak (customer-facing)**
   - High-density suburban trains active across Mumbai (Western/Central), Bangalore (Namma Metro), and Delhi Metro.
   - Real-time telemetry monitoring for alarm fire events, battery drain alerts, and 1-tap WhatsApp ETA generation.
3. **10:30 - 13:00 IST: Support triage & customer care (customer-facing)**
   - Process support inquiries submitted via in-app feedback or email.
   - Execute 1-tap statutory refunds under the 14-day money-back guarantee for any commuter who experienced an issue.
4. **14:00 - 16:30 IST: Infrastructure optimization & engineering**
   - Review Sentry crash logs for newly detected Android OEM builds (e.g., MIUI, ColorOS battery-killing heuristics).
   - Tally student referral unlocks (verifying 2-classmate codes and semester pass issuance).
5. **17:00 - 20:30 IST: Evening commuter peak (customer-facing)**
   - Monitor high-volume return routes and intermediate transfer interchange alarms.
   - Verify push notification deliverability via Firebase (FCM) and Apple (APNs).
6. **21:00 - 22:30 IST: Night-shift transit verification**
   - Ensure loudspeaker siren routing and offline subterranean caching remain armed for late-night healthcare and shift workers.
7. **23:00 - 23:30 IST: Daily financial reconciliation**
   - Reconcile daily subscriber acquisitions, Google Play / App Store receipts, and Razorpay UPI recurring e-mandates against the CFO break-even target (8 subscribers/day).

---

## 2. Verified Suppliers & Production Infrastructure

Every operational input in `founder/numbers.json` is mapped to public vendor pricing and operational service terms:

| Cost Item | Primary Supplier | Alternative Supplier | Public Pricing / Terms | Lead Time | Payment Terms |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **High-availability Nominatim & tile proxy VPS** | **Hetzner Cloud** (CPX21: 3 vCPU, 4GB RAM, 80GB NVMe) | **DigitalOcean** (Basic Droplet 4GB) | €8.45/month (~800 INR) to €24.00/month (~2,200 INR) | Instant | Monthly post-paid credit card |
| **Global CDN & edge caching** | **Cloudflare** (Free / Pro tier) | **Fastly** Developer Tier | $0.00/month (Free Tier includes unlimited bandwidth & DDoS) | Instant | Free tier |
| **Crash analytics & observability** | **Sentry for React Native** | **PostHog Cloud** | $0.00/month (Developer Free Tier: 5,000 errors/month) | Instant | Free tier |
| **Apple Developer Program** | **Apple Inc.** | N/A (Monopoly provider) | 8,300 INR / $99 USD annually | 2 to 4 business days | Annual credit card charge |
| **Google Play Developer Console** | **Google LLC** | N/A (Monopoly provider) | 2,100 INR / $25 USD one-time registration | 1 to 2 business days | One-off credit card charge |
| **Domain registration (`transitwake.app`)** | **Cloudflare Registrar** | **Namecheap** | $14.00 USD/year (~1,200 INR at wholesale registry price) | Instant | Annual credit card charge |
| **Payment gateway (India UPI AutoPay)** | **Razorpay** | **Cashfree Payments** | 2.0% + GST per successful UPI transaction; zero setup fee | 2 to 3 business days | T+2 settlement to bank account |
| **In-app subscription management** | **RevenueCat** | Native Store Billing | $0.00/month until $2,500 USD monthly tracked revenue | 1 business day | Free tier up to revenue threshold |
| **Mobile cloud builds & OTA updates** | **Expo Application Services (EAS)** | Local Xcode / Android Studio | $0.00/month (Free tier: 30 Android + 30 iOS cloud builds/month) | Instant | Free tier with on-demand overage |

*Pricing validation*: Total fixed monthly vendor expenditure across Hetzner, Cloudflare, Sentry, and RevenueCat totals approximately 2,200 INR to 3,500 INR, well within the 4,500 INR monthly budget in `founder/numbers.json`.

---

## 3. People, Team Structure, & Staffing Rota

During Phase 1 (Launch through Month 3), operations are executed by a focused 3-person core team:

```
                            TEAM ROLES & RESPONSIBILITIES
  ┌─────────────────────────┬─────────────────────────┬──────────────────────────┐
  │ Founder & Growth Lead   │ Tech Lead (Mobile/Ops)  │ Support & Community Lead │
  │ 40 hrs/wk               │ 40 hrs/wk               │ 20 hrs/wk (Part-Time)    │
  ├─────────────────────────┼─────────────────────────┼──────────────────────────┤
  │ Product direction       │ Expo/React Native code  │ Ticket triage (<30m)     │
  │ Financial reconcile     │ EAS cloud build signing │ 14-day refund execution  │
  │ Station flyer stunts    │ VPS & tile cache ops    │ College ambassador loop  │
  │ Regulatory compliance   │ Sentry bug hotfixes     │ Transit forum replies    │
  └─────────────────────────┴─────────────────────────┴──────────────────────────┘
```

### Weekly Staffing Rota (Planned Volume: 250 to 1,000 DAU)

| Shift / Block | Window (IST) | Primary Responsibility | Assigned Role |
| :--- | :---: | :--- | :--- |
| **Morning Rush Vigil** | 06:30 - 10:00 | Real-time system monitoring and station flyer coordination | Founder + Tech Lead |
| **Mid-Day Operations** | 10:30 - 14:00 | Customer email inquiries, refund processing, and forum engagement | Support Lead |
| **Engineering & Deploy** | 14:00 - 17:00 | Feature sprint iterations, EAS cloud builds, and unit testing | Tech Lead |
| **Evening Rush Vigil** | 17:00 - 20:30 | Live transit monitoring, transfer alarms, and server load checks | Tech Lead + Support Lead |
| **Daily Close & Reconcile** | 21:00 - 22:30 | Financial tallying, subscription verification, and nightly logs | Founder |

### Compensation & Payroll Structure

- **Founder & Product Lead**: Equity-based vesting during Phase 1 with living expense drawdown once net operating profit exceeds 15,000 INR/month.
- **Tech Lead**: 35,000 to 50,000 INR/month stipend (market baseline for early-stage mobile developer in India).
- **Part-Time Support & Community Lead**: 15,000 to 20,000 INR/month (hourly equivalent at ~200 INR/hr for 20 hrs/week).

---

## 4. Standard Operating Procedures (SOPs)

### SOP 1: Pre-Commute Infrastructure Health Check (Daily, 05:30 IST)

1. Open Hetzner Cloud and Cloudflare Dashboards.
2. Confirm CPU load on tile proxy is below 40% and RAM usage is below 70%.
3. Execute automated test query against Nominatim geocoding endpoint:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" -H "User-Agent: TransitWake-App/1.0" "https://nominatim.openstreetmap.org/search?format=json&q=Dadar&limit=1"
   ```
4. Verify HTTP response is `200`. If `429` (rate limited), immediately toggle DNS failover to the local SQLite offline cache mirror.
5. Post "All Systems Operational" confirmation to the internal team channel.

### SOP 2: Handling a Missed Stop Report (Response SLA: < 30 Minutes)

1. Acknowledge ticket with empathy: *"We are deeply sorry you experienced an issue with your wake alarm. Missing your stop is unacceptable to us, and we are investigating immediately."*
2. Verify customer device model and OS version from ticket telemetry.
3. If on Xiaomi, OnePlus, Oppo, or Vivo (aggressive battery management):
   - Guide commuter to toggle: **Settings > Apps > TransitWake > Battery Saver > No Restrictions**, and enable **Autostart**.
4. Check if the commuter is within the 14-day statutory guarantee window.
5. If requested, click **Refund Transaction** in Razorpay or Google Play Console within 1 tap.
6. Log device manufacturer and failure coordinates in the engineering bug queue.

### SOP 3: 1-Tap Subscription Cancellation & Refund Execution

1. Commuter initiates cancellation directly in-app: **Settings > Manage Subscription > Cancel Subscription**.
2. Service automatically updates state to `cancelled_grace_period`, retaining ad-free access until the current 30-day paid term expires.
3. If user requests immediate refund under the 14-day statutory guarantee:
   - Verify transaction timestamp (must be $\le 14$ days since initial purchase).
   - In Razorpay Dashboard: Locate Payment ID > Click **Issue Full Refund** (processed in 2-4 business days).
   - In Google Play Console: Locate Order ID > Click **Refund** > Select **Customer Satisfaction Guarantee**.
   - Send automated confirmation email with zero exit surveys and zero cancellation penalties.

### SOP 4: Emergency Hotfix Deployment via EAS Update (SLA: < 15 Minutes)

1. Identify bug cause from Sentry stack trace.
2. Formulate minimal surgical diff on isolated branch `fix/critical-hotfix`.
3. Verify all 16 test suites pass (`npm test`) and typecheck passes (`npx tsc --noEmit`).
4. Publish over-the-air (OTA) update instantly without waiting for app store re-review:
   ```bash
   npx eas-cli update --branch production --message "Critical fix for background alarm audio routing"
   ```
5. Confirm live client update on physical test device within 5 minutes.

---

## 5. Software Tools & Running Costs

| Function | Tool | Plan / Edition | Monthly Cost | Rationale |
| :--- | :--- | :--- | :---: | :--- |
| **Payments & Mandates** | **Razorpay** | Standard Payment Gateway | 2% + GST per txn | Market standard for India UPI AutoPay recurring e-mandates. |
| **In-App Purchases** | **RevenueCat** | Starter Plan | $0.00 | Handles receipt validation and store subscription webhooks. |
| **Mobile Build & Deploy** | **EAS CLI** | Free / On-demand | $0.00 | Cloud build pipeline for Android `.aab` and iOS `.ipa`. |
| **Server Hosting** | **Hetzner Cloud** | CPX21 Cloud Instance | ~1,200 INR | High bandwidth NVMe performance at fraction of AWS/GCP cost. |
| **DNS & Edge Proxy** | **Cloudflare** | Standard Free Tier | $0.00 | Global CDN, free SSL, and DDoS attack mitigation. |
| **Crash Monitoring** | **Sentry** | Developer Free Tier | $0.00 | Native symbolicated stack traces and ANR tracking. |
| **Customer Support** | **Crisp / Freshdesk** | Free Tier (2 seats) | $0.00 | Multi-channel inbox for user inquiries and refund tickets. |
| **Accounting & Tax** | **Zoho Books** | Standard India Tier | ~750 INR | Automated GST invoicing, e-way bills, and bank reconciliation. |

---

## 6. Licences, Permits, Taxes, & Legal Compliance (India & Global)

*Disclaimer: The operational checklist below represents standard corporate practice for mobile application businesses. Formal regulatory filings should be reviewed with a Chartered Accountant (CA) or corporate legal counsel.*

- **Corporate Structure**:
  - **Recommended vehicle**: **Private Limited Company (Pvt Ltd)** or **Limited Liability Partnership (LLP)** registered with the Ministry of Corporate Affairs (MCA) in India.
  - *Why*: Protects founders with limited liability, required for corporate merchant accounts on Razorpay, and necessary for Apple Developer Organization registration (D-U-N-S Number).
- **Tax Registrations**:
  - **Permanent Account Number (PAN) & Tax Deduction Account Number (TAN)**: Issued with MCA incorporation.
  - **Goods & Services Tax (GST)**: Mandatory for e-commerce and digital marketplace operators. Required to claim input tax credits on cloud server and payment gateway expenses.
- **Reserve Bank of India (RBI) Recurring Subscription Compliance**:
  - In India, recurring auto-debit payments require compliance with RBI e-mandate guidelines.
  - Transactions below ₹15,000 INR per month do not require Additional Factor of Authentication (AFA) for every cycle, provided an e-mandate is registered during the first ₹26 transaction with pre-debit notifications sent 24 hours prior.
- **Privacy & Data Protection Compliance**:
  - **India Digital Personal Data Protection Act (DPDPA 2023)**:
    - User coordinates are processed ephemerally in RAM; zero location breadcrumbs are saved to disk.
    - Explicit consent banner implemented with 1-tap account and data erasure in settings.
  - **European Union GDPR**:
    - Right to be Forgotten: Implemented in `authService.ts` via 1-tap GDPR account deletion.
    - Zero transfer of personal data to third-party ad networks without consent.
- **Store Regulatory Compliance**:
  - Complete 20-point compliance deck itemized in `src/config/legalData.ts` and verified by automated checklist test suite (`__tests__/complianceChecklist.test.ts`).

---

## 7. Operational Risk Register

Ten operational failure modes evaluated by probability, impact, and mitigation protocols:

| # | Risk Event | Probability | Impact | Early Warning Indicator | Pre-Emptive Mitigation & SOP Action |
| :-: | :--- | :---: | :---: | :--- | :--- |
| **1** | **OEM Android battery saver kills background alarm** | High | Critical | User support ticket: "Alarm did not ring on OnePlus/Xiaomi" | Trigger in-app warning on setup requesting battery optimization exemption; run foreground service with persistent notification. |
| **2** | **Nominatim geocoding rate-limit / outage** | Medium | High | Search latency > 3.0s or HTTP 429 status codes | Auto-switch client to embedded offline SQLite railway station index; fallback to LocationIQ mirror. |
| **3** | **Earphones unplugged while commuter sleeps** | High | High | Hardware audio route change event | Audio session auto-switches to device loudspeaker at maximum volume (`playsInSilentModeIOS: true`). |
| **4** | **Subway tunnel cellular deadzone** | High | Medium | Network connectivity state drops to offline | PWA Service Worker (`/sw.js`) serves pre-cached map tiles and offline station coordinates with zero latency. |
| **5** | **UPI recurring payment e-mandate fails** | Medium | Low | Razorpay webhook `subscription.halted` | Provide 7-day grace period with banner notification before restricting Prime transfer features. |
| **6** | **Google Play / App Store review rejection** | Low | High | App store review status marked "Action Required" | 20-point regulatory compliance deck pre-submitted; clear background location video documentation provided. |
| **7** | **Rapid cloud tile bandwidth spike** | Low | Medium | Hetzner bandwidth usage > 1TB/month | Cloudflare edge caching configured with 30-day immutable cache-control headers on static tile images. |
| **8** | **Negative app store review on launch day** | Medium | Medium | Store rating drops below 4.2 stars | Support Lead contacts reviewer within 30 minutes offering immediate live troubleshooting and full refund. |
| **9** | **Key engineer unavailable during commuter rush** | Low | Medium | No response in team alert channel | Documented SOPs allow any founder to deploy hotfixes via EAS Update in under 15 minutes. |
| **10**| **Student referral fraud / fake account spam** | Medium | Low | Single IP creating multiple referral codes | Enforce device fingerprinting and require distinct hardware UUIDs for referral redemptions. |

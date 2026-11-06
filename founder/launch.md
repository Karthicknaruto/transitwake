# TransitWake Launch Playbook: Test, Countdown, Run Sheet, and First 30 Days

This launch plan turns the customer panel evidence (`founder/panel/results.md`), financial model (`founder/cfo.md`, `founder/numbers.json`), and go-to-market strategy (`founder/marketing.md`) into a dated, step-by-step operational schedule. It begins with the lowest-cost real-world payment test before incurring the 12,000 rupee store and server setup expenses, details a 4-week countdown to public release, outlines the hour-by-hour launch day run sheet, and establishes the performance gates for the first 30 days.

---

## Step 1: Test Before You Spend

Before paying the 12,000 rupee startup costs in `founder/numbers.json` (Apple Developer Program 8,300 rupees, Google Play account 2,100 rupees, and custom domain 1,600 rupees) or committing to the 4,500 rupee monthly VPS infrastructure, a low-cost live payment test is run to validate that real commuters pay at the rates predicted by the 100-person simulated panel.

### The Real-World Test: Founding Commuter Pre-Sale Pass

- **Format**: Lightweight web landing page hosted on the existing staging server (`http://localhost:8081` exported to GitHub Pages or Cloudflare Pages with zero server cost).
- **Offer**: "Founding Commuter Pass" at 26 rupees for the first month (or 199 rupees for 1 full year) with early access to the PWA offline web client, subterranean tunnel caching, 1-tap WhatsApp ETA generation, and a lifetime grandfathered 26 rupee monthly price guarantee.
- **Distribution**:
  - Direct outreach to 10 commuter WhatsApp groups across the Mumbai Western Line (Churchgate-Virar) and Bangalore Purple Line (Whitefield-Kengeri).
  - Physical QR code test flyers posted at two high-density suburban station bus stops (Borivali East and Indiranagar Metro entrance).
  - One organic post on r/mumbai and r/bangalore detailing the open-source offline subway tunnel PWA architecture.
- **Success line**:
  - Minimum 50 paid founding pre-orders in 14 days (or 200 verified waitlist signups with phone numbers).
  - Target payment conversion: 3.5% or higher of unique landing page visitors.

### Panel Calibration & Decision Gate

| Metric | Simulated Panel Prediction | Real Test Success Threshold | Action if Below Threshold |
| :--- | :---: | :---: | :--- |
| Overall buy rate | 66% (after objection handling) | 3.5% unique visitor conversion | Revise landing headline; clarify loudspeaker failsafe. |
| Night shift buy rate | 90% (18 of 20) | 15 paid night worker orders | Double down on 05:00-07:00 station gate flyer distribution. |
| Student referral willingness | 50% (15 of 30) | 25 active invite code shares | Re-tune referral rewards; test 1-referral unlock instead of 2. |
| Cart abandonment | ~15% estimated | Under 30% on Razorpay UPI | Streamline UPI QR one-click payment flow. |

**Decision Rule**:
- If real paid pre-orders reach or exceed 50 orders by Day 14, immediately trigger the Step 2 Countdown and disburse the 12,000 rupee developer account registrations.
- If real paid pre-orders fall below 25 orders, freeze store registration spend and return to `founder/offer.md` and `founder/marketing.md` to revise messaging and core value propositions before committing capital.

---

## Step 2: The Countdown (Target Launch Date: Monday, December 7, 2026)

The schedule spans 4 calendar weeks starting Monday, November 9, 2026, leading to opening day on Monday, December 7, 2026, synchronized with the peak commuter morning rush hour.

### Week 1: November 9 to November 15, 2026 — Pre-Sale Test, Entity, & Merchant Setup

| Day / Date | Area | Task | Owner | Critical Path |
| :--- | :--- | :--- | :--- | :---: |
| Mon, Nov 9 | Marketing | Deploy pre-sale landing page and QR code tracking URLs | Growth Lead | Yes |
| Tue, Nov 10 | Legal & Money | Submit Apple Developer Organization registration & D-U-N-S verification | Founder | Yes |
| Wed, Nov 11 | Legal & Money | Create Google Play Developer Console account (2,100 rupees paid) | Tech Lead | Yes |
| Thu, Nov 12 | Legal & Money | Configure Razorpay / Cashfree UPI recurring e-mandate merchant keys | Founder | Yes |
| Fri, Nov 13 | Build | Configure production EAS project (`eas.json`) and EAS Cloud Build credentials | Tech Lead | No |
| Sat, Nov 14 | Marketing | Distribute 250 laminated QR flyers at Borivali and Indiranagar stations | Growth Lead | No |
| Sun, Nov 15 | Review | Tally Week 1 pre-orders (target: 20 paid reservations) | Founder | Yes |

*Critical Path item*: Apple D-U-N-S and Google Play merchant verification can take up to 5 business days. Any delay pushes the release date directly.

### Week 2: November 16 to November 22, 2026 — Build Freeze & Internal Track Verification

| Day / Date | Area | Task | Owner | Critical Path |
| :--- | :--- | :--- | :--- | :---: |
| Mon, Nov 16 | Review | Pre-sale gate review (confirming >= 50 paid orders by Nov 22) | All | Yes |
| Tue, Nov 17 | Build | Generate clean Android release bundle (`npx eas-cli build --platform android --profile production`) | Tech Lead | Yes |
| Wed, Nov 18 | Build | Upload release `.aab` to Google Play Console Internal Testing track | Tech Lead | Yes |
| Thu, Nov 19 | Build | Upload iOS archive via EAS Build to Apple TestFlight | Tech Lead | Yes |
| Fri, Nov 20 | Brand | Finalize 5-frame portrait store screenshots following unslop design | Design Lead | No |
| Sat, Nov 21 | Team | Run physical device field test on Churchgate-Borivali train run (sound, GPS, PWA cache) | QA Engineer | Yes |
| Sun, Nov 22 | Build | Code freeze on `master`: tag release candidate `v1.0.0-rc1` | Tech Lead | Yes |

### Week 3: November 23 to November 29, 2026 — Closed Beta (Soft Open) & Store Review Submission

| Day / Date | Area | Task | Owner | Critical Path |
| :--- | :--- | :--- | :--- | :---: |
| Mon, Nov 23 | Soft Open | Invite 100 closed beta testers (pre-order buyers + student ambassadors) | Growth Lead | Yes |
| Tue, Nov 24 | Legal | Submit Google Play Store production review with 20-point compliance deck | Tech Lead | Yes |
| Wed, Nov 25 | Legal | Submit Apple App Store review with in-app purchase credentials and test logins | Tech Lead | Yes |
| Thu, Nov 26 | QA | Monitor Sentry crash reporting and battery telemetry from 100 beta commuters | QA Engineer | No |
| Fri, Nov 27 | Marketing | Deliver college ambassador toolkits (posters, WhatsApp invite text, stickers) | Growth Lead | No |
| Sat, Nov 28 | Ops | Provision high-availability tile proxy VPS (3,000 rupees/month budget) | DevOps Lead | No |
| Sun, Nov 29 | Review | Verify zero crashes, zero battery anomalies, and resolve reviewer inquiries | Founder | Yes |

*Critical Path item*: Apple and Google app review queues typically take 2 to 4 business days. Submission by November 24 guarantees clearance before the target launch date.

### Week 4: November 30 to December 6, 2026 — Pre-Warming & Final Staging (T-7 to T-1)

| Day / Date | Area | Task | Owner | Critical Path |
| :--- | :--- | :--- | :--- | :---: |
| Mon, Nov 30 | Legal | Verify Google Play and Apple App Store production approvals ("Ready to Publish") | Tech Lead | Yes |
| Tue, Dec 1 | Marketing | Pre-brief 5 regional transit content creators and transit forum moderators | Growth Lead | No |
| Wed, Dec 2 | Marketing | Schedule Product Hunt launch page and teaser video demo | Growth Lead | No |
| Thu, Dec 3 | Build | Verify PWA service worker caching headers and domain SSL on `transitwake.app` | DevOps Lead | Yes |
| Fri, Dec 4 | Team | Conduct dry-run simulation of launch day run sheet and escalation SOPs | All | No |
| Sat, Dec 5 | Marketing | Seed launch day announcement drafts to student WhatsApp groups | Growth Lead | No |
| Sun, Dec 6 | Ops | System health verification: test live Nominatim failover and DB backups | Tech Lead | Yes |

---

## Step 3: Launch Day Run Sheet (Monday, December 7, 2026)

All timings are in Indian Standard Time (IST). The launch is sequenced around peak morning and evening commuter transit windows.

### Hour-by-Hour Execution Schedule

| Time (IST) | Channel / Area | Action | Owner | Verification / Fallback |
| :---: | :--- | :--- | :--- | :--- |
| **05:30** | Infrastructure | Verify VPS health, memory usage, and API rate limits | DevOps Lead | Check server uptime and SSL response. |
| **06:00** | App Stores | Flip Google Play & App Store status to **Live Public Release** | Tech Lead | Confirm store search indexing on real phones. |
| **06:15** | Product Hunt | Publish Product Hunt submission with video and maker comment | Growth Lead | Verify featured listing link and upvote widget. |
| **06:30** | WhatsApp | Trigger Day 1 Commuter Pass broadcast to waitlist and pre-order buyers | Growth Lead | Monitor message open rate; watch relay queue. |
| **07:00** | Reddit | Post founder story and open-source announcement on r/mumbai and r/bangalore | Founder | Strictly comply with subreddit self-promotion rules. |
| **07:30** | Field Ops | Live station team active at Borivali, Dadar, and Indiranagar stations | Street Team | Hand out commute sleep cards to boarding riders. |
| **08:30** | Social Media | Publish Twitter/X technical thread demonstrating 78% battery savings | Founder | Tag open-source Expo, React Native, and OSM handles. |
| **10:00** | Telemetry | First triage meeting: review morning rush crashes, installs, and error logs | All | Check Sentry dashboard and Nominatim request counts. |
| **12:00** | Student Loop | University ambassador blast goes live across 15 campus Discord/WhatsApp servers | Growth Lead | Verify student referral codes increment properly. |
| **14:00** | PR & Media | Send release brief to local tech reporters and transport newsletters | Growth Lead | Follow up on Product Hunt mid-day ranking. |
| **17:00** | Infrastructure | Pre-evening rush server check: double tile proxy cache capacity | DevOps Lead | Confirm zero 429 errors on geocoding endpoints. |
| **17:30** | In-App Push | Trigger evening commute notification: "Heading home? Arm your wake alarm in 1 tap." | Tech Lead | Verify push delivery across iOS APNs and Android FCM. |
| **18:00** | Evening Rush | Monitor live active commuters, transfer alarms, and WhatsApp ETA shares | QA Engineer | Verify sequential interchange alarms ring on time. |
| **20:30** | Evening Tally | Post-commute review: count daily active commuters, conversions, and bug reports | All | Tally Day 1 installs against break-even targets. |
| **22:00** | Night Shift | Send targeted message to hospital and night shift nurse/doctor associations | Growth Lead | Highlight 04:00-06:00 fail-safe loud wake reliability. |

### Opening Offer: The Day 1 Commuter Pass

- **Free Tier**: Complete geofence wake alarms, offline PWA subway tunnel mode, single-leg routes, and standard TTS voice alerts.
- **Launch Day Prime Special**:
  - The first 1,000 commuters lock in **26 rupees per month forever** (or 199 rupees for 1 year).
  - Includes: 1-tap WhatsApp peace of mind live ETA link, multi-leg interchange transfer alarms, zero banner ads, and emergency loudspeaker failsafe.
  - Student referral loop active immediately: invite 2 classmates to unlock 6 months free.
  - Guaranteed by the **14-day statutory money-back policy** with 1-tap transparent cancellation in app settings.

### Risk Register & Emergency Response Protocols

| Risk Event | Severity | Detection Indicator | Immediate Corrective Protocol |
| :--- | :---: | :--- | :--- |
| Nominatim geocoding hits rate limit | High | Geocoding failure rate > 2% | Instant fallback to embedded offline SQLite transit station index. |
| Tile proxy bandwidth saturated | High | Map load latency > 2.0s | Switch client to local vector fallback or OpenStreetMap public mirrors. |
| Android OS kills background alarm | Critical | User report of missed alarm | Prompt user to disable battery optimization (`ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS`). |
| In-app purchase verification fails | High | Store receipt timeout | Grant temporary 48-hour Prime access locally while server retries verification queue. |
| Negative store review on launch day | Medium | Rating drops below 4.2 | Direct developer reply within 30 minutes offering direct support and immediate fix. |

---

## Step 4: The First 30 Days Playbook

To ensure financial stability and prevent capital bleed, operational performance is monitored weekly against the unit economics defined in `founder/cfo.md` and `founder/numbers.json`.

### Weekly Financial & Metric Targets

| Metric | CFO Break-Even Line | Week 1 Target | Week 2 Target | Week 3 Target | Week 4 (Day 30) Plan Target |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Daily active commuters (DAU) | 120 | 250 | 500 | 1,000 | 2,500 |
| New Prime subscribers / day | **8 / day** | 12 / day | 18 / day | 22 / day | **25 / day** |
| Active paying subscribers | 217 total | 84 | 210 | 364 | **520** |
| Monthly recurring revenue (MRR) | 5,642 rupees | 2,184 rupees | 5,460 rupees | 9,464 rupees | **13,520 rupees** |
| Net monthly operating profit | 0 rupees (break-even) | -2,316 rupees | -40 rupees | +4,964 rupees | **+9,020 rupees** |
| Referral K-factor (students) | 0.8 | 1.1 | 1.25 | 1.3 | 1.4 |
| 7-day retention rate | 25% | 35% | 40% | 42% | 45% |

### Circuit Breakers: Triggers for Operational Change

1. **Daily Prime conversions drop below 8 per day for 3 consecutive days**:
   - *Diagnosis*: Commuters find the free tier sufficient and do not perceive the urgency of multi-leg alarms or ad removal.
   - *Remedy*: Enhance the post-alarm relief summary screen (`AlarmTriggerModal.tsx`) to highlight the exact minutes of sleep protected and battery preserved, and offer a 7-day free trial of Prime before charging the 26 rupees.
2. **Student referral unlock rate falls below 15%**:
   - *Diagnosis*: 2 referrals is perceived as too high a barrier among shy or non-technical commuters.
   - *Remedy*: Temporarily lower the threshold to 1 referral for the first 1,000 students or reward both referrer and referee with 3 months each.
3. **App crash rate exceeds 0.25%**:
   - *Diagnosis*: Unhandled edge case in background GPS throttling or headless audio sessions on specific OEM Android builds (MIUI, ColorOS).
   - *Remedy*: Issue hotfix patch within 12 hours utilizing EAS Update over-the-air deployment without waiting for full app store re-review.
4. **Tile proxy and server costs exceed 4,500 rupees per month**:
   - *Diagnosis*: Aggressive pre-fetching of map tiles in underground stations creating unnecessary bandwidth consumption.
   - *Remedy*: Increase local browser/PWA cache TTL from 7 days to 30 days and restrict tile caching strictly to zoom levels 13 to 16 along defined rail tracks.

---

## Post-Launch Review Milestones

### Day 7 Review (Monday, December 14, 2026)

- **Questions to answer**:
  1. Did we achieve the break-even run rate of 8 new subscriber-months per day?
  2. What percentage of commuters who armed an alarm used the 1-tap WhatsApp ETA share?
  3. Are night shift and hospital workers converting at the projected 90% rate?
  4. What are the top 3 user complaint themes in store reviews and customer support emails?
- **Action items**:
  - Triage all bugs reported during first 10,000 commute kilometers.
  - Publish Day 7 performance transparency report on community channels.

### Day 14 Review (Monday, December 21, 2026)

- **Questions to answer**:
  1. What is the Day 14 refund rate under the statutory guarantee (is it below the 2% safety threshold)?
  2. Are students unlocking the 6-month pass via 2 peer referrals, and are their peers remaining active?
  3. How effective were the physical station QR flyers compared to online Reddit/WhatsApp acquisition?
  4. Is battery consumption consistently clocking at or below 22% of normal GPS drain?
- **Action items**:
  - Reallocate marketing focus: prune channels with CAC > 10 rupees; double down on highest ROI commuter hubs.
  - Review cloud VPS server resource utilization and optimize tile caching policies.

### Day 30 Review (Wednesday, January 6, 2027)

- **Questions to answer**:
  1. Did Month 1 hit the CFO plan target of 25 subscriber-months per day (19,500 rupees revenue / 11,100 rupees profit)?
  2. What is the 30-day renewal rate on the 26 rupee monthly subscription?
  3. Has the 12,000 rupee initial startup expenditure been recovered according to the payback model?
  4. Is the app ready to expand from Mumbai and Bangalore rail lines to Delhi Metro and Chennai suburban networks?
- **Action items**:
  - Prepare Month 2 expansion roadmap (`founder/plan.md`).
  - Activate corporate B2B night-shift pilot discussions with local private hospital networks and BPO call centers.

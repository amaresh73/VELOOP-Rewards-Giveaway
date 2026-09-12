# VELOOP Rewards – Premium Giveaway Experience

A high-performance, fintech-inspired Giveaway platform built with React, Vite, and Node/Express/MongoDB. The platform provides an authentic, transparent, and rewarding loyalty experience designed to delight verified VELOOP members while maintaining strict compliance, fraud prevention, and database-enforced integrity.

---

## 1. Project Overview
VELOOP Rewards Giveaway provides members with an engaging opportunity to participate in tier-based giveaways using platform reward currencies (**VEs**, **SVEs**, **Tokens**). Designed following modern fintech aesthetics (dark glassmorphism, refined micro-interactions, responsive grids), it avoids cheap casino/gambling tropes in favor of an auditable, transparent loyalty experience.

---

## 2. Giveaway Concept
- **Activity & Loyalty Focused**: Users earn entries by completing verified tasks and platform milestones.
- **Fair & Transparent**: One entry per verified member per giveaway event enforced at the database level.
- **Tier-Based Prize Structure**: Clearly categorized prize tiers (1st Prize, 2nd Prize, 3rd Prize, Lucky Draw).
- **Verifiable Selection**: Provably random winner selection executed server-side after the close timer finishes.
- **Dedicated Claim Workflow**: Customized fulfillment forms for Physical, Gift Card, and Digital rewards.

---

## 3. Key Features
- **VELOOP Reward Arena Command Center**: Asymmetrical high-tech command center featuring ambient multi-color aurora drift, live pulsing protocol indicator (`VELOOP PROTOCOL • VERIFIED DROPS`), dynamic cyber-fintech typography, an integrated quick promo code redemption bar, and the **Grand Prize Spotlight Vault** with an amber glowing halo and live draw counter.
- **The VELOOP Protocol (Horizontal 4-Phase Roadmap)**: Transparent, auditable 4-phase horizontal roadmap (`01. Verify Membership`, `02. Collect Currencies`, `03. Stake Draw Entry`, `04. Verifiable Claim`) featuring glowing watermark indices and neon accents on hover.
- **Dynamic Live Drops Explorer**: Filterable drops catalog supporting real-time category filtering (`🔥 All Drops`, `📱 Tech & Flagships`, `🎧 Audio & Sound`, `🎁 Gift Vouchers`) and sorting (`Closing Soonest`, `Lowest Entry Fee`, `Most Winners`).
- **Individual Giveaway Details Pages**: Every drop has a dedicated route (`/giveaway/:slug`) with a 7-step process timeline, 10-point T&C breakdown, balance verification across currencies (**VEs**, **SVEs**, **Tokens**), confirmation modal, and success flow.
- **Dedicated Trust Section**: 4 pillars of integrity (100% Fair & Transparent, Secure & Safe, Trusted by 10K+ Users, 24/7 Customer Support).
- **Winner Announcement Slider**: Smooth, continuous horizontal marquee ticker displaying privacy-safe masked winner alerts (`User VE****72 won an iPhone 15 Pro`) with hover-to-pause interaction.
- **Winners Lifecycle Tracker**:
  - **Current Giveaway Tab**: Guards against premature winner reveals during active draws; features a verified draw animation (`Selecting Winners...` → `Winner Revealed`).
  - **Previous Winners Tab**: Historical archive of completed draws, awarded prizes, and dates.
- **Winner-Specific Prize Claim Modal**:
  - `PHYSICAL`: Full Name, Phone, Complete Address, City, State, PIN Code.
  - `GIFT_CARD`: Digital delivery strictly via verified email address.
  - `DIGITAL`: Destination Wallet Address / Account ID and confirmation email.
- **5-State Claim Tracking**: Not Submitted → Submitted → Processing → Completed → Expired.
- **Expandable Accordion FAQ**: In-depth answers on eligibility, mechanics, deadlines, and claims.
- **Interactive Promo Codes**: Redeem codes like `VELOOP2026` or `SUMMERDROP` to unlock instant bonus VEs.

---

## 4. Giveaway Lifecycle & States
The frontend dynamically supports 7 distinct user/event states:
1. **Visitor State**: Prompts `Login to Participate` with account creation shortcuts.
2. **Logged-in Non-Participant**: Displays required fee in VEs and unlocks `Join Giveaway`.
3. **Active Participant State**: Displays `You're Participating ✓`, `Your Entries: 24`, and CTA `Earn More Entries →`.
4. **Winner State**: Spotlight banner: `🎉 Congratulations! You won Apple Watch Series 9! [Claim Prize]`.
5. **Non-Winner State**: Encouraging notification: `Thanks for participating! Winners have been announced. Better luck next time! [View Winners]`.
6. **Giveaway Ended State**: Automatic countdown zero-transition switching to closed audit state.
7. **Upcoming State**: Displays `Next Giveaway Starts In ...`, `Get ready for another chance to win.`, and `[Explore Rewards →]`.

---

## 5. Technology Stack
- **Frontend Framework**: React 18 with Vite
- **Routing**: React Router DOM v6
- **UI & Layout**: React Bootstrap, Vanilla CSS Modules, Modern CSS Grid & Flexbox
- **Typography**: Inter (Google Fonts)
- **Backend Service**: Node.js, Express.js, MongoDB (Mongoose) with MongoMemoryServer for zero-config local development
- **Security & Integrity**: JWT authentication, atomic wallet balance debits, idempotency keys

---

## 6. Folder Structure
```
Project_giveaway/
├── Backend/
│   ├── src/
│   │   ├── config/          # Database & MongoMemoryServer setup
│   │   ├── controllers/     # Giveaways, Auth, Claims, Winners
│   │   ├── models/          # User, Wallet, Giveaway, Participation, Claim
│   │   └── routes/          # Express API endpoints
│   └── server.js            # Server entrypoint
│
└── Frontend/
    ├── public/
    │   └── assets/          # Static production assets
    ├── src/
    │   ├── assets/          # 3D pedestal box, golden ticket artwork
    │   ├── components/
    │   │   ├── Common/      # GiveawayCodeModal
    │   │   ├── Countdown/   # Automatic ticking countdown
    │   │   ├── FAQ/         # Accordion FAQ section
    │   │   ├── GiveawayBanner/ # Exclusive reference banner
    │   │   ├── GiveawayLoader/ # Branded gift box loader
    │   │   ├── PrizeCard/   # 4-tier themed prize cards
    │   │   ├── TrustSection/# 4 integrity pillars
    │   │   ├── WinnerSlider/# Looping social proof marquee
    │   │   └── WinnersTabs/ # Lifecycle tracker & claim modals
    │   ├── context/         # AuthContext
    │   ├── data/            # giveawayData.js (API mock schemas & seeds)
    │   ├── pages/           # GiveawayHome, GiveawayDetails, AdminPanel, LoginPage
    │   ├── services/        # api.js, giveawayService.js
    │   └── styles/          # global.css, admin.css
    └── vite.config.js
```

---

## 7. Component Architecture
- **`GiveawayBanner`**: Large visual showcase containing 3D rendered gift box, VIP golden voucher, value props, and code entry CTA.
- **`PrizeCard`**: Configurable reward card with ambient glow matching position tier:
  - Gold / Purple: 1st Prize (iPhone 15 Pro)
  - Blue: 2nd Prize (Apple Watch Series 9)
  - Green: 3rd Prize (AirPods Pro 2)
  - Orange: Lucky Draw (Amazon Gift Card)
- **`WinnersTabs`**: Full lifecycle tabbed interface managing live draws, reveal animations, non-winner fallbacks, and past winner archives.
- **`GiveawayCodeModal`**: Interactive modal supporting promo code redemptions with floating celebratory toasts.

---

## 8. Installation & Local Development

### Prerequisites
- Node.js 18+
- npm 9+

### Quick Start
```powershell
# 1. Run the Backend (Terminal 1)
cd Backend
npm install
node server.js
# Backend runs on http://localhost:5000 (Uses MongoMemoryServer automatically)

# 2. Run the Frontend (Terminal 2)
cd ../Frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### Production Build
```powershell
cd Frontend
npm run build
```

---

## 9. Backend Architecture & Fraud Protection Layer

The backend serves as the **single authoritative source of truth**, enforcing the critical principle: **Never trust client-supplied values.**

### 9.1 Multi-Signal Fraud Protection
- **Privacy-Conscious Device Fingerprinting (`deviceHash`)**: Uses SHA-256 to hash client environment headers instead of collecting intrusive personal data.
- **Same-Device & Multi-Account Protection**: Prevents multiple accounts from participating from the same device in the same giveaway event (`DeviceParticipation`).
- **Cumulative Risk Scoring (0–100)**:
  - `0–29`: **LOW** (Allowed)
  - `30–59`: **MEDIUM** (Flagged for review)
  - `60–79`: **HIGH** (Blocked)
  - `80–100`: **CRITICAL** (Blocked & logged)
- **Non-Reward Policy**: Fraudulent/suspicious attempts are logged to `FraudEvent` and denied entry creation.
- **Audit Logging**: All financial and state-modifying actions are permanently recorded in `AuditLog`.

### 9.2 API Reference

| Endpoint | Method | Auth | Description | Error Codes |
|---|---|---|---|---|
| `/api/giveaways` | `GET` | Public | List all giveaways with authoritative server statuses | `500` |
| `/api/giveaways/current` | `GET` | Public | Authoritative current active giveaway event | `404` (No active giveaway) |
| `/api/giveaways/:id` | `GET` | Public | Fetch individual giveaway by ID or slug | `404` (`GIVEAWAY_NOT_FOUND`) |
| `/api/giveaways/previous` | `GET` | Public | Historical completed giveaways and previous winners | `500` |
| `/api/giveaways/:id/my-status` | `GET` | Required | Authenticated user participation status | `401` (`LOGIN_REQUIRED`) |
| `/api/giveaways/:id/join` | `POST` | Required | Atomic entry fee deduction & participation creation | `400` (`INSUFFICIENT_BALANCE`, `GIVEAWAY_ENDED`), `409` (`PARTICIPATION_ALREADY_EXISTS`, `DUPLICATE_REQUEST`), `429` (`RATE_LIMITED`) |
| `/api/giveaways/:id/winners` | `GET` | Public | Privacy-masked winners for the giveaway | `500` |
| `/api/giveaways/:id/claim` | `POST` | Required | Server-validated claim submission (physical or voucher) | `400` (Validation failed), `403` (`NOT_WINNER`), `409` (`CLAIM_ALREADY_SUBMITTED`) |
| `/api/giveaways/:id/my-claim` | `GET` | Required | Check status of user's reward claim | `401` |
| `/api/auth/login` | `POST` | Public | Authenticate user & issue signed JWT | `400`, `401`, `429` |
| `/api/admin/stats` | `GET` | Admin | Live platform metrics and fraud activity counters | `401`, `403` |

---

## 10. Credentials for Development
- **Default Member Account**: `test@example.com` / `secret123`
- **Default Winner User ID**: `VE10025` (Matched with Apple Watch Series 9)
- **Giveaway Promo Codes**: `VELOOP2026`, `SUMMERDROP`, `REWARD500`
- **Admin Portal**: Accessible at `/admin` (Credentials: `admin@example.com` / `admin123`)

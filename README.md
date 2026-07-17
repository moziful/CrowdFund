# 🚀 CrowdFund — Premium Crowdfunding Platform

CrowdFund is a fully responsive, premium crowdfunding platform built using **Next.js**, **Tailwind CSS**, and **MongoDB**. It enables creators to pitch campaigns, manage supporters, and request withdrawals, while enabling backers to explore campaigns, buy credits, make contributions, and track their pledges in real-time.

---

## 🌟 Key Features

1. **Role-Based Workspaces**: Multi-tenant architecture with tailored workspaces for three roles: **Supporter**, **Creator**, and **Admin**.
2. **Dynamic Live Notification System**: Floating dropdown list notifying creators of contributions and goal milestones, backers of pledge updates, and admins of new campaigns or security reports.
3. **Credit Ledger Ecosystem**: Dynamic virtual currency transactions (50 credits default for Supporters, 20 credits default for Creators upon registration).
4. **Stripe Payment Gateway Integration**: Real-time package purchase mechanism for Supporters to acquire platform credits safely.
5. **Interactive Security Reports Form**: Backers can flag suspicious campaigns directly to the Admin moderation panel.
6. **Dynamic Sorting**: Search and overview directories sort active campaigns by creation date (newest first).
7. **Creator Withdrawal Hub**: Handles lock-in credits to USD payouts conversion ratio (20 credits = $1) with automatic refund state updates on rejection.
8. **Collapsible Mobile-Friendly Drawers**: Seamless navigations across all layouts optimized for mobile, tablet, and desktop views.
9. **Dev Mode Switcher**: Quick-toggle header bar allowing developer testing between mock user profiles.
10. **Toast Notifications**: Interactive state alerts using React-Toastify for smooth visual feedback on forms and button clicks.

---

## 🔑 Live Link & Admin Credentials

* **Live Site URL**: *https://crowd-fund-omega.vercel.app*
* **Admin Email**: `admin@crowd.com`
* **Admin Password**: `AdminPassword123!` (Or use the built-in Dev Switcher in the dashboard to instantly test as Admin/Creator/Supporter)


---

## ⚙️ Environment Configuration

Create a `.env.local` file in the root directory and define the following variables:

```env
MONGODB_URI=your_mongodb_connection_uri
JWT_SECRET=your_jwt_secret_key_change_me_in_production
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🛠️ Getting Started

First, install the dependencies:

```bash
npm install
```

Second, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to inspect the application.

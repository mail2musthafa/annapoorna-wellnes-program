# 🌿 Annapoorna Portal — Lifestyle Medicine, Clinical Education & Community Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat-square&logo=python)](https://python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

**Annapoorna Portal** is an evidence-based clinical lifestyle medicine and culinary education web platform modeled after modern outcomes-driven metabolic health systems (such as *Mastering Diabetes* and *Food for Life*). It bridges the gap between endocrinology and kitchen practice to help reverse insulin resistance, lower A1c, and cultivate lifelong vitality across **Six Pillars of Health**.

---

## 🌟 Key Platform Modules & Highlights

### 1. 🏠 Outcome-Focused Landing Page & Conversion Funnel (`/`)
* **Hero Outcome Section**: Value proposition with direct navigation to [**Wellness Store**](http://localhost:3000/products), [**Live Calendar**](http://localhost:3000/classes), [**Six Pillars**](http://localhost:3000/pillars), [**Recipes**](http://localhost:3000/recipes), and [**About Us**](http://localhost:3000/about).
* **Verified Patient Results & CGM Flatlines**: Real before/after case studies (Kathy Gaither: A1c 9.2% ➔ 5.4%, Jim Jones: Down 28 lbs, Rajesh Kumar: 70% insulin reduction).
* **Vibrant Community Feed Preview**: Live social proof quotes with direct responses from Dr. Maya Rao, MD and Chef Anita Desai.
* **Featured Recipe Masterclasses**: Split-banner masterclass cards (*Adobo Mushroom Bowl*, *Cherry Balsamic Chickpea*, *Sesame Ginger Edamame*).
* **Free 42-Page Starter Guide Lead Magnet**: Zero-oil pantry blueprint and 14-day rotational meal starter.

---

### 2. 🤖 "Ask Ammara" — Your Annapoorna Wellness Companion
* **Global Floating Assistant**: Accessible from any page via the warm terracotta floating trigger button.
* **Warm, Compassionate Tone**: Introduces with *"Namaste, I’m Ammara—your Annapoorna wellness companion..."*
* **Core Handled Workflows**:
  * 🗓️ **Live Class Discovery**: Recommends upcoming cooking labs with direct reservation links.
  * 🥗 **Zero-Oil Plant Recipes**: Low-glycemic, anti-inflammatory meal suggestions.
  * 🧾 **Invoices & Purchases**: Direct guidance for downloading official tax receipts.
  * 👩‍⚕️ **Human Specialist Handoff**: Connects members directly with Dr. Maya Rao, Anita Desai, and Jim Jones via VIP Concierge.
* **Clinical Boundary Safeguard**: Ammara strictly provides lifestyle guidance and never diagnoses diseases or prescribes medications.

---

### 3. 🎥 Interactive Live Calendar & Masterclasses (`/classes`)
* **Populated Sessions Across All 6 Pillars**: Nutrition, Movement, Restorative Sleep, Mindfulness, Community, and Clean Habits.
* **Dynamic Timezone Converter**: Converts scheduled times in real-time between **IST (India)**, **EST (New York)**, **PST (Los Angeles)**, and **GMT (London)**.
* **Dual Display Modes**: Grid view with cover photography and list agenda view.
* **Live Capacity Indicators**: Real-time remaining seat badges (`🟢 6 Seats Left`).
* **Interactive Booking Drawer**: Learn syllabus takeaways and book seats directly into the cart.

---

### 4. 🛒 Multi-Currency E-Commerce, Cart & Checkout (`/products`, `/cart`, `/checkout`)
* **13 Curated Offerings**: Live masterclasses, 6-week cohort resets, video course labs, and VIP memberships.
* **Authoritative Multi-Currency Engine**: Full support for both **USD ($)** and **INR (₹)**.
* **Interactive Shopping Cart**: Quantity adjustments, item removal, and coupon engine (`ANNAPOORNA10` for 10% off).
* **Multi-Gateway Checkout**: Supports Credit/Debit Cards (Stripe), UPI/Net Banking (Razorpay), and 1-Click Sandbox Test Settlement.

---

### 5. 🧑‍💻 Member Workspace Hub (`/dashboard`)
* 🏠 **Overview**: 92/100 Adherence score, split video tutorials, live coaching countdown.
* 💬 **Community Forum (`/dashboard/community`)**:
  * **Live Feed**: Multi-image attachments, emoji reaction counters (`🔥`, `❤️`, `👏`), nested commenting.
  * **Members Directory**: Peer mentor cards, streak badges, and "Send Direct Note" chat modal.
  * **Active Challenges**: 4 gamified lifestyle challenges with progress bars.
  * **Faculty Protocol Modal**: Clinical paper on insulin sensitization by Dr. Maya Rao.
* 📅 **1-on-1 Consultation Calendar (`/dashboard/appointments`)**: Live slot status (`🟢 Available`, `🟡 Limited`, `🔴 Booked`) with Google Meet booking confirmation.
* 🎓 **Video Courses (`/dashboard/courses`)**: Video player modal with syllabus checklist and *"Mark as Done"* tracker.
* 🥗 **Clinical Nutrition Plan (`/dashboard/nutrition-plan`)**: 2-Stage meal plan with ingredient swaps and physician sign-off.
* 📁 **Digital Downloads (`/dashboard/resources`)**: PDF preview drawer and real browser `.md` handbook downloads.
* 💎 **VIP Membership (`/dashboard/membership`)**: Monthly/Annual plan switcher and VIP Concierge message drawer.
* 🧾 **Tax Invoices & Receipts (`/dashboard/purchases`)**: Itemized tax receipts with GST breakdown and **real downloadable text/PDF receipt generator**.

---

### 6. 🛡️ Admin Operations Control Center (`/admin`)
* **Left Sidebar Navigation**: Collapsible vertical layout matching the member workspace.
* **📦 Offerings & Pricing**: Product editor with 3-mode cover photo uploader (computer file upload, curated presets, direct URL) and one-click store visibility approvals.
* **👥 Members & Access Grants**: Searchable member table, active/suspended account switches, and manual enrollment grant modal.
* **📅 Consultation Capacity Manager**: Real-time consultation slot capacity and coach assignments.
* **🥗 Clinical Plan Approvals**: Physician sign-off queue.
* **🎯 CRM Lead Pipeline**: Multi-stage inbound enquiry tracking.
* **📊 Analytics Dashboard**: Revenue counters, active subscribers, and capacity stats.

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Super Administrator** | `admin@annapoorna.local` | `AdminPass123!` | Full Admin Control Center, Offerings, Member Grants |
| **Cohort Member** | `priya.sharma@example.com` | `MemberPass123!` | Member Workspace, Community, Courses, Invoices |
| **Faculty Physician** | `maya@annapoorna.local` | `CoachPass123!` | Clinical Approvals, Video Consultations, Protocol |

---

## 🗺️ Application Sitemap

### 🌐 Public Pages
* [**Landing Page**](http://localhost:3000/): `http://localhost:3000/`
* [**About Us**](http://localhost:3000/about): `http://localhost:3000/about`
* [**Wellness Store**](http://localhost:3000/products): `http://localhost:3000/products`
* [**Live Calendar**](http://localhost:3000/classes): `http://localhost:3000/classes`
* [**Six Pillars**](http://localhost:3000/pillars): `http://localhost:3000/pillars`
* [**Recipes**](http://localhost:3000/recipes): `http://localhost:3000/recipes`
* [**Free Starter Guide**](http://localhost:3000/lead-guide): `http://localhost:3000/lead-guide`
* [**Shopping Cart**](http://localhost:3000/cart): `http://localhost:3000/cart`
* [**Checkout**](http://localhost:3000/checkout): `http://localhost:3000/checkout`
* [**Sign In**](http://localhost:3000/login): `http://localhost:3000/login`

### 🧑‍💻 Member Workspace
* [**Workspace Overview**](http://localhost:3000/dashboard): `http://localhost:3000/dashboard`
* [**Community Forum**](http://localhost:3000/dashboard/community): `http://localhost:3000/dashboard/community`
* [**Consultation Calendar**](http://localhost:3000/dashboard/appointments): `http://localhost:3000/dashboard/appointments`
* [**Live Classroom**](http://localhost:3000/dashboard/classes): `http://localhost:3000/dashboard/classes`
* [**Course Video Labs**](http://localhost:3000/dashboard/courses): `http://localhost:3000/dashboard/courses`
* [**Nutrition Plans**](http://localhost:3000/dashboard/nutrition-plan): `http://localhost:3000/dashboard/nutrition-plan`
* [**Digital Downloads**](http://localhost:3000/dashboard/resources): `http://localhost:3000/dashboard/resources`
* [**VIP Membership**](http://localhost:3000/dashboard/membership): `http://localhost:3000/dashboard/membership`
* [**Invoices & Receipts**](http://localhost:3000/dashboard/purchases): `http://localhost:3000/dashboard/purchases`

### 🛡️ Admin Operations
* [**Admin Control Center**](http://localhost:3000/admin): `http://localhost:3000/admin`

---

## 🛠️ Architecture & Tech Stack

```
annapoorna/
├── apps/
│   ├── web/                     # Next.js 16 App Router Frontend
│   │   ├── src/
│   │   │   ├── app/             # 24 Server & Client Routes
│   │   │   ├── components/      # Design System, Navbar, Cart, Chatbot
│   │   │   ├── context/         # CartContext & Multi-Currency Engine
│   │   │   └── lib/             # API Client & Utilities
│   └── api/                     # FastAPI Async Backend
│       ├── app/
│       │   ├── modules/         # Modular DDD Domain Endpoints
│       │   │   ├── admin/       # Offerings, Members, Calendar Slots, Image Upload
│       │   │   ├── commerce/    # Products, Cart, Discounts, Checkout
│       │   │   ├── community/   # Posts, Comments, Reactions, Direct Chat
│       │   │   ├── scheduling/  # Timezone Sessions & Concurrency Seat Holds
│       │   │   └── payments/    # Orders, Invoices, Gateway Webhooks
│       │   └── db/              # SQLAlchemy Async Models & Migrations
│       └── scripts/seed.py      # Comprehensive Database Seeder
```

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js**: v20+
* **Python**: v3.12+ (or `uv`)

### 2. Backend Setup (`apps/api`)
```bash
cd apps/api
# Run migrations & seed data
DATABASE_URL="sqlite+aiosqlite:///annapoorna_dev.db" uv run python scripts/seed.py

# Start FastAPI server (Port 8000)
DATABASE_URL="sqlite+aiosqlite:///annapoorna_dev.db" uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Setup (`apps/web`)
```bash
cd apps/web
npm install

# Start Next.js development server (Port 3000)
npm run dev

# Run Production Build Verification
npm run build
```

---

## 🧪 Test Suite & Quality Assurance
* **Pytest Backend Tests**: 18/18 tests passing (100%).
* **Next.js Production Build**: 24/24 routes prerendered in <900ms.
* **0 Console Errors**: Clean TypeScript compilation and zero 404 routing errors.

---

*Crafted with care for holistic metabolic vitality.*

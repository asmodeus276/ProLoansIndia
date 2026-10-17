# Proloan India 🇮🇳
> Premier Multi-Bank Financial Advisory & Loan Facilitation Platform

[![Website](https://img.shields.io/badge/Platform-Proloan%20India-blue.svg)](https://proloanindia.com)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-green.svg)](#)
[![Stack](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20JavaScript%20%7C%20Node.js-orange.svg)](#)

---

## 📌 Overview

**Proloan India** is a premier financial technology and multi-bank loan distribution platform designed to help retail borrowers, MSMEs, doctors, and businesses secure competitive loans with low interest rates and high-touch advisory.

### Key Capabilities:
- **Comprehensive Product Suite:** Personal Loans, Business Loans, Home Loans, LAP (Loan Against Property), MSME / CGTMSE Credit, Overdraft (OD/CC) Facilities, Doctor/CA Professional Loans, Machinery Loans, and Construction Finance.
- **Interactive Financial Calculators:** Real-time EMI calculators, tenure adjusters, and loan eligibility estimators.
- **Direct Lead Capture & Tracking:** Multi-stage application modals, real-time Supabase cloud synchronization, and Nodemailer lead dispatch.
- **Internal Staff Portal (`portal.html`):** Dedicated back-office dashboard for DSA team lead tracking and application status management.
- **Mobile First & Responsive:** Optimized for desktop, tablet, and 360px+ mobile screens.

---

## 📂 Project Architecture

```
├── index.html        # Main customer-facing web application
├── portal.html       # Internal staff management and loan tracking portal
├── server.js         # Express + Nodemailer backend for instant lead email notifications
├── assets/           # High-resolution logos, banners, credit score guides & blog media
├── .env.example      # Sample environment variables for email dispatch
└── package.json      # Node.js dependencies
```

---

## 🚀 Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   Copy `.env.example` to `.env` and fill in your Gmail SMTP credentials:
   ```env
   PORT=3000
   GMAIL_USER=your_sender_email@gmail.com
   GMAIL_APP_PASSWORD=your_gmail_app_password
   LEAD_RECIPIENT=client_leads_recipient@gmail.com
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   Open `http://localhost:3000` in your browser.

---

## 🌐 Deploying to Hostinger

- **Web Root:** Upload `index.html`, `portal.html`, and the `assets/` folder to `public_html`.
- **Node.js Web App:** Deploy via Hostinger's Node.js / Web Apps section pointing to `server.js`.

---

© Proloan India. All rights reserved.

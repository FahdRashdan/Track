# 💸 Track — Personal Finance & Expense Tracker

A modern, full-stack personal finance and expense tracking mobile application built with **React Native (Expo SDK 57)**, **Node.js / Express**, **Neon PostgreSQL**, and **Clerk Authentication**.

---

## 🌟 Key Features

- 🔐 **Authentication with Clerk**:
  - Secure Email & Password Sign Up / Sign In.
  - Multi-Factor Authentication & Device Verification support (`needs_client_trust`).
  - Native token caching via Expo SecureStore.

- 📊 **Real-Time Financial Dashboard**:
  - **Total Balance** card with privacy toggle (`eye` icon to hide/show amounts) and monthly percentage growth indicators.
  - Side-by-side **Income** and **Expenses** summary cards.
  - Dynamic category styling with custom circular icons for quick visual recognition.

- ➕ **Seamless Transaction Management**:
  - Log both **Expenses** (8 categories: *Food & Beverage, Transportation, Shopping, Bills, Entertainment, Health, Personal, Other*) and **Incomes** (6 categories: *Salary, Freelance, Gift, Refund, Investment, Other*).
  - Quick single-tap transaction deletion via inline trash bin icons (`trash-outline`).
  - Automatic, instant UI updates on view focus using Expo Router's `useFocusEffect`.

- 🚀 **Production-Ready Backend**:
  - Express REST API deployed live on **Render**.
  - PostgreSQL database powered by **Neon DB**.
  - API rate-limiting via **Upstash Redis**.

---

## 🛠️ Tech Stack

### Mobile Frontend (`/mobile`)
- **Framework**: React Native with [Expo SDK 57](https://expo.dev)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **Authentication**: [@clerk/expo](https://clerk.com/docs/quickstarts/expo) (v4.6+)
- **Icons**: [@expo/vector-icons](https://icons.expo.fyi/) (`Ionicons`)
- **Language**: JavaScript / ES6+

### Backend API (`/backend`)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon Database)
- **Rate Limiting**: Upstash Redis (`@upstash/ratelimit`)
- **Hosting**: Render

---

## 📁 Repository Structure

```text
Track/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection & Upstash Redis configuration
│   │   ├── controllers/     # Transaction & summary logic handlers
│   │   ├── middleware/      # Rate limiter middleware
│   │   ├── routes/          # Express API route definitions
│   │   └── server.js        # Express app entry point
│   ├── .env.example
│   └── package.json
│
└── mobile/
    ├── assets/              # App images & icons
    ├── src/
    │   ├── app/             # Expo Router screens
    │   │   ├── (auth)/      # Sign-in & Sign-up authentication flow
    │   │   ├── add-transaction.jsx   # Expense & Income entry screen
    │   │   ├── index.jsx    # Main Financial Dashboard screen
    │   │   └── _layout.jsx  # Root layout with ClerkProvider
    │   ├── components/      # Reusable UI components (SafeScreen)
    │   ├── constants/       # App themes & color tokens
    │   ├── hooks/           # Custom React hooks (useTransactions)
    │   └── lib/             # Utility functions
    ├── app.json
    ├── package.json
    └── tsconfig.json
```

---

## ⚙️ Environment Configuration

### Backend Setup (`backend/.env`)
Create a `.env` file inside the `backend/` directory:

```env
PORT=5001
DATABASE_URL=postgresql://<username>:<password>@<neon-hostname>/<dbname>?sslmode=require
UPSTASH_REDIS_REST_URL=https://<your-upstash-redis>.upstash.io
UPSTASH_REDIS_REST_TOKEN=<your-upstash-token>
```

### Mobile Setup (`mobile/.env`)
Create a `.env` file inside the `mobile/` directory:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Track.git
cd Track
```

### 2. Start the Backend Server
```bash
cd backend
npm install
npm run dev
```
The server will run on `http://localhost:5001`.

### 3. Start the Expo Mobile App
In a separate terminal window:

```bash
cd mobile
npm install
npx expo start -c
```

- Press `w` to open in **Web Browser**.
- Press `a` to open in **Android Emulator**.
- Press `i` to open in **iOS Simulator**.
- Scan the QR code using **Expo Go** on your mobile device.

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/transactions/:user_id` | Fetch all transactions for a specific user |
| `POST` | `/api/transactions` | Create a new transaction (`{ user_id, title, amount, category }`) |
| `DELETE` | `/api/transactions/:id` | Delete a transaction by ID |
| `GET` | `/api/transactions/summary/:user_id` | Fetch financial summary (`balance`, `income`, `expense`) |

---

## 🎬 Application Demo

<div align="center">
  <video src="YOUR_VIDEO_URL_HERE" width="800" controls title="Track App Demo"></video>
</div>

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).

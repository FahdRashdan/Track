# 📱 Track Mobile App (Expo SDK 57)

This directory contains the **Track** React Native mobile application built with **Expo SDK 57**, **Expo Router**, and **Clerk Authentication**.

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in `mobile/`:

```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### 3. Run Development Server
```bash
npx expo start -c
```

---

## 🛠 Features & Architecture

- **Clerk Auth Integration**: Configured in `src/app/_layout.jsx` with secure token caching using `expo-secure-store`.
- **Financial Dashboard**: Rendered in `src/app/index.jsx` featuring real-time balance totals, income vs expense breakdowns, and trash-bin transaction deletion.
- **Add Transaction Modal**: Rendered in `src/app/add-transaction.jsx` with pill-based segmented category selection for Expense & Income.
- **Production Backend API**: Uses `https://track-9b0s.onrender.com/api/transactions`.

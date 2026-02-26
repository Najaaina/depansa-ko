# Depansa++

Personal finance management mobile application built with React Native and Expo.

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend server running (see depansa++.backend)

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set `EXPO_PUBLIC_API_URL` to your backend URL (e.g., `http://localhost:8080`)

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Run on device/simulator**
   - iOS: Press `i`
   - Android: Press `a`
   - Web: Press `w`

## Project Structure

```
app/                    # Expo Router pages
├── (auth)/            # Authentication screens (login, register)
├── (app)/             # Protected app screens
│   └── wallet/        # Wallet management screens
components/ui/          # Reusable UI components
context/               # React Context providers
hooks/                 # Custom React hooks
schemas/               # Zod validation schemas
services/              # API services
types/                 # TypeScript interfaces
```

## Features

- User authentication (login/register)
- Wallet management (CRUD)
- Transaction tracking
- Categories/Labels management
- Financial goals

## Tech Stack

- React Native with Expo SDK 54
- Expo Router v6
- React Native Reusables (UI components)
- NativeWind (Tailwind CSS)
- Zod (validation)
- expo-secure-store (secure storage)

## Adding UI Components

```bash
npx react-native-reusables/cli@latest add [component]
```

Example: `npx react-native-reusables/cli@latest add input textarea`

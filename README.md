# ⚽ FC Pulse

> Never miss a kick-off. Real-time football match notifications, personalized for your clubs and leagues.

![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

---

## 📱 Overview

FC Pulse is a cross-platform mobile application that keeps football fans up to date with real-time match notifications across multiple leagues. Users can follow their favorite clubs, track rival teams, and receive personalized reminders — all timed exactly the way they prefer.

---

## ✨ Features

- 🔔 **Smart Push Notifications** — Receive match reminders at your preferred time (15 minutes to 14 hours before kick-off)
- 🏆 **Multi-League Support** — Follow matches across multiple football leagues worldwide
- ❤️ **Club Subscriptions** — Follow favorite clubs and rival teams for personalized daily updates
- 📅 **Daily Match Digests** — Get a morning summary of all matches happening in your subscribed leagues
- 🔐 **Secure Authentication** — User accounts powered by Supabase Auth with Row Level Security
- 🔄 **Real-Time Sync** — Live match data and database synchronization via Supabase Realtime
- 📦 **Production-Ready** — Distributed as a production Android APK with internal distribution support

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| Framework | React Native + Expo |
| Backend & Database | Supabase (Auth, Realtime DB, RLS) |
| State Management | Zustand + Context API |
| Push Notifications | Expo Notifications |
| Football Data | Football-Data.org API |
| Language | JavaScript / TypeScript |

---

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Set up environment variables

   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON=your_supabase_anon_key
   EXPO_PUBLIC_FOOTBALL_DATA_KEY=your_football_data_api_key
   ```

3. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

---

## 🔔 Notification System

FC Pulse uses a subscription-based notification architecture:

1. **League Subscriptions** — Users subscribe to leagues and receive a daily digest of all upcoming matches.
2. **Club Alerts** — Users mark clubs as *favorite* or *rival* and receive pre-match reminders.
3. **Custom Timing** — Each user sets their preferred reminder window (e.g., 30 minutes before kick-off).
4. **Scheduling** — Expo's notification scheduler queues reminders dynamically as new match data arrives.

---

## 📦 Deployment

FC Pulse is built for Android and distributed as a production APK using Expo's build service (EAS Build).

```bash
# Build for Android
eas build --platform android --profile production
```

---

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

---

## 👤 Author

**Olorunfemi I. Allo**
- GitHub: [@harlloh](https://github.com/harlloh)
- Email: alloolorunfemi@gmail.com
- LinkedIn: [@Allo Olorunfemi](https://www.linkedin.com/in/allo-olorunfemi)

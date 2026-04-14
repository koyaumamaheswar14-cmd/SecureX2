# SecureX — Real-Time Fraud Detection Web App

SecureX is a production-grade security platform designed to detect, protect, and prevent online fraud.

## Features

- **Real-Time Threat Feed**: Live monitoring of global cyber threats using Firebase Realtime Database.
- **Threat Scanner**: AI-powered URL analysis for phishing and malicious patterns.
- **Alert Center**: Personalized security notifications with severity levels.
- **Awareness Hub**: Educational resources and a security quiz to improve user awareness.
- **Scam Reporting**: Community-driven scam reporting system.
- **Risk Assessment**: Dynamic risk scoring based on user activity and scan history.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion
- **Backend**: Firebase v10 (Auth, Firestore, Realtime DB)
- **Charts**: Recharts
- **Icons**: Lucide React

## Setup Instructions

1. **Firebase Configuration**:
   - Ensure `firebase-applet-config.json` is present in the root directory.
   - The app uses Firestore for user profiles, alerts, and reports.
   - The app uses Realtime Database for the live threat feed.

2. **Environment Variables**:
   - `VITE_FIREBASE_API_KEY` and other variables are loaded from `firebase-applet-config.json`.

3. **Running the App**:
   - `npm install`
   - `npm run dev`

## Security Rules

The app implements strict Firestore Security Rules:
- Users can only read/write their own profiles and data.
- Data validation is enforced for all writes.
- Public scam reports are readable by authenticated users but only writable by the owner.

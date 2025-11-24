# DriveAssist

Your AI-Powered Car Companion - A comprehensive mobile application for vehicle diagnostics and expert marketplace, built for the Ghanaian market.

## Overview

DriveAssist is a two-sided marketplace connecting **drivers** with **automotive experts**. Using AI-powered diagnostics, drivers can identify vehicle issues and connect with certified mechanics in their area.

## Project Structure

```
drive-assist-app/
├── mobile/                    # React Native Expo mobile app
│   ├── app/                   # Expo Router screens
│   │   ├── (auth)/           # Authentication screens
│   │   ├── (driver)/         # Driver app screens
│   │   ├── (expert)/         # Expert app screens
│   │   └── (shared)/         # Shared screens (messages)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context providers
│   │   ├── constants/        # App constants & config
│   │   └── types/            # TypeScript definitions
│   └── assets/               # Images, fonts, etc.
└── stitch_moobile_uis/       # UI design references
```

## Features

### For Drivers
- **AI Diagnostics**: Describe your car issues via text, voice, or photos
- **Expert Marketplace**: Find and connect with verified mechanics
- **Vehicle Management**: Save multiple vehicles for quick diagnostics
- **Learning Hub**: Access car maintenance guides and road signs information
- **Real-time Chat**: Communicate directly with experts

### For Experts
- **Lead Management**: Receive and manage customer leads
- **Job Tracking**: Track active and completed jobs
- **Earnings Dashboard**: Monitor income and manage withdrawals
- **Customer Reviews**: Build reputation through customer feedback
- **Service Management**: Define your specializations and pricing

## Tech Stack

- **Framework**: React Native with Expo SDK 54
- **Navigation**: Expo Router (file-based routing)
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Language**: TypeScript
- **State Management**: React Context API
- **Icons**: @expo/vector-icons (MaterialIcons)

## Getting Started

See the [mobile README](./mobile/README.md) for detailed setup instructions.

### Quick Start

```bash
cd mobile
npm install
npm start
```

## Localization

The app is built for the Ghanaian market with:
- Currency: Ghana Cedi (GH₵)
- Default Location: Accra, Ghana
- Phone Code: +233
- Popular vehicle makes in Ghana

## License

MIT License - See LICENSE file for details.

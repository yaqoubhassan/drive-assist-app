# DriveAssist Mobile App

React Native Expo mobile application for DriveAssist - an AI-powered vehicle diagnostics and expert marketplace platform.

## Tech Stack

- **React Native** with **Expo SDK 54**
- **TypeScript** for type safety
- **NativeWind** (Tailwind CSS for React Native)
- **Expo Router** for file-based navigation
- **@expo/vector-icons** for Material Design icons

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator, or Expo Go app on physical device

## Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

## Project Structure

```
mobile/
├── app/                          # Expo Router screens
│   ├── _layout.tsx              # Root layout with providers
│   ├── index.tsx                # Splash screen
│   ├── (auth)/                  # Authentication flow
│   │   ├── onboarding.tsx       # Onboarding carousel
│   │   ├── welcome.tsx          # Welcome/auth gate
│   │   ├── sign-in.tsx          # Sign in screen
│   │   └── sign-up.tsx          # Sign up screen
│   ├── (driver)/                # Driver app
│   │   ├── _layout.tsx          # Tab navigation
│   │   ├── index.tsx            # Home dashboard
│   │   ├── diagnose/            # Diagnosis flow
│   │   ├── experts/             # Expert marketplace
│   │   ├── learn/               # Learning hub
│   │   └── profile/             # User profile
│   ├── (expert)/                # Expert app
│   │   ├── _layout.tsx          # Tab navigation
│   │   ├── index.tsx            # Expert dashboard
│   │   ├── leads/               # Lead management
│   │   ├── jobs/                # Job tracking
│   │   ├── earnings/            # Earnings & withdrawals
│   │   └── profile/             # Expert profile
│   └── (shared)/                # Shared screens
│       └── messages/            # Chat functionality
├── src/
│   ├── components/
│   │   └── common/              # Reusable UI components
│   │       ├── Avatar.tsx
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Chip.tsx
│   │       ├── EmptyState.tsx
│   │       ├── IconButton.tsx
│   │       ├── Input.tsx
│   │       ├── ListItem.tsx
│   │       ├── Loading.tsx
│   │       ├── Rating.tsx
│   │       └── SearchBar.tsx
│   ├── context/
│   │   ├── AuthContext.tsx      # Authentication state
│   │   └── ThemeContext.tsx     # Theme (dark/light mode)
│   ├── constants/
│   │   ├── index.ts             # Ghana-specific constants
│   │   └── colors.ts            # Color palette
│   └── types/
│       └── index.ts             # TypeScript definitions
├── assets/                       # Images, fonts
├── app.json                      # Expo configuration
├── tailwind.config.js           # NativeWind/Tailwind config
├── babel.config.js              # Babel configuration
├── metro.config.js              # Metro bundler config
└── package.json                 # Dependencies
```

## Design System

### Colors

```typescript
// Primary Colors
primary: '#3B82F6'     // Blue - main brand color
secondary: '#10B981'   // Green - success states
accent: '#F59E0B'      // Amber - warnings, highlights

// Semantic Colors
error: '#EF4444'       // Red
success: '#10B981'     // Green
warning: '#F59E0B'     // Amber
info: '#3B82F6'        // Blue
```

### Typography

The app uses the system font stack with consistent sizing:
- Headings: Bold, sizes from 2xl to base
- Body: Regular/Medium, base to sm sizes
- Labels: Medium/Semibold, sm to xs sizes

### Components

All reusable components support:
- **Dark mode** - Automatic theme switching
- **Variants** - Multiple style variants (primary, secondary, outline, etc.)
- **Sizes** - sm, md, lg sizes where applicable
- **Accessibility** - Proper contrast and touch targets

## Key Features

### Authentication
- Email/password sign up and sign in
- Guest mode access
- User type selection (Driver/Expert)
- Onboarding carousel for first-time users

### Driver Features
- **Home Dashboard**: Quick actions, recent diagnoses, vehicle management
- **AI Diagnosis**: Multi-step flow with text, voice, and photo input
- **Expert Search**: Find mechanics with map view and filters
- **Learning Hub**: Educational content, road signs guide
- **Profile**: Vehicle management, history, settings

### Expert Features
- **Dashboard**: Earnings overview, stats, leads, active jobs
- **Leads**: Browse and accept new customer leads
- **Jobs**: Manage scheduled and in-progress jobs
- **Earnings**: Track income, withdraw to mobile money or bank
- **Profile**: Services, reviews, availability settings

### Shared Features
- **Messages**: Real-time chat between drivers and experts
- **Settings**: Theme, notifications, language preferences

## Ghana Market Localization

The app is specifically built for the Ghanaian market:

```typescript
// Currency
formatCurrency(1500) // "GH₵1,500.00"

// Default Location
{ latitude: 5.6037, longitude: -0.1870, city: 'Accra' }

// Phone Code
'+233'

// Popular Vehicle Makes
['Toyota', 'Hyundai', 'Honda', 'Kia', 'Nissan', 'Mercedes-Benz', ...]
```

## Development

### Running in Development

```bash
# Start Expo development server
npm start

# Clear cache if needed
npm start -- --clear
```

### Building for Production

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

### Code Style

- TypeScript strict mode enabled
- Functional components with hooks
- NativeWind for styling (Tailwind classes)
- Expo Router for navigation

## Environment Variables

Create a `.env` file for environment-specific configuration:

```env
EXPO_PUBLIC_API_URL=https://api.driveassist.com
EXPO_PUBLIC_GOOGLE_MAPS_KEY=your_key_here
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test on both iOS and Android
4. Submit a pull request

## License

MIT License

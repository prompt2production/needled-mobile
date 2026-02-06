# Needled Mobile App - Claude Code Instructions

## Project Overview
Cross-platform mobile app for GLP-1 medication users to track injections, weight, and daily habits. Built with Expo SDK 54, featuring Pip the mascot for emotional engagement.

## Tech Stack
- **Framework:** Expo SDK 54 (React Native 0.81, React 19.2)
- **Navigation:** Expo Router (file-based routing)
- **State Management:** Zustand (client state)
- **Server State:** TanStack Query (API caching)
- **Styling:** NativeWind v4 (Tailwind CSS for RN)
- **Auth Storage:** expo-secure-store
- **HTTP Client:** Axios

## Project Structure
```
app/                    # Expo Router pages (file-based routing)
src/
  components/           # Reusable components
    ui/                 # Base UI primitives (Button, Card, Input, etc.)
    pip/                # Pip mascot components
    dashboard/          # Dashboard-specific components
    habits/             # Habit tracking components
    injection/          # Injection logging components
    weighin/            # Weigh-in components
    calendar/           # Calendar components
  hooks/                # Custom React hooks
  services/             # API layer (Axios)
  stores/               # Zustand stores
  lib/                  # Utility functions
  types/                # TypeScript types
  constants/            # Theme, messages, etc.
assets/
  images/pip/           # Pip mascot PNG states
docs/                   # API documentation
mockups/                # HTML/CSS design mockups
```

## Key Files
- `tailwind.config.js` - Design tokens (colors from mockups)
- `src/constants/theme.ts` - Design system tokens
- `src/lib/pip-logic.ts` - Pip emotional state determination
- `src/services/api.ts` - Axios instance with auth interceptor
- `src/stores/authStore.ts` - Auth state + secure storage

## Design System
Colors are defined in `tailwind.config.js`:
- **Primary:** Teal (50-700 scale)
- **Accent:** Coral, Yellow
- **Status:** Success, Warning, Error
- **Dark mode:** dark-bg, dark-card, dark-text

## Running the App
```bash
# Start development server (use port 8082 to avoid conflicts)
npm start

# Run on Android emulator
npm run android

# Run on physical Android device via USB (auto-configures ADB)
npm run android:device

# Run on web (for quick testing)
npm run web

# Manual ADB setup (if needed)
npm run adb:reverse
```

## Building APKs for Testing (EAS Build)
Use EAS Build to create APKs for distribution to testers without app store submission.

```bash
# Login to EAS (first time only)
eas login

# Build APK for Android testers (uses production API)
eas build --platform android --profile preview

# Build for iOS (requires Apple Developer account)
eas build --platform ios --profile preview
```

### Build Profiles (eas.json)
- **development** - Development client with tunnel URL for local testing
- **preview** - APK/IPA for internal distribution to testers (uses production API)
- **production** - App store submission builds (AAB for Android, IPA for iOS)

### Distributing to Testers
After the build completes, EAS provides a download link and QR code. Testers can:
1. Open the link on their Android phone
2. Download and install the APK
3. Enable "Install from unknown sources" if prompted

Build dashboard: https://expo.dev/accounts/consulcode/projects/needled-mobile

## Physical Device Development (Android via USB)
When connecting a physical Android device via USB:

1. **Enable USB debugging** on your phone (Settings > Developer Options)
2. **Connect via USB** and authorize the PC when prompted
3. **Use the device script**: `npm run android:device`
   - Auto-configures ADB reverse port forwarding
   - Uses `--localhost` flag so Expo connects through USB tunnel
   - Press `a` to launch on device once server starts

The `adb:reverse` script forwards these ports from your phone to your PC:
- **8081** - Default Metro bundler port
- **8082** - Custom Metro port (used by this project)
- **2810** - Backend API server

**Troubleshooting "Failed to download remote update" errors:**
1. Ensure USB debugging is authorized
2. Run `npm run adb:reverse` manually
3. Make sure you're using `--localhost` flag (included in `android:device` script)

## API Configuration
- Full API docs: `docs/API_DOCUMENTATION.md`
- Base URL configured in `src/services/api.ts`
- Default: `http://localhost:2810/api`
- For physical device: Set `EXPO_PUBLIC_API_URL` env var to machine's IP
- See `.env.example` for configuration options

## Current Implementation Status (as of Jan 2026)

### Completed Features
- **Auth Flow**: Login, Register, Logout with secure token storage (expo-secure-store)
- **Welcome Screen**: Animated Pip mascot with login/register navigation
- **Dashboard**: Connected to real API with TanStack Query hooks
  - User greeting with real name
  - Injection status card (days until next dose)
  - Weight progress card (handles null values for new users)
  - Habits section with optimistic toggle updates
  - Pull-to-refresh functionality
  - Confetti celebration on all habits complete
- **Settings Screen**: User info display, logout functionality

### Key Implementation Details
- Auth token stored securely via `expo-secure-store`
- 401 responses trigger automatic logout via API interceptor
- Dashboard uses TanStack Query hooks (`src/hooks/useDashboard.ts`)
- Habit toggles use optimistic updates for instant UI feedback
- Pip mascot has floating/bobbing animation (larger on welcome, subtle on dashboard)

### Next Steps (Pending)
- Check-in tab (habits logging)
- Injection tab (log new injections)
- Weigh-in tab (log weight)
- Calendar tab (monthly view)
- Settings screens (profile, notifications, account management)

## Development Notes
- Always check `PROGRESS.md` for detailed implementation status
- Pip mascot images are in `assets/images/pip/`
- Design mockups for reference in `mockups/` folder
- Use NativeWind className prop for styling (Tailwind syntax)
- Path aliases configured: `@/` maps to `src/` (e.g., `@/hooks`, `@/services`)

## Commit Guidelines
- Commit after each feature/task completion
- Include descriptive commit messages
- Update PROGRESS.md after each task

## Testing Approach
- Manual UI verification at key checkpoints
- Component tests with React Native Testing Library (future)
- E2E tests with Maestro (future)

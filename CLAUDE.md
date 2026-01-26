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
# Start development server
npx expo start

# Run on Android (requires Android Studio)
npx expo start --android

# Run on web (for quick testing)
npx expo start --web
```

## API Documentation
- Full API docs: `docs/API_DOCUMENTATION.md`
- Quick reference: `docs/API_QUICK_REFERENCE.md`
- Base URL: TBD (currently using mock data for development)

## Development Notes
- Always check `PROGRESS.md` for current implementation status
- Pip mascot images are in `assets/images/pip/`
- Design mockups for reference in `mockups/` folder
- Use NativeWind className prop for styling (Tailwind syntax)

## Commit Guidelines
- Commit after each feature/task completion
- Include descriptive commit messages
- Update PROGRESS.md after each task

## Testing Approach
- Manual UI verification at key checkpoints
- Component tests with React Native Testing Library (future)
- E2E tests with Maestro (future)

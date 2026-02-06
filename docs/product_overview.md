# Product Overview: Needled

## What is Needled?

Needled is a native mobile application designed as a companion for people on weight loss journeys using GLP-1 medications (Ozempic, Wegovy, Mounjaro, Zepbound). It brings together injection tracking, weekly weigh-ins, and daily habit check-ins into a single, focused experience that enforces healthy behaviours by design—featuring Pip, a friendly mascot who provides emotional support and celebrates your wins.

## The Problem We Solve

People using weight loss injections face a unique challenge: they need to maintain consistency across multiple dimensions simultaneously. They must take their weekly injection on schedule, monitor weight without obsessing over daily fluctuations, and build sustainable habits around hydration, nutrition, and movement.

Most health apps fail this audience in one of two ways:
- **Too complex:** Calorie counting, detailed macro tracking, and workout logging create friction and overwhelm
- **Too narrow:** Simple weight trackers miss the holistic nature of the GLP-1 journey

Needled fills this gap with focused simplicity—just enough structure to build consistency without becoming another chore. Plus, Pip is there to cheer you on every step of the way.

## Target Audience

People on weight loss injection journeys who want structure without complexity. Those who find comprehensive health apps overwhelming but need more than a simple weight tracker. Users who value mindfulness over micromanagement.

## Platform Strategy

- **Native Mobile Apps:** iOS and Android built with Expo/React Native for a true native experience
- **Marketing Website:** Provides information about Needled, beta tester access, and app store links

---

## Core Features

### User Onboarding

New users complete a guided wizard-style setup flow that captures:

**Account Setup:**
- **Name** for personalisation
- **Email** for account access
- **Password** with strength indicator

**Dosing Configuration:**
- **Dosing mode** selection (Standard or Microdosing)
- **Medication type** (Ozempic, Wegovy, Mounjaro, Zepbound, or Other)
- **Injection day** for schedule alignment
- **Current dosage** for standard mode (medication-specific options)
- **Pen strength and dose amount** for microdosing mode
- **Golden dose tracking** option (leftover medication after standard doses)
- **Current pen position** to sync with existing pens

**Body Metrics:**
- **Starting weight** with unit preference (kg or lbs)
- **Goal weight** (optional) for progress tracking
- **Height** (optional) for BMI calculations

The onboarding wizard adapts based on dosing mode selection, showing relevant fields for standard vs. microdosing users.

### Authentication & Sessions

Secure email/password authentication with persistent sessions:
- Sessions remain active for returning visits via secure token storage
- Protected routes ensure data privacy
- Password change functionality in settings
- 401 responses trigger automatic logout

### Pip the Mascot

Pip is a friendly animated character who provides emotional engagement throughout the app:

- **Multiple emotional states:** cheerful, proud, encouraging, celebrating, concerned
- **Contextual messages** based on user actions and progress
- **Floating/bobbing animation** for liveliness
- **Celebration mode** with confetti when completing habits or logging activities
- **Speech bubbles** with personalised encouragement

Pip appears on the dashboard, results screen, and throughout the app to celebrate wins and provide motivation.

### Dashboard

The home screen answers "How am I doing?" at a glance:

- **Pip mascot** with personalised greeting and emotional state
- **Week badge** showing current week on the journey
- **Injection status card** with days until next dose and pen progress
- **Weight progress card** with current weight and change since start
- **Today's habits** with toggle cards for quick check-in
- **Confetti celebration** when completing all three daily habits
- **Pull-to-refresh** functionality

Everything designed for quick daily engagement without overwhelming detail.

### Daily Habit Check-In

Three simple yes/no questions create a moment of daily reflection:
- **Water:** Did I drink enough water today?
- **Nutrition:** Did I eat healthily today?
- **Exercise:** Did I move my body today?

**Check-in tab features:**
- **Date navigation** to view and edit past days (up to 7 days back)
- **Visual habit cards** with icons and completion state
- **Weekly habit grid** showing completion dots for the last 7 days
- **Haptic feedback** on interactions
- **Confetti celebration** on completing all habits for today

No calorie counting. No workout logging. No detail required—just honest self-reflection.

### Injection Tracking

Comprehensive injection management for medication adherence:

- **Site rotation tracking** across six injection sites (left/right abdomen, thighs, upper arms)
- **Visual body map** showing injection sites with suggested next rotation
- **Dose tracking** monitors which dose (1-4 standard, or custom for microdosing) of the current pen
- **Pen progress indicator** showing doses remaining before needing a new pen
- **Golden dose support** for tracking leftover medication
- **Notes field** for additional observations
- **Schedule awareness** knows when the next injection is due
- **Status-based UI** adapts for due, done, overdue, and upcoming states
- **Success celebration** with Pip and confetti after logging

### Weekly Weigh-Ins

Users log their weight with intentional constraints that promote healthy tracking behaviour:

- **Weekly-focused logging** encourages focus on long-term trends
- **Weight input** with unit from user profile (kg/lbs)
- **Input validation** with sensible min/max limits
- **Last weight hint** shown for reference
- **Goal progress visualisation** with progress bar and percentage
- **Weight history list** showing past entries
- **Stats display** (total lost, weekly change, distance to goal)
- **Two-state UI:** Ready to weigh vs. Already weighed this week
- **Success celebration** with Pip and confetti

The design philosophy: celebrate trajectory, not any single data point.

### Results & Progress

A dedicated results tab provides detailed progress visualisation:

- **Weight progress chart** with visual line/bar graph
- **Time range filtering** (4 weeks, 3 months, 6 months, 1 year, all time)
- **Stats grid** showing key metrics
- **Goal line visualisation** if goal weight is set
- **Journey info card** showing start date and current week
- **Pip with contextual messages** based on progress

The chart adapts to show meaningful data regardless of journey length.

### Calendar View

A calendar view provides visual feedback on consistency:

- **Monthly calendar grid** with navigation arrows
- **Activity indicators:** teal dots for habits, pink for injections, yellow for weigh-ins
- **Perfect day highlighting** when all three habits are completed
- **Today indicator** with distinct border
- **Selected day detail modal** showing all activities for that date
- **Monthly summary stats** (completion percentage, perfect days, injections, weigh-ins)
- **Best streak tracking** for consecutive habit completion
- **Cannot navigate to future months** (focuses on reflection, not planning)

The visual "don't break the chain" motivation loop reinforces consistency.

### Push Notifications

Opt-in reminders keep users on track:

- **Injection reminders** on the preferred injection day
- **Weigh-in reminders** weekly
- **Habit reminders** for daily check-in (optional)
- **Customisable timing** for each notification type
- **Timezone support** for accurate delivery

### Settings & Account Management

Full control over profile and data:

**Profile Settings:**
- Edit name, goal weight, medication, injection day

**Pen & Dosing Settings:**
- Change dosing mode (standard/microdosing)
- Configure pen strength and dose amounts
- Toggle golden dose tracking
- Update current pen position

**Notification Preferences:**
- Toggle individual reminder types
- View reminder times and timezone

**Security:**
- Change password with strength indicator

**Account:**
- Change email with verification
- Export data in JSON format (via native Share API)
- Delete account with password confirmation

---

## Technical Implementation

### Tech Stack

- **Framework:** Expo SDK 54 (React Native 0.81, React 19)
- **Navigation:** Expo Router (file-based routing)
- **State Management:** Zustand (client state)
- **Server State:** TanStack Query (API caching with optimistic updates)
- **Styling:** NativeWind v4 (Tailwind CSS for React Native)
- **Auth Storage:** expo-secure-store
- **HTTP Client:** Axios with auth interceptor
- **Animations:** React Native Reanimated, Lottie, react-native-confetti-cannon
- **Haptics:** expo-haptics for tactile feedback

### Data Model

```
User
├── Profile (name, email, weights, height, medication, injection day)
├── Dosing Settings (mode, pen strength, dose amount, golden dose, pen position)
├── Sessions (authentication tokens)
├── WeighIns (date, weight)
├── Injections (date, site, dose number, notes)
├── DailyHabits (date, water, nutrition, exercise)
└── NotificationPreference (reminders, times, timezone)
```

### Design Philosophy

- **Mobile-first:** Designed for one-handed phone use
- **Tab-based navigation:** Bottom tabs for core features (Home, Check-in, Results, Calendar)
- **Card-based layout:** Content organised in focused, scannable cards
- **Minimal friction:** Quick actions, sensible defaults, no unnecessary steps
- **Calming palette:** Teal primary with coral accents, dark mode support
- **Celebration moments:** Confetti, Pip animations, and haptic feedback reward positive actions

---

## Success Criteria

Needled succeeds when users:
- Open it daily for their habit check-in
- Feel motivated (not overwhelmed) by what they see
- Maintain better consistency with their injection schedule
- Build sustainable healthy habits around the three pillars
- Smile when they see Pip celebrating their wins

It fails if it becomes another abandoned app or feels like a burden rather than support.

---

## Future Considerations

Potential enhancements for future development:
- Photo progress tracking
- Community features (anonymous progress sharing)
- Integration with health platforms (Apple Health, Google Fit)
- Healthcare provider sharing/reports
- Medication titration schedule tracking
- Widgets for home screen quick view

---

## Development Status

**Mobile app fully functional** with:
- Complete onboarding wizard with dosing mode support
- Dashboard with Pip mascot and real-time data
- Daily habit check-in with date navigation
- Injection logging with site rotation and pen tracking
- Weight tracking with progress visualisation
- Calendar view with monthly activity overview
- Results screen with charts and stats
- Full settings suite including pen/dosing configuration
- Push notification support
- Dark mode throughout
- Haptic feedback on interactions

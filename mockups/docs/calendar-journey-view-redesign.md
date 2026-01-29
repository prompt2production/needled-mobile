# Calendar → Journey View Redesign Specification

## Overview

The calendar screen has been transformed from a utilitarian date grid into an engaging "Journey Map" that celebrates user progress, creates emotional connection through visual feedback, and generates screenshot-worthy moments. The redesign focuses on making progress visible, streaks meaningful, and achievements celebratory.

---

## 1. Header Section

### Previous Design
- Plain teal-50 background
- Static "Your Journey" title with subtitle
- Pip image (non-animated, no context)

### New Design

**Gradient Background**
- Linear gradient from teal-50 to teal-100 (135deg angle)
- Creates a premium, polished feel

**Streak Badge**
- Prominent badge below the subtitle showing current streak
- Yellow gradient background (yellow-light to #fef9c3)
- Displays flame emoji + streak count (e.g., "🔥 12 day streak!")
- Rounded pill shape with subtle shadow
- Bold text for emphasis

**Pip Speech Bubble**
- Speech bubble positioned above Pip
- White background with shadow
- Contains contextual encouragement messages
- Has a small triangular pointer toward Pip
- Animates in with fade effect
- Updates dynamically based on user interaction

**Pip Animation**
- New "journey bob" animation with slight rotation
- More playful than the standard bob
- State changes based on monthly progress percentage:
  - 80%+ completion → "proud" state
  - 60-79% → "cheerful" state
  - 40-59% → "encouraging" state
  - Below 40% → "curious" state

---

## 2. Day Cell Redesign (Journey Days)

### Previous Design
- Simple square cells with date number
- Tiny 6px colored dots at bottom indicating completion status
- Basic hover state (gray-50 background)
- Today highlighted with teal-50 background

### New Design

**Heat Map Backgrounds**

Day cells now use color-intensity backgrounds to show completion levels at a glance:

| Completion | Background Style |
|------------|------------------|
| 0% (empty) | `gray-50` solid |
| 33% (partial) | `teal-50` solid |
| 66% (partial) | `teal-100` solid |
| 100% (complete) | `teal-200 → teal-300` gradient with subtle glow shadow |
| Future days | White background, gray-400 text color |

**Progress Ring**
- Each day cell contains an SVG circular progress ring
- Ring background: gray-200 stroke
- Ring fill: teal-400 stroke
- Fill amount corresponds to completion percentage
- Ring animates on page load (stroke-dashoffset transition)
- Positioned as absolute overlay within the cell

**Day Number**
- Centered within the cell
- z-index ensures it appears above the progress ring
- Bold weight on 100% completion days

**Emoji Badges**

Replace hard-to-see dots with clear, recognizable badges:

| Event Type | Badge |
|------------|-------|
| Injection | 💉 on coral-light circular background |
| Weigh-in | ⚖️ on yellow-light circular background |

- Badges positioned at bottom center of cell
- 16px diameter circular container
- 9px emoji size
- Multiple badges stack horizontally with 2px gap

**Tap Interaction**
- Hover: scale to 1.05
- Active/tap: scale to 0.95
- Tap triggers a quick scale animation (0.2s)
- Perfect days (100%) trigger mini confetti celebration on tap

---

## 3. Today Indicator

### Previous Design
- Teal-50 background
- Bold font weight

### New Design
- All previous styling plus:
- **Pulsing Border**: 2px teal-500 border with animated opacity/scale pulse (2s infinite)
- **Streak Glow**: If part of active streak, has animated glowing box-shadow
- Creates strong visual anchor for "where am I today"

---

## 4. Streak System

### Visual Connectors

Consecutive completed days are visually connected to show the "path" through the month:

- **Streak Start**: First day of a streak (no left connector)
- **Streak Continue**: Subsequent days show a small gradient connector
  - Positioned to the left of the cell
  - 8px wide, 3px tall
  - Gradient from yellow to teal-400
  - Creates a visual "trail" between days

### Streak Indicators

Days within a streak can display a small flame emoji (🔥) in the top-right corner with a twinkle animation.

### Milestone Markers

Special visual treatments at key streak lengths:

**7-Day Milestone**
- Star emoji (⭐) positioned above the cell
- Twinkle animation on the star
- Golden glow box-shadow (yellow with 0.5 opacity, 12px blur)

**14-Day Milestone**
- Larger flame emoji (🔥) above the cell
- Enhanced flame twinkle animation (faster, 1s)
- Orange glow box-shadow (16px blur)

**30-Day Milestone**
- Trophy emoji (🏆) above the cell
- Bounce animation on the trophy
- Rainbow gradient background (yellow-light → green-light → teal-100)
- Dual glow effect: teal + yellow shadows (20px and 40px blur)

---

## 5. Legend Section

### Previous Design
- Small colored dots with text labels
- Items: All habits, Some habits, Injection, Weigh-in

### New Design
- Updated to match new visual language:
  - **Complete**: Small badge with teal gradient background + checkmark
  - **Partial**: Small teal-100 dot
  - **Injection**: 💉 emoji in coral-light badge
  - **Weigh-in**: ⚖️ emoji in yellow-light badge
- Badge styling matches the day cell badges for consistency

---

## 6. Stats Section → "Monthly Wins"

### Previous Design
- Plain card with "January Stats" title
- 2x2 grid of numbers
- Simple text labels

### New Design

**Section Title**
- "Monthly Wins" with trophy emoji (🏆)
- Uppercase, semibold, gray-500 text
- Letter spacing for elegance

**Hero Stat (Primary Focus)**
- Large circular progress ring (80px diameter)
- SVG ring with animated fill
- Percentage displayed in center (e.g., "85%")
- Label: "Habit Completion"
- **Month Comparison**: Green text showing improvement (e.g., "↑ 12% better than December!")
- Up arrow icon next to comparison text
- Gradient background (teal-50 to white)

**Stat Cards Grid (2x2)**

Each card has distinct color theming:

| Card | Color | Icon | Example Value | Label |
|------|-------|------|---------------|-------|
| Injections | Coral gradient | 💉 | 4/4 | Injections |
| Weigh-ins | Yellow gradient | ⚖️ | 4 | Weigh-ins |
| Best Streak | Teal gradient | 🔥 | 12 | Best Streak |
| Weight Loss | Green gradient | 📉 | -7.4 | lbs lost |

Card structure:
- Gradient background (light color → lighter)
- Emoji icon at top
- Large bold value
- Small gray label

**Share Button**
- Full-width button below stat cards
- Gray-100 background
- Upload/share icon + "Share Your Progress" text
- Hover darkens to gray-200
- Click triggers confetti celebration + Pip celebrates

---

## 7. Animation System

### Entry Animations (Page Load)

**Staggered Timing:**
1. Header slides down (0.4s ease-out)
2. Calendar rows fade in with stagger (50ms delay per row, 0.3s each)
3. Stats section slides up (0.5s ease-out, 0.3s delay)
4. Pip bobs into place with journey animation

### Micro-Interactions

| Element | Trigger | Animation |
|---------|---------|-----------|
| Day cell | Hover | Scale to 1.05 |
| Day cell | Tap/click | Scale pulse (1 → 0.92 → 1) over 0.2s |
| Today border | Continuous | Pulsing opacity/scale (2s infinite) |
| Streak flames | Continuous | Twinkle with rotation (1.5s infinite) |
| Progress rings | Page load | Fill animation (0.8s ease-out) |
| Hero stat ring | Page load | Fill animation (1.5s ease-out, 0.5s delay) |
| Speech bubble | Content change | Fade in (0.4s) |
| Milestone markers | On tap | Pop-in effect (0.5s) |

### Celebrations

**Mini Celebration (Perfect Day Tap)**
- 10 pieces of confetti
- Teal and green colors only
- Smaller, quicker burst (2s duration)
- Centered around tap location

**Milestone Celebration**
- Full 30-piece confetti burst
- All colors (teal, coral, yellow, green)
- Pip changes to celebrating state
- Speech bubble updates with milestone message:
  - 7 days: "One week strong! 💪"
  - 14 days: "Two weeks! Unstoppable!"
  - 30 days: "30 DAYS! LEGEND! 🏆"

**Share Button Celebration**
- Full confetti burst
- Pip celebrates
- Button scales on press

---

## 8. Pip Contextual Messages

When a user taps on different days, Pip's speech bubble updates:

| Context | Message |
|---------|---------|
| Today | "Today is your day!" |
| Injection + Weigh-in day | "What a productive day!" |
| Injection day | "Injection day done! 💉" |
| Weigh-in day | "Weigh-in logged! ⚖️" |
| 100% completion | "Perfect day! ⭐" |
| 66%+ completion | "Almost there!" |
| 1-65% completion | "Every step counts!" |
| 0% completion | "Let's get moving!" |

---

## 9. Technical Implementation Notes

### New CSS Classes

**Day Components:**
- `.journey-day` - Base day cell
- `.journey-day--empty` - Empty placeholder cell
- `.journey-day--future` - Future date styling
- `.journey-day--0`, `--33`, `--66`, `--100` - Completion heat map levels
- `.journey-day--today` - Today indicator
- `.journey-day--streak-start` - First day of streak
- `.journey-day--streak-continue` - Continuation of streak (has connector)
- `.journey-day--milestone-7`, `--milestone-14`, `--milestone-30` - Milestone styling
- `.journey-day__ring` - Progress ring container
- `.journey-day__ring-bg`, `__ring-fill` - SVG ring elements
- `.journey-day__number` - Day number text
- `.journey-day__badges` - Badge container
- `.journey-day__badge--injection`, `--weighin` - Badge types

**Header Components:**
- `.journey-header` - Header container
- `.journey-header__content` - Left side content
- `.journey-header__title`, `__subtitle` - Text elements
- `.journey-header__streak-badge` - Streak pill badge
- `.pip-container` - Pip wrapper
- `.pip-speech-bubble` - Speech bubble

**Stats Components:**
- `.monthly-wins` - Section container
- `.monthly-wins__title` - Section header
- `.hero-stat` - Hero stat container
- `.hero-stat__ring` - SVG ring container
- `.hero-stat__ring-bg`, `__ring-fill` - Ring elements
- `.hero-stat__value` - Centered percentage
- `.hero-stat__content` - Right side content
- `.hero-stat__label`, `__comparison` - Text elements
- `.stat-cards` - 2x2 grid container
- `.stat-card` - Individual card
- `.stat-card--coral`, `--yellow`, `--teal`, `--green` - Color variants
- `.stat-card__icon`, `__value`, `__label` - Card elements
- `.share-btn` - Share button

### New Animation Classes
- `.header-animate` - Header entry
- `.stats-animate` - Stats section entry
- `.calendar-row-animate` - Row stagger entry
- `.streak-glow` - Glowing streak effect
- `.milestone-pop` - Milestone pop-in
- `.speech-animate` - Speech bubble fade
- `.journey-day--tapped` - Tap feedback
- `.hero-stat__ring-fill--animated` - Hero ring animation

### Data Attributes
- `data-day` - Day number (1-31)
- `data-completion` - Completion percentage (0, 33, 66, 100)
- `data-streak` - Streak milestone reached (7, 14, 30)

### JavaScript Functions
- `initJourneyMap()` - Initialize all journey interactions
- `animateCalendarRows()` - Trigger staggered entry
- `triggerMiniCelebration()` - Small confetti burst
- `triggerMilestoneCelebration(days)` - Full milestone celebration
- `updatePipSpeech(day, pip, bubble)` - Update speech based on context
- `calculateCurrentStreak()` - Compute streak from data
- `updatePipForProgress()` - Set Pip state based on completion rate
- `initShareButton()` - Share button interactions

---

## 10. Screenshot Appeal Checklist

Ensure the final implementation achieves:

- [ ] Vibrant colors throughout (not monochrome gray)
- [ ] Clear streak visualization that users can brag about
- [ ] Large, readable numbers in stats
- [ ] Emoji/icons add personality without being childish
- [ ] Gradient backgrounds feel premium
- [ ] Stats tell a clear progress story
- [ ] Overall feels celebratory, not clinical
- [ ] Milestones are visually distinct and exciting
- [ ] Today is immediately identifiable
- [ ] Progress is visible at a glance via heat map

---

## 11. Accessibility Considerations

- Ensure color contrast meets WCAG standards (heat map colors should be distinguishable)
- Progress rings should have appropriate ARIA labels
- Emoji badges should have screen reader alternatives
- Animations should respect `prefers-reduced-motion` media query
- Touch targets are minimum 44px for day cells

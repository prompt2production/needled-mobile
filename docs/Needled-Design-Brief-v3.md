# Needled - Design Brief v3

**Needled** is a mobile app for people on weekly weight loss injections (Ozempic, Wegovy, Mounjaro). It tracks injections, weekly weigh-ins, and three daily habits: water, healthy eating, and exercise.

## Design Direction

We're using **emotionally intelligent design** - warm, encouraging, and character-driven. The goal is an app that feels like a supportive companion, not a clinical tracker. Users should feel good opening it, celebrated for small wins, and gently welcomed back if they've been away.

The brand personality is slightly cheeky and self-aware - the name "Needled" plays on injections and being nudged to stay on track.

## The Mascot: Pip

Pip is a friendly **water droplet character** who serves as the emotional heart of the app. The droplet ties thematically to both the liquid medication and the daily water habit.

### Character Specifications

- **Shape:** Teardrop/droplet with clean dark teal outline
- **Style:** Semi-transparent with subtle iridescent shimmer and internal sparkles - suggesting "special liquid" rather than plain water
- **Colour:** Teal/cyan with soft gradient shading
- **Face:** Simple round eyes with white highlights, gentle curved smile
- **Arms:** Small stick arms with rounded ends - NO legs
- **Consistency:** All emotional states should maintain the same base shape, outline weight, transparency, and iridescent quality

### Emotional States

| State | When Used | Expression |
|-------|-----------|------------|
| Cheerful | Default, opening the app | Arms raised, happy smile |
| Encouraging | Injection reminder, motivation | Warm smile, one arm waving, eyebrows raised |
| Celebrating | Habit completed, milestone reached | Eyes closed in joy, big open smile, arms up, confetti |
| Proud | Streak achieved, weekly summary | Hands on hips, confident smile |
| Gentle nudge | Missed a day or two | Soft smile, small wave, welcoming |
| Missing you | Extended absence | Sad/hopeful eyes, small wave, slight pout |
| Curious | Onboarding, asking questions | Head tilted, thinking pose, raised eyebrow |
| Sleeping | Late night, "see you tomorrow" | Eyes closed peacefully, content smile, "zzz" above |

### Character Placement

Pip should be central to the experience, not decorative. The character reacts to what the user is doing and provides emotional feedback throughout the app.

## Colour Palette

**Primary: Vibrant teal/cyan** - fresh, clean, energetic without being clinical. This is the signature colour, matching Pip.

**Accents:** Warm coral or yellow for celebration moments and achievements. Use colour to reinforce emotional states.

**Background:** Clean white or very light grey to let Pip and the UI elements stand out.

## Micro-animations

The app should feel fluid and alive:

- Pip should animate (bounce, wobble, stretch) in response to user actions
- Satisfying feedback when completing habits
- Celebratory moments for milestones
- The internal sparkles can twinkle or shift
- Everything should feel responsive and delightful

## UI Approach

Clean and minimal so the character and key metrics take centre stage. Let the emotional design do the heavy lifting rather than complex dashboards or data visualisations.

## Platform

React Native / Expo (iOS and Android)

## Attached Assets

- Base character (Pip - cheerful state with arms raised)
- 7 emotional state variations
- Reference screenshots showing emotional design inspiration

## Notes for Developer

- Standardise all Pip states to have arms only (no legs)
- Maintain consistent outline weight, transparency, and iridescent quality across all states
- The confetti in the celebrating state should be animated
- Consider subtle idle animations (gentle bobbing, sparkle twinkle) when Pip is on screen

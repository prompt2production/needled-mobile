# API Requirements: Goal Date Field

## Overview

This document specifies the new `goalDate` field that needs to be added to the User entity. This field allows users to set a target date for reaching their goal weight, enabling the mobile app to display a goal trajectory line on the progress chart.

## Field Specification

### `goalDate`

- **Type:** `string | null`
- **Format:** ISO 8601 date string (e.g., `"2026-06-15"`)
- **Nullable:** Yes (default: `null`)
- **Description:** Target date for the user to reach their goal weight

## Database Schema Changes

### User Table

Add the following column:

```sql
ALTER TABLE users
ADD COLUMN goal_date DATE NULL;
```

## API Endpoints Affected

### 1. GET /api/dashboard

**Current Response (user object):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "startWeight": 200,
    "goalWeight": 175,
    "weightUnit": "lbs",
    "medication": "OZEMPIC",
    "injectionDay": 0,
    "createdAt": "2025-01-01T00:00:00Z"
  }
  // ... other fields
}
```

**Updated Response (user object):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "startWeight": 200,
    "goalWeight": 175,
    "goalDate": "2026-06-15",  // NEW FIELD - can be null
    "weightUnit": "lbs",
    "medication": "OZEMPIC",
    "injectionDay": 0,
    "createdAt": "2025-01-01T00:00:00Z"
  }
  // ... other fields
}
```

### 2. GET /api/user

Add `goalDate` to the user object in the response.

### 3. PUT /api/user/profile

**Current Request Body:**
```json
{
  "name": "John Doe",
  "goalWeight": 175,
  "medication": "OZEMPIC",
  "injectionDay": 0,
  "currentDosage": 0.5,
  "height": 175
}
```

**Updated Request Body:**
```json
{
  "name": "John Doe",
  "goalWeight": 175,
  "goalDate": "2026-06-15",  // NEW FIELD - optional, can be null to clear
  "medication": "OZEMPIC",
  "injectionDay": 0,
  "currentDosage": 0.5,
  "height": 175
}
```

## Validation Rules

1. **Date Format:** Must be a valid ISO 8601 date string (YYYY-MM-DD)
2. **Future Date:** `goalDate` should be in the future (after today's date)
3. **Optional:** Field is optional - can be omitted or set to `null`
4. **Logical Constraint:** If `goalWeight` is null, `goalDate` should also be null (no goal date without a goal weight)

## Mobile App Behavior

### Settings Screen
Users can set their goal weight and target date in **Settings > Profile**:
- Goal Weight: Numeric input for target weight
- Target Date: Future date picker for when they want to reach their goal

### Results Screen
The mobile app uses `goalDate` in conjunction with `goalWeight` to display a goal trajectory line on the weight progress chart:

- **Both set:** Coral-colored line with circle markers from start weight to goal weight
- **Either missing:** No goal line displayed
- **Goal line X-axis:** Calculated based on where `goalDate` falls within the chart's date range

## Migration Considerations

1. **Existing Users:** Default `goalDate` to `null` for all existing users
2. **Backward Compatibility:** The field is optional, so existing API consumers won't break
3. **Data Integrity:** Users who have `goalWeight` set can optionally add `goalDate` later

## Example TypeScript Types

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  startWeight: number;
  goalWeight: number | null;
  goalDate: string | null;  // ISO date string - target date to reach goal weight
  weightUnit: 'kg' | 'lbs';
  medication: 'OZEMPIC' | 'WEGOVY' | 'MOUNJARO' | 'ZEPBOUND' | 'OTHER';
  injectionDay: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  currentDosage: number | null;
  height: number | null;
  createdAt: string;
  updatedAt: string;
}

interface DashboardData {
  user: {
    id: string;
    name: string;
    startWeight: number;
    goalWeight: number | null;
    goalDate: string | null;  // NEW
    weightUnit: 'kg' | 'lbs';
    medication: string;
    injectionDay: number;
    createdAt: string;
  };
  // ... other fields
}

interface UpdateProfileRequest {
  name: string;
  goalWeight?: number | null;
  goalDate?: string | null;  // NEW
  medication: string;
  injectionDay: number;
  currentDosage?: number | null;
  height?: number | null;
}
```

## Timeline

This change is required for the mobile app's enhanced Results page feature that displays a goal trajectory line on the weight progress chart.

**Priority:** Medium - Feature enhancement

**Dependencies:** None

## Questions/Discussion Points

1. Should we validate that `goalDate` is reasonable (e.g., not more than 2 years in the future)?
2. Should we auto-clear `goalDate` if user clears their `goalWeight`?
3. Do we need an API to calculate a suggested `goalDate` based on current progress?

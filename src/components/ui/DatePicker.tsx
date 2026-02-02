/**
 * DatePicker Component
 * Allows selection of date for historical logging
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  useColorScheme,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';

export interface DatePickerProps {
  /** Selected date (null means "today" for past mode, "not set" for future mode) */
  selectedDate: Date | null;
  /** Callback when date changes */
  onDateChange: (date: Date | null) => void;
  /** Maximum date (defaults to today for 'past' mode, 2 years from now for 'future' mode) */
  maxDate?: Date;
  /** Minimum date (defaults to 1 year ago for 'past' mode, today for 'future' mode) */
  minDate?: Date;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Label text */
  label?: string;
  /** Mode: 'past' for historical entries, 'future' for target dates */
  mode?: 'past' | 'future';
}

/**
 * Format date for display
 */
function formatDateDisplay(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dateToCheck = new Date(date);
  dateToCheck.setHours(0, 0, 0, 0);

  // Check if it's today
  if (dateToCheck.getTime() === today.getTime()) {
    return 'Today';
  }

  // Check if it's yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateToCheck.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  // Otherwise format as "Mon, Jan 15"
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function DatePicker({
  selectedDate,
  onDateChange,
  maxDate,
  minDate,
  disabled = false,
  label = 'Date',
  mode = 'past',
}: DatePickerProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [showPicker, setShowPicker] = useState(false);

  const isFutureMode = mode === 'future';

  // Default max date based on mode
  const effectiveMaxDate = maxDate || (() => {
    if (isFutureMode) {
      const twoYearsFromNow = new Date();
      twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);
      return twoYearsFromNow;
    }
    return new Date(); // today for past mode
  })();

  // Default min date based on mode
  const effectiveMinDate = minDate || (() => {
    if (isFutureMode) {
      return new Date(); // today for future mode
    }
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return oneYearAgo;
  })();

  // Determine display date
  const displayDate = selectedDate || (isFutureMode ? effectiveMinDate : new Date());
  const isNotSet = !selectedDate;

  const handlePress = useCallback(() => {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowPicker(true);
  }, [disabled]);

  const handleDateChange = useCallback(
    (event: DateTimePickerEvent, date?: Date) => {
      // On Android, the picker dismisses automatically
      if (Platform.OS === 'android') {
        setShowPicker(false);
      }

      if (event.type === 'set' && date) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

        if (isFutureMode) {
          // In future mode, always set the selected date
          onDateChange(date);
        } else {
          // In past mode, check if selected date is today
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const selected = new Date(date);
          selected.setHours(0, 0, 0, 0);

          if (selected.getTime() === today.getTime()) {
            // If today, set to null (default behavior)
            onDateChange(null);
          } else {
            onDateChange(date);
          }
        }
      }
    },
    [onDateChange, isFutureMode]
  );

  const handleDismiss = useCallback(() => {
    setShowPicker(false);
  }, []);

  const handleResetToToday = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDateChange(null);
    setShowPicker(false);
  }, [onDateChange]);

  return (
    <View>
      {/* Label */}
      <Text
        style={{
          fontSize: 14,
          fontWeight: '600',
          color: isDark ? '#9CA3AF' : '#6B7280',
          marginBottom: 8,
        }}
      >
        {label}
      </Text>

      {/* Date Button */}
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: isDark ? '#374151' : '#F3F4F6',
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 14,
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          {/* Calendar Icon */}
          <Text style={{ fontSize: 18 }}>📅</Text>

          {/* Date Text */}
          <Text
            style={{
              fontSize: 16,
              fontWeight: '500',
              color: isNotSet && isFutureMode
                ? isDark ? '#6B7280' : '#9CA3AF'
                : isDark ? '#F9FAFB' : '#111827',
            }}
          >
            {isNotSet && isFutureMode ? 'Not set' : formatDateDisplay(displayDate)}
          </Text>

          {/* Badge - shows context for the selected date */}
          {!isNotSet && (
            <View
              style={{
                backgroundColor: isFutureMode
                  ? isDark ? 'rgba(20, 184, 166, 0.2)' : '#CCFBF1'
                  : isDark ? 'rgba(251, 191, 36, 0.2)' : '#FEF3C7',
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: isFutureMode ? '#14B8A6' : '#F59E0B',
                }}
              >
                {isFutureMode ? 'Target' : 'Historical'}
              </Text>
            </View>
          )}
        </View>

        {/* Chevron */}
        <Text
          style={{
            fontSize: 16,
            color: isDark ? '#9CA3AF' : '#6B7280',
          }}
        >
          ▼
        </Text>
      </Pressable>

      {/* Hint text */}
      <Text
        style={{
          fontSize: 12,
          color: isDark ? '#6B7280' : '#9CA3AF',
          marginTop: 6,
        }}
      >
        {isFutureMode
          ? isNotSet
            ? 'Tap to set a target date'
            : 'Target date selected'
          : isNotSet
            ? 'Tap to log a past entry'
            : 'Logging for a past date'}
      </Text>

      {/* Date Picker */}
      {showPicker && Platform.OS === 'ios' ? (
        // iOS: Show in modal
        <Modal
          transparent
          animationType="slide"
          visible={showPicker}
          onRequestClose={handleDismiss}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              justifyContent: 'flex-end',
            }}
            onPress={handleDismiss}
          >
            <View
              style={{
                backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingBottom: 34,
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: isDark ? '#374151' : '#E5E7EB',
                }}
              >
                <Pressable onPress={handleResetToToday}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#14B8A6',
                      fontWeight: '600',
                    }}
                  >
                    {isFutureMode ? 'Clear' : 'Today'}
                  </Text>
                </Pressable>

                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: '600',
                    color: isDark ? '#F9FAFB' : '#111827',
                  }}
                >
                  Select Date
                </Text>

                <Pressable onPress={handleDismiss}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#14B8A6',
                      fontWeight: '600',
                    }}
                  >
                    Done
                  </Text>
                </Pressable>
              </View>

              {/* Picker */}
              <DateTimePicker
                value={displayDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={effectiveMaxDate}
                minimumDate={effectiveMinDate}
                textColor={isDark ? '#F9FAFB' : '#111827'}
                style={{ height: 200 }}
              />
            </View>
          </Pressable>
        </Modal>
      ) : showPicker ? (
        // Android: Shows inline
        <DateTimePicker
          value={displayDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={effectiveMaxDate}
          minimumDate={effectiveMinDate}
        />
      ) : null}
    </View>
  );
}

export default DatePicker;

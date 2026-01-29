/**
 * InjectionSuccessCard Component
 * Post-injection confirmation card
 */

import React from 'react';
import { View, Text, useColorScheme, Image } from 'react-native';
import { InjectionStatusResponse, InjectionSite, DoseNumber } from '@/types/api';

interface InjectionSuccessCardProps {
  status: InjectionStatusResponse;
  injectionDay: number; // 0-6 for Monday-Sunday
}

const siteNames: Record<InjectionSite, string> = {
  ABDOMEN_LEFT: 'Abdomen Left',
  ABDOMEN_RIGHT: 'Abdomen Right',
  THIGH_LEFT: 'Thigh Left',
  THIGH_RIGHT: 'Thigh Right',
  UPPER_ARM_LEFT: 'Arm Left',
  UPPER_ARM_RIGHT: 'Arm Right',
};

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function InjectionSuccessCard({
  status,
  injectionDay,
}: InjectionSuccessCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const lastInjection = status.lastInjection;
  const doseNumber = status.currentDose || lastInjection?.doseNumber || 1;

  // Format the date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  // Calculate days until next
  const getNextInjectionText = () => {
    if (status.daysUntil === 7) {
      return `Next ${dayNames[injectionDay]}`;
    }
    if (status.daysUntil === 1) {
      return 'Tomorrow';
    }
    return `In ${status.daysUntil} days`;
  };

  // Progress bar percentage (dose X of 4)
  const progressPercent = (doseNumber / 4) * 100;

  return (
    <View
      style={{
        backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
        borderRadius: 20,
        padding: 16,
        borderWidth: 2,
        borderColor: isDark ? '#0D9488' : '#99F6E4',
      }}
    >
      {/* Success Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: isDark ? 'rgba(20, 184, 166, 0.2)' : '#CCFBF1',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Text style={{ fontSize: 20 }}>✓</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: isDark ? '#5EEAD4' : '#0F766E',
            }}
          >
            Injection Logged!
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: isDark ? '#9CA3AF' : '#6B7280',
              marginTop: 2,
            }}
          >
            You're all set for this week
          </Text>
        </View>
      </View>

      {/* Injection Details */}
      {lastInjection && (
        <View
          style={{
            backgroundColor: isDark ? 'rgba(20, 184, 166, 0.1)' : '#F0FDFA',
            borderRadius: 14,
            padding: 14,
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
            <View>
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  marginBottom: 2,
                }}
              >
                Date
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: isDark ? '#F9FAFB' : '#111827',
                }}
              >
                {formatDate(lastInjection.date)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  marginBottom: 2,
                }}
              >
                Site
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: '600',
                  color: isDark ? '#F9FAFB' : '#111827',
                }}
              >
                {siteNames[lastInjection.site]}
              </Text>
            </View>
          </View>

          {lastInjection.notes && (
            <View
              style={{
                borderTopWidth: 1,
                borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                paddingTop: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? '#9CA3AF' : '#6B7280',
                  marginBottom: 2,
                }}
              >
                Notes
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: isDark ? '#D1D5DB' : '#4B5563',
                }}
              >
                {lastInjection.notes}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Dose Progress */}
      <View style={{ marginBottom: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '600',
              color: isDark ? '#F9FAFB' : '#111827',
            }}
          >
            Pen Progress
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: isDark ? '#9CA3AF' : '#6B7280',
            }}
          >
            Dose {doseNumber} of 4
          </Text>
        </View>

        {/* Progress Bar */}
        <View
          style={{
            height: 12,
            backgroundColor: isDark ? '#374151' : '#E5E7EB',
            borderRadius: 6,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${progressPercent}%`,
              height: '100%',
              backgroundColor: '#14B8A6',
              borderRadius: 6,
            }}
          />
        </View>

        {/* Dose dots */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 6,
            paddingHorizontal: 4,
          }}
        >
          {[1, 2, 3, 4].map((dose) => (
            <View
              key={dose}
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor:
                  dose <= doseNumber
                    ? '#14B8A6'
                    : isDark
                    ? '#374151'
                    : '#E5E7EB',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {dose <= doseNumber && (
                <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>
                  {dose}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>

      {/* Next Injection */}
      <View
        style={{
          backgroundColor: isDark ? '#374151' : '#F3F4F6',
          borderRadius: 12,
          padding: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={require('../../../media/injection.png')}
            style={{ width: 20, height: 20, marginRight: 10, opacity: 0.7 }}
          />
          <Text
            style={{
              fontSize: 14,
              color: isDark ? '#D1D5DB' : '#4B5563',
            }}
          >
            Next Injection
          </Text>
        </View>
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: isDark ? '#F9FAFB' : '#111827',
          }}
        >
          {getNextInjectionText()}
        </Text>
      </View>
    </View>
  );
}

export default InjectionSuccessCard;

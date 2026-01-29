/**
 * MonthlyWins Component
 * Stats section with share functionality
 */

import React, { useRef, useCallback } from 'react';
import { View, Text, Pressable, useColorScheme, Alert, Platform } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { HeroStat } from './HeroStat';
import { WinCard } from './WinCard';

interface MonthlyWinsProps {
  stats: {
    completionPercent: number;
    perfectDays: number;
    totalInjections: number;
    totalWeighIns: number;
    bestStreak: number;
    weightChange: number | null;
  };
  weightUnit: string;
  monthName: string;
  onSharePress?: () => void; // For triggering confetti
}

export function MonthlyWins({
  stats,
  weightUnit,
  monthName,
  onSharePress,
}: MonthlyWinsProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const viewShotRef = useRef<ViewShot>(null);

  const handleShare = useCallback(async () => {
    try {
      // Trigger confetti callback if provided
      onSharePress?.();

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          'Sharing Unavailable',
          'Sharing is not available on this device.'
        );
        return;
      }

      // Capture screenshot
      if (viewShotRef.current?.capture) {
        const uri = await viewShotRef.current.capture();

        // Share the image
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share Your Progress',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Could not share your progress. Please try again.');
    }
  }, [onSharePress]);

  // Format weight change
  const formatWeightChange = () => {
    if (stats.weightChange === null) return '—';
    const sign = stats.weightChange < 0 ? '' : '+';
    return `${sign}${stats.weightChange.toFixed(1)} ${weightUnit}`;
  };

  return (
    <View
      style={{
        marginHorizontal: 16,
        marginTop: 16,
      }}
    >
      <ViewShot
        ref={viewShotRef}
        options={{
          format: 'png',
          quality: 1,
          result: 'tmpfile',
        }}
        style={{
          backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
          borderRadius: 20,
          padding: 16,
        }}
      >
        {/* Title */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: '700',
            color: isDark ? '#F9FAFB' : '#111827',
            marginBottom: 4,
          }}
        >
          🏆 Monthly Wins
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: isDark ? '#9CA3AF' : '#6B7280',
            marginBottom: 12,
          }}
        >
          {monthName}
        </Text>

        {/* Hero stat - large progress ring */}
        <HeroStat completionPercent={stats.completionPercent} />

        {/* Win cards grid - 2x2 */}
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <WinCard
              variant="coral"
              emoji="💉"
              value={stats.totalInjections.toString()}
              label="Injections"
            />
            <WinCard
              variant="yellow"
              emoji="⚖️"
              value={stats.totalWeighIns.toString()}
              label="Weigh-ins"
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <WinCard
              variant="teal"
              emoji="🔥"
              value={stats.bestStreak.toString()}
              label="Best Streak"
            />
            <WinCard
              variant="green"
              emoji={stats.weightChange !== null && stats.weightChange < 0 ? '📉' : '📊'}
              value={formatWeightChange()}
              label="Weight Change"
            />
          </View>
        </View>

        {/* Branding for screenshot */}
        <View
          style={{
            alignItems: 'center',
            marginTop: 16,
            paddingTop: 12,
            borderTopWidth: 1,
            borderTopColor: isDark ? '#374151' : '#E5E7EB',
          }}
        >
          <Text
            style={{
              fontSize: 10,
              color: isDark ? '#6B7280' : '#9CA3AF',
            }}
          >
            Tracked with Needled
          </Text>
        </View>
      </ViewShot>

      {/* Share button (outside screenshot) */}
      <Pressable
        onPress={handleShare}
        style={({ pressed }) => ({
          backgroundColor: pressed
            ? isDark
              ? '#0D9488'
              : '#0F766E'
            : '#14B8A6',
          borderRadius: 16,
          paddingVertical: 14,
          marginTop: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        })}
      >
        <Text style={{ fontSize: 16 }}>📤</Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#FFFFFF',
          }}
        >
          Share Your Progress
        </Text>
      </Pressable>
    </View>
  );
}

export default MonthlyWins;

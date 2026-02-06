import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useAuthStore } from '@/stores/authStore';
import { ChipSelector, Button } from '@/components/ui';
import { DosingMode } from '@/types/api';
import { calculateDosesPerPen, getDoseRemainder } from '@/constants/dosages';
import {
  useDosageOptions,
  useHasDosageTracking,
  usePenStrengthOptions,
  useSuggestedMicrodoseAmounts,
  useDefaultDosesPerPen,
} from '@/hooks/useMedicationConfig';
import { useUpdatePenDosing, useUpdateProfile } from '@/hooks/useSettings';

interface DosingModeOption {
  value: DosingMode;
  icon: string;
  title: string;
  description: string;
}

const DOSING_MODES: DosingModeOption[] = [
  {
    value: 'STANDARD',
    icon: '💉',
    title: 'Standard',
    description: 'Pre-set pen doses',
  },
  {
    value: 'MICRODOSE',
    icon: '🔬',
    title: 'Microdosing',
    description: 'Smaller custom doses',
  },
];

export default function PenDosingSettings() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuthStore();

  // Mutations
  const updatePenDosingMutation = useUpdatePenDosing();
  const updateProfileMutation = useUpdateProfile();

  // Local state for form
  const [dosingMode, setDosingMode] = useState<DosingMode>(user?.dosingMode || 'STANDARD');
  const [penStrengthMg, setPenStrengthMg] = useState<number | null>(user?.penStrengthMg || null);
  const [doseAmountMg, setDoseAmountMg] = useState<number | null>(user?.doseAmountMg || null);
  const [tracksGoldenDose, setTracksGoldenDose] = useState<boolean>(user?.tracksGoldenDose || false);
  const [currentDoseInPen, setCurrentDoseInPen] = useState<number>(user?.currentDoseInPen || 1);
  const [currentDosage, setCurrentDosage] = useState<number | null>(user?.currentDosage || null);

  const isLoading = updatePenDosingMutation.isPending || updateProfileMutation.isPending;

  // Use hooks for dynamic medication config
  const defaultDosesPerPen = useDefaultDosesPerPen();
  const penStrengthOptions = usePenStrengthOptions(user?.medication ?? null);
  const microdoseOptions = useSuggestedMicrodoseAmounts(penStrengthMg);
  const dosageOptions = useDosageOptions(user?.medication ?? null);
  const hasDosageTrackingForMed = useHasDosageTracking(user?.medication ?? null);

  // Calculate doses per pen
  const dosesPerPen = useMemo(() => {
    if (dosingMode === 'MICRODOSE' && penStrengthMg && doseAmountMg) {
      return calculateDosesPerPen(penStrengthMg, doseAmountMg);
    }
    return defaultDosesPerPen;
  }, [dosingMode, penStrengthMg, doseAmountMg, defaultDosesPerPen]);

  // Check if medication supports dosage tracking
  const showDosageForStandard = hasDosageTrackingForMed;

  // Calculate remainder for warning
  const remainder = useMemo(() => {
    if (!penStrengthMg || !doseAmountMg) return 0;
    return getDoseRemainder(penStrengthMg, doseAmountMg);
  }, [penStrengthMg, doseAmountMg]);

  // Reset currentDoseInPen if it exceeds new dosesPerPen
  useEffect(() => {
    const maxDose = tracksGoldenDose ? dosesPerPen + 1 : dosesPerPen;
    if (currentDoseInPen > maxDose) {
      setCurrentDoseInPen(1);
    }
  }, [dosesPerPen, tracksGoldenDose]);

  // Check if form has changes
  const hasChanges = useMemo(() => {
    const penDosingChanged =
      dosingMode !== user?.dosingMode ||
      penStrengthMg !== user?.penStrengthMg ||
      doseAmountMg !== user?.doseAmountMg ||
      tracksGoldenDose !== user?.tracksGoldenDose ||
      currentDoseInPen !== user?.currentDoseInPen;

    const dosageChanged = dosingMode === 'STANDARD' && currentDosage !== user?.currentDosage;

    return penDosingChanged || dosageChanged;
  }, [dosingMode, penStrengthMg, doseAmountMg, tracksGoldenDose, currentDoseInPen, currentDosage, user]);

  // Validation
  const isValid = useMemo(() => {
    if (dosingMode === 'MICRODOSE') {
      return penStrengthMg !== null && doseAmountMg !== null && dosesPerPen >= 1;
    }
    return true;
  }, [dosingMode, penStrengthMg, doseAmountMg, dosesPerPen]);

  const handleSave = async () => {
    if (!isValid || !hasChanges || !user) return;

    try {
      // Update pen dosing settings via API
      await updatePenDosingMutation.mutateAsync({
        dosingMode,
        penStrengthMg: dosingMode === 'MICRODOSE' ? penStrengthMg : null,
        doseAmountMg: dosingMode === 'MICRODOSE' ? doseAmountMg : null,
        dosesPerPen,
        tracksGoldenDose,
        currentDoseInPen,
      });

      // If standard mode and dosage changed, update profile too
      if (dosingMode === 'STANDARD' && currentDosage !== user.currentDosage) {
        await updateProfileMutation.mutateAsync({
          name: user.name,
          medication: user.medication,
          injectionDay: user.injectionDay,
          currentDosage,
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Saved', 'Your pen and dosing settings have been updated.');
      router.back();
    } catch (error) {
      console.error('Failed to save settings:', error);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    }
  };

  // Generate dose position options
  const dosePositionOptions = useMemo(() => {
    const options: { value: number; label: string }[] = [];
    for (let i = 1; i <= dosesPerPen; i++) {
      options.push({ value: i, label: `Dose ${i}` });
    }
    if (tracksGoldenDose) {
      options.push({ value: dosesPerPen + 1, label: 'Golden' });
    }
    return options;
  }, [dosesPerPen, tracksGoldenDose]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-dark-bg" edges={['bottom']}>
      <ScrollView
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Dosing Mode Section */}
        <View
          style={{
            backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: isDark ? '#F9FAFB' : '#111827',
              marginBottom: 4,
            }}
          >
            Dosing Mode
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: isDark ? '#9CA3AF' : '#6B7280',
              marginBottom: 16,
            }}
          >
            How do you dose your medication?
          </Text>

          <View style={{ gap: 10 }}>
            {DOSING_MODES.map((option) => {
              const isSelected = dosingMode === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setDosingMode(option.value);
                  }}
                  activeOpacity={0.7}
                  style={{
                    backgroundColor: isSelected
                      ? isDark
                        ? 'rgba(20, 184, 166, 0.15)'
                        : '#F0FDFA'
                      : isDark
                      ? '#374151'
                      : '#F9FAFB',
                    borderRadius: 12,
                    padding: 14,
                    borderWidth: 2,
                    borderColor: isSelected ? '#14B8A6' : 'transparent',
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 24, marginRight: 12 }}>{option.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: '600',
                        color: isDark ? '#F9FAFB' : '#111827',
                      }}
                    >
                      {option.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 12,
                        color: isDark ? '#9CA3AF' : '#6B7280',
                      }}
                    >
                      {option.description}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 2,
                      borderColor: isSelected ? '#14B8A6' : isDark ? '#6B7280' : '#D1D5DB',
                      backgroundColor: isSelected ? '#14B8A6' : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isSelected && (
                      <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Current Dosage - only for standard mode with dosage tracking */}
        {dosingMode === 'STANDARD' && showDosageForStandard && (
          <View
            style={{
              backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: isDark ? '#F9FAFB' : '#111827',
                marginBottom: 4,
              }}
            >
              Current Dosage
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: isDark ? '#9CA3AF' : '#6B7280',
                marginBottom: 16,
              }}
            >
              Your current {user?.medication} dose
            </Text>

            <ChipSelector
              options={dosageOptions}
              value={currentDosage}
              onChange={(value) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setCurrentDosage(value);
              }}
              scrollable
            />
          </View>
        )}

        {/* Microdose Configuration - only for microdosers */}
        {dosingMode === 'MICRODOSE' && (
          <View
            style={{
              backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: isDark ? '#F9FAFB' : '#111827',
                marginBottom: 4,
              }}
            >
              Microdose Configuration
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: isDark ? '#9CA3AF' : '#6B7280',
                marginBottom: 16,
              }}
            >
              Set your pen strength and dose amount
            </Text>

            {/* Pen Strength */}
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: isDark ? '#D1D5DB' : '#374151',
                marginBottom: 10,
              }}
            >
              Pen Strength
            </Text>
            <ChipSelector
              options={penStrengthOptions}
              value={penStrengthMg}
              onChange={(value) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setPenStrengthMg(value);
                setDoseAmountMg(null); // Reset dose amount when pen changes
              }}
              scrollable
            />

            {/* Dose Amount - only after pen strength selected */}
            {penStrengthMg !== null && (
              <View style={{ marginTop: 20 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: '600',
                    color: isDark ? '#D1D5DB' : '#374151',
                    marginBottom: 10,
                  }}
                >
                  Dose Amount
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {microdoseOptions.map((option) => {
                    const isSelected = doseAmountMg === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setDoseAmountMg(option.value);
                        }}
                        activeOpacity={0.7}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 16,
                          backgroundColor: isSelected
                            ? '#14B8A6'
                            : isDark
                            ? '#374151'
                            : '#F3F4F6',
                          borderWidth: isSelected ? 0 : 1,
                          borderColor: isDark ? '#4B5563' : '#E5E7EB',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: isSelected
                              ? 'white'
                              : isDark
                              ? '#F9FAFB'
                              : '#374151',
                          }}
                        >
                          {option.label}
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: isSelected
                              ? 'rgba(255,255,255,0.7)'
                              : isDark
                              ? '#9CA3AF'
                              : '#6B7280',
                          }}
                        >
                          {option.doses} doses/pen
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Result */}
            {dosesPerPen >= 1 && doseAmountMg !== null && (
              <View
                style={{
                  backgroundColor: isDark ? 'rgba(20, 184, 166, 0.1)' : '#F0FDFA',
                  borderRadius: 12,
                  padding: 14,
                  marginTop: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: '600',
                    color: '#14B8A6',
                    textAlign: 'center',
                  }}
                >
                  {dosesPerPen} dose{dosesPerPen !== 1 ? 's' : ''} per pen
                </Text>
                {remainder > 0 && (
                  <Text
                    style={{
                      fontSize: 12,
                      color: '#F59E0B',
                      textAlign: 'center',
                      marginTop: 6,
                    }}
                  >
                    ⚠️ {remainder.toFixed(2)}mg leftover
                  </Text>
                )}
              </View>
            )}
          </View>
        )}

        {/* Golden Dose Section */}
        <View
          style={{
            backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: isDark ? '#F9FAFB' : '#111827',
                  marginBottom: 4,
                }}
              >
                Golden Dose ✨
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: isDark ? '#9CA3AF' : '#6B7280',
                }}
              >
                Track the leftover medication extracted after standard doses
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setTracksGoldenDose(!tracksGoldenDose);
              }}
              style={{
                width: 52,
                height: 32,
                borderRadius: 16,
                backgroundColor: tracksGoldenDose
                  ? '#14B8A6'
                  : isDark
                  ? '#4B5563'
                  : '#D1D5DB',
                padding: 2,
              }}
            >
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: 'white',
                  transform: [{ translateX: tracksGoldenDose ? 20 : 0 }],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {tracksGoldenDose && <Text style={{ fontSize: 14 }}>✨</Text>}
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Current Pen Position */}
        <View
          style={{
            backgroundColor: isDark ? '#1E1E2E' : '#FFFFFF',
            borderRadius: 16,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: '700',
              color: isDark ? '#F9FAFB' : '#111827',
              marginBottom: 4,
            }}
          >
            Current Pen Position
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: isDark ? '#9CA3AF' : '#6B7280',
              marginBottom: 16,
            }}
          >
            Which dose are you currently on?
          </Text>

          <ChipSelector
            options={dosePositionOptions}
            value={currentDoseInPen}
            onChange={(value) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setCurrentDoseInPen(value);
            }}
            scrollable
          />

          {/* Visual Preview */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: 16,
              gap: 6,
            }}
          >
            {Array.from({ length: dosesPerPen }).map((_, index) => {
              const doseNum = index + 1;
              const isFilled = doseNum < currentDoseInPen;
              const isCurrent = doseNum === currentDoseInPen;

              return (
                <View
                  key={doseNum}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: isFilled || isCurrent
                      ? '#14B8A6'
                      : isDark
                      ? '#374151'
                      : '#E5E7EB',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: isCurrent ? 2 : 0,
                    borderColor: isDark ? 'white' : '#0D9488',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: isFilled || isCurrent
                        ? 'white'
                        : isDark
                        ? '#9CA3AF'
                        : '#6B7280',
                    }}
                  >
                    {doseNum}
                  </Text>
                </View>
              );
            })}
            {tracksGoldenDose && (
              <>
                <Text style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}>—</Text>
                <View
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    backgroundColor: currentDoseInPen > dosesPerPen
                      ? '#F59E0B'
                      : isDark
                      ? 'rgba(252, 211, 77, 0.2)'
                      : '#FEF3C7',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: currentDoseInPen > dosesPerPen ? 2 : 0,
                    borderColor: isDark ? 'white' : '#D97706',
                  }}
                >
                  <Text style={{ fontSize: 12 }}>✨</Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Save Button */}
        <Button
          onPress={handleSave}
          variant="primary"
          size="lg"
          fullWidth
          disabled={!isValid || !hasChanges}
          loading={isLoading}
        >
          Save Changes
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

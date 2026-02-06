/**
 * LogActionSheet Component
 * Bottom sheet with logging options (injection and weight)
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  useColorScheme,
  StyleSheet,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Custom icons
const actionIcons = {
  injection: require('../../../media/injection.png'),
  weighIn: require('../../../media/weigh-in.png'),
};

export interface LogActionSheetProps {
  visible: boolean;
  onClose: () => void;
}

interface ActionItemProps {
  iconSource: ImageSourcePropType;
  label: string;
  description: string;
  onPress: () => void;
  isDark: boolean;
}

function ActionItem({
  iconSource,
  label,
  description,
  onPress,
  isDark,
}: ActionItemProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
      style={styles.actionItem}
    >
      <View style={[
        styles.actionItemInner,
        { backgroundColor: isDark ? '#1F2937' : '#FFFFFF' }
      ]}>
        <Image source={iconSource} style={styles.actionIcon} />
        <View style={styles.actionContent}>
          <Text style={[
            styles.actionLabel,
            { color: isDark ? '#F9FAFB' : '#111827' }
          ]}>
            {label}
          </Text>
          <Text style={[
            styles.actionDescription,
            { color: isDark ? '#9CA3AF' : '#6B7280' }
          ]}>
            {description}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDark ? '#6B7280' : '#9CA3AF'}
        />
      </View>
    </Pressable>
  );
}

export function LogActionSheet({ visible, onClose }: LogActionSheetProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleInjection = () => {
    onClose();
    setTimeout(() => {
      router.push('/modals/injection');
    }, 150);
  };

  const handleWeighIn = () => {
    onClose();
    setTimeout(() => {
      router.push('/modals/weigh-in');
    }, 150);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable style={styles.backdropPressable} onPress={onClose} />

        <View style={[
          styles.sheet,
          {
            backgroundColor: isDark ? '#111827' : '#F9FAFB',
            paddingBottom: insets.bottom + 16,
          }
        ]}>
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={[
              styles.handle,
              { backgroundColor: isDark ? '#4B5563' : '#D1D5DB' }
            ]} />
          </View>

          {/* Title */}
          <Text style={[
            styles.title,
            { color: isDark ? '#F9FAFB' : '#111827' }
          ]}>
            What would you like to log?
          </Text>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <ActionItem
              iconSource={actionIcons.injection}
              label="Log Injection"
              description="Record your medication dose"
              onPress={handleInjection}
              isDark={isDark}
            />

            <ActionItem
              iconSource={actionIcons.weighIn}
              label="Log Weight"
              description="Track your progress"
              onPress={handleWeighIn}
              isDark={isDark}
            />
          </View>

          {/* Cancel Button */}
          <Pressable onPress={onClose} style={styles.cancelButton}>
            <Text style={[
              styles.cancelText,
              { color: isDark ? '#9CA3AF' : '#6B7280' }
            ]}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdropPressable: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  handleContainer: {
    alignItems: 'center',
    paddingBottom: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  actionsContainer: {
    gap: 12,
  },
  actionItem: {
    // wrapper for pressable
  },
  actionItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  actionIcon: {
    width: 44,
    height: 44,
  },
  actionContent: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  actionLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
  },
  cancelButton: {
    paddingVertical: 16,
    marginTop: 8,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default LogActionSheet;

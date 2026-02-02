/**
 * FloatingActionButton Component
 * A central FAB for quick logging actions (injection & weight)
 * Features expand/collapse animation with two action options
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Pressable,
  Text,
  Animated,
  StyleSheet,
  Modal,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export interface FABAction {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}

export interface FloatingActionButtonProps {
  actions: FABAction[];
  /** Bottom offset for positioning above tab bar */
  bottomOffset?: number;
}

const FAB_SIZE = 56;
const ACTION_BUTTON_HEIGHT = 48;
const ACTION_SPACING = 12;
const ANIMATION_DURATION = 200;

export function FloatingActionButton({
  actions,
  bottomOffset = 0,
}: FloatingActionButtonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [isExpanded, setIsExpanded] = useState(false);

  // Animated values
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const actionAnims = useRef(
    actions.map(() => ({
      translateY: new Animated.Value(20),
      opacity: new Animated.Value(0),
    }))
  ).current;

  // Toggle expanded state
  const toggleExpand = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsExpanded(!isExpanded);
  };

  // Handle action press
  const handleActionPress = (action: FABAction) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsExpanded(false);
    action.onPress();
  };

  // Animate on expand/collapse
  useEffect(() => {
    if (isExpanded) {
      // Expand animations
      Animated.parallel([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();

      // Stagger action button animations
      actionAnims.forEach((anim, index) => {
        Animated.sequence([
          Animated.delay(index * 50),
          Animated.parallel([
            Animated.timing(anim.translateY, {
              toValue: 0,
              duration: ANIMATION_DURATION,
              useNativeDriver: true,
            }),
            Animated.timing(anim.opacity, {
              toValue: 1,
              duration: ANIMATION_DURATION,
              useNativeDriver: true,
            }),
          ]),
        ]).start();
      });
    } else {
      // Collapse animations
      Animated.parallel([
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        }),
      ]).start();

      // Reset action animations
      actionAnims.forEach((anim) => {
        anim.translateY.setValue(20);
        anim.opacity.setValue(0);
      });
    }
  }, [isExpanded]);

  // Rotation interpolation for + to x
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  return (
    <>
      {/* Backdrop overlay when expanded */}
      <Modal
        visible={isExpanded}
        transparent
        animationType="none"
        onRequestClose={() => setIsExpanded(false)}
      >
        <Pressable
          style={styles.backdrop}
          onPress={() => setIsExpanded(false)}
        >
          <Animated.View
            style={[
              styles.backdropInner,
              { opacity: opacityAnim },
            ]}
          />
        </Pressable>

        {/* Action buttons */}
        <View
          style={[
            styles.actionsContainer,
            { bottom: bottomOffset + FAB_SIZE + 16 },
          ]}
        >
          {actions.map((action, index) => (
            <Animated.View
              key={action.id}
              style={[
                styles.actionButtonWrapper,
                {
                  transform: [{ translateY: actionAnims[index].translateY }],
                  opacity: actionAnims[index].opacity,
                },
              ]}
            >
              <Pressable
                onPress={() => handleActionPress(action)}
                style={[
                  styles.actionButton,
                  { backgroundColor: isDark ? '#374151' : '#FFFFFF' },
                ]}
              >
                <View
                  style={[
                    styles.actionIconContainer,
                    { backgroundColor: '#14B8A6' },
                  ]}
                >
                  <Ionicons name={action.icon} size={20} color="#FFFFFF" />
                </View>
                <Text
                  style={[
                    styles.actionLabel,
                    { color: isDark ? '#F9FAFB' : '#111827' },
                  ]}
                >
                  {action.label}
                </Text>
              </Pressable>
            </Animated.View>
          ))}
        </View>

        {/* Main FAB (rendered inside modal when expanded) */}
        <View
          style={[
            styles.fabContainer,
            { bottom: bottomOffset },
          ]}
        >
          <Pressable
            onPress={toggleExpand}
            style={styles.fab}
          >
            <Animated.View
              style={{ transform: [{ rotate: rotateInterpolate }] }}
            >
              <Ionicons name="add" size={32} color="#FFFFFF" />
            </Animated.View>
          </Pressable>
        </View>
      </Modal>

      {/* Main FAB (rendered outside modal when collapsed) */}
      {!isExpanded && (
        <View
          style={[
            styles.fabContainer,
            { bottom: bottomOffset },
          ]}
        >
          <Pressable
            onPress={toggleExpand}
            style={styles.fab}
          >
            <Ionicons name="add" size={32} color="#FFFFFF" />
          </Pressable>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: '#14B8A6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backdrop: {
    flex: 1,
  },
  backdropInner: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  actionsContainer: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    gap: ACTION_SPACING,
  },
  actionButtonWrapper: {
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    gap: 12,
  },
  actionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FloatingActionButton;

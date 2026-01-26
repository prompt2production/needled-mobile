import React, { useEffect, useRef } from "react";
import { Image, ImageStyle, StyleProp, Animated, Easing } from "react-native";

export type PipState =
  | "cheerful"
  | "encouraging"
  | "celebrating"
  | "proud"
  | "curious"
  | "missing"
  | "sleeping";

export interface PipProps {
  state?: PipState;
  size?: "sm" | "md" | "lg" | "xl";
  style?: StyleProp<ImageStyle>;
  animated?: boolean;
}

const pipImages: Record<PipState, any> = {
  cheerful: require("../../../assets/images/pip/pip-cheerful.png"),
  encouraging: require("../../../assets/images/pip/pip-encouraging.png"),
  celebrating: require("../../../assets/images/pip/pip-celebrating.png"),
  proud: require("../../../assets/images/pip/pip-proud.png"),
  curious: require("../../../assets/images/pip/pip-curious.png"),
  missing: require("../../../assets/images/pip/pip-missing.png"),
  sleeping: require("../../../assets/images/pip/pip-sleeping.png"),
};

const sizeMap = {
  sm: { width: 60, height: 60 },
  md: { width: 100, height: 100 },
  lg: { width: 150, height: 150 },
  xl: { width: 200, height: 200 },
};

export function Pip({ state = "cheerful", size = "md", style, animated = true }: PipProps) {
  const dimensions = sizeMap[size];
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!animated) return;

    // Floating up and down animation
    const floatAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Subtle pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    floatAnimation.start();
    pulseAnimation.start();

    return () => {
      floatAnimation.stop();
      pulseAnimation.stop();
    };
  }, [animated, floatAnim, pulseAnim]);

  // Extra bounce for celebrating state
  const celebrateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (state === "celebrating" && animated) {
      const bounceAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(celebrateAnim, {
            toValue: -15,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(celebrateAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.in(Easing.bounce),
            useNativeDriver: true,
          }),
        ])
      );
      bounceAnimation.start();
      return () => bounceAnimation.stop();
    }
  }, [state, animated, celebrateAnim]);

  const translateY = state === "celebrating"
    ? Animated.add(floatAnim, celebrateAnim)
    : floatAnim;

  return (
    <Animated.Image
      source={pipImages[state]}
      style={[
        dimensions,
        {
          transform: [
            { translateY: animated ? translateY : 0 },
            { scale: animated ? pulseAnim : 1 },
          ],
        },
        style,
      ]}
      resizeMode="contain"
    />
  );
}

export default Pip;

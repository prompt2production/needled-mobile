import React from "react";
import { Image, ImageStyle, StyleProp } from "react-native";

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

export function Pip({ state = "cheerful", size = "md", style }: PipProps) {
  const dimensions = sizeMap[size];

  return (
    <Image
      source={pipImages[state]}
      style={[dimensions, style]}
      resizeMode="contain"
    />
  );
}

export default Pip;

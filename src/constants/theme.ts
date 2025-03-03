// Theme constants
export const COLORS = {
  PRIMARY: "#FF6B00",
  SECONDARY: "#2A2550",
  ACCENT: "#FFD700",
  BACKGROUND: "#F8F9FA",
  CARD: "#FFFFFF",
  TEXT: "#212529",
  BORDER: "#DEE2E6",
  NOTIFICATION: "#FF6B00",
  SUCCESS: "#28A745",
  DANGER: "#DC3545",
  WARNING: "#FFC107",
  INFO: "#17A2B8",
  DARK: "#343A40",
  LIGHT: "#F8F9FA",
  GRAY: "#6C757D",
  GRAY_LIGHT: "#CED4DA",
  TRANSPARENT: "transparent",
};

// Spacing/sizing constants
export const SPACING = {
  XS: 4,
  S: 8,
  M: 16,
  L: 24,
  XL: 32,
  XXL: 48,
};

// Font constants
export const FONTS = {
  REGULAR: "System",
  MEDIUM: "System-Medium",
  BOLD: "System-Bold",
};

// Heading sizes
export const TEXT = {
  H1: 32,
  H2: 24,
  H3: 18,
  BODY: 16,
  BODY_SMALL: 14,
  CAPTION: 12,
};

// Screen dimensions
import { Dimensions } from "react-native";
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
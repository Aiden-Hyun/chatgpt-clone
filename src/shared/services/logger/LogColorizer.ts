import { LogLevelString } from "../LogLevel";

const isDevelopment = __DEV__;

const ANSI_COLORS = {
  debug: "\x1b[36m", // Cyan
  info: "\x1b[32m", // Green
  warn: "\x1b[33m", // Yellow
  error: "\x1b[31m", // Red
  reset: "\x1b[0m",
  gray: "\x1b[90m",
  white: "\x1b[37m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
  // Rich color palette for contexts - using 256-color palette and RGB
  cyan: "\x1b[96m", // Bright cyan
  green: "\x1b[92m", // Bright green
  red: "\x1b[91m", // Bright red
  purple: "\x1b[95m", // Bright magenta
  orange: "\x1b[38;2;255;165;0m", // RGB Orange
  pink: "\x1b[38;2;255;192;203m", // RGB Pink
  lime: "\x1b[38;2;50;205;50m", // RGB Lime Green
  teal: "\x1b[38;2;0;128;128m", // RGB Teal
  indigo: "\x1b[38;2;75;0;130m", // RGB Indigo
  magenta: "\x1b[35m", // Magenta
  blue: "\x1b[34m", // Blue
  // Additional rich colors
  coral: "\x1b[38;2;255;127;80m", // RGB Coral
  gold: "\x1b[38;2;255;215;0m", // RGB Gold
  turquoise: "\x1b[38;2;64;224;208m", // RGB Turquoise
  violet: "\x1b[38;2;238;130;238m", // RGB Violet
  salmon: "\x1b[38;2;250;128;114m", // RGB Salmon
  skyblue: "\x1b[38;2;135;206;235m", // RGB Sky Blue
  forest: "\x1b[38;2;34;139;34m", // RGB Forest Green
  chocolate: "\x1b[38;2;210;105;30m", // RGB Chocolate
  crimson: "\x1b[38;2;220;20;60m", // RGB Crimson
  navy: "\x1b[38;2;0;0;128m", // RGB Navy
  olive: "\x1b[38;2;128;128;0m", // RGB Olive
  maroon: "\x1b[38;2;128;0;0m", // RGB Maroon
};

/**
 * Get colored level string for better visual distinction with proper padding
 */
export const getColoredLevel = (
  level: LogLevelString,
  width: number
): string => {
  const levelText = `[${level.toUpperCase()}]`;

  if (!isDevelopment) {
    return levelText.padEnd(width);
  }

  const color = ANSI_COLORS[level] || "";
  const paddedText = levelText.padEnd(width);
  return `${color}${paddedText}${ANSI_COLORS.reset}`;
};

/**
 * Simple hash function to generate consistent colors for contexts
 */
const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

/**
 * Get a consistent color for a context string
 */
export const getContextColor = (context: string): keyof typeof ANSI_COLORS => {
  if (!context) return "white";

  // Rich color palette with good variety and readability
  const colors: (keyof typeof ANSI_COLORS)[] = [
    "cyan", // Bright cyan
    "green", // Bright green
    "red", // Bright red
    "purple", // Bright magenta
    "orange", // RGB Orange
    "pink", // RGB Pink
    "lime", // RGB Lime Green
    "teal", // RGB Teal
    "indigo", // RGB Indigo
    "magenta", // Magenta
    "blue", // Blue
    "coral", // RGB Coral
    "gold", // RGB Gold
    "turquoise", // RGB Turquoise
    "violet", // RGB Violet
    "salmon", // RGB Salmon
    "skyblue", // RGB Sky Blue
    "forest", // RGB Forest Green
    "chocolate", // RGB Chocolate
    "crimson", // RGB Crimson
    "navy", // RGB Navy
    "olive", // RGB Olive
    "maroon", // RGB Maroon
  ];

  const hash = hashString(context);
  const colorIndex = hash % colors.length;
  const selectedColor = colors[colorIndex];

  return selectedColor;
};

/**
 * Get colored text for different columns
 */
export const getColoredText = (
  text: string,
  color: keyof typeof ANSI_COLORS
): string => {
  if (!isDevelopment) {
    return text;
  }
  return `${ANSI_COLORS[color]}${text}${ANSI_COLORS.reset}`;
};

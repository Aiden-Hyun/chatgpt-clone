// Define breakpoints for responsive design
export const BREAKPOINTS = {
  mobile: 768, // iPhone 14 is 393px, so this will catch mobile devices
  tablet: 1024,
  desktop: 1200,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

// Define breakpoints for responsive design
export const BREAKPOINTS = {
  mobile: 768, // iPhone 14 is 393px, so this will catch mobile devices
  tablet: 1024,
  desktop: 1200,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export const useResponsive = () => {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
    });

    return () => subscription?.remove();
  }, []);

  const isMobile = screenWidth < BREAKPOINTS.mobile;
  const isTablet = screenWidth >= BREAKPOINTS.mobile && screenWidth < BREAKPOINTS.tablet;
  const isDesktop = screenWidth >= BREAKPOINTS.tablet;

  const getBreakpoint = (): Breakpoint => {
    if (screenWidth < BREAKPOINTS.mobile) return 'mobile';
    if (screenWidth < BREAKPOINTS.tablet) return 'tablet';
    return 'desktop';
  };

  return {
    screenWidth,
    isMobile,
    isTablet,
    isDesktop,
    getBreakpoint,
    breakpoints: BREAKPOINTS,
  };
};

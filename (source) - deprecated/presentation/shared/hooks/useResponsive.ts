import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

import { BREAKPOINTS, Breakpoint } from '../../interfaces/ui/Responsive.types';

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

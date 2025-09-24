import { usePathname } from 'expo-router';

// Defer initial navigation decisions to AuthGuard to prevent redirect loops
const StartPage = () => {
  const pathname = usePathname();
  console.log('🔍 StartPage: Render (deferring to AuthGuard)', { pathname });
  return null;
};

export default StartPage;
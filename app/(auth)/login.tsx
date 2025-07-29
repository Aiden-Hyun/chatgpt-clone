import Constants from 'expo-constants';
import { router, usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Button, View } from 'react-native';
import { ThemedText } from '../../src/shared/components';
import { useLoadingState } from '../../src/shared/hooks';
import { useErrorStateCombined } from '../../src/shared/hooks/error';
import { supabase } from '../../src/shared/lib/supabase';
import { createLoginStyles } from './login.styles';

export default function LoginScreen() {
  const { loading, setLoading, startLoading, stopLoading } = useLoadingState({ initialLoading: true });
  const { loading: signingIn, startLoading: startSigningIn, stopLoading: stopSigningIn } = useLoadingState();
  const { setNetworkError, setAuthError, clearError, currentError } = useErrorStateCombined({
    autoClear: true,
    autoClearDelay: 5000,
    showAlerts: false, // Temporarily disable alerts
    logToConsole: true
  });
  const pathname = usePathname();
  const styles = createLoginStyles();
  const navigationAttempted = useRef(false);

  // Session check logic extracted to avoid duplication
  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setNetworkError('Failed to check session status', { 
          context: 'session-check',
          originalError: error,
          endpoint: 'auth.getSession'
        });
        stopLoading();
        return;
      }
      
      if (session) {
        router.replace('/(tabs)/(home)');
      } else {
        stopLoading();
      }
    } catch (error) {
      setNetworkError('Failed to check session status - please check your internet connection', {
        context: 'session-check',
        originalError: error,
        endpoint: 'auth.getSession',
        isNetworkError: true
      });
      stopLoading();
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  // Monitor pathname changes to detect navigation
  useEffect(() => {
    if (navigationAttempted.current) {
      console.log('Pathname changed to:', pathname);
      navigationAttempted.current = false;
    }
  }, [pathname]);

  const handleGoogleLogin = async () => {
    try {
      startSigningIn();
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${Constants.linkingUri}`,
          queryParams: {
            prompt: 'select_account',
          },
        },
      });
      // Don't stop signing in here - let the OAuth redirect handle it
      // The user will be redirected away from this screen
    } catch (error) {
      setAuthError('Failed to start Google login. Please try again.', {
        context: 'google-oauth',
        originalError: error,
        provider: 'google',
        redirectUrl: Constants.linkingUri
      });
      stopSigningIn();
    }
  };

  const handleEmailSignin = () => {
    console.log('Email signin button clicked - navigating to signin');
    console.log('Current route:', pathname);
    navigationAttempted.current = true;
    try {
      router.push('/signin');
      console.log('Navigation command sent');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleEmailSignup = () => {
    console.log('Email signup button clicked - navigating to signup');
    console.log('Current route:', pathname);
    navigationAttempted.current = true;
    try {
      router.push('/signup');
      console.log('Navigation command sent');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const handleTestNavigation = () => {
    console.log('Test navigation button clicked');
    console.log('Current route:', pathname);
    navigationAttempted.current = true;
    try {
      router.push('/signin');
      console.log('Test navigation command sent');
    } catch (error) {
      console.error('Test navigation error:', error);
    }
  };

  // Retry session check if there's a network error
  const retrySessionCheck = () => {
    clearError(currentError?.id || '');
    startLoading();
    checkSession().catch(error => {
      console.error('Session check error:', error);
    });
  };

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#FFFFFF'
      }}>
        <ActivityIndicator size="large" color="#000000" />
        <ThemedText style={{ marginTop: 16 }}>Loading...</ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <ThemedText type="title" style={styles.title}>Welcome to AidenGPT</ThemedText>
      
      <Button 
        title={signingIn ? 'Redirecting...' : 'Login with Google'} 
        onPress={handleGoogleLogin} 
        disabled={signingIn} 
      />
      
      <View style={styles.divider}>
        <ThemedText style={styles.dividerText}>or</ThemedText>
      </View>
      
      <Button 
        title="Sign In with Email" 
        onPress={handleEmailSignin}
      />
      
      <Button 
        title="Create Account" 
        onPress={handleEmailSignup}
      />

      <Button 
        title="TEST NAVIGATION" 
        onPress={handleTestNavigation}
      />
      
      {/* Show retry button for network errors */}
      {currentError && currentError.type === 'network' && (
        <Button 
          title="Retry Connection" 
          onPress={retrySessionCheck}
        />
      )}
    </View>
  );
}



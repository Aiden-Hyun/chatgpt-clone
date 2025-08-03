import Constants from 'expo-constants';
import { router, usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Button, Text, View } from 'react-native';
import { LanguageSelector } from '../../src/shared/components';
import { useLanguageContext } from '../../src/shared/context/LanguageContext';
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
    showAlerts: false,
    logToConsole: true
  });
  const pathname = usePathname();
  const styles = createLoginStyles();
  const navigationAttempted = useRef(false);
  const { t } = useLanguageContext();

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
        <Text style={{ marginTop: 16 }}>{t('common.loading')}...</Text>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Text style={styles.title}>{t('auth.welcome')}</Text>
      
      <Button 
        title={signingIn ? t('auth.redirecting') : t('auth.login_with_google')} 
        onPress={handleGoogleLogin} 
        disabled={signingIn} 
      />
      
      <View style={styles.divider}>
        <Text style={styles.dividerText}>{t('auth.or')}</Text>
      </View>
      
      <Button 
        title={t('auth.sign_in_with_email')} 
        onPress={handleEmailSignin}
      />
      
      <Button 
        title={t('auth.create_account')} 
        onPress={handleEmailSignup}
      />

      <Button 
        title={t('auth.test_navigation')} 
        onPress={handleTestNavigation}
      />
      
      {/* Show retry button for network errors */}
      {currentError && currentError.type === 'network' && (
        <Button 
          title={t('auth.retry_connection')} 
          onPress={retrySessionCheck}
        />
      )}

      {/* Language Selector - Small and at bottom */}
      <LanguageSelector />
    </View>
  );
}



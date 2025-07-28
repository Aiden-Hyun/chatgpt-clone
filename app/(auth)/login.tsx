import Constants from 'expo-constants';
import { useEffect } from 'react';
import { Button, Text, View } from 'react-native';
import { LoadingWrapper } from '../../src/shared/components';
import { useLoadingState, useNavigation } from '../../src/shared/hooks';
import { useErrorStateCombined } from '../../src/shared/hooks/error';
import { supabase } from '../../src/shared/lib/supabase';
import { createLoginStyles } from './login.styles';

export default function LoginScreen() {
  const { loading, setLoading, startLoading, stopLoading } = useLoadingState({ initialLoading: true });
  const { loading: signingIn, startLoading: startSigningIn, stopLoading: stopSigningIn } = useLoadingState();
  const { setNetworkError, setAuthError, clearError, currentError } = useErrorStateCombined({
    autoClear: true,
    autoClearDelay: 5000,
    showAlerts: true,
    logToConsole: true
  });
  const { navigateToHome } = useNavigation();
  const styles = createLoginStyles();

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
        navigateToHome();
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



  // Retry session check if there's a network error
  const retrySessionCheck = () => {
    clearError(currentError?.id || '');
    startLoading();
    checkSession();
  };

  return (
    <LoadingWrapper loading={loading}>
      <View style={styles.center}>
        <Text style={styles.title}>Welcome to AidenGPT</Text>
        <Button title={signingIn ? 'Redirecting...' : 'Login with Google'} onPress={handleGoogleLogin} disabled={signingIn} />
        
        {/* Show retry button for network errors */}
        {currentError && currentError.type === 'network' && (
          <Button 
            title="Retry Connection" 
            onPress={retrySessionCheck}
          />
        )}
      </View>
    </LoadingWrapper>
  );
}



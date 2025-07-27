import Constants from 'expo-constants';
import { useEffect } from 'react';
import { ActivityIndicator, Button, Text, View } from 'react-native';
import { useErrorState, useLoadingState, useNavigation } from '../../src/shared/hooks';
import { supabase } from '../../src/shared/lib/supabase';
import { createLoginStyles } from './login.styles';

export default function LoginScreen() {
  const { loading, setLoading, startLoading, stopLoading } = useLoadingState({ initialLoading: true });
  const { loading: signingIn, startLoading: startSigningIn, stopLoading: stopSigningIn } = useLoadingState();
  const { setAuthError, setNetworkError } = useErrorState();
  const { navigateToHome } = useNavigation();
  const styles = createLoginStyles();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          setNetworkError('Failed to check session status');
          stopLoading();
          return;
        }
        
        if (session) {
          navigateToHome();
        } else {
          stopLoading();
        }
      } catch (error) {
        console.error('Network or session check error:', error);
        setNetworkError('Failed to check session status - please check your internet connection');
        stopLoading();
      }
    };
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
      console.error('OAuth error:', error);
      setAuthError('Failed to start Google login. Please try again.');
      stopSigningIn();
    }
  };



  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Text style={styles.title}>Welcome to AidenGPT</Text>
      <Button title={signingIn ? 'Redirecting...' : 'Login with Google'} onPress={handleGoogleLogin} disabled={signingIn} />
    </View>
  );
}



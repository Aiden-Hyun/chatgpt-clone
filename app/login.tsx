import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Text, View } from 'react-native';
import { supabase } from '../src/shared/lib/supabase';
import { styles } from './login.styles';

export default function LoginScreen() {
  const [loading, setLoading] = useState(true);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/chat');
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const handleGoogleLogin = async () => {
    setSigningIn(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${Constants.linkingUri}`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    });
    setSigningIn(false);
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



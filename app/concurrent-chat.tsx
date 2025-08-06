// import React from 'react';
// import { SafeAreaView, StyleSheet, useColorScheme } from 'react-native';
// import { useAuth } from '../src/features/auth/context';
// import { ConcurrentChat } from '../src/features/concurrent-chat/components';
// import { theme } from '../src/features/theme/lib/theme';

// export default function ConcurrentChatScreen() {
//   const colorScheme = useColorScheme();
//   const currentTheme = theme[colorScheme ?? 'light'];
//   const { session } = useAuth();
  
//   const styles = StyleSheet.create({
//     container: {
//       flex: 1,
//       backgroundColor: currentTheme.colors.background.primary,
//     },
//   });

//   return (
//     <SafeAreaView style={styles.container}>
//       <ConcurrentChat session={session} />
//     </SafeAreaView>
//   );
// } 
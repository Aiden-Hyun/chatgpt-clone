import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme';
import { BlurView } from './BlurView';

/**
 * A component that showcases the glassmorphism effect with various examples
 */
export const GlassmorphismDemo: React.FC = () => {
  const theme = useAppTheme();
  
  // Create styles using current theme
  const styles = StyleSheet.create({
    container: {
      padding: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: theme.fontSizes.lg,
      fontWeight: theme.fontWeights.semibold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
      marginTop: theme.spacing.lg,
    },
    demoContainer: {
      height: 200,
      marginVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      overflow: 'hidden',
      position: 'relative',
    },
    backgroundGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.borderRadius.md,
    },
    backgroundPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.1,
    },
    glassCard: {
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      margin: theme.spacing.md,
    },
    glassCardTitle: {
      fontSize: theme.fontSizes.md,
      fontWeight: theme.fontWeights.bold,
      marginBottom: theme.spacing.xs,
      color: theme.colors.text.primary,
    },
    glassCardText: {
      fontSize: theme.fontSizes.sm,
      color: theme.colors.text.secondary,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    column: {
      flex: 1,
      marginHorizontal: theme.spacing.xs,
    },
    smallGlassCard: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.sm,
      marginBottom: theme.spacing.sm,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: theme.spacing.sm,
    },
    userRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    username: {
      fontSize: theme.fontSizes.sm,
      fontWeight: theme.fontWeights.semibold,
      color: theme.colors.text.primary,
    },
    userStatus: {
      fontSize: theme.fontSizes.xs,
      color: theme.colors.text.tertiary,
    },
    messageRow: {
      flexDirection: 'row',
      marginBottom: theme.spacing.xs,
    },
    messageBubble: {
      padding: theme.spacing.sm,
      borderRadius: theme.borderRadius.md,
      maxWidth: '80%',
    },
    userMessage: {
      alignSelf: 'flex-end',
      marginLeft: 'auto',
    },
    assistantMessage: {
      alignSelf: 'flex-start',
    },
    messageText: {
      fontSize: theme.fontSizes.sm,
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Glassmorphism Demo</Text>
      
      {/* Card with Blur Effect */}
      <View style={styles.demoContainer}>
        <View style={[styles.backgroundGradient, { backgroundColor: '#4158D0', opacity: 0.8 }]} />
        <View style={[styles.backgroundGradient, { 
          backgroundColor: '#C850C0', 
          opacity: 0.4,
          transform: [{ translateX: 100 }, { translateY: 50 }],
          borderRadius: 100,
        }]} />
        <View style={[styles.backgroundGradient, { 
          backgroundColor: '#FFCC70', 
          opacity: 0.4,
          transform: [{ translateX: -50 }, { translateY: -30 }],
          borderRadius: 100,
        }]} />
        
        <BlurView 
          intensity={20}
          style={styles.glassCard}
        >
          <Text style={styles.glassCardTitle}>Glassmorphism Card</Text>
          <Text style={styles.glassCardText}>
            This card demonstrates the glassmorphism effect with a frosted glass appearance.
            Notice how the background colors show through with a blur effect.
          </Text>
        </BlurView>
      </View>
      
      {/* Multiple Cards Demo */}
      <Text style={styles.sectionTitle}>Multiple Glass Elements</Text>
      <View style={styles.demoContainer}>
        <View style={[styles.backgroundGradient, { 
          backgroundColor: '#0093E9',
          backgroundImage: 'linear-gradient(160deg, #0093E9 0%, #80D0C7 100%)',
        }]} />
        
        <View style={styles.row}>
          <View style={styles.column}>
            <BlurView 
              intensity={15}
              style={styles.smallGlassCard}
              tintOpacity={0.2}
            >
              <Text style={styles.glassCardTitle}>Weather</Text>
              <Text style={styles.glassCardText}>72°F</Text>
              <Text style={styles.glassCardText}>Sunny</Text>
            </BlurView>
            
            <BlurView 
              intensity={15}
              style={styles.smallGlassCard}
              tintOpacity={0.2}
            >
              <Text style={styles.glassCardTitle}>Calendar</Text>
              <Text style={styles.glassCardText}>Meeting at 2 PM</Text>
            </BlurView>
          </View>
          
          <View style={styles.column}>
            <BlurView 
              intensity={15}
              style={[styles.smallGlassCard, { height: 150 }]}
              tintOpacity={0.2}
            >
              <Text style={styles.glassCardTitle}>Activity</Text>
              <View style={{ 
                height: 100, 
                flexDirection: 'row', 
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                marginTop: theme.spacing.sm,
              }}>
                <View style={{ 
                  width: 15, 
                  height: '30%', 
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.borderRadius.xs,
                }} />
                <View style={{ 
                  width: 15, 
                  height: '50%', 
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.borderRadius.xs,
                }} />
                <View style={{ 
                  width: 15, 
                  height: '80%', 
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.borderRadius.xs,
                }} />
                <View style={{ 
                  width: 15, 
                  height: '60%', 
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.borderRadius.xs,
                }} />
                <View style={{ 
                  width: 15, 
                  height: '40%', 
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.borderRadius.xs,
                }} />
              </View>
            </BlurView>
          </View>
        </View>
      </View>
      
      {/* Chat UI Demo */}
      <Text style={styles.sectionTitle}>Chat Interface</Text>
      <View style={[styles.demoContainer, { height: 300 }]}>
        <View style={[styles.backgroundGradient, { 
          backgroundColor: '#8EC5FC',
          backgroundImage: 'linear-gradient(62deg, #8EC5FC 0%, #E0C3FC 100%)',
        }]} />
        
        <BlurView 
          intensity={10}
          style={{ 
            margin: theme.spacing.md,
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.md,
            flex: 1,
          }}
          tintOpacity={0.1}
        >
          <View style={styles.userRow}>
            <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]} />
            <View>
              <Text style={styles.username}>John Doe</Text>
              <Text style={styles.userStatus}>Online</Text>
            </View>
          </View>
          
          <ScrollView style={{ flex: 1 }}>
            <View style={styles.messageRow}>
              <BlurView
                intensity={20}
                style={[styles.messageBubble, styles.assistantMessage]}
                tintColor={theme.colors.glass.secondary}
                tintOpacity={0.5}
                blurType="light"
              >
                <Text style={[styles.messageText, { color: theme.colors.text.primary }]}>
                  Hello! How can I help you today?
                </Text>
              </BlurView>
            </View>
            
            <View style={styles.messageRow}>
              <BlurView
                intensity={20}
                style={[styles.messageBubble, styles.userMessage]}
                tintColor={theme.colors.primary}
                tintOpacity={0.7}
                blurType="light"
              >
                <Text style={[styles.messageText, { color: theme.colors.text.inverted }]}>
                  I'm interested in learning more about glassmorphism design.
                </Text>
              </BlurView>
            </View>
            
            <View style={styles.messageRow}>
              <BlurView
                intensity={20}
                style={[styles.messageBubble, styles.assistantMessage]}
                tintColor={theme.colors.glass.secondary}
                tintOpacity={0.5}
                blurType="light"
              >
                <Text style={[styles.messageText, { color: theme.colors.text.primary }]}>
                  Glassmorphism is a design trend that creates a frosted glass effect using transparency, blur, and subtle borders.
                </Text>
              </BlurView>
            </View>
          </ScrollView>
          
          <BlurView
            intensity={30}
            style={{
              marginTop: theme.spacing.sm,
              padding: theme.spacing.sm,
              borderRadius: theme.borderRadius.md,
              flexDirection: 'row',
              alignItems: 'center',
            }}
            tintOpacity={0.2}
          >
            <View style={{ 
              flex: 1, 
              height: 36, 
              borderRadius: theme.borderRadius.sm,
              backgroundColor: 'rgba(255,255,255,0.2)',
            }} />
            <View style={{ 
              width: 36, 
              height: 36, 
              borderRadius: 18,
              backgroundColor: theme.colors.primary,
              marginLeft: theme.spacing.sm,
              justifyContent: 'center',
              alignItems: 'center',
            }} />
          </BlurView>
        </BlurView>
      </View>
    </ScrollView>
  );
};

export default GlassmorphismDemo;

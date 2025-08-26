import { Ionicons } from '@expo/vector-icons';
import { getButtonSize } from '../../../business/utils/layout';
import { useAppTheme } from '../../business/theme/theme';
import { Text } from '../components/ui';
import { useLanguageContext } from '../language';

import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, TouchableOpacity, View } from 'react-native';
import Animated, {
    Easing,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';



export default function NeumorphismDemoScreen() {
  const { t } = useLanguageContext();
  const theme = useAppTheme();

  // State for interactive elements
  const [switchValue, setSwitchValue] = useState(false);
  const [activeButtons, setActiveButtons] = useState<Set<string>>(new Set());

  const handleBack = () => {
    try {
      const canGoBack = (router as any).canGoBack?.() ?? false;
      if (canGoBack) {
        router.back();
      } else {
        router.replace('/chat');
      }
    } catch {
      router.replace('/chat');
    }
  };

  const toggleButton = (buttonId: string) => {
    setActiveButtons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(buttonId)) {
        newSet.delete(buttonId);
      } else {
        newSet.add(buttonId);
      }
      return newSet;
    });
  };

  // Enhanced Neumorphism styles for realistic physical buttons
  const neumorphismStyles = {
    container: {
      flex: 1,
      backgroundColor: '#e0e5ec', // Soft gray background for neumorphism
    },
    header: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255, 255, 255, 0.3)',
      backgroundColor: '#e0e5ec',
    },
    backButton: {
      width: getButtonSize('action'),
      height: getButtonSize('action'),
      borderRadius: getButtonSize('action') / 2,
      backgroundColor: '#e0e5ec',
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      marginRight: theme.spacing.md,
      // Enhanced raised effect - more realistic
      shadowColor: '#a3b1c6',
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 0.7,
      shadowRadius: 12,
      elevation: 12,
      // Multiple shadow layers for depth
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    backButtonPressed: {
      // Realistic pressed state - deeper inset
      shadowColor: '#a3b1c6',
      shadowOffset: { width: -3, height: -3 },
      shadowOpacity: 0.5,
      shadowRadius: 6,
      elevation: 3,
      backgroundColor: '#d1d9e6', // Slightly darker when pressed
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    headerTitle: {
      fontSize: theme.typography.fontSizes.xl,
      fontFamily: theme.typography.fontFamily.primary,
      color: '#4a5568',
      fontWeight: theme.typography.fontWeights.semibold as '600',
    },
    content: {
      flex: 1,
      padding: theme.spacing.xl,
    },
    section: {
      marginBottom: theme.spacing.xxxl,
    },
    sectionTitle: {
      fontSize: theme.typography.fontSizes.lg,
      fontFamily: theme.typography.fontFamily.primary,
      color: '#4a5568',
      fontWeight: theme.typography.fontWeights.semibold as '600',
      marginBottom: theme.spacing.lg,
    },
    // Enhanced neumorphic card with realistic depth
    neumorphicCard: {
      backgroundColor: '#e0e5ec',
      borderRadius: 20,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
      // Enhanced raised effect with multiple shadow layers
      shadowColor: '#a3b1c6',
      shadowOffset: { width: 8, height: 8 },
      shadowOpacity: 0.8,
      shadowRadius: 16,
      elevation: 16,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.6)',
    },
    // Enhanced neumorphic button - more realistic physical appearance
    neumorphicButton: {
      backgroundColor: '#e0e5ec',
      borderRadius: 18,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minHeight: 56,
      // Enhanced raised effect - more pronounced
      shadowColor: '#a3b1c6',
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 0.7,
      shadowRadius: 12,
      elevation: 12,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.5)',
      // Additional inner highlight for more depth
    },
    // Dramatic neumorphic button with web-style shadows
    dramaticNeumorphicButton: {
      backgroundColor: '#e0e0e0',
      borderRadius: 68,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minHeight: 80,
      // Dramatic shadow effect - multiple shadow layers
      shadowColor: '#5a5a5a',
      shadowOffset: { width: -20, height: 20 },
      shadowOpacity: 0.8,
      shadowRadius: 35,
      elevation: 20,
      borderWidth: 0,
    },
    dramaticNeumorphicButtonPressed: {
      // Dramatic pressed state
      shadowColor: '#5a5a5a',
      shadowOffset: { width: 20, height: -20 },
      shadowOpacity: 0.6,
      shadowRadius: 25,
      elevation: 10,
      backgroundColor: '#d0d0d0',
      transform: [{ scale: 0.95 }],
    },
    // Dramatic neumorphic card
    dramaticNeumorphicCard: {
      backgroundColor: '#e0e0e0',
      borderRadius: 30,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
      // Dramatic shadow effect
      shadowColor: '#5a5a5a',
      shadowOffset: { width: -15, height: 15 },
      shadowOpacity: 0.7,
      shadowRadius: 30,
      elevation: 15,
      borderWidth: 0,
    },
    // Gradient neumorphic button with enhanced shadows
    gradientNeumorphicButton: {
      borderRadius: 68,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      minHeight: 80,
      // Gradient background (will be applied via LinearGradient component)
      // Dramatic shadow effect with multiple layers
      shadowColor: '#5a5a5a',
      shadowOffset: { width: -20, height: 20 },
      shadowOpacity: 0.8,
      shadowRadius: 35,
      elevation: 20,
      borderWidth: 0,
    },
    gradientNeumorphicButtonPressed: {
      // Dramatic pressed state for gradient button
      shadowColor: '#5a5a5a',
      shadowOffset: { width: 20, height: -20 },
      shadowOpacity: 0.6,
      shadowRadius: 25,
      elevation: 10,
      transform: [{ scale: 0.95 }],
    },
    // Gradient neumorphic card
    gradientNeumorphicCard: {
      borderRadius: 30,
      padding: theme.spacing.xl,
      marginBottom: theme.spacing.lg,
      // Dramatic shadow effect
      shadowColor: '#5a5a5a',
      shadowOffset: { width: -15, height: 15 },
      shadowOpacity: 0.7,
      shadowRadius: 30,
      elevation: 15,
      borderWidth: 0,
    },
    // Animated heart button styles - Enhanced to match web version
    animatedHeartButton: {
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      paddingVertical: 20,
      paddingHorizontal: 25,
      paddingLeft: 22,
      // Enhanced inset shadow effect to match web
      shadowColor: 'rgba(10, 37, 64, 0.35)',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.35,
      shadowRadius: 6,
      elevation: 6,
      backgroundColor: '#e8e8e8',
      borderColor: '#ffe2e2',
      borderWidth: 9,
      borderRadius: 35,
      marginBottom: theme.spacing.lg,
      // Add more realistic styling
      minHeight: 80,
      minWidth: 120,
    },
    animatedHeartButtonPressed: {
      backgroundColor: '#eee',
      transform: [{ scale: 1.05 }],
      borderColor: '#ffd8d8',
      // Enhanced pressed state
      shadowOpacity: 0.25,
      elevation: 4,
    },
    heartIconContainer: {
      marginRight: 11,
      position: 'relative' as const,
      width: 32,
      height: 32,
    },
    heartIconEmpty: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: 32,
      height: 32,
      opacity: 1,
    },
    heartIconFilled: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      width: 32,
      height: 32,
      opacity: 0,
    },
    heartIconFilledActive: {
      opacity: 1,
      transform: [{ scale: 1.15 }],
    },
    // Classic neumorphic button styles - Enhanced for accuracy
    classicNeumorphicButton: {
      color: '#090909',
      paddingVertical: 12,
      paddingHorizontal: 20,
      fontSize: 18,
      borderRadius: 8,
      backgroundColor: '#e8e8e8',
      borderWidth: 1,
      borderColor: '#e8e8e8',
      marginBottom: theme.spacing.md,
      // Enhanced dual shadow effect using multiple layers
      shadowColor: '#c5c5c5',
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 0.8,
      shadowRadius: 12,
      elevation: 12,
    },
    classicNeumorphicButtonPressed: {
      // Enhanced inset shadow effect
      shadowColor: '#c5c5c5',
      shadowOffset: { width: -4, height: -4 },
      shadowOpacity: 0.6,
      shadowRadius: 8,
      elevation: 6,
      color: '#666',
      backgroundColor: '#e0e0e0',
    },
    neumorphicButtonPressed: {
      // Realistic pressed state - deeper inset with color change
      shadowColor: '#a3b1c6',
      shadowOffset: { width: -3, height: -3 },
      shadowOpacity: 0.5,
      shadowRadius: 6,
      elevation: 3,
      backgroundColor: '#d1d9e6', // Darker when pressed
      borderColor: 'rgba(255, 255, 255, 0.2)',
      transform: [{ scale: 0.98 }], // Slight scale down for pressed effect
    },
    // Enhanced neumorphic input field - deeper inset
    neumorphicInput: {
      backgroundColor: '#e0e5ec',
      borderRadius: 18,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      minHeight: 56,
      // Enhanced inset effect - deeper depression
      shadowColor: '#a3b1c6',
      shadowOffset: { width: -4, height: -4 },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 4,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    // Enhanced neumorphic switch container - more realistic
    neumorphicSwitchContainer: {
      backgroundColor: '#e0e5ec',
      borderRadius: 30,
      padding: 6,
      width: 70,
      height: 36,
      // Enhanced inset effect
      shadowColor: '#a3b1c6',
      shadowOffset: { width: -3, height: -3 },
      shadowOpacity: 0.5,
      shadowRadius: 6,
      elevation: 4,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    // Enhanced neumorphic toggle - more realistic physical button
    neumorphicToggle: {
      backgroundColor: '#e0e5ec',
      borderRadius: 14,
      width: 28,
      height: 28,
      // Enhanced raised effect
      shadowColor: '#a3b1c6',
      shadowOffset: { width: 3, height: 3 },
      shadowOpacity: 0.6,
      shadowRadius: 6,
      elevation: 6,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.4)',
    },
    // Enhanced neumorphic icon button - more realistic
    neumorphicIconButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: '#e0e5ec',
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      margin: theme.spacing.sm,
      // Enhanced raised effect
      shadowColor: '#a3b1c6',
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 0.7,
      shadowRadius: 12,
      elevation: 12,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    neumorphicIconButtonPressed: {
      // Realistic pressed state for icon buttons
      shadowColor: '#a3b1c6',
      shadowOffset: { width: -3, height: -3 },
      shadowOpacity: 0.5,
      shadowRadius: 6,
      elevation: 3,
      backgroundColor: '#d1d9e6',
      borderColor: 'rgba(255, 255, 255, 0.2)',
      transform: [{ scale: 0.95 }],
    },
    // Row layout
    row: {
      flexDirection: 'row' as const,
      justifyContent: 'space-around' as const,
      alignItems: 'center' as const,
      marginBottom: theme.spacing.lg,
    },
    // Text styles
    cardText: {
      fontSize: theme.typography.fontSizes.md,
      color: '#4a5568',
      fontFamily: theme.typography.fontFamily.primary,
      lineHeight: 24,
    },
    buttonText: {
      fontSize: theme.typography.fontSizes.md,
      color: '#4a5568',
      fontFamily: theme.typography.fontFamily.primary,
      fontWeight: theme.typography.fontWeights.medium as '500',
    },
    inputText: {
      fontSize: theme.typography.fontSizes.md,
      color: '#4a5568',
      fontFamily: theme.typography.fontFamily.primary,
    },
  };

  // Enhanced Heart Button Component with Reanimated
  const EnhancedHeartButton = () => {
    const [isPressed, setIsPressed] = useState(false);
    
    // Shared values for animations
    const heartScale = useSharedValue(1);
    const borderColorProgress = useSharedValue(0);
    const buttonScale = useSharedValue(1);
    const emptyHeartOpacity = useSharedValue(1);
    const filledHeartOpacity = useSharedValue(0);
    
    // Custom easing function to match web CSS
    const customEasing = Easing.bezier(0.68, -0.55, 0.27, 2.5);
    
    // Start continuous animations
    useEffect(() => {
      // Beating heart animation (continuous)
      heartScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 150, easing: Easing.ease }),
          withTiming(1, { duration: 150, easing: Easing.ease }),
          withTiming(1.15, { duration: 150, easing: Easing.ease }),
          withTiming(1, { duration: 150, easing: Easing.ease })
        ),
        -1, // Infinite repeat
        true // Reverse
      );
      
      // Moving border colors animation (continuous)
      borderColorProgress.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.ease }),
        -1, // Infinite repeat
        true // Reverse
      );
    }, []);
    
    // Animated styles
    const heartAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: heartScale.value }],
      };
    });
    
    const borderAnimatedStyle = useAnimatedStyle(() => {
      return {
        borderColor: interpolateColor(
          borderColorProgress.value,
          [0, 0.5, 1],
          ['#fce4e4', '#ffd8d8', '#fce4e4']
        ),
      };
    });
    
    const buttonAnimatedStyle = useAnimatedStyle(() => {
      return {
        transform: [{ scale: buttonScale.value }],
        backgroundColor: isPressed ? '#eee' : '#e8e8e8',
      };
    });
    
    const emptyHeartAnimatedStyle = useAnimatedStyle(() => {
      return {
        opacity: emptyHeartOpacity.value,
      };
    });
    
    const filledHeartAnimatedStyle = useAnimatedStyle(() => {
      return {
        opacity: filledHeartOpacity.value,
        transform: [{ scale: heartScale.value }],
      };
    });
    
    const handlePressIn = () => {
      setIsPressed(true);
      buttonScale.value = withTiming(1.05, { duration: 400, easing: customEasing });
      emptyHeartOpacity.value = withTiming(0, { duration: 100 });
      filledHeartOpacity.value = withTiming(1, { duration: 100 });
    };
    
    const handlePressOut = () => {
      setIsPressed(false);
      buttonScale.value = withTiming(1, { duration: 400, easing: customEasing });
      emptyHeartOpacity.value = withTiming(1, { duration: 100 });
      filledHeartOpacity.value = withTiming(0, { duration: 100 });
    };
    
    return (
      <Animated.View style={[neumorphismStyles.animatedHeartButton, borderAnimatedStyle, buttonAnimatedStyle]}>
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 20,
            paddingHorizontal: 25,
            paddingLeft: 22,
            minHeight: 80,
            minWidth: 120,
          }}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
        >
          <View style={neumorphismStyles.heartIconContainer}>
            {/* Empty heart icon */}
            <Animated.View style={emptyHeartAnimatedStyle}>
              <Ionicons 
                name="heart-outline" 
                size={32} 
                color="rgb(255, 110, 110)"
              />
            </Animated.View>
            {/* Filled heart icon */}
            <Animated.View style={[neumorphismStyles.heartIconFilled, filledHeartAnimatedStyle]}>
              <Ionicons 
                name="heart" 
                size={32} 
                color="rgb(255, 110, 110)"
              />
            </Animated.View>
          </View>
          <Text style={{
            fontSize: 25,
            fontWeight: '900',
            color: 'rgb(134, 124, 124)',
            fontFamily: 'monospace',
            letterSpacing: -2,
          }}>
            Like
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={neumorphismStyles.container}>
      {/* Header */}
      <View style={neumorphismStyles.header}>
        <TouchableOpacity
          style={[
            neumorphismStyles.backButton,
            activeButtons.has('back') && neumorphismStyles.backButtonPressed
          ]}
          onPress={handleBack}
          onPressIn={() => toggleButton('back')}
          onPressOut={() => toggleButton('back')}
        >
          <Ionicons name="arrow-back" size={24} color="#4a5568" />
        </TouchableOpacity>
        <Text style={neumorphismStyles.headerTitle}>Neumorphism Demo</Text>
      </View>

      {/* Content */}
      <ScrollView style={neumorphismStyles.content}>
        {/* Cards Section */}
        <View style={neumorphismStyles.section}>
          <Text style={neumorphismStyles.sectionTitle}>Neumorphic Cards</Text>
          
          <View style={neumorphismStyles.neumorphicCard}>
            <Text style={neumorphismStyles.cardText}>
              This is a neumorphic card with soft shadows that create a 3D embossed effect. 
              The design uses subtle highlights and shadows to make elements appear raised from the surface.
            </Text>
          </View>

          <View style={neumorphismStyles.neumorphicCard}>
            <Text style={neumorphismStyles.cardText}>
              Enhanced neumorphism creates realistic physical buttons with deeper shadows, 
              color changes on press, and subtle scale animations. Each button feels like 
              a real physical object you can press.
            </Text>
          </View>

          <View style={neumorphismStyles.dramaticNeumorphicCard}>
            <Text style={[neumorphismStyles.cardText, { color: '#333333' }]}>
              Dramatic neumorphism uses larger shadow offsets and different color schemes 
              to create more pronounced 3D effects. This style is inspired by web CSS 
              with larger shadow values.
            </Text>
          </View>
        </View>

        {/* Buttons Section */}
        <View style={neumorphismStyles.section}>
          <Text style={neumorphismStyles.sectionTitle}>Neumorphic Buttons</Text>
          
          <TouchableOpacity
            style={[
              neumorphismStyles.neumorphicButton,
              activeButtons.has('button1') && neumorphismStyles.neumorphicButtonPressed
            ]}
            onPressIn={() => toggleButton('button1')}
            onPressOut={() => toggleButton('button1')}
          >
            <Text style={neumorphismStyles.buttonText}>Press Me</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              neumorphismStyles.neumorphicButton,
              activeButtons.has('button2') && neumorphismStyles.neumorphicButtonPressed
            ]}
            onPressIn={() => toggleButton('button2')}
            onPressOut={() => toggleButton('button2')}
          >
            <Text style={neumorphismStyles.buttonText}>Interactive Button</Text>
          </TouchableOpacity>
        </View>

        {/* Dramatic Neumorphism Section */}
        <View style={neumorphismStyles.section}>
          <Text style={neumorphismStyles.sectionTitle}>Dramatic Neumorphism</Text>
          
          <View style={neumorphismStyles.dramaticNeumorphicCard}>
            <Text style={[neumorphismStyles.cardText, { color: '#333333' }]}>
              This card uses dramatic neumorphic shadows with larger offsets and different colors. 
              The effect is more pronounced and creates a stronger 3D appearance.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              neumorphismStyles.dramaticNeumorphicButton,
              activeButtons.has('dramatic1') && neumorphismStyles.dramaticNeumorphicButtonPressed
            ]}
            onPressIn={() => toggleButton('dramatic1')}
            onPressOut={() => toggleButton('dramatic1')}
          >
            <Text style={[neumorphismStyles.buttonText, { color: '#333333', fontSize: 18 }]}>
              Dramatic Button
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              neumorphismStyles.dramaticNeumorphicButton,
              activeButtons.has('dramatic2') && neumorphismStyles.dramaticNeumorphicButtonPressed
            ]}
            onPressIn={() => toggleButton('dramatic2')}
            onPressOut={() => toggleButton('dramatic2')}
          >
            <Text style={[neumorphismStyles.buttonText, { color: '#333333', fontSize: 18 }]}>
              Web-Style Shadows
            </Text>
          </TouchableOpacity>
        </View>

        {/* Gradient Neumorphism Section */}
        <View style={neumorphismStyles.section}>
          <Text style={neumorphismStyles.sectionTitle}>Gradient Neumorphism</Text>
          
          <View style={neumorphismStyles.neumorphicCard}>
            <Text style={neumorphismStyles.cardText}>
              This section demonstrates the gradient neumorphism effect using simulated gradients 
              with layered View components. The effect creates a sophisticated 3D appearance.
            </Text>
          </View>
          
          <View style={neumorphismStyles.gradientNeumorphicCard}>
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 30,
              backgroundColor: '#cacaca',
            }} />
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 30,
              backgroundColor: '#f0f0f0',
              opacity: 0.7,
            }} />
            <Text style={[neumorphismStyles.cardText, { color: '#333333', position: 'relative', zIndex: 1 }]}>
              This card uses a simulated gradient background (#cacaca to #f0f0f0) with the same dramatic 
              shadow effects. The gradient creates a more sophisticated neumorphic appearance.
            </Text>
          </View>

          <TouchableOpacity
            style={[
              neumorphismStyles.gradientNeumorphicButton,
              activeButtons.has('gradient1') && neumorphismStyles.gradientNeumorphicButtonPressed
            ]}
            onPressIn={() => toggleButton('gradient1')}
            onPressOut={() => toggleButton('gradient1')}
          >
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 68,
              backgroundColor: '#cacaca',
            }} />
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 68,
              backgroundColor: '#f0f0f0',
              opacity: 0.7,
            }} />
            <Text style={[neumorphismStyles.buttonText, { color: '#333333', fontSize: 18, position: 'relative', zIndex: 1 }]}>
              Gradient Button
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              neumorphismStyles.gradientNeumorphicButton,
              activeButtons.has('gradient2') && neumorphismStyles.gradientNeumorphicButtonPressed
            ]}
            onPressIn={() => toggleButton('gradient2')}
            onPressOut={() => toggleButton('gradient2')}
          >
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 68,
              backgroundColor: '#cacaca',
            }} />
            <View style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 68,
              backgroundColor: '#f0f0f0',
              opacity: 0.7,
            }} />
            <Text style={[neumorphismStyles.buttonText, { color: '#333333', fontSize: 18, position: 'relative', zIndex: 1 }]}>
              Linear Gradient Effect
            </Text>
          </TouchableOpacity>
        </View>

        {/* Classic Neumorphic Button Section */}
        <View style={neumorphismStyles.section}>
          <Text style={neumorphismStyles.sectionTitle}>Classic Neumorphic Button</Text>
          
          {/* Enhanced version with dual shadow simulation */}
          <View style={{
            marginBottom: theme.spacing.md,
            borderRadius: 8,
            // Dark shadow layer (bottom-right)
            shadowColor: '#c5c5c5',
            shadowOffset: { width: 6, height: 6 },
            shadowOpacity: 0.8,
            shadowRadius: 12,
            elevation: 12,
          }}>
            <View style={{
              borderRadius: 8,
              // Light shadow layer (top-left) - simulated with border
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.8)',
              backgroundColor: 'transparent',
            }}>
              <TouchableOpacity
                style={[
                  neumorphismStyles.classicNeumorphicButton,
                  activeButtons.has('classic1') && neumorphismStyles.classicNeumorphicButtonPressed
                ]}
                onPressIn={() => toggleButton('classic1')}
                onPressOut={() => toggleButton('classic1')}
              >
                <Text style={{
                  color: activeButtons.has('classic1') ? '#666' : '#090909',
                  fontSize: 18,
                  textAlign: 'center',
                }}>
                  Click me
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[
              neumorphismStyles.classicNeumorphicButton,
              activeButtons.has('classic2') && neumorphismStyles.classicNeumorphicButtonPressed
            ]}
            onPressIn={() => toggleButton('classic2')}
            onPressOut={() => toggleButton('classic2')}
          >
            <Text style={{
              color: activeButtons.has('classic2') ? '#666' : '#090909',
              fontSize: 18,
              textAlign: 'center',
            }}>
              Press me
            </Text>
          </TouchableOpacity>

          <View style={neumorphismStyles.neumorphicCard}>
            <Text style={neumorphismStyles.cardText}>
              Classic neumorphic buttons feature dual shadows that create a raised 3D effect. 
              When pressed, the shadows invert to create an inset effect, making the button 
              appear pressed into the surface.
            </Text>
          </View>

          <View style={neumorphismStyles.neumorphicCard}>
            <Text style={neumorphismStyles.cardText}>
              Note: React Native limitations for dual shadows:
              {'\n'}• Can only apply one shadow per element
              {'\n'}• Missing light highlight shadow (-6px -6px 12px #ffffff)
              {'\n'}• Platform-specific shadow rendering differences
              {'\n'}• Cannot replicate exact CSS box-shadow behavior
            </Text>
          </View>
        </View>

        {/* Enhanced Animated Heart Button Section */}
        <View style={neumorphismStyles.section}>
          <Text style={neumorphismStyles.sectionTitle}>Enhanced Animated Heart Button</Text>
          
          <EnhancedHeartButton />

          <View style={neumorphismStyles.neumorphicCard}>
            <Text style={neumorphismStyles.cardText}>
              This enhanced version uses React Native Reanimated to create continuous animations 
              that closely match the original web CSS. Features beating heart animation, 
              moving border colors, and custom timing functions.
            </Text>
          </View>
        </View>

        {/* Input Fields Section */}
        <View style={neumorphismStyles.section}>
          <Text style={neumorphismStyles.sectionTitle}>Neumorphic Input Fields</Text>
          
          <View style={neumorphismStyles.neumorphicInput}>
            <Text style={neumorphismStyles.inputText}>Input field with inset effect</Text>
          </View>

          <View style={neumorphismStyles.neumorphicInput}>
            <Text style={neumorphismStyles.inputText}>Another inset input field</Text>
          </View>
        </View>

        {/* Toggle Section */}
        <View style={neumorphismStyles.section}>
          <Text style={neumorphismStyles.sectionTitle}>Neumorphic Toggle</Text>
          
          <View style={neumorphismStyles.row}>
            <View style={neumorphismStyles.neumorphicSwitchContainer}>
              <View style={[
                neumorphismStyles.neumorphicToggle,
                {
                  transform: [{ translateX: switchValue ? 30 : 0 }],
                  backgroundColor: switchValue ? '#4CAF50' : '#e0e5ec'
                }
              ]} />
            </View>
            <TouchableOpacity
              style={neumorphismStyles.neumorphicButton}
              onPress={() => setSwitchValue(!switchValue)}
            >
              <Text style={neumorphismStyles.buttonText}>
                {switchValue ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Icon Buttons Section */}
        <View style={neumorphismStyles.section}>
          <Text style={neumorphismStyles.sectionTitle}>Neumorphic Icon Buttons</Text>
          
          <View style={neumorphismStyles.row}>
            <TouchableOpacity
              style={[
                neumorphismStyles.neumorphicIconButton,
                activeButtons.has('home') && neumorphismStyles.neumorphicIconButtonPressed
              ]}
              onPress={() => console.log('Home pressed')}
              onPressIn={() => toggleButton('home')}
              onPressOut={() => toggleButton('home')}
            >
              <Ionicons name="home" size={28} color="#4a5568" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                neumorphismStyles.neumorphicIconButton,
                activeButtons.has('settings') && neumorphismStyles.neumorphicIconButtonPressed
              ]}
              onPress={() => console.log('Settings pressed')}
              onPressIn={() => toggleButton('settings')}
              onPressOut={() => toggleButton('settings')}
            >
              <Ionicons name="settings" size={28} color="#4a5568" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                neumorphismStyles.neumorphicIconButton,
                activeButtons.has('heart') && neumorphismStyles.neumorphicIconButtonPressed
              ]}
              onPress={() => console.log('Heart pressed')}
              onPressIn={() => toggleButton('heart')}
              onPressOut={() => toggleButton('heart')}
            >
              <Ionicons name="heart" size={28} color="#4a5568" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                neumorphismStyles.neumorphicIconButton,
                activeButtons.has('star') && neumorphismStyles.neumorphicIconButtonPressed
              ]}
              onPress={() => console.log('Star pressed')}
              onPressIn={() => toggleButton('star')}
              onPressOut={() => toggleButton('star')}
            >
              <Ionicons name="star" size={28} color="#4a5568" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Section */}
        <View style={neumorphismStyles.section}>
          <Text style={neumorphismStyles.sectionTitle}>About Neumorphism</Text>
          
          <View style={neumorphismStyles.neumorphicCard}>
            <Text style={neumorphismStyles.cardText}>
              Neumorphism (or "soft UI") creates a soft, tactile interface using subtle shadows 
              and highlights. Elements appear to be either raised from or pressed into the surface.
            </Text>
          </View>

          <View style={neumorphismStyles.neumorphicCard}>
            <Text style={neumorphismStyles.cardText}>
              Enhanced characteristics:
              {'\n'}• Deeper, more pronounced shadows
              {'\n'}• Color changes on press (#d1d9e6)
              {'\n'}• Scale animations (0.98x, 0.95x)
              {'\n'}• Thicker borders (2px)
              {'\n'}• Larger, more tactile buttons
              {'\n'}• Realistic pressed states
            </Text>
          </View>
        </View>

        {/* Gradient Neumorphism Theme Demo Section */}
        <View style={neumorphismStyles.section}>
          <Text style={neumorphismStyles.sectionTitle}>Gradient Neumorphism Theme</Text>
          
          <View style={neumorphismStyles.neumorphicCard}>
            <Text style={neumorphismStyles.cardText}>
              This is a preview of the new Gradient Neumorphism theme that will be available 
              in your theme selector. It features gradient backgrounds with enhanced neumorphic shadows.
            </Text>
          </View>

          <View style={neumorphismStyles.neumorphicCard}>
            <Text style={neumorphismStyles.cardText}>
              Theme features:
              {'\n'}• Gradient color palettes (primary, accent, success, etc.)
              {'\n'}• Enhanced shadow system for depth
              {'\n'}• High contrast text colors
              {'\n'}• Gradient-based message bubbles
              {'\n'}• Gradient button styling
              {'\n'}• Compatible with existing components
            </Text>
          </View>

          <TouchableOpacity
            style={[
              neumorphismStyles.neumorphicButton,
              activeButtons.has('themeDemo') && neumorphismStyles.neumorphicButtonPressed
            ]}
            onPress={() => console.log('Theme demo pressed')}
            onPressIn={() => toggleButton('themeDemo')}
            onPressOut={() => toggleButton('themeDemo')}
          >
            <Text style={neumorphismStyles.buttonText}>
              Try Gradient Theme
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

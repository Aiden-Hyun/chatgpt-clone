import React, { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { useAppTheme } from '../../../../shared/hooks';
import { createLoadingMessageStyles } from './LoadingMessage.styles';

interface LoadingMessageProps {
  style?: any;
}

export const LoadingMessage: React.FC<LoadingMessageProps> = ({ style }) => {
  const theme = useAppTheme();
  const styles = createLoadingMessageStyles(theme);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const dot1Anim = React.useRef(new Animated.Value(0.4)).current;
  const dot2Anim = React.useRef(new Animated.Value(0.7)).current;
  const dot3Anim = React.useRef(new Animated.Value(1)).current;

  const loadingTexts = [
    'Thinking...',
    'Analyzing your message...',
    'Generating response...',
    'Processing...',
    'Creating thoughtful reply...',
    'Almost ready...',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        // Change text
        setCurrentTextIndex((prev) => (prev + 1) % loadingTexts.length);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    }, 3000); // Change text every 3 seconds

    return () => clearInterval(interval);
  }, [fadeAnim]);

  // Animate dots
  useEffect(() => {
    const animateDots = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(dot1Anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Anim, {
            toValue: 0.4,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Anim, {
            toValue: 0.7,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(dot1Anim, {
            toValue: 0.7,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Anim, {
            toValue: 0.4,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(dot1Anim, {
            toValue: 0.4,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot2Anim, {
            toValue: 0.7,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot3Anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => animateDots());
    };

    animateDots();
  }, [dot1Anim, dot2Anim, dot3Anim]);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.messageContainer}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>🤖</Text>
        </View>
        <View style={styles.contentContainer}>
          <Animated.Text style={[styles.loadingText, { opacity: fadeAnim }]}>
            {loadingTexts[currentTextIndex]}
          </Animated.Text>
          <View style={styles.dotsContainer}>
            <Animated.View style={[styles.dot, { opacity: dot1Anim }]} />
            <Animated.View style={[styles.dot, { opacity: dot2Anim }]} />
            <Animated.View style={[styles.dot, { opacity: dot3Anim, marginRight: 0 }]} />
          </View>
        </View>
      </View>
    </View>
  );
}; 
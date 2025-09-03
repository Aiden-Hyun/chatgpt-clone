import { useLanguageContext } from "@/features/language";
import { useAppTheme } from "@/features/theme";
import React, { useEffect, useState } from "react";
import { Animated, View } from "react-native";
import {
  LOADING_ANIMATION_START_DELAY_MS,
  LOADING_DOT_INTERVAL_MS,
} from "../../constants";
import { createLoadingMessageStyles } from "./LoadingMessage.styles";

interface LoadingMessageProps {
  style?: any;
}

export const LoadingMessage: React.FC<LoadingMessageProps> = ({ style }) => {
  const theme = useAppTheme();
  const { t } = useLanguageContext();
  const styles = createLoadingMessageStyles(theme);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [showDetailedMessages, setShowDetailedMessages] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const dot1Anim = React.useRef(new Animated.Value(0.4)).current;
  const dot2Anim = React.useRef(new Animated.Value(0.7)).current;
  const dot3Anim = React.useRef(new Animated.Value(1)).current;

  const simpleLoadingText = t("loading.thinking");
  const detailedLoadingTexts = [
    t("loading.analyzing"),
    t("loading.generating"),
    t("loading.processing"),
    t("loading.creating"),
    t("loading.almost_ready"),
  ];

  // Show detailed messages after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDetailedMessages(true);
    }, LOADING_ANIMATION_START_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  // Animate detailed messages
  useEffect(() => {
    if (!showDetailedMessages) return;

    const interval = setInterval(() => {
      // Update text first
      setCurrentTextIndex((prev) => (prev + 1) % detailedLoadingTexts.length);

      // Then animate fade out and in
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();
    }, LOADING_DOT_INTERVAL_MS); // Change text every 3 seconds

    return () => clearInterval(interval);
  }, [fadeAnim, showDetailedMessages, detailedLoadingTexts.length]);

  // Animate dots
  useEffect(() => {
    const animateDots = () => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(dot1Anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: false,
          }),
          Animated.timing(dot2Anim, {
            toValue: 0.4,
            duration: 400,
            useNativeDriver: false,
          }),
          Animated.timing(dot3Anim, {
            toValue: 0.7,
            duration: 400,
            useNativeDriver: false,
          }),
        ]),
        Animated.parallel([
          Animated.timing(dot1Anim, {
            toValue: 0.7,
            duration: 400,
            useNativeDriver: false,
          }),
          Animated.timing(dot2Anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: false,
          }),
          Animated.timing(dot3Anim, {
            toValue: 0.4,
            duration: 400,
            useNativeDriver: false,
          }),
        ]),
        Animated.parallel([
          Animated.timing(dot1Anim, {
            toValue: 0.4,
            duration: 400,
            useNativeDriver: false,
          }),
          Animated.timing(dot2Anim, {
            toValue: 0.7,
            duration: 400,
            useNativeDriver: false,
          }),
          Animated.timing(dot3Anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: false,
          }),
        ]),
      ]).start(() => animateDots());
    };

    animateDots();
  }, [dot1Anim, dot2Anim, dot3Anim]);

  return (
    <View style={[styles.container, style]}>
      {showDetailedMessages ? (
        <Animated.Text style={[styles.loadingText, { opacity: fadeAnim }]}>
          {detailedLoadingTexts[currentTextIndex]}
        </Animated.Text>
      ) : (
        <View style={styles.dotsContainer}>
          <Animated.View style={[styles.dot, { opacity: dot1Anim }]} />
          <Animated.View style={[styles.dot, { opacity: dot2Anim }]} />
          <Animated.View
            style={[styles.dot, { opacity: dot3Anim, marginRight: 0 }]}
          />
        </View>
      )}
    </View>
  );
};

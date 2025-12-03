// src/features/subscription/screens/PaywallScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSubscription } from '../context/SubscriptionContext';

const { width } = Dimensions.get('window');

interface PaywallScreenProps {
  onClose?: () => void;
}

const FEATURES = [
  { icon: 'chatbubbles', title: 'Unlimited AI Chats', desc: 'No message limits' },
  { icon: 'flash', title: 'GPT-4 & Claude', desc: 'Access to all models' },
  { icon: 'cloud-upload', title: 'Cloud Sync', desc: 'Access anywhere' },
  { icon: 'shield-checkmark', title: 'Priority Support', desc: '24/7 assistance' },
];

export function PaywallScreen({ onClose }: PaywallScreenProps) {
  const insets = useSafeAreaInsets();
  const { packages, purchase, restore, isLoading } = useSubscription();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const selectedPackage = packages[0]; // Default to first package

  const handlePurchase = useCallback(async () => {
    if (!selectedPackage || isPurchasing) return;

    setIsPurchasing(true);
    try {
      const success = await purchase(selectedPackage);
      if (success) {
        // Purchase successful - subscription context will update
      }
    } finally {
      setIsPurchasing(false);
    }
  }, [selectedPackage, purchase, isPurchasing]);

  const handleRestore = useCallback(async () => {
    if (isRestoring) return;

    setIsRestoring(true);
    try {
      await restore();
    } finally {
      setIsRestoring(false);
    }
  }, [restore, isRestoring]);

  const getTrialText = () => {
    if (!selectedPackage) return 'Start Free Trial';

    const product = selectedPackage.product;
    const introPrice = product.introPrice;

    if (introPrice && introPrice.price === 0) {
      return `Start ${introPrice.periodNumberOfUnits}-Day Free Trial`;
    }

    return 'Subscribe Now';
  };

  const getPriceText = () => {
    if (!selectedPackage) return '';

    const product = selectedPackage.product;
    return `Then ${product.priceString}/${product.subscriptionPeriod === 'P1M' ? 'month' : 'year'}`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Close button (if dismissible) */}
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        )}

        {/* Logo/Icon */}
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.logoGradient}
          >
            <Ionicons name="sparkles" size={40} color="white" />
          </LinearGradient>
        </View>

        {/* Title */}
        <Text style={styles.title}>Unlock MalloAI Pro</Text>
        <Text style={styles.subtitle}>
          Your personal AI assistant, unlimited
        </Text>

        {/* Features */}
        <View style={styles.featuresContainer}>
          {FEATURES.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <View style={styles.featureIconContainer}>
                <Ionicons
                  name={feature.icon as any}
                  size={24}
                  color="#667eea"
                />
              </View>
              <View style={styles.featureTextContainer}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.desc}</Text>
              </View>
              <Ionicons name="checkmark-circle" size={24} color="#4ade80" />
            </View>
          ))}
        </View>

        {/* Pricing Card */}
        <View style={styles.pricingCard}>
          <View style={styles.pricingBadge}>
            <Text style={styles.pricingBadgeText}>MOST POPULAR</Text>
          </View>

          {selectedPackage ? (
            <>
              <Text style={styles.pricingAmount}>
                {selectedPackage.product.priceString}
              </Text>
              <Text style={styles.pricingPeriod}>per month</Text>
              {selectedPackage.product.introPrice && (
                <Text style={styles.trialInfo}>
                  {selectedPackage.product.introPrice.periodNumberOfUnits}-day free trial included
                </Text>
              )}
            </>
          ) : (
            <>
              <Text style={styles.pricingAmount}>$9.99</Text>
              <Text style={styles.pricingPeriod}>per month</Text>
              <Text style={styles.trialInfo}>7-day free trial included</Text>
            </>
          )}
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={[styles.ctaButton, (isPurchasing || isLoading) && styles.ctaButtonDisabled]}
          onPress={handlePurchase}
          disabled={isPurchasing || isLoading || !selectedPackage}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            {isPurchasing ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text style={styles.ctaText}>{getTrialText()}</Text>
                {selectedPackage && (
                  <Text style={styles.ctaSubtext}>{getPriceText()}</Text>
                )}
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Restore */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={isRestoring}
        >
          {isRestoring ? (
            <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
          ) : (
            <Text style={styles.restoreText}>Restore Purchases</Text>
          )}
        </TouchableOpacity>

        {/* Legal */}
        <Text style={styles.legalText}>
          {Platform.OS === 'ios'
            ? 'Payment will be charged to your Apple ID account. Subscription automatically renews unless canceled at least 24 hours before the end of the current period.'
            : 'Payment will be charged to your Google Play account. Subscription automatically renews unless canceled at least 24 hours before the end of the current period.'}
        </Text>

        <View style={styles.legalLinks}>
          <TouchableOpacity>
            <Text style={styles.linkText}>Terms of Service</Text>
          </TouchableOpacity>
          <Text style={styles.linkDivider}>•</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 8,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoGradient: {
    width: 80,
    height: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 32,
  },
  featuresContainer: {
    width: '100%',
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(102, 126, 234, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  pricingCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#667eea',
  },
  pricingBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: '#667eea',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pricingBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 1,
  },
  pricingAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: 'white',
    marginTop: 8,
  },
  pricingPeriod: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 8,
  },
  trialInfo: {
    fontSize: 14,
    color: '#4ade80',
    fontWeight: '500',
  },
  ctaButton: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaButtonDisabled: {
    opacity: 0.7,
  },
  ctaGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  ctaSubtext: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  restoreButton: {
    padding: 12,
    marginBottom: 24,
  },
  restoreText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textDecorationLine: 'underline',
  },
  legalText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 16,
  },
  legalLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textDecorationLine: 'underline',
  },
  linkDivider: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginHorizontal: 8,
  },
});


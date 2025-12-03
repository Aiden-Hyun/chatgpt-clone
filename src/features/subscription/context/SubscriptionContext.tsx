// src/features/subscription/context/SubscriptionContext.tsx
import Constants from 'expo-constants';
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';

import { getLogger } from '@/shared/services/logger';

// Conditionally import RevenueCat only on native platforms
let Purchases: any = null;
let CustomerInfo: any = null;
let PurchasesPackage: any = null;
let LOG_LEVEL: any = null;

if (Platform.OS !== 'web') {
  const RC = require('react-native-purchases');
  Purchases = RC.default;
  CustomerInfo = RC.CustomerInfo;
  PurchasesPackage = RC.PurchasesPackage;
  LOG_LEVEL = RC.LOG_LEVEL;
}

const logger = getLogger('SubscriptionContext');

export type SubscriptionStatus = 'loading' | 'active' | 'expired' | 'none';

interface SubscriptionContextType {
  status: SubscriptionStatus;
  isLoading: boolean;
  customerInfo: any | null;
  packages: any[];
  purchase: (pkg: any) => Promise<boolean>;
  restore: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

// Entitlement ID - this should match what you set up in RevenueCat dashboard
const ENTITLEMENT_ID = 'pro';

interface SubscriptionProviderProps {
  children: ReactNode;
}

export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [status, setStatus] = useState<SubscriptionStatus>('loading');
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [isConfigured, setIsConfigured] = useState(false);

  // Initialize RevenueCat
  useEffect(() => {
    const initRevenueCat = async () => {
      try {
        // Web platform: Always grant access (subscriptions only for mobile)
        if (Platform.OS === 'web') {
          logger.info('Web platform detected: Granting access without subscription');
          setStatus('active');
          setIsLoading(false);
          return;
        }

        const androidKey = Constants.expoConfig?.extra?.revenueCatAndroidKey;
        const iosKey = Constants.expoConfig?.extra?.revenueCatIosKey;

        const apiKey = Platform.OS === 'ios' ? iosKey : androidKey;

        if (!apiKey) {
          logger.warn('RevenueCat API key not configured, skipping initialization');
          // For development without keys, grant access
          if (__DEV__) {
            logger.info('DEV mode: Granting access without subscription');
            setStatus('active');
          } else {
            setStatus('none');
          }
          setIsLoading(false);
          return;
        }

        // Configure RevenueCat (only available on native platforms)
        if (!Purchases) {
          logger.error('RevenueCat not available on this platform');
          setStatus('none');
          setIsLoading(false);
          return;
        }

        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        await Purchases.configure({ apiKey });
        setIsConfigured(true);

        logger.info('RevenueCat configured successfully');

        // Get initial customer info
        const info = await Purchases.getCustomerInfo();
        updateSubscriptionStatus(info);

        // Fetch available packages
        await fetchOfferings();

        // Listen for customer info updates
        Purchases.addCustomerInfoUpdateListener((info) => {
          logger.debug('Customer info updated');
          updateSubscriptionStatus(info);
        });
      } catch (error) {
        logger.error('Failed to initialize RevenueCat', { error });
        // On error in dev, grant access; in prod, deny
        if (__DEV__) {
          setStatus('active');
        } else {
          setStatus('none');
        }
      } finally {
        setIsLoading(false);
      }
    };

    initRevenueCat();
  }, []);

  const updateSubscriptionStatus = useCallback((info: CustomerInfo) => {
    setCustomerInfo(info);

    const isActive = info.entitlements.active[ENTITLEMENT_ID] !== undefined;

    if (isActive) {
      logger.info('User has active subscription');
      setStatus('active');
    } else {
      logger.info('User does not have active subscription');
      setStatus('none');
    }
  }, []);

  const fetchOfferings = useCallback(async () => {
    if (!Purchases) return;

    try {
      const offerings = await Purchases.getOfferings();

      if (offerings.current?.availablePackages) {
        setPackages(offerings.current.availablePackages);
        logger.debug('Fetched offerings', {
          packageCount: offerings.current.availablePackages.length,
        });
      }
    } catch (error) {
      logger.error('Failed to fetch offerings', { error });
    }
  }, []);

  const purchase = useCallback(async (pkg: any): Promise<boolean> => {
    if (!isConfigured || !Purchases) {
      logger.warn('RevenueCat not configured, cannot purchase');
      return false;
    }

    try {
      setIsLoading(true);
      logger.info('Starting purchase', { packageId: pkg.identifier });

      const { customerInfo: info } = await Purchases.purchasePackage(pkg);
      updateSubscriptionStatus(info);

      const success = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
      logger.info('Purchase completed', { success });

      return success;
    } catch (error: any) {
      // Check if user cancelled
      if (error.userCancelled) {
        logger.info('User cancelled purchase');
        return false;
      }

      logger.error('Purchase failed', { error: error.message });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured, updateSubscriptionStatus]);

  const restore = useCallback(async (): Promise<boolean> => {
    if (!isConfigured || !Purchases) {
      logger.warn('RevenueCat not configured, cannot restore');
      return false;
    }

    try {
      setIsLoading(true);
      logger.info('Restoring purchases');

      const info = await Purchases.restorePurchases();
      updateSubscriptionStatus(info);

      const success = info.entitlements.active[ENTITLEMENT_ID] !== undefined;
      logger.info('Restore completed', { success });

      return success;
    } catch (error) {
      logger.error('Restore failed', { error });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured, updateSubscriptionStatus]);

  const refresh = useCallback(async () => {
    if (!isConfigured || !Purchases) return;

    try {
      const info = await Purchases.getCustomerInfo();
      updateSubscriptionStatus(info);
    } catch (error) {
      logger.error('Failed to refresh subscription status', { error });
    }
  }, [isConfigured, updateSubscriptionStatus]);

  return (
    <SubscriptionContext.Provider
      value={{
        status,
        isLoading,
        customerInfo,
        packages,
        purchase,
        restore,
        refresh,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}


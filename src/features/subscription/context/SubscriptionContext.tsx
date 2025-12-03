// src/features/subscription/context/SubscriptionContext.tsx
import Constants from 'expo-constants';
import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { Platform } from 'react-native';
import Purchases, { CustomerInfo, PurchasesPackage, LOG_LEVEL } from 'react-native-purchases';

import { getLogger } from '@/shared/services/logger';

const logger = getLogger('SubscriptionContext');

export type SubscriptionStatus = 'loading' | 'active' | 'expired' | 'none';

interface SubscriptionContextType {
  status: SubscriptionStatus;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  packages: PurchasesPackage[];
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
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

        // Configure RevenueCat
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

  const purchase = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    if (!isConfigured) {
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
    if (!isConfigured) {
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
    if (!isConfigured) return;

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


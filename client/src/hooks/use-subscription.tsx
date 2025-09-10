import { useAuth } from "./use-auth";

export function useSubscription() {
  const { user } = useAuth();

  const isStandard = user?.subscriptionTier === 'standard';
  const isPremium = user?.subscriptionTier === 'premium';

  const hasFeature = (feature: string): boolean => {
    if (!user) return false;

    const standardFeatures = [
      'pos',
      'inventory',
      'basic_reports',
      'customer_management',
      'sales_orders',
      'basic_accounting'
    ];

    const premiumFeatures = [
      ...standardFeatures,
      'ai_insights',
      'advanced_analytics',
      'vendor_management',
      'purchase_orders',
      'advanced_reporting',
      'multi_currency',
      'custom_integrations'
    ];

    if (isPremium) {
      return premiumFeatures.includes(feature);
    }

    if (isStandard) {
      return standardFeatures.includes(feature);
    }

    return false;
  };

  const requiresUpgrade = (feature: string): boolean => {
    return !hasFeature(feature) && isStandard;
  };

  return {
    subscriptionTier: user?.subscriptionTier || 'standard',
    isStandard,
    isPremium,
    hasFeature,
    requiresUpgrade,
  };
}

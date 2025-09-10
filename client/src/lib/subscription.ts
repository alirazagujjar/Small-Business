import { useAuth } from "@/hooks/use-auth";

export interface SubscriptionFeatures {
  // Standard Features
  pos: boolean;
  inventory: boolean;
  basic_reports: boolean;
  customer_management: boolean;
  sales_orders: boolean;
  basic_accounting: boolean;
  
  // Premium Features
  ai_insights: boolean;
  advanced_analytics: boolean;
  vendor_management: boolean;
  purchase_orders: boolean;
  advanced_reporting: boolean;
  multi_currency: boolean;
  custom_integrations: boolean;
}

export const FEATURE_DEFINITIONS: Record<string, { name: string; description: string; tier: 'standard' | 'premium' }> = {
  pos: {
    name: 'Point of Sale',
    description: 'Complete POS system with barcode scanning and receipt printing',
    tier: 'standard'
  },
  inventory: {
    name: 'Inventory Management',
    description: 'Track stock levels, low stock alerts, and product management',
    tier: 'standard'
  },
  basic_reports: {
    name: 'Basic Reports',
    description: 'Essential business reports and analytics',
    tier: 'standard'
  },
  customer_management: {
    name: 'Customer Management',
    description: 'Customer database and relationship management',
    tier: 'standard'
  },
  sales_orders: {
    name: 'Sales Orders',
    description: 'Create and manage sales orders and transactions',
    tier: 'standard'
  },
  basic_accounting: {
    name: 'Basic Accounting',
    description: 'Financial tracking and basic accounting features',
    tier: 'standard'
  },
  ai_insights: {
    name: 'AI Business Insights',
    description: 'AI-powered recommendations and business intelligence',
    tier: 'premium'
  },
  advanced_analytics: {
    name: 'Advanced Analytics',
    description: 'Deep business analytics with predictive insights',
    tier: 'premium'
  },
  vendor_management: {
    name: 'Vendor Management',
    description: 'Complete supplier relationship management',
    tier: 'premium'
  },
  purchase_orders: {
    name: 'Purchase Orders',
    description: 'Automated procurement and vendor workflow',
    tier: 'premium'
  },
  advanced_reporting: {
    name: 'Advanced Reporting',
    description: 'Custom reports with advanced data visualization',
    tier: 'premium'
  },
  multi_currency: {
    name: 'Multi-Currency',
    description: 'Support for multiple currencies and exchange rates',
    tier: 'premium'
  },
  custom_integrations: {
    name: 'Custom Integrations',
    description: 'API access and third-party integrations',
    tier: 'premium'
  }
};

export function getSubscriptionFeatures(tier: 'standard' | 'premium'): SubscriptionFeatures {
  const standardFeatures = {
    pos: true,
    inventory: true,
    basic_reports: true,
    customer_management: true,
    sales_orders: true,
    basic_accounting: true,
    ai_insights: false,
    advanced_analytics: false,
    vendor_management: false,
    purchase_orders: false,
    advanced_reporting: false,
    multi_currency: false,
    custom_integrations: false,
  };

  if (tier === 'premium') {
    return {
      ...standardFeatures,
      ai_insights: true,
      advanced_analytics: true,
      vendor_management: true,
      purchase_orders: true,
      advanced_reporting: true,
      multi_currency: true,
      custom_integrations: true,
    };
  }

  return standardFeatures;
}

export function hasFeatureAccess(feature: string, userTier: 'standard' | 'premium'): boolean {
  const features = getSubscriptionFeatures(userTier);
  return features[feature as keyof SubscriptionFeatures] || false;
}

export function requiresUpgrade(feature: string, userTier: 'standard' | 'premium'): boolean {
  const featureDefinition = FEATURE_DEFINITIONS[feature];
  if (!featureDefinition) return false;
  
  return featureDefinition.tier === 'premium' && userTier === 'standard';
}

export function getFeaturesByTier(tier: 'standard' | 'premium'): string[] {
  return Object.entries(FEATURE_DEFINITIONS)
    .filter(([_, definition]) => {
      if (tier === 'premium') return true;
      return definition.tier === 'standard';
    })
    .map(([key, _]) => key);
}

export function getPremiumFeatures(): string[] {
  return Object.entries(FEATURE_DEFINITIONS)
    .filter(([_, definition]) => definition.tier === 'premium')
    .map(([key, _]) => key);
}

export function getStandardFeatures(): string[] {
  return Object.entries(FEATURE_DEFINITIONS)
    .filter(([_, definition]) => definition.tier === 'standard')
    .map(([key, _]) => key);
}

export interface SubscriptionLimits {
  maxProducts: number;
  maxCustomers: number;
  maxOrders: number;
  maxUsers: number;
  storageGB: number;
  apiCallsPerMonth: number;
}

export function getSubscriptionLimits(tier: 'standard' | 'premium'): SubscriptionLimits {
  if (tier === 'premium') {
    return {
      maxProducts: -1, // unlimited
      maxCustomers: -1, // unlimited
      maxOrders: -1, // unlimited
      maxUsers: 10,
      storageGB: 100,
      apiCallsPerMonth: 50000,
    };
  }

  return {
    maxProducts: 1000,
    maxCustomers: 500,
    maxOrders: 1000,
    maxUsers: 3,
    storageGB: 5,
    apiCallsPerMonth: 5000,
  };
}

export function checkLimit(
  limitType: keyof SubscriptionLimits,
  currentUsage: number,
  userTier: 'standard' | 'premium'
): { withinLimit: boolean; limit: number; usage: number; percentage: number } {
  const limits = getSubscriptionLimits(userTier);
  const limit = limits[limitType];
  
  if (limit === -1) {
    return {
      withinLimit: true,
      limit: -1,
      usage: currentUsage,
      percentage: 0
    };
  }

  const percentage = (currentUsage / limit) * 100;
  const withinLimit = currentUsage <= limit;

  return {
    withinLimit,
    limit,
    usage: currentUsage,
    percentage
  };
}

export function getUpgradeReasons(userTier: 'standard' | 'premium'): string[] {
  if (userTier === 'premium') return [];

  return [
    'Unlock AI-powered business insights and recommendations',
    'Access advanced analytics and reporting tools',
    'Manage vendors and automate purchase orders',
    'Remove limits on products, customers, and orders',
    'Get priority customer support',
    'Use multi-currency features for global business',
    'Access to API and custom integrations'
  ];
}

export function formatSubscriptionPrice(tier: 'standard' | 'premium'): string {
  const prices = {
    standard: { monthly: 0, annual: 0 },
    premium: { monthly: 29, annual: 290 }
  };

  const price = prices[tier];
  
  if (price.monthly === 0) {
    return 'Free';
  }

  return `$${price.monthly}/month`;
}

export function getTrialInfo(userTier: 'standard' | 'premium'): { 
  inTrial: boolean; 
  daysRemaining: number; 
  trialEnd: Date | null 
} {
  // This would be implemented based on actual subscription data
  // For now, return default values
  return {
    inTrial: false,
    daysRemaining: 0,
    trialEnd: null
  };
}

export function getSubscriptionStatus(userTier: 'standard' | 'premium'): {
  isActive: boolean;
  status: 'active' | 'inactive' | 'trial' | 'cancelled';
  nextBillingDate: Date | null;
  cancelAtPeriodEnd: boolean;
} {
  // This would be implemented based on actual Stripe subscription data
  // For now, return default active status
  return {
    isActive: true,
    status: 'active',
    nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    cancelAtPeriodEnd: false
  };
}

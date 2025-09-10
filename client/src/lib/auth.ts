import { User } from "@/types/auth";

export const AUTH_STORAGE_KEY = "nexus_auth";

export function getStoredAuth(): { user: User | null; token: string | null } {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error parsing stored auth:", error);
  }
  return { user: null, token: null };
}

export function setStoredAuth(user: User | null, token: string | null) {
  try {
    if (user && token) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token }));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch (error) {
    console.error("Error storing auth:", error);
  }
}

export function clearStoredAuth() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

export function hasValidSession(): boolean {
  const { user, token } = getStoredAuth();
  return !!(user && token);
}

export function getUserRole(): string | null {
  const { user } = getStoredAuth();
  return user?.role || null;
}

export function getSubscriptionTier(): string | null {
  const { user } = getStoredAuth();
  return user?.subscriptionTier || null;
}

export function canAccessFeature(feature: string): boolean {
  const tier = getSubscriptionTier();
  const role = getUserRole();
  
  if (!tier || !role) return false;

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

  // Admin can access all features regardless of tier
  if (role === 'admin') {
    return premiumFeatures.includes(feature);
  }

  // Check tier-based access
  if (tier === 'premium') {
    return premiumFeatures.includes(feature);
  }

  return standardFeatures.includes(feature);
}

export function requiresUpgrade(feature: string): boolean {
  const tier = getSubscriptionTier();
  return tier === 'standard' && !canAccessFeature(feature);
}

export function getRolePermissions(role: string): string[] {
  const permissions = {
    admin: ['all'],
    manager: ['view_all', 'edit_all', 'delete_some'],
    sales: ['view_customers', 'create_orders', 'view_products'],
    cashier: ['pos_only', 'view_products'],
    vendor: ['view_own_orders', 'confirm_orders']
  };

  return permissions[role as keyof typeof permissions] || [];
}

export function hasPermission(permission: string): boolean {
  const role = getUserRole();
  if (!role) return false;

  const permissions = getRolePermissions(role);
  return permissions.includes('all') || permissions.includes(permission);
}

export function isAuthenticated(): boolean {
  return hasValidSession();
}

export function getAuthHeaders(): Record<string, string> {
  const { token } = getStoredAuth();
  if (token) {
    return {
      'Authorization': `Bearer ${token}`
    };
  }
  return {};
}

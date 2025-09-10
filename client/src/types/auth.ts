export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'sales' | 'vendor' | 'cashier';
  subscriptionTier: 'standard' | 'premium';
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: string;
}

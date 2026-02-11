import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { router } from 'expo-router';
import { storage, StoredUser } from '@/lib/storage';
import { apiClient } from '@/lib/api-client';
import { loginWithGoogle, loginWithAzureAD } from '@/lib/auth/oauth';

export type { StoredUser };

interface AuthContextType {
  user: StoredUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOAuth: (provider: 'google' | 'azure' | 'apple') => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  updateUser: (userData: StoredUser) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<StoredUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  // When API client gives up after 401 (e.g. refresh failed), clear auth state and send user to sign-in
  useEffect(() => {
    apiClient.setSessionExpiredHandler(() => {
      setUser(null);
      router.replace('/screens/sign-in');
    });
    return () => apiClient.setSessionExpiredHandler(null);
  }, []);

  const loadUser = async () => {
    try {
      const storedUser = await storage.getUser();
      const accessToken = await storage.getAccessToken();

      if (storedUser && accessToken) {
        setUser(storedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = await storage.getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const response = await apiClient.refreshToken(refreshToken);
      await storage.setAccessToken(response.access_token);
      await storage.setRefreshToken(response.refresh_token);

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await storage.clearAll();
      setUser(null);
      return false;
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await apiClient.login(email, password);

      await storage.setAccessToken(response.access_token);
      await storage.setRefreshToken(response.refresh_token);
      await storage.setUser(response.user);

      setUser(response.user);
      router.replace('/');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, []);

  const loginWithOAuth = useCallback(async (provider: 'google' | 'azure' | 'apple') => {
    try {
      let oauthInfo: any;
      if (provider === 'google' || provider === 'azure') {
        oauthInfo = provider === 'google' ? await loginWithGoogle() : await loginWithAzureAD();
        // Backend proxy already returns tokens, use them directly
        if ((oauthInfo as any).accessToken && (oauthInfo as any).refreshToken) {
          await storage.setAccessToken((oauthInfo as any).accessToken);
          await storage.setRefreshToken((oauthInfo as any).refreshToken);
          await storage.setUser((oauthInfo as any).user);
          setUser((oauthInfo as any).user);

          router.replace('/');
          return;
        }
      } else {
        throw new Error(`Provider ${provider} not supported yet`);
      }

      // For Azure (and fallback for Google), use the old flow
      const response = await apiClient.loginWithOAuth(oauthInfo);

      await storage.setAccessToken(response.access_token);
      await storage.setRefreshToken(response.refresh_token);
      await storage.setUser(response.user);

      setUser(response.user);

      router.replace('/');
    } catch (error: any) {
      console.error(`OAuth login with ${provider} failed:`, error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      await storage.clearAll();
      setUser(null);
      router.replace('/screens/sign-in');
    }
  }, []);

  const updateUser = useCallback(async (userData: StoredUser) => {
    await storage.setUser(userData);
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithOAuth,
        logout,
        refreshAccessToken,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

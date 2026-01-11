import React, { createContext, useContext, useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from './AuthContext';

interface GuardContextType {
  // We can add state or functions here if needed in the future
  // e.g., setRequiresAuth(false) for specific dynamic cases
}

const GuardContext = createContext<GuardContextType | undefined>(undefined);

// Define routes that do NOT require authentication
const PUBLIC_ROUTES = [
  'screens/sign-in',
  'onboarding',
  'splash',
];

export const GuardProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Convert segments array to a path string (e.g., ['screens', 'sign-in'] -> 'screens/sign-in')
    const currentPath = segments.join('/');

    // Check if the current route is in the public routes list
    const isPublicRoute = PUBLIC_ROUTES.some(route => currentPath === route);

    // Check if it's the root path (index)
    const isRoot = currentPath === '';

    if (!isAuthenticated && !isPublicRoute && !isRoot) {
      // If not authenticated and trying to access a private route, redirect to sign-in
      // Note: index path is handled separately or can be added to PUBLIC_ROUTES if desired,
      // but usually the index is the main entry point we want to protect.
      router.replace('/screens/sign-in');
    } else if (!isAuthenticated && isRoot) {
      // If landing on index and not authenticated, redirect to sign-in
      router.replace('/screens/sign-in');
    } else if (isAuthenticated && isPublicRoute) {
      // If authenticated and trying to access a public route (like sign-in), redirect to home
      router.replace('/');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  return (
    <GuardContext.Provider value={{}}>
      {children}
    </GuardContext.Provider>
  );
};

export const useGuard = () => {
  const context = useContext(GuardContext);
  if (context === undefined) {
    throw new Error('useGuard must be used within a GuardProvider');
  }
  return context;
};


import React from 'react';
import { NovuProvider } from '@novu/react-native';
import { useAuth } from '@/contexts/AuthContext';

const NOVU_APP_ID = process.env.EXPO_PUBLIC_NOVU_APPLICATION_IDENTIFIER || '';

/**
 * Whether Novu is configured via environment variables.
 * Use this to conditionally render Novu-dependent components.
 */
export const novuConfigured = !!NOVU_APP_ID;

/**
 * Wraps children with NovuProvider when the user is authenticated
 * and Novu is configured. Falls back to rendering children without
 * the provider if anything is missing.
 *
 * Usage: wrap only the specific component subtree that uses Novu hooks,
 * NOT the entire app tree (to avoid white-screen issues on init).
 */
export function NovuSafeProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();

  if (!novuConfigured || !isAuthenticated || !user?.id) {
    return <>{children}</>;
  }

  return (
    <NovuProvider
      subscriber={String(user.id)}
      applicationIdentifier={NOVU_APP_ID}
    >
      {children}
    </NovuProvider>
  );
}

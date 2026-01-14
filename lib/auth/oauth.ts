import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { Platform, Alert, AppState } from 'react-native';
import { apiClient } from '../api-client';

// Lazy load GoogleSignin to prevent issues on non-native environments
let GoogleSignin: any = null;

export interface OAuthUserInfo {
  email: string;
  name: string;
  provider: 'google' | 'azure' | 'apple';
  providerId: string;
  avatarUrl?: string;
}

/**
 * Get redirect URI for OAuth callbacks
 */
function getRedirectUri(): string {
  // Using the app's custom scheme from app.json (should match expo.scheme)
  const schemeConfig = Constants.expoConfig?.scheme;
  const scheme = typeof schemeConfig === 'string' ? schemeConfig : (Array.isArray(schemeConfig) ? schemeConfig[0] : 'skyai');
  const redirectUri = AuthSession.makeRedirectUri({
    scheme,
    path: 'oauth-callback',
  });
  return redirectUri;
}

/**
 * Base64 encode a byte array for PKCE
 */
function base64EncodeBytes(bytes: Uint8Array): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;

  while (i < bytes.length) {
    const a = bytes[i++];
    const b = i < bytes.length ? bytes[i++] : 0;
    const c = i < bytes.length ? bytes[i++] : 0;

    const bitmap = (a << 16) | (b << 8) | c;

    result += chars.charAt((bitmap >> 18) & 63);
    result += chars.charAt((bitmap >> 12) & 63);
    result += (i - 2 < bytes.length ? chars.charAt((bitmap >> 6) & 63) : '=');
    result += (i - 1 < bytes.length ? chars.charAt(bitmap & 63) : '=');
  }

  return result;
}

/**
 * Generate PKCE code verifier and challenge
 */
async function generatePKCE(): Promise<{ codeVerifier: string; codeChallenge: string }> {
  const randomBytes = await Crypto.getRandomBytesAsync(43);
  const base64 = base64EncodeBytes(randomBytes);
  const codeVerifier = base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const codeChallengeHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    codeVerifier,
    { encoding: Crypto.CryptoEncoding.BASE64 }
  );

  const codeChallenge = codeChallengeHash
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return { codeVerifier, codeChallenge };
}

/**
 * Google OAuth login using backend proxy (since Expo's auth proxy is deprecated and custom schemes don't work)
 * Flow: 1. Get auth URL from backend, 2. Open in browser, 3. User enters code displayed on callback page, 4. Exchange code for tokens
 */
export async function loginWithGoogle(): Promise<OAuthUserInfo> {
  try {
    const appScheme = Constants.expoConfig?.scheme || 'skyai';

    // Step 1: Get OAuth URL from backend
    console.log('[Google OAuth] Requesting OAuth URL from backend...');
    const schemeParam = typeof appScheme === 'string' ? appScheme : String(appScheme);
    const response = await apiClient.get<{ auth_url: string; state: string }>(
      `/auth/oauth/google/initiate?app_scheme=${encodeURIComponent(schemeParam)}`
    );
    const auth_url = typeof response === 'object' && 'auth_url' in response ? response.auth_url : (response as any).auth_url;
    const state = typeof response === 'object' && 'state' in response ? response.state : (response as any).state;

    // Extract callback URL from auth_url to show user what needs to be configured
    try {
      const urlObj = new URL(auth_url);
      const redirectUriParam = urlObj.searchParams.get('redirect_uri');
      if (redirectUriParam) {
        console.log('[Google OAuth] IMPORTANT: Backend callback URL is:', redirectUriParam);
        console.log('[Google OAuth] Make sure this EXACT URL is configured in Google Cloud Console as an authorized redirect URI');
      }
    } catch (e) {
      // Ignore URL parsing errors
    }

    // Step 2: Open OAuth URL in browser (don't wait for it to complete)
    // Step 3: Poll backend with state to check if authentication completed
    const callbackUrl = `${appScheme}://oauth/callback`;
    console.log('[Google OAuth] Opening OAuth URL in browser...');
    console.log('[Google OAuth] Auth URL:', auth_url.substring(0, 100) + '...');
    console.log('[Google OAuth] Callback URL:', callbackUrl);
    console.log('[Google OAuth] State:', state?.substring(0, 20) + '...');

    // Open browser in background - don't wait for it to complete
    // Instead, poll the backend to check if authentication completed
    WebBrowser.openAuthSessionAsync(auth_url, callbackUrl).catch((error) => {
      console.warn('[Google OAuth] Browser session error (ignoring for polling):', error);
    });

    // Step 3: Poll backend with state to check if authentication completed
    // This is much better UX - no manual code entry needed!
    console.log('[Google OAuth] Starting polling for authentication status...');

    const pollInterval = 1000; // Poll every 1 second
    const maxPollTime = 120000; // Maximum 2 minutes
    const startTime = Date.now();

    let tokenData: {
      access_token: string;
      refresh_token: string;
      token_type: string;
      user: { id: string; email: string; full_name: string; is_active: boolean };
    } | null = null;

    while (!tokenData && (Date.now() - startTime) < maxPollTime) {
      try {
        const statusResponse = await apiClient.get<{
          status: 'pending' | 'completed';
          tokens?: {
            access_token: string;
            refresh_token: string;
            token_type: string;
            user: { id: string; email: string; full_name: string; is_active: boolean };
          } | null;
        }>(`/auth/oauth/google/status?state=${encodeURIComponent(state)}`);

        if (statusResponse.status === 'completed' && statusResponse.tokens) {
          tokenData = statusResponse.tokens;
          console.log('[Google OAuth] Authentication completed!');
          break;
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error: any) {
        // Log error but continue polling (might be temporary)
        console.warn('[Google OAuth] Poll error (continuing):', error.message);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }

    if (!tokenData) {
      throw new Error('OAuth authentication timed out. Please try again.');
    }

    // Return tokens directly (backend already created/logged in user)
    return {
      email: tokenData.user.email,
      name: tokenData.user.full_name,
      provider: 'google' as const,
      providerId: tokenData.user.id,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      user: tokenData.user,
    } as any;
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

/**
 * Azure AD OAuth login using backend proxy (matches Google OAuth architecture)
 * This avoids iOS deep linking issues with passkeys/MFA
 */
export async function loginWithAzureAD(): Promise<OAuthUserInfo> {
  try {
    const appScheme = Constants.expoConfig?.scheme || 'skyai';

    // Step 1: Get OAuth URL from backend
    console.log('[Azure OAuth] Requesting OAuth URL from backend...');
    const schemeParam = typeof appScheme === 'string' ? appScheme : String(appScheme);
    const response = await apiClient.get<{ auth_url: string; state: string }>(
      `/auth/oauth/azure/initiate?app_scheme=${encodeURIComponent(schemeParam)}`
    );
    const { auth_url, state } = response;

    // Step 2: Open OAuth URL in browser (don't wait for it to complete)
    console.log('[Azure OAuth] Opening OAuth URL in browser...');
    const callbackUrl = `${appScheme}://oauth/callback`;

    // We use openAuthSessionAsync but we don't rely on it returning the URL
    // since we'll be polling the backend instead. This works better on iOS.
    WebBrowser.openAuthSessionAsync(auth_url, callbackUrl).catch((error) => {
      console.warn('[Azure OAuth] Browser session error (ignoring for polling):', error);
    });

    // Step 3: Poll backend with state to check if authentication completed
    console.log('[Azure OAuth] Starting polling for authentication status...');

    const pollInterval = 1000; // Poll every 1 second
    const maxPollTime = 120000; // Maximum 2 minutes
    const startTime = Date.now();

    let tokenData: {
      access_token: string;
      refresh_token: string;
      token_type: string;
      user: { id: string; email: string; full_name: string; is_active: boolean };
    } | null = null;

    while (!tokenData && (Date.now() - startTime) < maxPollTime) {
      try {
        const statusResponse = await apiClient.get<{
          status: 'pending' | 'completed';
          tokens?: {
            access_token: string;
            refresh_token: string;
            token_type: string;
            user: { id: string; email: string; full_name: string; is_active: boolean };
          } | null;
        }>(`/auth/oauth/azure/status?state=${encodeURIComponent(state)}`);

        if (statusResponse.status === 'completed' && statusResponse.tokens) {
          tokenData = statusResponse.tokens;
          console.log('[Azure OAuth] Authentication completed!');
          break;
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error: any) {
        // Log error but continue polling (might be temporary)
        console.warn('[Azure OAuth] Poll error (continuing):', error.message);
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }

    if (!tokenData) {
      throw new Error('Azure AD authentication timed out. Please try again.');
    }

    // Return tokens directly (backend already created/logged in user)
    return {
      email: tokenData.user.email,
      name: tokenData.user.full_name,
      provider: 'azure' as const,
      providerId: tokenData.user.id,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      user: tokenData.user,
    } as any;
  } catch (error: any) {
    console.error('Azure AD sign-in error:', error);
    throw error;
  }
}



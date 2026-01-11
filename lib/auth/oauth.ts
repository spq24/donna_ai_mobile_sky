import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
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
  // Using the app's custom scheme from app.json
  const scheme = 'donnaai';
  return AuthSession.makeRedirectUri({
    scheme,
    path: 'oauth-callback',
  });
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
 * Azure AD OAuth login using expo-auth-session
 */
export async function loginWithAzureAD(): Promise<OAuthUserInfo> {
  try {
    const azureClientId = process.env.EXPO_PUBLIC_AZURE_CLIENT_ID;
    const azureTenantId = process.env.EXPO_PUBLIC_AZURE_TENANT_ID || 'common';

    if (!azureClientId) {
      throw new Error('Azure AD client ID not configured');
    }

    const discovery = await AuthSession.fetchDiscoveryAsync(
      `https://login.microsoftonline.com/${azureTenantId}/v2.0`
    );

    const redirectUri = getRedirectUri();
    const { codeVerifier, codeChallenge } = await generatePKCE();

    const params = new URLSearchParams({
      client_id: azureClientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email User.Read',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    });

    const authUrl = `${discovery.authorizationEndpoint}?${params.toString()}`;
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type !== 'success') {
      throw new Error(`Azure AD sign-in failed: ${result.type}`);
    }

    const parsedUrl = Linking.parse(result.url);
    const code = parsedUrl.queryParams?.code as string | undefined;

    if (!code) {
      throw new Error('No authorization code received from Azure AD');
    }

    const tokenResponse = await fetch(discovery.tokenEndpoint!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: azureClientId,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }).toString(),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange authorization code for tokens');
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch user info from Microsoft Graph');
    }

    const azureUserInfo = await userInfoResponse.json();

    return {
      email: azureUserInfo.mail || azureUserInfo.userPrincipalName,
      name: azureUserInfo.displayName || '',
      provider: 'azure',
      providerId: azureUserInfo.id,
    };
  } catch (error: any) {
    console.error('Azure AD OAuth error:', error);
    throw error;
  }
}


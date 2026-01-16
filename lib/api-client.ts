import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { storage, StoredUser } from './storage';
import { VendorSearchResponse } from '../types/vendor';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

// #region agent log
const DEBUG_ENDPOINT = 'http://127.0.0.1:7242/ingest/2b64901b-60f5-4542-95e5-c353760fc3c6';
const debugLog = (location: string, message: string, data: any, hypothesisId: string) => {
  fetch(DEBUG_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ location, message, data, hypothesisId, timestamp: Date.now(), sessionId: 'debug-session' })
  }).catch(() => {});
};
// #endregion

// #region agent log - Hypothesis D: Log the actual base URL being used
debugLog('api-client.ts:INIT', 'API_BASE_URL value', {
  envValue: process.env.EXPO_PUBLIC_API_URL,
  finalValue: API_BASE_URL
}, 'D');
// #endregion

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: StoredUser;
}

interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor() {
    // #region agent log - Hypothesis A, D: Log full baseURL construction
    const fullBaseURL = `${API_BASE_URL}/api/v1`;
    debugLog('api-client.ts:constructor', 'Creating axios client', {
      API_BASE_URL,
      fullBaseURL,
      hasHttps: fullBaseURL.startsWith('https'),
      hasHttp: fullBaseURL.startsWith('http://')
    }, 'A,D');
    // #endregion

    this.client = axios.create({
      baseURL: fullBaseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        // #region agent log - Hypothesis F: Add ngrok bypass header
        'ngrok-skip-browser-warning': 'true',
        // #endregion
      },
    });

    // Request interceptor to add access token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const accessToken = await storage.getAccessToken();
        // #region agent log - Hypothesis A, D: Log full request URL
        debugLog('api-client.ts:request-interceptor', 'Outgoing request', {
          method: config.method,
          baseURL: config.baseURL,
          url: config.url,
          fullURL: `${config.baseURL}${config.url}`,
          hasToken: !!accessToken
        }, 'A,D');
        // #endregion
        if (accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for automatic token refresh
    this.client.interceptors.response.use(
      (response) => {
        // #region agent log - Hypothesis B, C: Log successful responses and 307s
        if (response.status === 307) {
          debugLog('api-client.ts:response-307', 'Got 307 redirect', {
            requestURL: response.config.url,
            requestMethod: response.config.method,
            locationHeader: response.headers?.location
          }, 'B,C');
        }
        // #endregion
        return response;
      },
      async (error) => {
        // #region agent log - Hypothesis B, C: Log error responses
        debugLog('api-client.ts:response-error', 'Response error', {
          status: error.response?.status,
          requestURL: error.config?.url,
          requestMethod: error.config?.method,
          locationHeader: error.response?.headers?.location,
          errorMessage: error.message
        }, 'B,C');
        // #endregion
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Don't try to refresh tokens for auth endpoints (login, oauth, refresh)
        const authEndpoints = ['/auth/login', '/auth/oauth/login', '/auth/refresh'];
        const isAuthEndpoint = authEndpoints.some(endpoint => originalRequest.url?.includes(endpoint));

        // Handle 401 or 403 errors with token refresh (but not for auth endpoints)
        // Backend returns 403 for "Could not validate credentials" JWT errors
        const shouldRefresh = (error.response?.status === 401 || error.response?.status === 403);
        if (shouldRefresh && !originalRequest._retry && !isAuthEndpoint) {
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.client(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await storage.getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            // Using direct axios call for refresh to avoid interceptor loop
            const response = await axios.post<RefreshTokenResponse>(
              `${API_BASE_URL}/api/v1/auth/refresh`,
              {
                refresh_token: refreshToken,
              }
            );

            const { access_token, refresh_token } = response.data;
            await storage.setAccessToken(access_token);
            await storage.setRefreshToken(refresh_token);

            // Process queued requests
            this.processQueue(null, access_token);

            // Update original request and retry
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed - clear storage and process queue with error
            await storage.clearAll();
            this.processQueue(refreshError, null);
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any, token: string | null) {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    this.failedQueue = [];
  }

  // Auth methods
  async login(email: string, password: string): Promise<LoginResponse> {
    // Keys are already in snake_case as per API requirements
    const response = await this.client.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async loginWithOAuth(userInfo: {
    email: string;
    name: string;
    provider: 'google' | 'azure' | 'apple';
    providerId: string;
    avatarUrl?: string;
  }): Promise<LoginResponse> {
    // Convert camelCase keys to snake_case for API request data
    const requestData = {
      user_info: {
        email: userInfo.email,
        name: userInfo.name,
        provider: userInfo.provider,
        provider_id: userInfo.providerId,
        avatar_url: userInfo.avatarUrl,
      },
    };
    const response = await this.client.post<LoginResponse>('/auth/oauth/login', requestData);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await axios.post<RefreshTokenResponse>(
      `${API_BASE_URL}/api/v1/auth/refresh`,
      {
        refresh_token: refreshToken,
      }
    );
    return response.data;
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      // Even if logout fails, we still want to clear local storage
      console.error('Logout API call failed:', error);
    }
  }

  async getCurrentUser(): Promise<StoredUser> {
    const response = await this.client.get<StoredUser>('/users/me');
    return response.data;
  }

  // Generic HTTP methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Conversation methods
  // #region agent log - Hypothesis G: Use trailing slashes to avoid FastAPI 307 redirects
  async createConversation(data: { message: string }) {
    debugLog('api-client.ts:createConversation', 'Creating conversation', { data }, 'G');
    return this.post('/conversations/', data);
  }

  async sendMessage(conversationId: string, data: { message: string }) {
    debugLog('api-client.ts:sendMessage', 'Sending message', { conversationId, data }, 'G');
    // Note: Backend defines endpoint WITHOUT trailing slash
    return this.post(`/conversations/${conversationId}/messages`, data);
  }
  // #endregion

  // Scheduling methods
  async getSchedulingTask(id: string) {
    return this.get(`/scheduling/tasks/${id}`);
  }

  async updateSchedulingTask(id: string, data: any) {
    // Convert camelCase to snake_case if necessary (handled by the caller or here)
    return this.put(`/scheduling/tasks/${id}`, data);
  }

  async searchVendors(params: {
    query: string;
    page?: number;
    size?: number;
  }): Promise<VendorSearchResponse> {
    return this.get('/vendors/search', {
      params: {
        query: params.query,
        page: params.page,
        size: params.size,
      },
    });
  }
}

export const apiClient = new ApiClient();


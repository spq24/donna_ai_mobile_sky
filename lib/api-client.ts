import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { storage, StoredUser } from './storage';
import { VendorSearchResponse } from '../types/vendor';
import { GenerativeUIComponent } from '../types/generative-ui';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

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

// Agentic conversation response types
interface AgenticConversationResponse {
  conversation_id: string;
  response: string;
  router_decision?: {
    worker: string;
    confidence: number;
    reasoning: string;
  };
  tool_calls?: Array<{
    tool_name: string;
    success: boolean;
    result?: any;
    error?: string;
  }>;
  ui_components?: GenerativeUIComponent[];
}

interface AgenticMessageResponse {
  message_id?: string;
  response: string;
  router_decision?: {
    worker: string;
    confidence: number;
    reasoning: string;
  };
  tool_calls?: Array<{
    tool_name: string;
    success: boolean;
    result?: any;
    error?: string;
  }>;
  ui_components?: GenerativeUIComponent[];
}

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        // Required for ngrok tunnels to bypass browser warning page
        'ngrok-skip-browser-warning': 'true',
      },
    });

    // Request interceptor to add access token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const accessToken = await storage.getAccessToken();
        if (accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for automatic token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
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

  // Conversation methods (legacy)
  async createConversation(data: { message: string }) {
    return this.post('/conversations/', data);
  }

  async sendMessage(conversationId: string, data: { message: string }) {
    return this.post(`/conversations/${conversationId}/messages`, data);
  }

  // Agentic conversation methods (with UI components support)
  async createAgenticConversation(data: { message: string }): Promise<AgenticConversationResponse> {
    return this.post<AgenticConversationResponse>('/agentic/', data);
  }

  async sendAgenticMessage(
    conversationId: string,
    data: { message: string }
  ): Promise<AgenticMessageResponse> {
    return this.post<AgenticMessageResponse>(`/agentic/${conversationId}/messages`, data);
  }

  async getAgenticConversationHistory(conversationId: string) {
    return this.get(`/agentic/${conversationId}`);
  }

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

  // Task Management methods
  async getTasks(params?: {
    skip?: number;
    limit?: number;
    status?: string;
    priority?: string;
    assignee_type?: string;
    intent?: string;
  }) {
    return this.get('/tasks/', { params });
  }

  async getTask(id: number) {
    return this.get(`/tasks/${id}`);
  }

  async createTask(data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    assignee_type?: string;
    assignee_user_id?: number;
    due_date?: string;
    original_query?: string;
    intent?: string;
    intent_metadata?: any;
    task_metadata?: any;
  }) {
    return this.post('/tasks/', data);
  }

  async updateTask(id: number, data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    assignee_type?: string;
    assignee_user_id?: number;
    due_date?: string;
    intent?: string;
    intent_confidence?: number;
    intent_metadata?: any;
    task_metadata?: any;
    failure_reason?: string;
    completed_at?: string;
  }) {
    return this.put(`/tasks/${id}`, data);
  }

  async deleteTask(id: number) {
    return this.delete(`/tasks/${id}`);
  }

  async completeTask(id: number) {
    return this.post(`/tasks/${id}/complete`);
  }

  async cancelTask(id: number) {
    return this.post(`/tasks/${id}/cancel`);
  }

  async assignTaskToUser(taskId: number, userId: number) {
    return this.post(`/tasks/${taskId}/assign/user/${userId}`);
  }

  async assignTaskToAI(taskId: number) {
    return this.post(`/tasks/${taskId}/assign/ai`);
  }

  async getActionItems(params?: { skip?: number; limit?: number }) {
    return this.get('/tasks/action-items', { params });
  }

  async getAssignedTasks(params?: { skip?: number; limit?: number }) {
    return this.get('/tasks/assigned', { params });
  }

  async getOverdueTasks(params?: { skip?: number; limit?: number }) {
    return this.get('/tasks/overdue', { params });
  }

  async getAvailableUsers() {
    return this.get('/contacts/available-users/association');
  }

  // Account methods
  accounts = {
    getUsersForMentions: () => this.get('/accounts/users/for-mentions'),
  };

  // Comment methods
  async getComments(params: {
    commentable_type: string;
    commentable_id: number;
    include_replies?: boolean;
    skip?: number;
    limit?: number;
  }) {
    return this.get('/comments/', { params });
  }

  async getComment(commentId: string) {
    return this.get(`/comments/${commentId}`);
  }

  async createComment(data: {
    content: string;
    commentable_type: string;
    commentable_id: number;
    parent_comment_id?: string;
    mentioned_user_ids?: number[];
  }) {
    return this.post('/comments/', data);
  }

  async updateComment(commentId: string, data: { content: string; mentioned_user_ids?: number[] }) {
    return this.put(`/comments/${commentId}`, data);
  }

  async deleteComment(commentId: string) {
    return this.delete(`/comments/${commentId}`);
  }

  // Tag methods
  async getTags(params?: { skip?: number; limit?: number; search?: string }) {
    return this.get('/tags/', { params });
  }

  async createTag(data: { name: string }) {
    return this.post('/tags/', data);
  }

  async deleteTag(tagId: number) {
    return this.delete(`/tags/${tagId}`);
  }

  async getTaskTags(taskId: number) {
    return this.get(`/tags/tasks/${taskId}`);
  }

  async addTagToTaskByName(taskId: number, tagName: string) {
    return this.post(`/tags/tasks/${taskId}/by-name`, { tag_name: tagName });
  }

  async removeTagFromTask(taskId: number, tagId: number) {
    return this.delete(`/tags/tasks/${taskId}/${tagId}`);
  }
}

export const apiClient = new ApiClient();


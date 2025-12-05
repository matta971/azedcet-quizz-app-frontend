import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { config } from '../config';
import { syncStorage } from '../utils/storage';
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  MatchResponse,
  CreateMatchRequest,
  PageResponse,
  TeamSide,
  SmashQuestionOption,
  UpdateProfileRequest,
  UserInfo,
  LanguageOption,
} from '../types';

class ApiService {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (reqConfig: InternalAxiosRequestConfig) => {
        const token = syncStorage.getString(config.storage.accessTokenKey);
        if (token && reqConfig.headers) {
          reqConfig.headers.Authorization = `Bearer ${token}`;
        }
        return reqConfig;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = syncStorage.getString(config.storage.refreshTokenKey);
            if (refreshToken) {
              const response = await this.refreshToken({ refreshToken });
              if (response.success && response.data) {
                syncStorage.setString(config.storage.accessTokenKey, response.data.accessToken);
                syncStorage.setString(config.storage.refreshTokenKey, response.data.refreshToken);

                this.refreshSubscribers.forEach((callback) => callback(response.data!.accessToken));
                this.refreshSubscribers = [];

                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
                }
                return this.client(originalRequest);
              }
            }
          } catch (refreshError) {
            // Refresh failed, clear tokens
            syncStorage.remove(config.storage.accessTokenKey);
            syncStorage.remove(config.storage.refreshTokenKey);
            syncStorage.remove(config.storage.userKey);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(data: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/api/auth/register', data);
    return response.data;
  }

  async login(data: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/api/auth/login', data);
    return response.data;
  }

  async refreshToken(data: RefreshTokenRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/api/auth/refresh', data);
    return response.data;
  }

  // Match endpoints
  async getWaitingMatches(page = 0, size = 20): Promise<ApiResponse<PageResponse<MatchResponse>>> {
    const response = await this.client.get<ApiResponse<PageResponse<MatchResponse>>>('/api/matches', {
      params: { page, size },
    });
    return response.data;
  }

  async getMatch(id: string): Promise<ApiResponse<MatchResponse>> {
    const response = await this.client.get<ApiResponse<MatchResponse>>(`/api/matches/${id}`);
    return response.data;
  }

  async getMatchByCode(code: string): Promise<ApiResponse<MatchResponse>> {
    const response = await this.client.get<ApiResponse<MatchResponse>>(`/api/matches/code/${code}`);
    return response.data;
  }

  async createMatch(data: CreateMatchRequest): Promise<ApiResponse<MatchResponse>> {
    const response = await this.client.post<ApiResponse<MatchResponse>>('/api/matches', data);
    return response.data;
  }

  async joinMatch(matchId: string, preferredSide?: TeamSide): Promise<ApiResponse<MatchResponse>> {
    const response = await this.client.post<ApiResponse<MatchResponse>>(
      `/api/matches/${matchId}/join`,
      preferredSide ? { team: preferredSide } : {}
    );
    return response.data;
  }

  async joinMatchByCode(code: string, preferredSide?: TeamSide): Promise<ApiResponse<MatchResponse>> {
    const response = await this.client.post<ApiResponse<MatchResponse>>(
      `/api/matches/code/${code}/join`,
      preferredSide ? { team: preferredSide } : {}
    );
    return response.data;
  }

  async leaveMatch(matchId: string): Promise<ApiResponse<MatchResponse>> {
    const response = await this.client.post<ApiResponse<MatchResponse>>(`/api/matches/${matchId}/leave`);
    return response.data;
  }

  async startMatch(matchId: string): Promise<ApiResponse<MatchResponse>> {
    const response = await this.client.post<ApiResponse<MatchResponse>>(`/api/matches/${matchId}/start`);
    return response.data;
  }

  // Question endpoints
  async getRandomSmashQuestions(count = 10, roundType?: 'SMASH_A' | 'SMASH_B'): Promise<ApiResponse<SmashQuestionOption[]>> {
    const response = await this.client.get<ApiResponse<SmashQuestionOption[]>>('/api/questions/smash/random', {
      params: { count, roundType },
    });
    return response.data;
  }

  // User endpoints
  async getCurrentUser(): Promise<ApiResponse<UserInfo>> {
    const response = await this.client.get<ApiResponse<UserInfo>>('/api/users/me');
    return response.data;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<UserInfo>> {
    const response = await this.client.put<ApiResponse<UserInfo>>('/api/users/me', data);
    return response.data;
  }

  async getAvailableLanguages(): Promise<ApiResponse<LanguageOption[]>> {
    const response = await this.client.get<ApiResponse<LanguageOption[]>>('/api/users/languages');
    return response.data;
  }
}

export const apiService = new ApiService();

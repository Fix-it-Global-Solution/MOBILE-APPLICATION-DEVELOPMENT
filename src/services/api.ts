import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const STORAGE_KEYS = {
  TOKEN: '@FixIt:token',
  USER: '@FixIt:user',
  OCORRENCIAS: '@FixIt:ocorrencias',
  REGISTERED_USERS: '@FixIt:registered_users',
};

export const ANDROID_EMULATOR_HOST = 'http://10.0.2.2:8080';
export const LOCALHOST_HOST = 'http://localhost:8080';

export const DEFAULT_HOST =
  Platform.OS === 'android' ? ANDROID_EMULATOR_HOST : LOCALHOST_HOST;
export const ALTERNATE_HOST =
  Platform.OS === 'android' ? LOCALHOST_HOST : ANDROID_EMULATOR_HOST;

export const BASE_URL = `${DEFAULT_HOST}/api/v1`;
export const ALTERNATE_BASE_URL = `${ALTERNATE_HOST}/api/v1`;
export const API_BASE_URL = BASE_URL;

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retriedAlternateHost?: boolean;
}

type UnauthorizedCallback = () => void | Promise<void>;
let unauthorizedHandler: UnauthorizedCallback | null = null;

export function registerUnauthorizedHandler(
  callback: UnauthorizedCallback | null
): void {
  unauthorizedHandler = callback;
}

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 4500,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export function setAxiosAuthToken(token: string | null): void {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {}
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as RetryableRequestConfig | undefined;

    if (
      !error.response &&
      originalConfig &&
      !originalConfig._retriedAlternateHost
    ) {
      originalConfig._retriedAlternateHost = true;
      originalConfig.baseURL =
        originalConfig.baseURL === BASE_URL ? ALTERNATE_BASE_URL : BASE_URL;
      try {
        return await api.request(originalConfig);
      } catch (retryError) {
        error = retryError as AxiosError;
      }
    }

    const status = error.response?.status;
    const requestUrl = originalConfig?.url || '';
    const isAuthLoginOrRegister =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/registrar');

    if ((status === 401 || status === 403) && !isAuthLoginOrRegister) {
      setAxiosAuthToken(null);
      try {
        await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
      } catch {}
      if (unauthorizedHandler) {
        await unauthorizedHandler();
      }
    }

    return Promise.reject(error);
  }
);

export default api;

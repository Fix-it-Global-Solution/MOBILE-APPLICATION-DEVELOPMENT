import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const STORAGE_KEYS = {
  TOKEN: '@FixIt:token',
  USER: '@FixIt:user',
  OCORRENCIAS: '@FixIt:ocorrencias',
  REGISTERED_USERS: '@FixIt:registered_users',
};

/**
 * Emulador Android usa 10.0.2.2 para acessar o localhost da máquina host (API Java Spring Boot na porta 8080).
 * iOS Simulator e Web utilizam localhost:8080 diretamente.
 */
const DEFAULT_HOST = Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
export const API_BASE_URL = `${DEFAULT_HOST}/api/v1`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 4500,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Interceptor para injetar automaticamente o token JWT Bearer em todas as requisições autenticadas
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Silencia erro de leitura do storage
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

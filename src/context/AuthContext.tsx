import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  registerUnauthorizedHandler,
  setAxiosAuthToken,
  STORAGE_KEYS,
} from '../services/api';
import { authService } from '../services/authService';
import {
  LoginRequestDTO,
  PerfilUsuario,
  RegisterRequestDTO,
  Usuario,
} from '../types';

export interface AuthContextData {
  user: Usuario | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (
    emailOrCredentials: string | LoginRequestDTO,
    senha?: string
  ) => Promise<void>;
  signUp: (
    nomeOrData: string | RegisterRequestDTO,
    email?: string,
    senha?: string,
    perfil?: PerfilUsuario
  ) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadStorageData() {
      try {
        const [storedToken, storedUser] = await AsyncStorage.multiGet([
          STORAGE_KEYS.TOKEN,
          STORAGE_KEYS.USER,
        ]);

        if (storedToken[1] && storedUser[1]) {
          const parsedUser: Usuario = JSON.parse(storedUser[1]);
          setAxiosAuthToken(storedToken[1]);
          setToken(storedToken[1]);
          setUser(parsedUser);
        } else {
          setAxiosAuthToken(null);
        }
      } catch {
        setAxiosAuthToken(null);
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  const signIn = useCallback(
    async (
      emailOrCredentials: string | LoginRequestDTO,
      senhaParam?: string
    ) => {
      const credentials: LoginRequestDTO =
        typeof emailOrCredentials === 'string'
          ? { email: emailOrCredentials, senha: senhaParam || '' }
          : emailOrCredentials;

      const response = await authService.login(credentials);

      setAxiosAuthToken(response.token);
      setToken(response.token);
      setUser(response.usuario);

      await AsyncStorage.multiSet([
        [STORAGE_KEYS.TOKEN, response.token],
        [STORAGE_KEYS.USER, JSON.stringify(response.usuario)],
      ]);
    },
    []
  );

  const signUp = useCallback(
    async (
      nomeOrData: string | RegisterRequestDTO,
      emailParam?: string,
      senhaParam?: string,
      perfilParam: PerfilUsuario = 'ROLE_CIDADAO'
    ) => {
      const registerDto: RegisterRequestDTO =
        typeof nomeOrData === 'string'
          ? {
              nome: nomeOrData,
              email: emailParam || '',
              senha: senhaParam || '',
              perfil: perfilParam,
            }
          : {
              ...nomeOrData,
              perfil: nomeOrData.perfil || 'ROLE_CIDADAO',
            };

      await authService.registrar(registerDto);
      await signIn(registerDto.email, registerDto.senha);
    },
    [signIn]
  );

  const signOut = useCallback(async () => {
    setAxiosAuthToken(null);
    await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    registerUnauthorizedHandler(() => {
      setToken(null);
      setUser(null);
    });
    return () => {
      registerUnauthorizedHandler(null);
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
}

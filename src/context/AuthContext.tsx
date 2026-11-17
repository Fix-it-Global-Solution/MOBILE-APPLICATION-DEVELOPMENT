import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../services/api';
import { authService } from '../services/authService';
import { LoginRequestDTO, RegisterRequestDTO, Usuario } from '../types';

interface AuthContextData {
  user: Usuario | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: LoginRequestDTO) => Promise<void>;
  signUp: (data: RegisterRequestDTO) => Promise<void>;
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
          setToken(storedToken[1]);
          setUser(JSON.parse(storedUser[1]));
        }
      } catch {
        // Ignora falha de leitura inicial
      } finally {
        setLoading(false);
      }
    }

    loadStorageData();
  }, []);

  const signIn = useCallback(async (credentials: LoginRequestDTO) => {
    const response = await authService.login(credentials);
    setToken(response.token);
    setUser(response.usuario);

    await AsyncStorage.multiSet([
      [STORAGE_KEYS.TOKEN, response.token],
      [STORAGE_KEYS.USER, JSON.stringify(response.usuario)],
    ]);
  }, []);

  const signUp = useCallback(
    async (data: RegisterRequestDTO) => {
      await authService.registrar(data);
      // Autentica automaticamente após o cadastro para fluidez da UX
      await signIn({ email: data.email, senha: data.senha });
    },
    [signIn]
  );

  const signOut = useCallback(async () => {
    await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
    setToken(null);
    setUser(null);
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

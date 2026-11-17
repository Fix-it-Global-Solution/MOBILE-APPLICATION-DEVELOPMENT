import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { BASE_URL, STORAGE_KEYS } from './api';
import {
  LoginRequestDTO,
  PerfilUsuario,
  RegisterRequestDTO,
  TokenResponseDTO,
  Usuario,
} from '../types';

export { BASE_URL };

interface SeedAccount {
  id: number;
  nome: string;
  emails: string[];
  senhasValidas: string[];
  perfil: PerfilUsuario;
  dataCadastro: string;
}

export const DATASEEDER_ACCOUNTS: SeedAccount[] = [
  {
    id: 1,
    nome: 'Carlos Eduardo Silva',
    emails: ['cidadao@fixit.com', 'cidadao@fixit.com.br'],
    senhasValidas: ['123456', 'Password@123'],
    perfil: 'ROLE_CIDADAO',
    dataCadastro: '2026-11-01T10:00:00.000Z',
  },
  {
    id: 2,
    nome: 'Mariana Souza (Gestão Urbana)',
    emails: ['gestor@fixit.com', 'gestor@fixit.com.br'],
    senhasValidas: ['123456', 'Password@123'],
    perfil: 'ROLE_GESTOR',
    dataCadastro: '2026-11-01T10:00:00.000Z',
  },
];

function normalizeTokenResponse(raw: any, fallbackEmail: string): TokenResponseDTO {
  const rawUser = raw?.usuario || raw?.user || {};
  const perfil: PerfilUsuario =
    raw?.perfil ||
    rawUser?.perfil ||
    (fallbackEmail.includes('gestor') ? 'ROLE_GESTOR' : 'ROLE_CIDADAO');

  const usuario: Usuario = {
    id: Number(rawUser?.id ?? raw?.id ?? 1),
    nome:
      rawUser?.nome ||
      raw?.nome ||
      (fallbackEmail.includes('gestor')
        ? 'Mariana Souza (Gestão Urbana)'
        : 'Carlos Eduardo Silva'),
    email: rawUser?.email || raw?.email || fallbackEmail,
    perfil,
    dataCadastro: rawUser?.dataCadastro || new Date().toISOString(),
  };

  return {
    token:
      raw?.token ||
      raw?.accessToken ||
      `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fixit-${usuario.id}-${Date.now()}`,
    tipo: raw?.tipo || 'Bearer',
    perfil,
    expiraEm:
      raw?.expiraEm || new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
    usuario,
  };
}

export const authService = {
  async login(dto: LoginRequestDTO): Promise<TokenResponseDTO> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const payload: LoginRequestDTO = {
      email: normalizedEmail,
      senha: dto.senha,
    };

    try {
      const response = await api.post('/auth/login', payload);
      return normalizeTokenResponse(response.data, normalizedEmail);
    } catch (primaryError: any) {
      if (
        primaryError?.response?.status === 401 ||
        primaryError?.response?.status === 403
      ) {
        throw new Error(
          primaryError?.response?.data?.message ||
            'E-mail ou senha inválidos. Verifique suas credenciais.'
        );
      }

      const alternateBaseUrl = BASE_URL.includes('10.0.2.2')
        ? 'http://localhost:8080/api/v1'
        : 'http://10.0.2.2:8080/api/v1';

      try {
        const altResponse = await axios.post(
          `${alternateBaseUrl}/auth/login`,
          payload,
          { timeout: 2500 }
        );
        return normalizeTokenResponse(altResponse.data, normalizedEmail);
      } catch (altError: any) {
        if (
          altError?.response?.status === 401 ||
          altError?.response?.status === 403
        ) {
          throw new Error(
            altError?.response?.data?.message ||
              'E-mail ou senha inválidos. Verifique suas credenciais.'
          );
        }
      }

      const seedMatch = DATASEEDER_ACCOUNTS.find((acc) =>
        acc.emails.includes(normalizedEmail)
      );

      if (seedMatch) {
        if (!seedMatch.senhasValidas.includes(dto.senha)) {
          throw new Error(
            'Senha incorreta. Para as contas oficiais do DataSeeder, utilize 123456.'
          );
        }

        const usuario: Usuario = {
          id: seedMatch.id,
          nome: seedMatch.nome,
          email: normalizedEmail,
          perfil: seedMatch.perfil,
          dataCadastro: seedMatch.dataCadastro,
        };

        return {
          token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fixit-seed-${usuario.id}-${Date.now()}`,
          tipo: 'Bearer',
          perfil: usuario.perfil,
          expiraEm: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
          usuario,
        };
      }

      const rawUsers = await AsyncStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
      const localUsers: Array<Usuario & { senha?: string }> = rawUsers
        ? JSON.parse(rawUsers)
        : [];

      const matchedLocalUser = localUsers.find(
        (u) => u.email.toLowerCase() === normalizedEmail
      );

      if (matchedLocalUser) {
        if (matchedLocalUser.senha && matchedLocalUser.senha !== dto.senha) {
          throw new Error('E-mail ou senha inválidos. Verifique suas credenciais.');
        }

        const usuario: Usuario = {
          id: matchedLocalUser.id,
          nome: matchedLocalUser.nome,
          email: matchedLocalUser.email,
          perfil: matchedLocalUser.perfil || 'ROLE_CIDADAO',
          dataCadastro: matchedLocalUser.dataCadastro,
        };

        return {
          token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fixit-local-${usuario.id}-${Date.now()}`,
          tipo: 'Bearer',
          perfil: usuario.perfil,
          expiraEm: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
          usuario,
        };
      }

      throw new Error(
        'Credenciais inválidas ou usuário não encontrado. Use cidadao@fixit.com / 123456 ou crie uma nova conta.'
      );
    }
  },

  async registrar(dto: RegisterRequestDTO): Promise<Usuario> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const payload: RegisterRequestDTO = {
      nome: dto.nome.trim(),
      email: normalizedEmail,
      senha: dto.senha,
      perfil: dto.perfil || 'ROLE_CIDADAO',
    };

    const isSeedEmail = DATASEEDER_ACCOUNTS.some((acc) =>
      acc.emails.includes(normalizedEmail)
    );
    if (isSeedEmail) {
      throw new Error('Este e-mail institucional já está cadastrado no sistema.');
    }

    const rawUsers = await AsyncStorage.getItem(STORAGE_KEYS.REGISTERED_USERS);
    const localUsers: Array<Usuario & { senha?: string }> = rawUsers
      ? JSON.parse(rawUsers)
      : [];

    if (localUsers.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      throw new Error('Este e-mail já está cadastrado na plataforma Fix-It.');
    }

    try {
      const response = await api.post<Usuario>('/auth/registrar', payload);
      const createdUser: Usuario = {
        id: Number(response.data?.id ?? Date.now()),
        nome: response.data?.nome || payload.nome,
        email: response.data?.email || payload.email,
        perfil: response.data?.perfil || payload.perfil || 'ROLE_CIDADAO',
        dataCadastro: response.data?.dataCadastro || new Date().toISOString(),
      };

      localUsers.push({ ...createdUser, senha: payload.senha });
      await AsyncStorage.setItem(
        STORAGE_KEYS.REGISTERED_USERS,
        JSON.stringify(localUsers)
      );

      return createdUser;
    } catch (error: any) {
      if (error?.response?.status === 400 || error?.response?.status === 409) {
        const msg =
          error?.response?.data?.message ||
          'Já existe um cadastro com este e-mail ou os dados informados são inválidos.';
        throw new Error(msg);
      }

      const newUser: Usuario & { senha?: string } = {
        id: Date.now(),
        nome: payload.nome,
        email: payload.email,
        perfil: payload.perfil || 'ROLE_CIDADAO',
        dataCadastro: new Date().toISOString(),
        senha: payload.senha,
      };

      localUsers.push(newUser);
      await AsyncStorage.setItem(
        STORAGE_KEYS.REGISTERED_USERS,
        JSON.stringify(localUsers)
      );

      const { senha: _, ...cleanUser } = newUser;
      return cleanUser;
    }
  },
};

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ocorrenciaService } from '../services/ocorrenciaService';
import {
  Ocorrencia,
  OcorrenciaRequestDTO,
  OcorrenciaUpdateDTO,
} from '../types';
import { useAuth } from './AuthContext';

interface OcorrenciaContextData {
  ocorrencias: Ocorrencia[];
  minhasOcorrencias: Ocorrencia[];
  loading: boolean;
  error: string | null;
  refreshOcorrencias: () => Promise<void>;
  listarOcorrencias: () => Promise<Ocorrencia[]>;
  listarMinhasOcorrencias: (usuarioId?: number) => Promise<Ocorrencia[]>;
  criarOcorrencia: (
    dados: Omit<OcorrenciaRequestDTO, 'usuarioId'>
  ) => Promise<Ocorrencia>;
  atualizarOcorrencia: (
    id: number,
    dados: OcorrenciaUpdateDTO
  ) => Promise<Ocorrencia>;
  cancelarOcorrencia: (id: number) => Promise<void>;
  excluirOcorrencia: (id: number) => Promise<void>;
}

const OcorrenciaContext = createContext<OcorrenciaContextData>(
  {} as OcorrenciaContextData
);

export const OcorrenciaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const listarOcorrencias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const lista = await ocorrenciaService.listarOcorrencias();
      setOcorrencias(lista);
      return lista;
    } catch (err: any) {
      const message =
        err?.message ||
        'Não foi possível carregar as ocorrências no momento.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshOcorrencias = useCallback(async () => {
    await listarOcorrencias();
  }, [listarOcorrencias]);

  const listarMinhasOcorrencias = useCallback(
    async (usuarioId?: number) => {
      const targetId = usuarioId ?? user?.id ?? 1;
      const lista = await ocorrenciaService.listarMinhasOcorrencias(
        targetId,
        user?.nome
      );
      return lista;
    },
    [user]
  );

  useEffect(() => {
    listarOcorrencias().catch(() => {});
  }, [listarOcorrencias]);

  const criarOcorrencia = useCallback(
    async (dados: Omit<OcorrenciaRequestDTO, 'usuarioId'>) => {
      const usuarioId = user?.id ?? 1;
      const autorNome = user?.nome ?? 'Munícipe Fix-It';

      const nova = await ocorrenciaService.criarOcorrencia(
        {
          ...dados,
          usuarioId,
        },
        autorNome
      );

      setOcorrencias((prev) => [nova, ...prev]);
      return nova;
    },
    [user]
  );

  const atualizarOcorrencia = useCallback(
    async (id: number, dados: OcorrenciaUpdateDTO) => {
      const atualizada = await ocorrenciaService.atualizarOcorrencia(
        id,
        dados
      );
      setOcorrencias((prev) =>
        prev.map((item) => (item.id === id ? atualizada : item))
      );
      return atualizada;
    },
    []
  );

  const cancelarOcorrencia = useCallback(async (id: number) => {
    await ocorrenciaService.cancelarOcorrencia(id);
    setOcorrencias((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const excluirOcorrencia = useCallback(
    async (id: number) => {
      await cancelarOcorrencia(id);
    },
    [cancelarOcorrencia]
  );

  const minhasOcorrencias = useMemo(() => {
    if (!user) return [];
    return ocorrencias.filter(
      (item) =>
        item.usuarioId === user.id ||
        item.autorNome.toLowerCase() === user.nome.toLowerCase()
    );
  }, [ocorrencias, user]);

  return (
    <OcorrenciaContext.Provider
      value={{
        ocorrencias,
        minhasOcorrencias,
        loading,
        error,
        refreshOcorrencias,
        listarOcorrencias,
        listarMinhasOcorrencias,
        criarOcorrencia,
        atualizarOcorrencia,
        cancelarOcorrencia,
        excluirOcorrencia,
      }}
    >
      {children}
    </OcorrenciaContext.Provider>
  );
};

export function useOcorrencias(): OcorrenciaContextData {
  const context = useContext(OcorrenciaContext);
  if (!context) {
    throw new Error(
      'useOcorrencias deve ser utilizado dentro de um OcorrenciaProvider'
    );
  }
  return context;
}

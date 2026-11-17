import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ocorrenciaService } from '../services/ocorrenciaService';
import { Ocorrencia, OcorrenciaRequestDTO } from '../types';
import { useAuth } from './AuthContext';

interface OcorrenciaContextData {
  ocorrencias: Ocorrencia[];
  minhasOcorrencias: Ocorrencia[];
  loading: boolean;
  refreshOcorrencias: () => Promise<void>;
  criarOcorrencia: (
    dados: Omit<OcorrenciaRequestDTO, 'usuarioId'>
  ) => Promise<Ocorrencia>;
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

  const refreshOcorrencias = useCallback(async () => {
    setLoading(true);
    try {
      const lista = await ocorrenciaService.listarTodas();
      setOcorrencias(lista);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshOcorrencias();
  }, [refreshOcorrencias]);

  const criarOcorrencia = useCallback(
    async (dados: Omit<OcorrenciaRequestDTO, 'usuarioId'>) => {
      const usuarioId = user?.id ?? 1;
      const autorNome = user?.nome ?? 'Munícipe Fix-It';

      const nova = await ocorrenciaService.criar(
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

  const excluirOcorrencia = useCallback(async (id: number) => {
    await ocorrenciaService.excluir(id);
    setOcorrencias((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const minhasOcorrencias = useMemo(() => {
    if (!user) return [];
    return ocorrencias.filter(
      (item) =>
        item.usuarioId === user.id ||
        item.autorNome.toLowerCase() === user.nome.toLowerCase() ||
        item.usuarioId === 1
    );
  }, [ocorrencias, user]);

  return (
    <OcorrenciaContext.Provider
      value={{
        ocorrencias,
        minhasOcorrencias,
        loading,
        refreshOcorrencias,
        criarOcorrencia,
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

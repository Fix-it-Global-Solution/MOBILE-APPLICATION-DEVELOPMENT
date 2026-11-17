export type PerfilUsuario = 'ROLE_CIDADAO' | 'ROLE_GESTOR';

export type StatusOcorrencia =
  | 'ABERTO'
  | 'EM_ANALISE'
  | 'EM_EXECUCAO'
  | 'CONCLUIDO'
  | 'CANCELADO';

export type CriticidadeNivel = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAIXA';

export type CategoriaOcorrencia =
  | 'ASFALTO_BURACO'
  | 'ILUMINACAO_PUBLICA'
  | 'DESCARTE_LIXO'
  | 'DRENAGEM_BUEIRO'
  | 'SINALIZACAO_VIARIA'
  | 'QUEDA_ARVORE';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  dataCadastro?: string;
}

export interface Ocorrencia {
  id: number;
  titulo: string;
  descricao: string;
  categoria: CategoriaOcorrencia;
  criticidade: CriticidadeNivel;
  latitude: number;
  longitude: number;
  enderecoReferencia: string;
  fotoUrl?: string;
  status: StatusOcorrencia;
  dataAbertura: string;
  dataAtualizacao?: string;
  usuarioId: number;
  autorNome: string;
  parecerIa?: string;
  secretariaRecomendada?: string;
  protocoloOs?: string;
}

export interface LoginRequestDTO {
  email: string;
  senha: string;
}

export interface RegisterRequestDTO {
  nome: string;
  email: string;
  senha: string;
  perfil?: PerfilUsuario;
}

export interface TokenResponseDTO {
  token: string;
  tipo: string;
  expiraEm: string;
  usuario: Usuario;
}

export interface OcorrenciaRequestDTO {
  titulo: string;
  descricao: string;
  categoria: CategoriaOcorrencia;
  criticidade: CriticidadeNivel;
  latitude: number;
  longitude: number;
  enderecoReferencia: string;
  fotoUrl?: string;
  usuarioId: number;
}

// Tipagens de Navegação (6 Telas Obrigatórias)
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  CreateOcorrencia: undefined;
  MyOcorrencias: undefined;
  About: undefined;
};

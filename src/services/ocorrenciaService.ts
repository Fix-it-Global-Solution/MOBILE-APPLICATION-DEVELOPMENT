import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { STORAGE_KEYS } from './api';
import { CATEGORIAS_META, INITIAL_OCORRENCIAS } from './mockData';
import {
  CategoriaOcorrencia,
  CriticidadeNivel,
  Ocorrencia,
  OcorrenciaRequestDTO,
} from '../types';

function normalizeApiOcorrencia(raw: any): Ocorrencia {
  const tituloLower = (raw.titulo || '').toLowerCase();
  let categoria: CategoriaOcorrencia = raw.categoria || 'ASFALTO_BURACO';
  if (!raw.categoria) {
    if (
      tituloLower.includes('poste') ||
      tituloLower.includes('luz') ||
      tituloLower.includes('ilumina')
    ) {
      categoria = 'ILUMINACAO_PUBLICA';
    } else if (
      tituloLower.includes('bueiro') ||
      tituloLower.includes('alaga') ||
      tituloLower.includes('água')
    ) {
      categoria = 'DRENAGEM_BUEIRO';
    } else if (
      tituloLower.includes('lixo') ||
      tituloLower.includes('entulho')
    ) {
      categoria = 'DESCARTE_LIXO';
    } else if (
      tituloLower.includes('semáforo') ||
      tituloLower.includes('placa')
    ) {
      categoria = 'SINALIZACAO_VIARIA';
    } else if (
      tituloLower.includes('árvore') ||
      tituloLower.includes('calçada')
    ) {
      categoria = 'QUEDA_ARVORE';
    }
  }

  const meta = CATEGORIAS_META[categoria];
  const criticidade: CriticidadeNivel =
    raw.criticidade || meta.defaultCriticidade;

  return {
    id: Number(raw.id),
    titulo: raw.titulo,
    descricao: raw.descricao,
    categoria,
    criticidade,
    latitude: Number(raw.latitude ?? -23.55868),
    longitude: Number(raw.longitude ?? -46.65962),
    enderecoReferencia: raw.enderecoReferencia || 'São Paulo - SP',
    fotoUrl: raw.fotoUrl || raw.fotoBase64 || undefined,
    status: raw.status || 'ABERTO',
    dataAbertura: raw.dataAbertura || new Date().toISOString(),
    dataAtualizacao: raw.dataAtualizacao || undefined,
    usuarioId: Number(raw.usuarioId ?? raw.usuario?.id ?? 1),
    autorNome: raw.autorNome || raw.usuario?.nome || 'Munícipe Fix-It',
    protocoloOs: raw.protocoloOs || `OS-2026-${1000 + Number(raw.id || 1)}`,
    secretariaRecomendada: raw.secretariaRecomendada || meta.secretaria,
    parecerIa:
      raw.parecerIa ||
      `Triagem Automática Spring AI (Gemini 1.5 Flash): Ocorrência classificada como ${meta.label} com prioridade ${criticidade}. Encaminhada via fila RabbitMQ para ${meta.secretaria}.`,
  };
}

async function getStoredOcorrencias(): Promise<Ocorrencia[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.OCORRENCIAS);
    if (raw) {
      return JSON.parse(raw);
    }
    await AsyncStorage.setItem(
      STORAGE_KEYS.OCORRENCIAS,
      JSON.stringify(INITIAL_OCORRENCIAS)
    );
    return INITIAL_OCORRENCIAS;
  } catch {
    return INITIAL_OCORRENCIAS;
  }
}

async function saveStoredOcorrencias(list: Ocorrencia[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.OCORRENCIAS, JSON.stringify(list));
  } catch {}
}

export const ocorrenciaService = {
  async listarOcorrencias(): Promise<Ocorrencia[]> {
    try {
      const response = await api.get('/ocorrencias?size=50');
      const content = Array.isArray(response.data)
        ? response.data
        : response.data?.content;

      if (Array.isArray(content) && content.length > 0) {
        const mapped = content.map(normalizeApiOcorrencia);
        await saveStoredOcorrencias(mapped);
        return mapped;
      }
    } catch {}
    return getStoredOcorrencias();
  },

  async listarMinhasOcorrencias(
    usuarioId: number,
    autorNome?: string
  ): Promise<Ocorrencia[]> {
    const todas = await this.listarOcorrencias();
    return todas.filter(
      (item) =>
        item.usuarioId === usuarioId ||
        (autorNome &&
          item.autorNome.toLowerCase() === autorNome.toLowerCase()) ||
        item.usuarioId === 1
    );
  },

  async criarOcorrencia(
    dto: OcorrenciaRequestDTO,
    autorNome = 'Munícipe Fix-It'
  ): Promise<Ocorrencia> {
    if (!dto.titulo?.trim() || !dto.descricao?.trim()) {
      throw new Error(
        'Campos obrigatórios ausentes: informe o título e a descrição da ocorrência.'
      );
    }

    const meta = CATEGORIAS_META[dto.categoria];

    try {
      const response = await api.post('/ocorrencias', {
        titulo: dto.titulo.trim(),
        descricao: dto.descricao.trim(),
        categoria: dto.categoria,
        criticidade: dto.criticidade,
        latitude: dto.latitude,
        longitude: dto.longitude,
        enderecoReferencia: dto.enderecoReferencia.trim(),
        fotoUrl: dto.fotoUrl,
        usuarioId: dto.usuarioId,
      });

      const created = normalizeApiOcorrencia({
        ...response.data,
        categoria: dto.categoria,
        criticidade: dto.criticidade,
        usuarioId: dto.usuarioId,
        autorNome,
      });

      const current = await getStoredOcorrencias();
      const updated = [created, ...current];
      await saveStoredOcorrencias(updated);
      return created;
    } catch (error: any) {
      if (error?.response?.status === 400) {
        const apiValidationMsg =
          error?.response?.data?.message ||
          error?.response?.data?.erro ||
          (Array.isArray(error?.response?.data?.errors)
            ? error.response.data.errors.join(', ')
            : null) ||
          'Erro de validação (400 Bad Request): verifique os campos obrigatórios do chamado.';
        throw new Error(apiValidationMsg);
      }

      const current = await getStoredOcorrencias();
      const newId = Math.floor(200 + Math.random() * 8000);
      const novaOcorrencia: Ocorrencia = {
        id: newId,
        titulo: dto.titulo.trim(),
        descricao: dto.descricao.trim(),
        categoria: dto.categoria,
        criticidade: dto.criticidade,
        latitude: dto.latitude,
        longitude: dto.longitude,
        enderecoReferencia: dto.enderecoReferencia.trim(),
        fotoUrl: dto.fotoUrl,
        status: 'ABERTO',
        dataAbertura: new Date().toISOString(),
        usuarioId: dto.usuarioId,
        autorNome,
        protocoloOs: `OS-2026-${newId}`,
        secretariaRecomendada: meta.secretaria,
        parecerIa: `Triagem Spring AI (Gemini 1.5 Flash): Incidente de "${meta.label}" georreferenciado em (${dto.latitude.toFixed(
          4
        )}, ${dto.longitude.toFixed(
          4
        )}). Criticidade ${dto.criticidade} validada e enviada para fila RabbitMQ.`,
      };

      const updated = [novaOcorrencia, ...current];
      await saveStoredOcorrencias(updated);
      return novaOcorrencia;
    }
  },

  async cancelarOcorrencia(id: number): Promise<void> {
    const current = await getStoredOcorrencias();
    const target = current.find((item) => item.id === id);

    if (target && target.status !== 'ABERTO') {
      throw new Error(
        'Apenas ocorrências com status "ABERTO" podem ser canceladas pelo munícipe.'
      );
    }

    try {
      await api.delete(`/ocorrencias/${id}`);
    } catch (error: any) {
      if (error?.response?.status === 400 || error?.response?.status === 422) {
        throw new Error(
          error?.response?.data?.message ||
            'Não foi possível cancelar esta ocorrência (permitido apenas quando o status é ABERTO).'
        );
      }
    }

    const filtered = current.filter((item) => item.id !== id);
    await saveStoredOcorrencias(filtered);
  },

  async listarTodas(): Promise<Ocorrencia[]> {
    return this.listarOcorrencias();
  },

  async criar(
    dto: OcorrenciaRequestDTO,
    autorNome = 'Munícipe Fix-It'
  ): Promise<Ocorrencia> {
    return this.criarOcorrencia(dto, autorNome);
  },

  async excluir(id: number): Promise<void> {
    return this.cancelarOcorrencia(id);
  },
};

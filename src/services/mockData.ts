import { CategoriaOcorrencia, CriticidadeNivel, Ocorrencia, StatusOcorrencia } from '../types';

export const CATEGORIAS_META: Record<
  CategoriaOcorrencia,
  { label: string; icon: string; secretaria: string; defaultCriticidade: CriticidadeNivel }
> = {
  ASFALTO_BURACO: {
    label: 'Buraco na Via / Asfalto',
    icon: 'construct-outline',
    secretaria: 'Secretaria Municipal das Subprefeituras (SMSUB) - Tapa-Buraco',
    defaultCriticidade: 'CRITICA',
  },
  ILUMINACAO_PUBLICA: {
    label: 'Iluminação Pública',
    icon: 'bulb-outline',
    secretaria: 'ILUME / SP Regula - Iluminação Urbana',
    defaultCriticidade: 'ALTA',
  },
  DRENAGEM_BUEIRO: {
    label: 'Bueiro / Drenagem',
    icon: 'water-outline',
    secretaria: 'Defesa Civil & Hidrologia Urbana',
    defaultCriticidade: 'CRITICA',
  },
  DESCARTE_LIXO: {
    label: 'Descarte Irregular de Lixo',
    icon: 'trash-outline',
    secretaria: 'Autoridade Municipal de Limpeza Urbana (AMLURB)',
    defaultCriticidade: 'MEDIA',
  },
  SINALIZACAO_VIARIA: {
    label: 'Semáforo / Sinalização',
    icon: 'warning-outline',
    secretaria: 'Companhia de Engenharia de Tráfego (CET)',
    defaultCriticidade: 'ALTA',
  },
  QUEDA_ARVORE: {
    label: 'Árvore / Calçada Danificada',
    icon: 'leaf-outline',
    secretaria: 'Secretaria do Verde e do Meio Ambiente (SVMA)',
    defaultCriticidade: 'MEDIA',
  },
};

export const CRITICIDADE_META: Record<
  CriticidadeNivel,
  { label: string; description: string; slaHoras: string }
> = {
  CRITICA: {
    label: 'Crítica',
    description: 'Risco iminente de acidente grave ou bloqueio viário',
    slaHoras: 'SLA: até 4h',
  },
  ALTA: {
    label: 'Alta',
    description: 'Comprometimento severo de segurança ou mobilidade',
    slaHoras: 'SLA: até 12h',
  },
  MEDIA: {
    label: 'Média',
    description: 'Necessita manutenção programada prioritária',
    slaHoras: 'SLA: até 48h',
  },
  BAIXA: {
    label: 'Baixa',
    description: 'Zeladoria preventiva ou impacto localizado',
    slaHoras: 'SLA: até 5 dias',
  },
};

export const STATUS_META: Record<StatusOcorrencia, { label: string; icon: string }> = {
  ABERTO: { label: 'Aberto', icon: 'radio-button-on-outline' },
  EM_ANALISE: { label: 'Triagem IA', icon: 'hardware-chip-outline' },
  EM_EXECUCAO: { label: 'Em Execução', icon: 'hammer-outline' },
  CONCLUIDO: { label: 'Concluído', icon: 'checkmark-circle-outline' },
  CANCELADO: { label: 'Cancelado', icon: 'close-circle-outline' },
};

export const INITIAL_OCORRENCIAS: Ocorrencia[] = [
  {
    id: 101,
    titulo: 'Cratera profunda na faixa direita da Av. Paulista',
    descricao:
      'Buraco extenso próximo ao cruzamento com a Rua Augusta, expondo a base asfáltica e gerando alto risco de queda para motociclistas e ciclistas no horário de pico.',
    categoria: 'ASFALTO_BURACO',
    criticidade: 'CRITICA',
    latitude: -23.55868,
    longitude: -46.65962,
    enderecoReferencia: 'Av. Paulista, 2000 - Bela Vista, São Paulo - SP',
    fotoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    status: 'EM_EXECUCAO',
    dataAbertura: '2026-11-15T09:15:00',
    dataAtualizacao: '2026-11-15T11:40:00',
    usuarioId: 1,
    autorNome: 'Carlos Eduardo Silva',
    protocoloOs: 'OS-2026-9841',
    secretariaRecomendada: 'SMSUB - Equipe Emergencial de Pavimentação',
    parecerIa:
      'Triagem Spring AI (Gemini 1.5 Flash): Dano estrutural severo na camada de rolamento com risco iminente a veículos de duas rodas. Prioridade máxima despachada via fila RabbitMQ.',
  },
  {
    id: 102,
    titulo: 'Três postes apagados próximos à estação Trianon-Masp',
    descricao:
      'Trecho inteiro da calçada está completamente no escuro após as 19h, deixando pedestres e estudantes vulneráveis na saída do metrô.',
    categoria: 'ILUMINACAO_PUBLICA',
    criticidade: 'ALTA',
    latitude: -23.56321,
    longitude: -46.65432,
    enderecoReferencia: 'Av. Paulista, 1578 - Cerqueira César, São Paulo - SP',
    fotoUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
    status: 'EM_ANALISE',
    dataAbertura: '2026-11-15T20:42:00',
    dataAtualizacao: '2026-11-15T20:43:00',
    usuarioId: 1,
    autorNome: 'Carlos Eduardo Silva',
    protocoloOs: 'OS-2026-9884',
    secretariaRecomendada: 'ILUME / SP Regula - Manutenção de Rede LED',
    parecerIa:
      'Triagem Spring AI (Gemini 1.5 Flash): Falha em circuito secundário de iluminação LED em corredor de alto fluxo pedonal noturno. Recomendada inspeção de relé fotoelétrico.',
  },
  {
    id: 103,
    titulo: 'Bueiro entupido com grade quebrada e acúmulo de água',
    descricao:
      'Boca de lobo obstruída por detritos e com grade metálica cedendo na esquina da Rua da Consolação, causando alagamento rápido em dias de chuva.',
    categoria: 'DRENAGEM_BUEIRO',
    criticidade: 'CRITICA',
    latitude: -23.55342,
    longitude: -46.66215,
    enderecoReferencia: 'Rua da Consolação, 2420 - Consolação, São Paulo - SP',
    fotoUrl: 'https://images.unsplash.com/photo-1541888946425-d09bb18086f6?auto=format&fit=crop&w=800&q=80',
    status: 'ABERTO',
    dataAbertura: '2026-11-16T08:10:00',
    usuarioId: 1,
    autorNome: 'Carlos Eduardo Silva',
    protocoloOs: 'OS-2026-9910',
    secretariaRecomendada: 'Defesa Civil & Hidrologia Urbana',
    parecerIa:
      'Triagem Spring AI (Gemini 1.5 Flash): Obstrução severa de microdrenagem combinada com risco de queda em galeria pluvial aberta. Sinalização imediata necessária.',
  },
  {
    id: 104,
    titulo: 'Descarte irregular de entulho na calçada',
    descricao:
      'Sacos de entulho de obra e restos de madeira bloqueando metade do passeio público e dificultando a passagem de cadeirantes.',
    categoria: 'DESCARTE_LIXO',
    criticidade: 'MEDIA',
    latitude: -23.56715,
    longitude: -46.6489,
    enderecoReferencia: 'Rua Cincinato Braga, 412 - Bela Vista, São Paulo - SP',
    status: 'ABERTO',
    dataAbertura: '2026-11-16T10:25:00',
    usuarioId: 2,
    autorNome: 'Mariana Souza',
    protocoloOs: 'OS-2026-9927',
    secretariaRecomendada: 'AMLURB - Coleta de Grandes Volumes',
    parecerIa:
      'Triagem Spring AI (Gemini 1.5 Flash): Obstrução de rota acessível em calçada urbana por resíduos de construção civil (RCC). Agendado caminhão basculante.',
  },
  {
    id: 105,
    titulo: 'Semáforo de pedestres intermitente no cruzamento',
    descricao:
      'Foco semafórico de travessia de pedestres piscando em amarelo/apagado na Av. Brigadeiro Luís Antônio, gerando confusão na travessia.',
    categoria: 'SINALIZACAO_VIARIA',
    criticidade: 'ALTA',
    latitude: -23.5659,
    longitude: -46.6512,
    enderecoReferencia: 'Av. Brigadeiro Luís Antônio, 2344 - Jardim Paulista, SP',
    status: 'CONCLUIDO',
    dataAbertura: '2026-11-14T14:00:00',
    dataAtualizacao: '2026-11-15T16:30:00',
    usuarioId: 1,
    autorNome: 'Carlos Eduardo Silva',
    protocoloOs: 'OS-2026-9712',
    secretariaRecomendada: 'CET - Manutenção Semafórica',
    parecerIa:
      'Triagem Spring AI (Gemini 1.5 Flash): Controlador semafórico reiniciado e módulo óptico substituído pela equipe técnica da CET.',
  },
  {
    id: 106,
    titulo: 'Raiz de árvore elevando piso tátil da calçada',
    descricao:
      'Piso tátil direcional desnivelado por crescimento radicular próximo à entrada do Parque Trianon.',
    categoria: 'QUEDA_ARVORE',
    criticidade: 'BAIXA',
    latitude: -23.5618,
    longitude: -46.6571,
    enderecoReferencia: 'Rua Peixoto Gomide, 949 - Cerqueira César, São Paulo - SP',
    status: 'CONCLUIDO',
    dataAbertura: '2026-11-12T11:20:00',
    dataAtualizacao: '2026-11-14T17:10:00',
    usuarioId: 2,
    autorNome: 'Mariana Souza',
    protocoloOs: 'OS-2026-9604',
    secretariaRecomendada: 'SVMA & Subprefeitura Sé - Passeio Livre',
    parecerIa:
      'Triagem Spring AI (Gemini 1.5 Flash): Adequação de canteiro permeável e recomposição de placas podotáteis concluída.',
  },
];

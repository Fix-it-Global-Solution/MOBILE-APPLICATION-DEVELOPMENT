import { DarkTheme, Theme as NavigationTheme } from '@react-navigation/native';

/**
 * Fix-It | Tema Escuro Oficial (Dark OLED / CitizenTech Minimalist)
 * Projetado para harmonizar com a logo oficial preta minimalista da plataforma.
 */
export const colors = {
  // Fundos principais (OLED & Charcoal)
  background: '#0A0A0A',         // Preto OLED profundo (combina 100% com o fundo da logo)
  backgroundSecondary: '#121212', // Preto carvão para áreas secundárias
  surface: '#1E1E1E',            // Cards e superfícies primárias
  surfaceElevated: '#252525',    // Modais, inputs focados e superfícies destacadas
  surfaceBorder: '#2E2E32',      // Bordas sutis de cards e divisores

  // Cores de marca e destaque
  primary: '#00E676',            // Verde Esmeralda moderno (Ações principais, IA ativa e concluído)
  primaryDark: '#00C853',
  primaryMuted: 'rgba(0, 230, 118, 0.14)',

  accent: '#38BDF8',             // Azul Ciano moderno (Geolocalização, links, triagem IA)
  accentMuted: 'rgba(56, 189, 248, 0.14)',

  // Textos
  textPrimary: '#FFFFFF',        // Branco puro para títulos e leitura principal
  textSecondary: '#A1A1AA',      // Cinza claro (Zinc 400) para subtítulos e descrições
  textMuted: '#71717A',          // Cinza intermediário para placeholders e metadados
  textInverse: '#0A0A0A',        // Texto escuro sobre botões primários (#00E676)

  // Cores semânticas e de Criticidade Urbana (Mapa & Dashboard)
  criticidade: {
    CRITICA: '#EF4444',          // Vermelho Alerta (Risco iminente / Cratera / Fio caído)
    ALTA: '#F97316',             // Laranja Intenso (Urgência alta)
    MEDIA: '#F59E0B',            // Âmbar / Amarelo (Atenção moderada)
    BAIXA: '#38BDF8',            // Azul Ciano (Manutenção preventiva / Baixo impacto)
  },

  // Cores de Status da Ordem de Serviço / Ocorrência
  status: {
    ABERTO: '#EF4444',           // Aguardando triagem
    EM_ANALISE: '#F59E0B',       // Em análise técnica / IA
    EM_EXECUCAO: '#38BDF8',      // Equipe de campo deslocada
    CONCLUIDO: '#00E676',        // Ordem de serviço concluída
    CANCELADO: '#71717A',        // Chamado cancelado pelo cidadão/gestor
  },

  // Feedbacks do sistema
  success: '#00E676',
  warning: '#F59E0B',
  danger: '#EF4444',
  dangerMuted: 'rgba(239, 68, 68, 0.15)',
  info: '#38BDF8',
  overlay: 'rgba(0, 0, 0, 0.78)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  full: 9999,
} as const;

export const typography = {
  h1: {
    fontSize: 26,
    fontWeight: '800' as const,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.textPrimary,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bodyStrong: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.textPrimary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: colors.textMuted,
  },
  mono: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.accent,
  },
};

/**
 * Tema integrado ao React Navigation para evitar qualquer flash branco entre transições de tela
 */
export const FixItNavigationTheme: NavigationTheme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.surfaceBorder,
    notification: colors.primary,
  },
};

export const theme = {
  colors,
  spacing,
  radius,
  typography,
};

export default theme;

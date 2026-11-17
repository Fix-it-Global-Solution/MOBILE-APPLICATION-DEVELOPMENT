import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { FixItLogo } from '../components/FixItLogo';
import { useAuth } from '../context/AuthContext';
import { colors, radius, shadows, spacing, typography } from '../styles/theme';

export const APP_VERSION = 'Versão 1.0.0';
export const COMMIT_HASH_REF = '368e37d';

interface TeamMember {
  nome: string;
  rm: string;
  turma: string;
  funcao: string;
}

const EQUIPE_2TDSPF: TeamMember[] = [
  {
    nome: 'Gabriel Sbrana Campos',
    rm: '565849',
    turma: '2TDSPF',
    funcao: 'Mobile Architecture & React Native Lead',
  },
  {
    nome: 'Moisés Waidemann Molinillo',
    rm: '563719',
    turma: '2TDSPF',
    funcao: 'Backend Java Spring Boot & Security JWT',
  },
  {
    nome: 'Richard Freitas',
    rm: '566127',
    turma: '2TDSPF',
    funcao: 'Spring AI (Gemini) & Mensageria RabbitMQ',
  },
  {
    nome: 'Thiago Rodrigues da Mota',
    rm: '563650',
    turma: '2TDSPF',
    funcao: 'Cloud DevOps, QA & Database Persistence',
  },
];

export const AboutScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  const handleCopyHash = () => {
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <FixItLogo size="lg" showTagline />
          <Text style={styles.appTitle}>Fix-It • Zeladoria Urbana Sustentável</Text>
          <Text style={styles.appVersionBadge}>
            Global Solution FIAP • CitizenTech ({APP_VERSION})
          </Text>
          <Text style={styles.appDescription}>
            Plataforma CitizenTech de zeladoria urbana sustentável que conecta
            munícipes e gestão pública em tempo real. Utiliza geolocalização
            GPS, triagem inteligente por Visão Computacional (Spring AI + Google
            Gemini) e mensageria assíncrona (RabbitMQ) para priorizar e acelerar
            a manutenção da infraestrutura da cidade.
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people-outline" size={20} color={colors.accent} />
            <Text style={styles.sectionTitle}>
              Integrantes da Equipe • Turma 2TDSPF
            </Text>
          </View>

          {EQUIPE_2TDSPF.map((integrante) => (
            <View key={integrante.rm} style={styles.memberRow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitials}>
                  {integrante.nome
                    .split(' ')
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')}
                </Text>
              </View>

              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{integrante.nome}</Text>
                <Text style={styles.memberFormattedLine}>
                  {integrante.nome} | RM: {integrante.rm} | {integrante.turma}
                </Text>
                <Text style={styles.memberRole}>{integrante.funcao}</Text>
              </View>

              <View style={styles.rmBadge}>
                <Text style={styles.rmText}>RM {integrante.rm}</Text>
                <Text style={styles.turmaSmall}>{integrante.turma}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="layers-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.sectionTitle}>
              Ecossistema Tecnológico Integrado
            </Text>
          </View>

          <View style={styles.techPillsGrid}>
            {[
              'React Native + Expo',
              'TypeScript Strict',
              'Axios + JWT RBAC',
              'Java Spring Boot 3',
              'Spring AI (Gemini 1.5)',
              'RabbitMQ Async Queue',
              'Oracle SQL + MongoDB',
              'Azure DevOps CI/CD',
            ].map((tech) => (
              <View key={tech} style={styles.techPill}>
                <Text style={styles.techPillText}>{tech}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.userSessionCard}>
          <View style={styles.userSessionRow}>
            <Ionicons
              name="person-circle-outline"
              size={38}
              color={colors.primary}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.sessionUserTitle}>
                Sessão Ativa: {user?.nome || 'Munícipe'}
              </Text>
              <Text style={styles.sessionUserEmail}>
                {user?.email} • {user?.perfil || 'ROLE_CIDADAO'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutSolidButton}
            onPress={signOut}
            activeOpacity={0.85}
          >
            <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
            <Text style={styles.logoutSolidButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerVersionCard}>
          <View style={styles.footerVersionRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.footerVersionText}>{APP_VERSION}</Text>
              <Text style={styles.footerCommitText}>
                Commit Hash de Referência: {COMMIT_HASH_REF}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.copyHashBtn}
              onPress={handleCopyHash}
              activeOpacity={0.8}
            >
              <Ionicons
                name={copiedFeedback ? 'checkmark' : 'git-commit-outline'}
                size={16}
                color={copiedFeedback ? colors.primary : colors.accent}
              />
              <Text
                style={[
                  styles.copyHashText,
                  copiedFeedback && { color: colors.primary },
                ]}
              >
                {copiedFeedback ? 'Copiado' : `#${COMMIT_HASH_REF}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  heroCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  appTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  appVersionBadge: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  appDescription: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  sectionCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    gap: spacing.md,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  memberFormattedLine: {
    color: colors.accent,
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 2,
  },
  memberRole: {
    color: '#A1A1AA',
    fontSize: 11.5,
    marginTop: 2,
  },
  rmBadge: {
    alignItems: 'flex-end',
    backgroundColor: '#121212',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#333333',
  },
  rmText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  turmaSmall: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  techPillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  techPill: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  techPillText: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '600',
  },
  userSessionCard: {
    backgroundColor: '#1E1E1E',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  userSessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  sessionUserTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sessionUserEmail: {
    color: '#A1A1AA',
    fontSize: 12,
    marginTop: 2,
  },
  logoutSolidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#EF4444',
    minHeight: 50,
    borderRadius: radius.md,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  logoutSolidButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  footerVersionCard: {
    backgroundColor: '#121212',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#333333',
  },
  footerVersionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  footerVersionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  footerCommitText: {
    color: colors.primary,
    fontSize: 12.5,
    fontWeight: '700',
    marginTop: 4,
  },
  copyHashBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.accentMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  copyHashText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
});

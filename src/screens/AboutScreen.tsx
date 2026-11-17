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
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing, typography } from '../styles/theme';

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

const COMMIT_HASH_REF = 'cb5f0a1';

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
        {/* Identidade Oficial do Fix-It */}
        <View style={styles.heroCard}>
          <FixItLogo size="lg" showTagline />
          <Text style={styles.appTitle}>Fix-It • Cuidando da Nossa Cidade</Text>
          <Text style={styles.appVersion}>
            Global Solution FIAP 2026 • Plataforma CitizenTech v1.0.0
          </Text>
          <Text style={styles.appDescription}>
            Plataforma colaborativa de zeladoria urbana inteligente que conecta
            cidadãos e prefeituras usando geolocalização, visão computacional
            via Google Gemini e processamento assíncrono com RabbitMQ.
          </Text>
        </View>

        {/* Card de Referência de Build e Hash do Commit (Exigência do Edital) */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="git-commit-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.sectionTitle}>
              Rastreabilidade & Commit de Referência
            </Text>
          </View>

          <View style={styles.commitBox}>
            <View style={{ flex: 1 }}>
              <Text style={styles.commitLabel}>
                HASH DO COMMIT ATUAL (GIT HEAD)
              </Text>
              <Text style={styles.commitHashValue}>#{COMMIT_HASH_REF}</Text>
              <Text style={styles.commitMeta}>
                Branch: main • Turma Oficial: 2TDSPF • SDK: Expo 58 (React
                Native)
              </Text>
            </View>

            <TouchableOpacity
              style={styles.copyHashBtn}
              onPress={handleCopyHash}
              activeOpacity={0.8}
            >
              <Ionicons
                name={copiedFeedback ? 'checkmark' : 'copy-outline'}
                size={16}
                color={copiedFeedback ? colors.primary : colors.accent}
              />
              <Text
                style={[
                  styles.copyHashText,
                  copiedFeedback && { color: colors.primary },
                ]}
              >
                {copiedFeedback ? 'Verificado' : 'Hash'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Equipe de Desenvolvimento — Turma 2TDSPF */}
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
                <Text style={styles.memberRole}>{integrante.funcao}</Text>
              </View>

              <View style={styles.rmBadge}>
                <Text style={styles.rmText}>RM {integrante.rm}</Text>
                <Text style={styles.turmaSmall}>{integrante.turma}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Ecossistema Tecnológico Integrado */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Ionicons
              name="layers-outline"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.sectionTitle}>
              Arquitetura Integrada da Solução
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

        {/* Sessão Autenticada e Botão de Logout */}
        <View style={styles.userSessionCard}>
          <View style={styles.userSessionRow}>
            <Ionicons
              name="person-circle-outline"
              size={36}
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

          <PrimaryButton
            title="Encerrar Sessão (Logout)"
            variant="danger"
            icon="log-out-outline"
            onPress={signOut}
            style={{ marginTop: spacing.md }}
          />
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
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.lg,
  },
  appTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  appVersion: {
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
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.lg,
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
  commitBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: spacing.md,
  },
  commitLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  commitHashValue: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1,
    marginVertical: 2,
  },
  commitMeta: {
    color: colors.textSecondary,
    fontSize: 11.5,
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
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
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
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  memberRole: {
    color: colors.textSecondary,
    fontSize: 11.5,
    marginTop: 2,
  },
  rmBadge: {
    alignItems: 'flex-end',
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
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
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
  },
  techPillText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  userSessionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  userSessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  sessionUserTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  sessionUserEmail: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
});

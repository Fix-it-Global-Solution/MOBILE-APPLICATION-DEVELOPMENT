import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { FixItLogo } from '../components/FixItLogo';
import { CustomInput } from '../components/CustomInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing, typography } from '../styles/theme';
import { AuthStackParamList } from '../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('cidadao@fixit.com.br');
  const [senha, setSenha] = useState('Password@123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    setErrorMessage('');

    if (!email.trim() || !senha.trim()) {
      setErrorMessage('Preencha seu e-mail e senha para acessar o Fix-It.');
      return;
    }

    setLoading(true);
    try {
      await signIn({ email, senha });
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Não foi possível autenticar. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (tipo: 'CIDADAO' | 'GESTOR') => {
    setErrorMessage('');
    if (tipo === 'CIDADAO') {
      setEmail('cidadao@fixit.com.br');
      setSenha('Password@123');
    } else {
      setEmail('gestor@fixit.com.br');
      setSenha('Password@123');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Identidade Visual Oficial */}
          <View style={styles.headerSection}>
            <FixItLogo size="lg" showTagline />
            <Text style={styles.title}>Zeladoria Urbana Colaborativa</Text>
            <Text style={styles.subtitle}>
              Reporte problemas na sua rua, acione a triagem inteligente por IA
              e acompanhe as ordens de serviço municipais em tempo real.
            </Text>
          </View>

          {/* Card de Autenticação */}
          <View style={styles.formCard}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Acesso do Munícipe</Text>
              <View style={styles.jwtBadge}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={13}
                  color={colors.primary}
                />
                <Text style={styles.jwtBadgeText}>JWT Auth</Text>
              </View>
            </View>

            {!!errorMessage && (
              <View style={styles.errorBanner}>
                <Ionicons
                  name="warning-outline"
                  size={18}
                  color={colors.danger}
                />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            )}

            <CustomInput
              label="E-mail Cadastrado"
              placeholder="exemplo@fixit.com.br"
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />

            <CustomInput
              label="Senha de Acesso"
              placeholder="Digite sua senha"
              icon="lock-closed-outline"
              isPassword
              value={senha}
              onChangeText={setSenha}
            />

            <PrimaryButton
              title="Entrar na Plataforma"
              icon="log-in-outline"
              loading={loading}
              onPress={handleLogin}
              style={{ marginTop: spacing.xs }}
            />

            {/* Atalhos para Avaliação Rápida */}
            <View style={styles.demoSection}>
              <Text style={styles.demoLabel}>
                Preenchimento rápido (Credenciais de Teste API):
              </Text>
              <View style={styles.demoRow}>
                <TouchableOpacity
                  style={styles.demoChip}
                  onPress={() => fillDemoCredentials('CIDADAO')}
                >
                  <Ionicons
                    name="person-outline"
                    size={13}
                    color={colors.primary}
                  />
                  <Text style={styles.demoChipText}>Munícipe Cidadão</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.demoChip}
                  onPress={() => fillDemoCredentials('GESTOR')}
                >
                  <Ionicons
                    name="briefcase-outline"
                    size={13}
                    color={colors.accent}
                  />
                  <Text style={[styles.demoChipText, { color: colors.accent }]}>
                    Gestor Público
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Rodapé para Cadastro */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Ainda não possui conta?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.footerLink}>Cadastrar novo munícipe</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h2,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  subtitle: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
  },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.h3,
  },
  jwtBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  jwtBadgeText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerMuted,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorBannerText: {
    flex: 1,
    color: colors.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  demoSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  demoLabel: {
    color: colors.textMuted,
    fontSize: 11.5,
    marginBottom: spacing.sm,
  },
  demoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  demoChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  demoChipText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.xl,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});

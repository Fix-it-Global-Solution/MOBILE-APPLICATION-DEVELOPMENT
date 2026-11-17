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

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('cidadao@fixit.com');
  const [senha, setSenha] = useState('123456');
  const [loading, setLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [senhaError, setSenhaError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError('');
    setSenhaError('');
    setErrorMessage('');

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setEmailError('O campo de e-mail é obrigatório.');
      isValid = false;
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError('Informe um endereço de e-mail válido (ex: cidadao@fixit.com).');
      isValid = false;
    }

    if (!senha.trim()) {
      setSenhaError('O campo de senha é obrigatório.');
      isValid = false;
    } else if (senha.length < 6) {
      setSenhaError('A senha deve possuir no mínimo 6 caracteres.');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await signIn(email.trim(), senha);
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Não foi possível autenticar. Verifique suas credenciais.'
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (tipo: 'CIDADAO' | 'GESTOR') => {
    if (loading) return;
    setEmailError('');
    setSenhaError('');
    setErrorMessage('');

    if (tipo === 'CIDADAO') {
      setEmail('cidadao@fixit.com');
      setSenha('123456');
    } else {
      setEmail('gestor@fixit.com');
      setSenha('123456');
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
          <View style={styles.headerSection}>
            <FixItLogo size="lg" showTagline />
            <Text style={styles.title}>Zeladoria Urbana Colaborativa</Text>
            <Text style={styles.subtitle}>
              Reporte problemas na sua rua, acione a triagem inteligente por IA
              e acompanhe as ordens de serviço municipais em tempo real.
            </Text>
          </View>

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
              label="E-mail"
              placeholder="cidadao@fixit.com"
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
                if (errorMessage) setErrorMessage('');
              }}
              error={emailError}
            />

            <CustomInput
              label="Senha"
              placeholder="Digite sua senha"
              icon="lock-closed-outline"
              isPassword
              editable={!loading}
              value={senha}
              onChangeText={(text) => {
                setSenha(text);
                if (senhaError) setSenhaError('');
                if (errorMessage) setErrorMessage('');
              }}
              error={senhaError}
            />

            <PrimaryButton
              title="Entrar"
              icon="log-in-outline"
              loading={loading}
              disabled={loading}
              onPress={handleLogin}
              style={{ marginTop: spacing.xs }}
            />

            <View style={styles.demoSection}>
              <Text style={styles.demoLabel}>
                Atalho de Demonstração (DataSeeder Oficial):
              </Text>
              <View style={styles.demoRow}>
                <TouchableOpacity
                  style={[styles.demoChip, loading && styles.disabledChip]}
                  disabled={loading}
                  onPress={() => fillDemoCredentials('CIDADAO')}
                >
                  <Ionicons
                    name="person-outline"
                    size={13}
                    color={colors.primary}
                  />
                  <Text style={styles.demoChipText}>
                    Preencher Cidadão Demo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.demoChip, loading && styles.disabledChip]}
                  disabled={loading}
                  onPress={() => fillDemoCredentials('GESTOR')}
                >
                  <Ionicons
                    name="briefcase-outline"
                    size={13}
                    color={colors.accent}
                  />
                  <Text style={[styles.demoChipText, { color: colors.accent }]}>
                    Gestor Demo
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Ainda não tem conta?</Text>
            <TouchableOpacity
              disabled={loading}
              onPress={() => navigation.navigate('Register')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.footerLink}>Cadastre-se</Text>
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
    backgroundColor: '#0A0A0A',
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
    backgroundColor: '#121212',
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: '#333333',
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
    borderColor: '#EF4444',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorBannerText: {
    flex: 1,
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  demoSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#333333',
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
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
  },
  disabledChip: {
    opacity: 0.5,
  },
  demoChipText: {
    color: colors.primary,
    fontSize: 11.5,
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
    color: '#A1A1AA',
    fontSize: 14,
  },
  footerLink: {
    color: '#00E676',
    fontSize: 14,
    fontWeight: '700',
  },
});

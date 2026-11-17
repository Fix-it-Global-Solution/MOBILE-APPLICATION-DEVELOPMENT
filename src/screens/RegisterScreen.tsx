import React, { useState } from 'react';
import {
  Alert,
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
import { AuthStackParamList, PerfilUsuario } from '../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [perfil, setPerfil] = useState<PerfilUsuario>('ROLE_CIDADAO');
  const [loading, setLoading] = useState(false);

  const [nomeError, setNomeError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [senhaError, setSenhaError] = useState('');
  const [confirmarSenhaError, setConfirmarSenhaError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = (): boolean => {
    let isValid = true;
    setNomeError('');
    setEmailError('');
    setSenhaError('');
    setConfirmarSenhaError('');
    setErrorMessage('');

    const trimmedNome = nome.trim();
    const trimmedEmail = email.trim();

    if (!trimmedNome) {
      setNomeError('O nome completo é obrigatório.');
      isValid = false;
    } else if (trimmedNome.length < 3) {
      setNomeError('Informe seu nome completo (mínimo de 3 caracteres).');
      isValid = false;
    }

    if (!trimmedEmail) {
      setEmailError('O e-mail é obrigatório.');
      isValid = false;
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError('Informe um endereço de e-mail válido.');
      isValid = false;
    }

    if (!senha) {
      setSenhaError('A senha é obrigatória.');
      isValid = false;
    } else if (senha.length < 6) {
      setSenhaError('A senha deve ter no mínimo 6 caracteres.');
      isValid = false;
    }

    if (!confirmarSenha) {
      setConfirmarSenhaError('Confirme sua senha.');
      isValid = false;
    } else if (senha !== confirmarSenha) {
      setConfirmarSenhaError('As senhas informadas não coincidem.');
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    setSuccessMessage('');
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      setSuccessMessage('Cadastro realizado com sucesso! Autenticando...');
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Conta Criada com Sucesso!',
          'Bem-vindo ao Fix-It! Você será redirecionado automaticamente.'
        );
      }
      await signUp(nome.trim(), email.trim(), senha, perfil);
    } catch (err: any) {
      setSuccessMessage('');
      setErrorMessage(
        err?.message || 'Erro ao realizar o cadastro. Tente novamente.'
      );
    } finally {
      setLoading(false);
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
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              disabled={loading}
              onPress={() => navigation.goBack()}
            >
              <Ionicons
                name="arrow-back-outline"
                size={20}
                color={colors.textPrimary}
              />
            </TouchableOpacity>
            <FixItLogo size="sm" showTagline={false} />
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.title}>Cadastro de Munícipe</Text>
            <Text style={styles.subtitle}>
              Crie sua conta gratuita para registrar chamados geolocalizados e
              acompanhar a resolução pela prefeitura.
            </Text>
          </View>

          <View style={styles.formCard}>
            {!!errorMessage && (
              <View style={styles.errorBanner}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color={colors.danger}
                />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            )}

            {!!successMessage && (
              <View style={styles.successBanner}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text style={styles.successBannerText}>{successMessage}</Text>
              </View>
            )}

            <CustomInput
              label="Nome Completo"
              placeholder="Ex.: Gabriel Sbrana Campos"
              icon="person-outline"
              editable={!loading}
              value={nome}
              onChangeText={(text) => {
                setNome(text);
                if (nomeError) setNomeError('');
              }}
              error={nomeError}
            />

            <CustomInput
              label="E-mail"
              placeholder="seu.email@fixit.com"
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

            <Text style={styles.sectionLabel}>Perfil de Acesso (RBAC)</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
                disabled={loading}
                style={[
                  styles.roleOption,
                  perfil === 'ROLE_CIDADAO' && styles.roleOptionActive,
                ]}
                onPress={() => setPerfil('ROLE_CIDADAO')}
              >
                <Ionicons
                  name="people-outline"
                  size={16}
                  color={
                    perfil === 'ROLE_CIDADAO'
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.roleText,
                    perfil === 'ROLE_CIDADAO' && styles.roleTextActive,
                  ]}
                >
                  Cidadão (Padrão)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={loading}
                style={[
                  styles.roleOption,
                  perfil === 'ROLE_GESTOR' && styles.roleOptionActive,
                ]}
                onPress={() => setPerfil('ROLE_GESTOR')}
              >
                <Ionicons
                  name="construct-outline"
                  size={16}
                  color={
                    perfil === 'ROLE_GESTOR'
                      ? colors.primary
                      : colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.roleText,
                    perfil === 'ROLE_GESTOR' && styles.roleTextActive,
                  ]}
                >
                  Gestor Público
                </Text>
              </TouchableOpacity>
            </View>

            <CustomInput
              label="Senha"
              placeholder="Mínimo de 6 caracteres"
              icon="lock-closed-outline"
              isPassword
              editable={!loading}
              value={senha}
              onChangeText={(text) => {
                setSenha(text);
                if (senhaError) setSenhaError('');
              }}
              error={senhaError}
            />

            <CustomInput
              label="Confirmar Senha"
              placeholder="Repita a senha escolhida"
              icon="shield-checkmark-outline"
              isPassword
              editable={!loading}
              value={confirmarSenha}
              onChangeText={(text) => {
                setConfirmarSenha(text);
                if (confirmarSenhaError) setConfirmarSenhaError('');
              }}
              error={confirmarSenhaError}
            />

            <PrimaryButton
              title="Criar Conta"
              icon="checkmark-circle-outline"
              loading={loading}
              disabled={loading}
              onPress={handleRegister}
            />
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Já possui cadastro no Fix-It?</Text>
            <TouchableOpacity
              disabled={loading}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.footerLink}>Fazer Login</Text>
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
  },
  subtitle: {
    ...typography.body,
    marginTop: spacing.xs,
  },
  formCard: {
    backgroundColor: '#121212',
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: '#333333',
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
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  successBannerText: {
    flex: 1,
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: spacing.sm + 4,
    borderRadius: radius.md,
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#333333',
  },
  roleOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  roleText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  roleTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
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

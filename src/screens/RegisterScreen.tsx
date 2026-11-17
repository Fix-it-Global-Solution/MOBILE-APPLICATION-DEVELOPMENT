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
import { AuthStackParamList, PerfilUsuario } from '../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp } = useAuth();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [perfil, setPerfil] = useState<PerfilUsuario>('ROLE_CIDADAO');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleRegister = async () => {
    setErrorMessage('');

    if (!nome.trim() || !email.trim() || !senha.trim()) {
      setErrorMessage('Preencha todos os campos obrigatórios do cadastro.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMessage('Informe um endereço de e-mail válido.');
      return;
    }

    if (senha.length < 6) {
      setErrorMessage('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (senha !== confirmarSenha) {
      setErrorMessage('As senhas informadas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await signUp({
        nome,
        email,
        senha,
        perfil,
      });
    } catch (err: any) {
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
          {/* Botão Voltar + Cabeçalho */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
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

            <CustomInput
              label="Nome Completo"
              placeholder="Ex.: Gabriel Sbrana Campos"
              icon="person-outline"
              value={nome}
              onChangeText={setNome}
            />

            <CustomInput
              label="E-mail"
              placeholder="seu.email@dominio.com.br"
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />

            {/* Seletor de Perfil */}
            <Text style={styles.sectionLabel}>Perfil de Acesso (RBAC)</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity
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
                  Cidadão
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
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
              value={senha}
              onChangeText={setSenha}
            />

            <CustomInput
              label="Confirmar Senha"
              placeholder="Repita a senha escolhida"
              icon="shield-checkmark-outline"
              isPassword
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
            />

            <PrimaryButton
              title="Concluir Cadastro e Entrar"
              icon="checkmark-circle-outline"
              loading={loading}
              onPress={handleRegister}
            />
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Já possui cadastro no Fix-It?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
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
    backgroundColor: colors.background,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
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
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
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
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
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
    color: colors.textSecondary,
    fontSize: 14,
  },
  footerLink: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});

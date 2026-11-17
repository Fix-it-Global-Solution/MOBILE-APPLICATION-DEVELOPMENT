import React, { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { CustomInput } from '../components/CustomInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { useOcorrencias } from '../context/OcorrenciaContext';
import { CATEGORIAS_META, CRITICIDADE_META } from '../services/mockData';
import { colors, radius, spacing, typography } from '../styles/theme';
import {
  CategoriaOcorrencia,
  CriticidadeNivel,
  MainTabParamList,
} from '../types';

type Props = BottomTabScreenProps<MainTabParamList, 'CreateOcorrencia'>;

const SAMPLE_PHOTOS: Record<CategoriaOcorrencia, string> = {
  ASFALTO_BURACO:
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
  ILUMINACAO_PUBLICA:
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
  DRENAGEM_BUEIRO:
    'https://images.unsplash.com/photo-1541888946425-d09bb18086f6?auto=format&fit=crop&w=800&q=80',
  DESCARTE_LIXO:
    'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
  SINALIZACAO_VIARIA:
    'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=800&q=80',
  QUEDA_ARVORE:
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
};

export const CreateOcorrenciaScreen: React.FC<Props> = ({ navigation }) => {
  const { criarOcorrencia } = useOcorrencias();

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] =
    useState<CategoriaOcorrencia>('ASFALTO_BURACO');
  const [criticidade, setCriticidade] = useState<CriticidadeNivel>('CRITICA');
  const [enderecoReferencia, setEnderecoReferencia] = useState(
    'Av. Paulista, 1106 - Bela Vista, São Paulo - SP'
  );
  const [latitude, setLatitude] = useState<number>(-23.5641);
  const [longitude, setLongitude] = useState<number>(-46.6524);
  const [fotoUri, setFotoUri] = useState<string>('');
  const [loadingGps, setLoadingGps] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  const handleSelectCategoria = (cat: CategoriaOcorrencia) => {
    setCategoria(cat);
    setCriticidade(CATEGORIAS_META[cat].defaultCriticidade);
  };

  const handleCapturarGps = async () => {
    setLoadingGps(true);
    setErrorMessage('');
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Fallback para coordenadas da FIAP / Av. Paulista em simuladores sem GPS
        setLatitude(-23.56412);
        setLongitude(-46.65239);
        setEnderecoReferencia(
          'Av. Paulista, 1106 (Próximo à FIAP) - Bela Vista, SP'
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);

      const reverse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverse && reverse.length > 0) {
        const addr = reverse[0];
        const formatted = [
          addr.street,
          addr.streetNumber,
          addr.district || addr.subregion,
          addr.city,
        ]
          .filter(Boolean)
          .join(', ');
        if (formatted) {
          setEnderecoReferencia(formatted);
        }
      }
    } catch {
      setLatitude(-23.5614);
      setLongitude(-46.6558);
      setEnderecoReferencia('Av. Paulista, 1578 - Bela Vista, São Paulo - SP');
    } finally {
      setLoadingGps(false);
    }
  };

  const handleTirarFotoCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setFotoUri(SAMPLE_PHOTOS[categoria]);
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.7,
        allowsEditing: true,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setFotoUri(result.assets[0].uri);
      }
    } catch {
      setFotoUri(SAMPLE_PHOTOS[categoria]);
    }
  };

  const handleEscolherGaleria = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setFotoUri(SAMPLE_PHOTOS[categoria]);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsEditing: true,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setFotoUri(result.assets[0].uri);
      }
    } catch {
      setFotoUri(SAMPLE_PHOTOS[categoria]);
    }
  };

  const handleSubmit = async () => {
    setErrorMessage('');
    setSuccessBanner('');

    if (!titulo.trim() || titulo.trim().length < 5) {
      setErrorMessage(
        'Informe um título objetivo para o chamado (mínimo 5 caracteres).'
      );
      return;
    }

    if (!descricao.trim() || descricao.trim().length < 10) {
      setErrorMessage(
        'Descreva os detalhes do incidente para auxiliar a triagem da IA.'
      );
      return;
    }

    if (!enderecoReferencia.trim()) {
      setErrorMessage('Informe o endereço ou ponto de referência do local.');
      return;
    }

    setSubmitting(true);
    try {
      const criada = await criarOcorrencia({
        titulo,
        descricao,
        categoria,
        criticidade,
        latitude,
        longitude,
        enderecoReferencia,
        fotoUrl: fotoUri || SAMPLE_PHOTOS[categoria],
      });

      setTitulo('');
      setDescricao('');
      setFotoUri('');
      setSuccessBanner(
        `Ocorrência #${criada.protocoloOs} registrada e enviada para triagem IA!`
      );

      if (Platform.OS !== 'web') {
        Alert.alert(
          'Chamado Registrado com Sucesso!',
          `Protocolo: ${criada.protocoloOs}\nEncaminhado via RabbitMQ para: ${criada.secretariaRecomendada}`,
          [
            {
              text: 'Ver Meus Chamados',
              onPress: () => navigation.navigate('MyOcorrencias'),
            },
          ]
        );
      } else {
        setTimeout(() => {
          navigation.navigate('MyOcorrencias');
        }, 900);
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'Não foi possível registrar o chamado. Tente novamente.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Cabeçalho */}
          <View style={styles.headerBlock}>
            <View style={styles.aiBadge}>
              <Ionicons
                name="sparkles-outline"
                size={13}
                color={colors.primary}
              />
              <Text style={styles.aiBadgeText}>
                TRIAGEM AUTOMÁTICA SPRING AI + RABBITMQ
              </Text>
            </View>
            <Text style={styles.title}>Abrir Nova Ocorrência</Text>
            <Text style={styles.subtitle}>
              Registre um problema urbano com geolocalização e foto. Nossa IA
              classifica a gravidade e aciona a secretaria responsável.
            </Text>
          </View>

          {!!errorMessage && (
            <View style={styles.errorBanner}>
              <Ionicons
                name="alert-circle-outline"
                size={18}
                color={colors.danger}
              />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {!!successBanner && (
            <View style={styles.successBanner}>
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={colors.primary}
              />
              <Text style={styles.successText}>{successBanner}</Text>
            </View>
          )}

          {/* 1. Seletor de Categoria */}
          <Text style={styles.sectionLabel}>1. Categoria do Incidente</Text>
          <View style={styles.categoryGrid}>
            {(Object.keys(CATEGORIAS_META) as CategoriaOcorrencia[]).map(
              (catKey) => {
                const item = CATEGORIAS_META[catKey];
                const isSelected = categoria === catKey;
                return (
                  <TouchableOpacity
                    key={catKey}
                    style={[
                      styles.categoryCard,
                      isSelected && styles.categoryCardActive,
                    ]}
                    onPress={() => handleSelectCategoria(catKey)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={22}
                      color={isSelected ? colors.primary : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        isSelected && styles.categoryTextActive,
                      ]}
                      numberOfLines={2}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              }
            )}
          </View>

          {/* 2. Nível de Criticidade Percebida */}
          <Text style={styles.sectionLabel}>2. Grau de Criticidade / Risco</Text>
          <View style={styles.criticidadeRow}>
            {(
              ['CRITICA', 'ALTA', 'MEDIA', 'BAIXA'] as CriticidadeNivel[]
            ).map((nivel) => {
              const isSelected = criticidade === nivel;
              const cor = colors.criticidade[nivel];
              return (
                <TouchableOpacity
                  key={nivel}
                  style={[
                    styles.criticidadeChip,
                    isSelected && {
                      borderColor: cor,
                      backgroundColor: `${cor}22`,
                    },
                  ]}
                  onPress={() => setCriticidade(nivel)}
                >
                  <View
                    style={[styles.criticidadeDot, { backgroundColor: cor }]}
                  />
                  <Text
                    style={[
                      styles.criticidadeText,
                      isSelected && { color: cor, fontWeight: '800' },
                    ]}
                  >
                    {CRITICIDADE_META[nivel].label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* 3. Título e Descrição */}
          <View style={styles.formSection}>
            <CustomInput
              label="3. Título Resumido da Ocorrência"
              placeholder="Ex.: Cratera na faixa direita da Av. Paulista"
              icon="document-text-outline"
              maxLength={100}
              value={titulo}
              onChangeText={setTitulo}
            />

            <CustomInput
              label="4. Descrição Detalhada do Problema"
              placeholder="Informe dimensões aproximadas, riscos ao trânsito ou pedestres e pontos de referência..."
              icon="chatbox-ellipses-outline"
              multiline
              numberOfLines={4}
              maxLength={1000}
              value={descricao}
              onChangeText={setDescricao}
            />
          </View>

          {/* 5. Geolocalização GPS */}
          <View style={styles.geoCard}>
            <View style={styles.geoHeader}>
              <View style={styles.geoTitleRow}>
                <Ionicons name="location" size={18} color={colors.accent} />
                <Text style={styles.geoTitle}>5. Geolocalização Precisa</Text>
              </View>
              <Text style={styles.coordsBadge}>
                {latitude.toFixed(5)}, {longitude.toFixed(5)}
              </Text>
            </View>

            <CustomInput
              label="Endereço de Referência"
              placeholder="Rua, número e bairro"
              icon="map-outline"
              value={enderecoReferencia}
              onChangeText={setEnderecoReferencia}
            />

            <PrimaryButton
              title={
                loadingGps
                  ? 'Obtendo satélites GPS...'
                  : 'Atualizar Coordenadas pelo GPS Atual'
              }
              variant="secondary"
              icon="locate-outline"
              loading={loadingGps}
              onPress={handleCapturarGps}
            />
          </View>

          {/* 6. Evidência Fotográfica */}
          <View style={styles.photoCard}>
            <View style={styles.geoTitleRow}>
              <Ionicons name="camera" size={18} color={colors.primary} />
              <Text style={styles.geoTitle}>
                6. Foto do Incidente (Visão Computacional IA)
              </Text>
            </View>
            <Text style={styles.photoHint}>
              Fotografe o problema urbano para que o modelo Gemini 1.5 Flash
              valide a severidade e gere o parecer técnico.
            </Text>

            {fotoUri ? (
              <View style={styles.previewBox}>
                <Image source={{ uri: fotoUri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removePhotoBtn}
                  onPress={() => setFotoUri('')}
                >
                  <Ionicons name="trash-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.removePhotoText}>Remover Foto</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoActionsRow}>
                <TouchableOpacity
                  style={styles.photoBtn}
                  onPress={handleTirarFotoCamera}
                >
                  <Ionicons
                    name="camera-outline"
                    size={22}
                    color={colors.primary}
                  />
                  <Text style={styles.photoBtnText}>Câmera</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.photoBtn}
                  onPress={handleEscolherGaleria}
                >
                  <Ionicons
                    name="images-outline"
                    size={22}
                    color={colors.accent}
                  />
                  <Text style={styles.photoBtnText}>Galeria</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.photoBtn}
                  onPress={() => setFotoUri(SAMPLE_PHOTOS[categoria])}
                >
                  <Ionicons
                    name="sparkles-outline"
                    size={22}
                    color={colors.warning}
                  />
                  <Text style={styles.photoBtnText}>Foto Demo</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Botão de Envio */}
          <PrimaryButton
            title="Transmitir Chamado para Zeladoria"
            icon="paper-plane-outline"
            loading={submitting}
            onPress={handleSubmit}
            style={{ marginTop: spacing.md }}
          />
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
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  headerBlock: {
    marginBottom: spacing.lg,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: colors.primaryMuted,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  aiBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
  },
  title: {
    ...typography.h1,
  },
  subtitle: {
    ...typography.body,
    marginTop: spacing.xs,
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
  errorText: {
    flex: 1,
    color: colors.danger,
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
  successText: {
    flex: 1,
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryCard: {
    width: '31%',
    minHeight: 78,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  categoryCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  categoryText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoryTextActive: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  criticidadeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  criticidadeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  criticidadeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  criticidadeText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  formSection: {
    marginTop: spacing.xs,
  },
  geoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.lg,
  },
  geoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  geoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  geoTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
  },
  coordsBadge: {
    ...typography.mono,
    backgroundColor: colors.accentMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  photoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
  },
  photoHint: {
    color: colors.textSecondary,
    fontSize: 12.5,
    marginTop: 4,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  photoActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  photoBtn: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  photoBtnText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  previewBox: {
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 170,
    borderRadius: radius.md,
  },
  removePhotoBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(239, 68, 68, 0.9)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  removePhotoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

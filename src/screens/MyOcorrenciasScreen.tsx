import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { OcorrenciaCard } from '../components/OcorrenciaCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { useOcorrencias } from '../context/OcorrenciaContext';
import {
  CATEGORIAS_META,
  CRITICIDADE_META,
  STATUS_META,
} from '../services/mockData';
import { colors, radius, spacing, typography } from '../styles/theme';
import { MainTabParamList, Ocorrencia } from '../types';

type Props = BottomTabScreenProps<MainTabParamList, 'MyOcorrencias'>;

export const MyOcorrenciasScreen: React.FC<Props> = ({ navigation }) => {
  const {
    minhasOcorrencias,
    loading,
    refreshOcorrencias,
    excluirOcorrencia,
  } = useOcorrencias();

  const [busca, setBusca] = useState('');
  const [detalheSelecionado, setDetalheSelecionado] =
    useState<Ocorrencia | null>(null);
  const [confirmDeleteItem, setConfirmDeleteItem] =
    useState<Ocorrencia | null>(null);
  const [deleting, setDeleting] = useState(false);

  const listaFiltrada = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return minhasOcorrencias;
    return minhasOcorrencias.filter(
      (item) =>
        item.titulo.toLowerCase().includes(termo) ||
        item.enderecoReferencia.toLowerCase().includes(termo) ||
        (item.protocoloOs || '').toLowerCase().includes(termo)
    );
  }, [minhasOcorrencias, busca]);

  const handleConfirmDelete = async () => {
    if (!confirmDeleteItem) return;
    setDeleting(true);
    try {
      await excluirOcorrencia(confirmDeleteItem.id);
      if (detalheSelecionado?.id === confirmDeleteItem.id) {
        setDetalheSelecionado(null);
      }
      setConfirmDeleteItem(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Cabeçalho */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>Meus Chamados</Text>
            <Text style={styles.subtitle}>
              Acompanhe o parecer da IA ou cancele solicitações abertas
            </Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{minhasOcorrencias.length}</Text>
          </View>
        </View>

        {/* Barra de Pesquisa */}
        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.textSecondary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por protocolo, rua ou título..."
            placeholderTextColor={colors.textMuted}
            value={busca}
            onChangeText={setBusca}
          />
          {!!busca && (
            <TouchableOpacity onPress={() => setBusca('')}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Lista de Chamados do Usuário */}
        <FlatList
          data={listaFiltrada}
          keyExtractor={(item) => String(item.id)}
          refreshing={loading}
          onRefresh={refreshOcorrencias}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <OcorrenciaCard
              ocorrencia={item}
              showActions
              onPress={() => setDetalheSelecionado(item)}
              onDelete={() => setConfirmDeleteItem(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name="folder-open-outline"
                  size={34}
                  color={colors.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>
                Nenhuma ocorrência encontrada
              </Text>
              <Text style={styles.emptySubtitle}>
                Você ainda não possui chamados com este filtro ou não abriu
                solicitações de zeladoria.
              </Text>
              <PrimaryButton
                title="Abrir Novo Chamado Agora"
                icon="add-circle-outline"
                onPress={() => navigation.navigate('CreateOcorrencia')}
                style={{ marginTop: spacing.lg }}
              />
            </View>
          }
        />

        {/* MODAL DE DETALHES DA OCORRÊNCIA E PARECER IA */}
        <Modal
          visible={!!detalheSelecionado}
          transparent
          animationType="slide"
          onRequestClose={() => setDetalheSelecionado(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {detalheSelecionado && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.modalHeader}>
                    <View>
                      <Text style={styles.modalProtocol}>
                        ORDEM DE SERVIÇO #{detalheSelecionado.protocoloOs}
                      </Text>
                      <Text style={styles.modalTitle}>
                        {detalheSelecionado.titulo}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.closeBtn}
                      onPress={() => setDetalheSelecionado(null)}
                    >
                      <Ionicons
                        name="close"
                        size={20}
                        color={colors.textPrimary}
                      />
                    </TouchableOpacity>
                  </View>

                  {detalheSelecionado.fotoUrl && (
                    <Image
                      source={{ uri: detalheSelecionado.fotoUrl }}
                      style={styles.modalImage}
                    />
                  )}

                  <View style={styles.modalMetaGrid}>
                    <View style={styles.modalMetaItem}>
                      <Text style={styles.metaLabel}>STATUS ATUAL</Text>
                      <Text
                        style={[
                          styles.metaValue,
                          {
                            color: colors.status[detalheSelecionado.status],
                          },
                        ]}
                      >
                        {STATUS_META[detalheSelecionado.status].label}
                      </Text>
                    </View>

                    <View style={styles.modalMetaItem}>
                      <Text style={styles.metaLabel}>CRITICIDADE & SLA</Text>
                      <Text
                        style={[
                          styles.metaValue,
                          {
                            color:
                              colors.criticidade[
                                detalheSelecionado.criticidade
                              ],
                          },
                        ]}
                      >
                        {
                          CRITICIDADE_META[detalheSelecionado.criticidade]
                            .label
                        }{' '}
                        •{' '}
                        {
                          CRITICIDADE_META[detalheSelecionado.criticidade]
                            .slaHoras
                        }
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailBlock}>
                    <Text style={styles.detailSectionTitle}>
                      Categoria & Secretaria Designada
                    </Text>
                    <Text style={styles.detailText}>
                      {CATEGORIAS_META[detalheSelecionado.categoria].label} —{' '}
                      {detalheSelecionado.secretariaRecomendada}
                    </Text>
                  </View>

                  <View style={styles.detailBlock}>
                    <Text style={styles.detailSectionTitle}>
                      Descrição do Munícipe
                    </Text>
                    <Text style={styles.detailText}>
                      {detalheSelecionado.descricao}
                    </Text>
                  </View>

                  <View style={styles.detailBlock}>
                    <Text style={styles.detailSectionTitle}>
                      Localização Georreferenciada
                    </Text>
                    <Text style={styles.detailText}>
                      {detalheSelecionado.enderecoReferencia}
                    </Text>
                    <Text style={styles.coordsMono}>
                      Lat: {detalheSelecionado.latitude.toFixed(6)} | Lng:{' '}
                      {detalheSelecionado.longitude.toFixed(6)}
                    </Text>
                  </View>

                  {detalheSelecionado.parecerIa && (
                    <View style={styles.aiDetailCard}>
                      <View style={styles.aiHeaderRow}>
                        <Ionicons
                          name="hardware-chip-outline"
                          size={18}
                          color={colors.primary}
                        />
                        <Text style={styles.aiDetailTitle}>
                          Parecer Técnico Spring AI (Google Gemini)
                        </Text>
                      </View>
                      <Text style={styles.aiDetailBody}>
                        {detalheSelecionado.parecerIa}
                      </Text>
                    </View>
                  )}

                  <View style={styles.modalActions}>
                    <PrimaryButton
                      title="Cancelar / Excluir Chamado"
                      variant="danger"
                      icon="trash-outline"
                      onPress={() => {
                        const target = detalheSelecionado;
                        setDetalheSelecionado(null);
                        setConfirmDeleteItem(target);
                      }}
                    />
                    <PrimaryButton
                      title="Fechar Detalhes"
                      variant="outline"
                      onPress={() => setDetalheSelecionado(null)}
                      style={{ marginTop: spacing.sm }}
                    />
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>

        {/* MODAL DE CONFIRMAÇÃO DE CANCELAMENTO (DELETE) */}
        <Modal
          visible={!!confirmDeleteItem}
          transparent
          animationType="fade"
          onRequestClose={() => setConfirmDeleteItem(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.confirmCard}>
              <View style={styles.dangerCircle}>
                <Ionicons
                  name="trash-outline"
                  size={28}
                  color={colors.danger}
                />
              </View>
              <Text style={styles.confirmTitle}>
                Cancelar Ordem de Serviço?
              </Text>
              <Text style={styles.confirmSubtitle}>
                Tem certeza que deseja cancelar e remover o chamado{' '}
                <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
                  "{confirmDeleteItem?.titulo}"
                </Text>
                ? Esta ação não poderá ser desfeita.
              </Text>

              <View style={styles.confirmButtonsRow}>
                <PrimaryButton
                  title="Voltar"
                  variant="outline"
                  onPress={() => setConfirmDeleteItem(null)}
                  style={{ flex: 1 }}
                />
                <PrimaryButton
                  title="Confirmar Exclusão"
                  variant="danger"
                  loading={deleting}
                  onPress={handleConfirmDelete}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  title: {
    ...typography.h1,
  },
  subtitle: {
    ...typography.body,
    marginTop: 2,
  },
  countBadge: {
    minWidth: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.primaryMuted,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  countText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: spacing.md,
    height: 46,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
  },
  listContent: {
    paddingBottom: spacing.xxxl,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xxl,
    marginTop: spacing.xl,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  emptyIconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.h3,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  modalProtocol: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  modalTitle: {
    ...typography.h2,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalImage: {
    width: '100%',
    height: 180,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  modalMetaGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  modalMetaItem: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  metaLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
  },
  detailBlock: {
    marginBottom: spacing.md,
  },
  detailSectionTitle: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  detailText: {
    color: colors.textSecondary,
    fontSize: 13.5,
    lineHeight: 19,
  },
  coordsMono: {
    ...typography.mono,
    marginTop: 4,
  },
  aiDetailCard: {
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary,
    marginBottom: spacing.lg,
  },
  aiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  aiDetailTitle: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  aiDetailBody: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 19,
  },
  modalActions: {
    marginTop: spacing.xs,
  },
  confirmCard: {
    backgroundColor: colors.surface,
    margin: spacing.xl,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  dangerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.dangerMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  confirmTitle: {
    ...typography.h2,
    textAlign: 'center',
  },
  confirmSubtitle: {
    ...typography.body,
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  confirmButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
});

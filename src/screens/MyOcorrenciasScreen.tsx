import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import { CustomInput } from '../components/CustomInput';
import { OcorrenciaCard } from '../components/OcorrenciaCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { useOcorrencias } from '../context/OcorrenciaContext';
import {
  CATEGORIAS_META,
  CRITICIDADE_META,
  STATUS_META,
} from '../services/mockData';
import { colors, radius, spacing, typography } from '../styles/theme';
import {
  CategoriaOcorrencia,
  CriticidadeNivel,
  MainTabParamList,
  Ocorrencia,
  StatusOcorrencia,
} from '../types';

type Props = BottomTabScreenProps<MainTabParamList, 'MyOcorrencias'>;
type EscopoGestor = 'TODAS_OS' | 'MEUS_REGISTROS';

export const MyOcorrenciasScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const isGestor = user?.perfil === 'ROLE_GESTOR';

  const {
    ocorrencias,
    minhasOcorrencias,
    loading,
    refreshOcorrencias,
    atualizarOcorrencia,
    cancelarOcorrencia,
  } = useOcorrencias();

  const [escopoGestor, setEscopoGestor] = useState<EscopoGestor>('TODAS_OS');
  const [busca, setBusca] = useState('');
  const [detalheSelecionado, setDetalheSelecionado] =
    useState<Ocorrencia | null>(null);
  const [confirmDeleteItem, setConfirmDeleteItem] =
    useState<Ocorrencia | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [successFeedback, setSuccessFeedback] = useState('');

  const [editItem, setEditItem] = useState<Ocorrencia | null>(null);
  const [editTitulo, setEditTitulo] = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [editCategoria, setEditCategoria] =
    useState<CategoriaOcorrencia>('ASFALTO_BURACO');
  const [editCriticidade, setEditCriticidade] =
    useState<CriticidadeNivel>('CRITICA');
  const [editEndereco, setEditEndereco] = useState('');
  const [editStatus, setEditStatus] = useState<StatusOcorrencia>('ABERTO');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  const baseList = useMemo(() => {
    if (!isGestor) {
      return minhasOcorrencias;
    }
    return escopoGestor === 'TODAS_OS' ? ocorrencias : minhasOcorrencias;
  }, [isGestor, escopoGestor, ocorrencias, minhasOcorrencias]);

  const listaFiltrada = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return baseList;
    return baseList.filter(
      (item) =>
        item.titulo.toLowerCase().includes(termo) ||
        item.enderecoReferencia.toLowerCase().includes(termo) ||
        item.autorNome.toLowerCase().includes(termo) ||
        (item.protocoloOs || '').toLowerCase().includes(termo)
    );
  }, [baseList, busca]);

  const handleOpenEditModal = (item: Ocorrencia) => {
    setActionError('');
    setSuccessFeedback('');
    setEditError('');
    setEditItem(item);
    setEditTitulo(item.titulo);
    setEditDescricao(item.descricao);
    setEditCategoria(item.categoria);
    setEditCriticidade(item.criticidade);
    setEditEndereco(item.enderecoReferencia);
    setEditStatus(item.status);
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    setEditError('');

    if (!editTitulo.trim() || editTitulo.trim().length < 5) {
      setEditError('Informe um título com no mínimo 5 caracteres.');
      return;
    }

    if (!editDescricao.trim() || editDescricao.trim().length < 10) {
      setEditError('Informe uma descrição com no mínimo 10 caracteres.');
      return;
    }

    if (!editEndereco.trim()) {
      setEditError('Informe o endereço ou ponto de referência.');
      return;
    }

    setSavingEdit(true);
    try {
      const atualizada = await atualizarOcorrencia(editItem.id, {
        titulo: editTitulo,
        descricao: editDescricao,
        categoria: editCategoria,
        criticidade: editCriticidade,
        enderecoReferencia: editEndereco,
        status: isGestor ? editStatus : editItem.status,
      });

      if (detalheSelecionado?.id === atualizada.id) {
        setDetalheSelecionado(atualizada);
      }

      setEditItem(null);
      setSuccessFeedback(
        `Ocorrência #${atualizada.protocoloOs} atualizada com sucesso!`
      );

      if (Platform.OS !== 'web') {
        Alert.alert(
          'Ocorrência Atualizada!',
          `Os dados do chamado #${atualizada.protocoloOs} foram atualizados e sincronizados.`
        );
      }
    } catch (err: any) {
      setEditError(
        err?.message || 'Não foi possível salvar as alterações da ocorrência.'
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const requestCancelOcorrencia = (item: Ocorrencia) => {
    setActionError('');
    setSuccessFeedback('');
    if (item.status !== 'ABERTO') {
      const msg =
        'Apenas ocorrências com status "ABERTO" podem ser canceladas.';
      setActionError(msg);
      if (Platform.OS !== 'web') {
        Alert.alert('Cancelamento Indisponível', msg);
      }
      return;
    }

    if (Platform.OS !== 'web') {
      Alert.alert(
        'Cancelar Ordem de Serviço?',
        `Deseja realmente cancelar o chamado "${item.titulo}" (#${item.protocoloOs})? Esta ação não poderá ser desfeita.`,
        [
          { text: 'Voltar', style: 'cancel' },
          {
            text: 'Confirmar Cancelamento',
            style: 'destructive',
            onPress: async () => {
              setDeleting(true);
              try {
                await cancelarOcorrencia(item.id);
                if (detalheSelecionado?.id === item.id) {
                  setDetalheSelecionado(null);
                }
                setSuccessFeedback(
                  `Chamado #${item.protocoloOs} cancelado e removido.`
                );
              } catch (err: any) {
                setActionError(
                  err?.message || 'Não foi possível cancelar a ocorrência.'
                );
              } finally {
                setDeleting(false);
              }
            },
          },
        ]
      );
    } else {
      setConfirmDeleteItem(item);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteItem) return;
    setDeleting(true);
    setActionError('');
    try {
      await cancelarOcorrencia(confirmDeleteItem.id);
      if (detalheSelecionado?.id === confirmDeleteItem.id) {
        setDetalheSelecionado(null);
      }
      setSuccessFeedback(
        `Chamado #${confirmDeleteItem.protocoloOs} cancelado e removido.`
      );
      setConfirmDeleteItem(null);
    } catch (err: any) {
      setActionError(
        err?.message || 'Não foi possível cancelar a ocorrência.'
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>
              {isGestor ? 'Gestão de Chamados' : 'Meus Chamados'}
            </Text>
            <Text style={styles.subtitle}>
              {isGestor
                ? 'Gerencie todas as Ordens de Serviço dos munícipes ou seus próprios registros'
                : 'Acompanhe o parecer da IA, edite os dados ou cancele suas solicitações'}
            </Text>
          </View>
          <View style={styles.headerRightActions}>
            <View
              style={[
                styles.countBadge,
                isGestor && {
                  backgroundColor: colors.accentMuted,
                  borderColor: colors.accent,
                },
              ]}
            >
              <Text
                style={[
                  styles.countText,
                  isGestor && { color: colors.accent },
                ]}
              >
                {baseList.length}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.logoutHeaderBtn}
              onPress={signOut}
              activeOpacity={0.8}
              accessibilityLabel="Sair da Conta"
            >
              <Ionicons
                name="log-out-outline"
                size={18}
                color={colors.danger}
              />
            </TouchableOpacity>
          </View>
        </View>

        {isGestor && (
          <View style={styles.gestorSwitchRow}>
            <TouchableOpacity
              style={[
                styles.gestorSwitchBtn,
                escopoGestor === 'TODAS_OS' && styles.gestorSwitchBtnActive,
              ]}
              onPress={() => setEscopoGestor('TODAS_OS')}
            >
              <Ionicons
                name="briefcase-outline"
                size={14}
                color={
                  escopoGestor === 'TODAS_OS'
                    ? colors.textInverse
                    : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.gestorSwitchText,
                  escopoGestor === 'TODAS_OS' &&
                    styles.gestorSwitchTextActive,
                ]}
              >
                Todas as OS da Cidade ({ocorrencias.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.gestorSwitchBtn,
                escopoGestor === 'MEUS_REGISTROS' &&
                  styles.gestorSwitchBtnActive,
              ]}
              onPress={() => setEscopoGestor('MEUS_REGISTROS')}
            >
              <Ionicons
                name="person-outline"
                size={14}
                color={
                  escopoGestor === 'MEUS_REGISTROS'
                    ? colors.textInverse
                    : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.gestorSwitchText,
                  escopoGestor === 'MEUS_REGISTROS' &&
                    styles.gestorSwitchTextActive,
                ]}
              >
                Abertos por Mim ({minhasOcorrencias.length})
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.searchBar}>
          <Ionicons
            name="search-outline"
            size={18}
            color={colors.textSecondary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={
              isGestor
                ? 'Buscar por protocolo, solicitante, rua ou título...'
                : 'Buscar nos meus chamados por protocolo ou rua...'
            }
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

        {!!actionError && (
          <View style={styles.errorBanner}>
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={colors.danger}
            />
            <Text style={styles.errorBannerText}>{actionError}</Text>
          </View>
        )}

        {!!successFeedback && (
          <View style={styles.successBanner}>
            <Ionicons
              name="checkmark-circle-outline"
              size={18}
              color={colors.primary}
            />
            <Text style={styles.successBannerText}>{successFeedback}</Text>
          </View>
        )}

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
              onEdit={() => handleOpenEditModal(item)}
              onDelete={() => requestCancelOcorrencia(item)}
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
                Você ainda não possui chamados registrados neste filtro.
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
                    <View style={{ flex: 1 }}>
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
                      Solicitante do Chamado
                    </Text>
                    <Text style={styles.detailText}>
                      {detalheSelecionado.autorNome} (ID #{detalheSelecionado.usuarioId})
                    </Text>
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
                      Descrição do Incidente
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
                      title={
                        isGestor
                          ? 'Despachar / Editar Ordem de Serviço'
                          : 'Editar Dados da Minha Ocorrência'
                      }
                      variant="primary"
                      icon="create-outline"
                      onPress={() => {
                        const target = detalheSelecionado;
                        setDetalheSelecionado(null);
                        handleOpenEditModal(target);
                      }}
                    />

                    {detalheSelecionado.status === 'ABERTO' && (
                      <PrimaryButton
                        title="Cancelar / Excluir Chamado"
                        variant="danger"
                        icon="trash-outline"
                        onPress={() => {
                          const target = detalheSelecionado;
                          setDetalheSelecionado(null);
                          requestCancelOcorrencia(target);
                        }}
                        style={{ marginTop: spacing.sm }}
                      />
                    )}

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

        <Modal
          visible={!!editItem}
          transparent
          animationType="slide"
          onRequestClose={() => setEditItem(null)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalOverlay}
          >
            <View style={styles.modalCard}>
              {editItem && (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <View style={styles.modalHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalProtocol}>
                        EDITAR CHAMADO #{editItem.protocoloOs}
                      </Text>
                      <Text style={styles.modalTitle}>
                        {isGestor
                          ? 'Despacho & Atualização de OS'
                          : 'Editar Minha Ocorrência'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.closeBtn}
                      disabled={savingEdit}
                      onPress={() => setEditItem(null)}
                    >
                      <Ionicons
                        name="close"
                        size={20}
                        color={colors.textPrimary}
                      />
                    </TouchableOpacity>
                  </View>

                  {!!editError && (
                    <View style={styles.errorBanner}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={18}
                        color={colors.danger}
                      />
                      <Text style={styles.errorBannerText}>{editError}</Text>
                    </View>
                  )}

                  <Text style={styles.editSectionLabel}>
                    Categoria do Incidente
                  </Text>
                  <View style={styles.editChipsWrap}>
                    {(
                      Object.keys(CATEGORIAS_META) as CategoriaOcorrencia[]
                    ).map((catKey) => {
                      const isSelected = editCategoria === catKey;
                      return (
                        <TouchableOpacity
                          key={catKey}
                          style={[
                            styles.editOptionChip,
                            isSelected && styles.editOptionChipActive,
                          ]}
                          onPress={() => setEditCategoria(catKey)}
                        >
                          <Ionicons
                            name={CATEGORIAS_META[catKey].icon as any}
                            size={14}
                            color={
                              isSelected
                                ? colors.primary
                                : colors.textSecondary
                            }
                          />
                          <Text
                            style={[
                              styles.editOptionChipText,
                              isSelected && styles.editOptionChipTextActive,
                            ]}
                          >
                            {CATEGORIAS_META[catKey].label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <Text style={styles.editSectionLabel}>
                    Nível de Criticidade
                  </Text>
                  <View style={styles.editRowInline}>
                    {(
                      [
                        'CRITICA',
                        'ALTA',
                        'MEDIA',
                        'BAIXA',
                      ] as CriticidadeNivel[]
                    ).map((nivel) => {
                      const isSelected = editCriticidade === nivel;
                      const cor = colors.criticidade[nivel];
                      return (
                        <TouchableOpacity
                          key={nivel}
                          style={[
                            styles.editSmallChip,
                            isSelected && {
                              borderColor: cor,
                              backgroundColor: `${cor}22`,
                            },
                          ]}
                          onPress={() => setEditCriticidade(nivel)}
                        >
                          <Text
                            style={[
                              styles.editSmallChipText,
                              isSelected && { color: cor, fontWeight: '800' },
                            ]}
                          >
                            {CRITICIDADE_META[nivel].label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {isGestor && (
                    <>
                      <Text style={styles.editSectionLabel}>
                        Status da Ordem de Serviço (Exclusivo Gestor Público)
                      </Text>
                      <View style={styles.editRowInline}>
                        {(
                          [
                            'ABERTO',
                            'EM_ANALISE',
                            'EM_EXECUCAO',
                            'CONCLUIDO',
                          ] as StatusOcorrencia[]
                        ).map((st) => {
                          const isSelected = editStatus === st;
                          const cor = colors.status[st];
                          return (
                            <TouchableOpacity
                              key={st}
                              style={[
                                styles.editSmallChip,
                                isSelected && {
                                  borderColor: cor,
                                  backgroundColor: `${cor}22`,
                                },
                              ]}
                              onPress={() => setEditStatus(st)}
                            >
                              <Text
                                style={[
                                  styles.editSmallChipText,
                                  isSelected && {
                                    color: cor,
                                    fontWeight: '800',
                                  },
                                ]}
                              >
                                {STATUS_META[st].label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </>
                  )}

                  <CustomInput
                    label="Título da Ocorrência"
                    placeholder="Título resumido do problema"
                    icon="document-text-outline"
                    editable={!savingEdit}
                    value={editTitulo}
                    onChangeText={setEditTitulo}
                  />

                  <CustomInput
                    label="Descrição Detalhada"
                    placeholder="Descreva os detalhes atualizados..."
                    icon="chatbox-ellipses-outline"
                    multiline
                    numberOfLines={3}
                    editable={!savingEdit}
                    value={editDescricao}
                    onChangeText={setEditDescricao}
                  />

                  <CustomInput
                    label="Endereço de Referência"
                    placeholder="Rua, número e bairro"
                    icon="location-outline"
                    editable={!savingEdit}
                    value={editEndereco}
                    onChangeText={setEditEndereco}
                  />

                  <View style={styles.modalActions}>
                    <PrimaryButton
                      title="Salvar Alterações"
                      icon="checkmark-circle-outline"
                      loading={savingEdit}
                      disabled={savingEdit}
                      onPress={handleSaveEdit}
                    />
                    <PrimaryButton
                      title="Cancelar Edição"
                      variant="outline"
                      disabled={savingEdit}
                      onPress={() => setEditItem(null)}
                      style={{ marginTop: spacing.sm }}
                    />
                  </View>
                </ScrollView>
              )}
            </View>
          </KeyboardAvoidingView>
        </Modal>

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
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
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
  logoutHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.dangerMuted,
    borderWidth: 1,
    borderColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
  },
  gestorSwitchRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.sm + 2,
  },
  gestorSwitchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  gestorSwitchBtnActive: {
    backgroundColor: colors.accent,
  },
  gestorSwitchText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  gestorSwitchTextActive: {
    color: colors.textInverse,
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerMuted,
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
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
    marginBottom: spacing.md,
  },
  successBannerText: {
    flex: 1,
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
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
    maxHeight: '90%',
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
  editSectionLabel: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs + 2,
  },
  editChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  editOptionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 7,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  editOptionChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryMuted,
  },
  editOptionChipText: {
    color: colors.textSecondary,
    fontSize: 11.5,
    fontWeight: '600',
  },
  editOptionChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  editRowInline: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
    marginBottom: spacing.md,
  },
  editSmallChip: {
    flex: 1,
    minWidth: '22%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: radius.sm,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  editSmallChipText: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
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

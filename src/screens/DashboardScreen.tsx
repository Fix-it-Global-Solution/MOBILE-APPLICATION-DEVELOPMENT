import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import MapView, { Callout, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { FixItLogo } from '../components/FixItLogo';
import { OcorrenciaCard } from '../components/OcorrenciaCard';
import { useAuth } from '../context/AuthContext';
import { useOcorrencias } from '../context/OcorrenciaContext';
import {
  CATEGORIAS_META,
  CRITICIDADE_META,
  STATUS_META,
} from '../services/mockData';
import { colors, radius, spacing, typography } from '../styles/theme';
import {
  CriticidadeNivel,
  MainTabParamList,
  Ocorrencia,
  StatusOcorrencia,
} from '../types';

type Props = BottomTabScreenProps<MainTabParamList, 'Dashboard'>;

type FiltroCriticidade = 'TODAS' | CriticidadeNivel;
type ModoVisualizacao = 'MAPA_LISTA' | 'MAPA' | 'LISTA';

export const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#121212' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#A1A1AA' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#121212' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ color: '#2E2E2E' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#18181B' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#71717A' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#1E1E1E' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#2E2E2E' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#A1A1AA' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#27272A' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#1E1E1E' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0A0A0A' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#52525B' }],
  },
];

function getMarkerColor(ocorrencia: Ocorrencia): string {
  const statusMap: Record<StatusOcorrencia, string> = {
    ABERTO: '#EF4444',
    EM_ANALISE: '#F59E0B',
    EM_EXECUCAO: '#38BDF8',
    CONCLUIDO: '#00E676',
    CANCELADO: '#71717A',
  };

  if (ocorrencia.status === 'CONCLUIDO') return '#00E676';
  if (ocorrencia.status === 'EM_ANALISE') return '#F59E0B';
  if (ocorrencia.status === 'EM_EXECUCAO') return '#38BDF8';
  if (ocorrencia.criticidade === 'CRITICA') return '#EF4444';
  return statusMap[ocorrencia.status] || '#EF4444';
}

function coordsToCanvasPosition(lat: number, lng: number, index: number) {
  const minLat = -23.57;
  const maxLat = -23.55;
  const minLng = -46.666;
  const maxLng = -46.645;

  const normY = ((maxLat - lat) / (maxLat - minLat)) * 72 + 14;
  const normX = ((lng - minLng) / (maxLng - minLng)) * 74 + 13;

  const clampedX = Math.max(12, Math.min(86, normX || 20 + (index * 15) % 65));
  const clampedY = Math.max(14, Math.min(82, normY || 22 + (index * 17) % 60));

  return { left: `${clampedX}%` as const, top: `${clampedY}%` as const };
}

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const {
    ocorrencias,
    loading,
    error,
    listarOcorrencias,
    refreshOcorrencias,
  } = useOcorrencias();

  const [filtroCriticidade, setFiltroCriticidade] =
    useState<FiltroCriticidade>('TODAS');
  const [modoView, setModoView] = useState<ModoVisualizacao>('MAPA_LISTA');
  const [selectedPin, setSelectedPin] = useState<Ocorrencia | null>(null);

  useEffect(() => {
    listarOcorrencias().catch(() => {});
  }, [listarOcorrencias]);

  const ocorrenciasFiltradas = useMemo(() => {
    if (filtroCriticidade === 'TODAS') return ocorrencias;
    return ocorrencias.filter((o) => o.criticidade === filtroCriticidade);
  }, [ocorrencias, filtroCriticidade]);

  const activePin = useMemo(() => {
    if (
      selectedPin &&
      ocorrenciasFiltradas.some((o) => o.id === selectedPin.id)
    ) {
      return selectedPin;
    }
    return ocorrenciasFiltradas[0] || null;
  }, [selectedPin, ocorrenciasFiltradas]);

  const kpis = useMemo(() => {
    const total = ocorrencias.length;
    const criticasAltas = ocorrencias.filter(
      (o) => o.criticidade === 'CRITICA' || o.criticidade === 'ALTA'
    ).length;
    const emAndamento = ocorrencias.filter(
      (o) => o.status === 'EM_ANALISE' || o.status === 'EM_EXECUCAO'
    ).length;
    const concluidas = ocorrencias.filter(
      (o) => o.status === 'CONCLUIDO'
    ).length;
    return { total, criticasAltas, emAndamento, concluidas };
  }, [ocorrencias]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshOcorrencias}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.topHeader}>
          <View style={styles.brandRow}>
            <FixItLogo size="sm" showTagline={false} />
            <View style={styles.greetingBox}>
              <Text style={styles.greetingLabel}>
                {user?.perfil === 'ROLE_GESTOR'
                  ? 'GESTÃO PÚBLICA'
                  : 'PAINEL DE ZELADORIA'}
              </Text>
              <Text style={styles.greetingName} numberOfLines={1}>
                Olá, {user?.nome?.split(' ')[0] || 'Munícipe'}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.newCallBtn}
              onPress={() => navigation.navigate('CreateOcorrencia')}
              activeOpacity={0.85}
            >
              <Ionicons name="add-circle" size={17} color={colors.textInverse} />
              <Text style={styles.newCallBtnText}>Reportar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.aboutHeaderBtn}
              onPress={() => navigation.navigate('About')}
              activeOpacity={0.8}
              accessibilityLabel="Sobre o App"
            >
              <Ionicons
                name="information-circle-outline"
                size={19}
                color={colors.accent}
              />
            </TouchableOpacity>

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

        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiTopRow}>
              <Text style={styles.kpiValue}>{kpis.total}</Text>
              <Ionicons
                name="layers-outline"
                size={18}
                color={colors.accent}
              />
            </View>
            <Text style={styles.kpiLabel}>Total Mapeado</Text>
          </View>

          <View
            style={[
              styles.kpiCard,
              { borderColor: 'rgba(239, 68, 68, 0.35)' },
            ]}
          >
            <View style={styles.kpiTopRow}>
              <Text
                style={[
                  styles.kpiValue,
                  { color: colors.criticidade.CRITICA },
                ]}
              >
                {kpis.criticasAltas}
              </Text>
              <Ionicons
                name="flame-outline"
                size={18}
                color={colors.criticidade.CRITICA}
              />
            </View>
            <Text style={styles.kpiLabel}>Críticas / Altas</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiTopRow}>
              <Text
                style={[styles.kpiValue, { color: colors.criticidade.MEDIA }]}
              >
                {kpis.emAndamento}
              </Text>
              <Ionicons
                name="hardware-chip-outline"
                size={18}
                color={colors.criticidade.MEDIA}
              />
            </View>
            <Text style={styles.kpiLabel}>Triagem IA / OS</Text>
          </View>

          <View
            style={[
              styles.kpiCard,
              { borderColor: 'rgba(0, 230, 118, 0.35)' },
            ]}
          >
            <View style={styles.kpiTopRow}>
              <Text style={[styles.kpiValue, { color: colors.primary }]}>
                {kpis.concluidas}
              </Text>
              <Ionicons
                name="checkmark-done-outline"
                size={18}
                color={colors.primary}
              />
            </View>
            <Text style={styles.kpiLabel}>Concluídos</Text>
          </View>
        </View>

        <View style={styles.modeSwitchContainer}>
          <TouchableOpacity
            style={[
              styles.modeBtn,
              modoView === 'MAPA_LISTA' && styles.modeBtnActive,
            ]}
            onPress={() => setModoView('MAPA_LISTA')}
          >
            <Ionicons
              name="grid-outline"
              size={15}
              color={
                modoView === 'MAPA_LISTA'
                  ? colors.textInverse
                  : colors.textSecondary
              }
            />
            <Text
              style={[
                styles.modeBtnText,
                modoView === 'MAPA_LISTA' && styles.modeBtnTextActive,
              ]}
            >
              Visão Híbrida
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeBtn,
              modoView === 'MAPA' && styles.modeBtnActive,
            ]}
            onPress={() => setModoView('MAPA')}
          >
            <Ionicons
              name="map-outline"
              size={15}
              color={
                modoView === 'MAPA'
                  ? colors.textInverse
                  : colors.textSecondary
              }
            />
            <Text
              style={[
                styles.modeBtnText,
                modoView === 'MAPA' && styles.modeBtnTextActive,
              ]}
            >
              Mapa Interativo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modeBtn,
              modoView === 'LISTA' && styles.modeBtnActive,
            ]}
            onPress={() => setModoView('LISTA')}
          >
            <Ionicons
              name="list-outline"
              size={15}
              color={
                modoView === 'LISTA'
                  ? colors.textInverse
                  : colors.textSecondary
              }
            />
            <Text
              style={[
                styles.modeBtnText,
                modoView === 'LISTA' && styles.modeBtnTextActive,
              ]}
            >
              Lista ({ocorrenciasFiltradas.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {(
            ['TODAS', 'CRITICA', 'ALTA', 'MEDIA', 'BAIXA'] as FiltroCriticidade[]
          ).map((nivel) => {
            const isSelected = filtroCriticidade === nivel;
            const dotColor =
              nivel === 'TODAS'
                ? colors.primary
                : colors.criticidade[nivel];
            const label =
              nivel === 'TODAS'
                ? 'Todas as Criticidades'
                : `${CRITICIDADE_META[nivel].label}`;

            return (
              <TouchableOpacity
                key={nivel}
                style={[
                  styles.filterChip,
                  isSelected && {
                    borderColor: dotColor,
                    backgroundColor: `${dotColor}22`,
                  },
                ]}
                onPress={() => setFiltroCriticidade(nivel)}
              >
                <View
                  style={[styles.filterDot, { backgroundColor: dotColor }]}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && { color: colors.textPrimary, fontWeight: '700' },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {(modoView === 'MAPA_LISTA' || modoView === 'MAPA') && (
          <View style={styles.mapSection}>
            <View
              style={[
                styles.mapContainer,
                modoView === 'MAPA' && styles.mapContainerExpanded,
              ]}
            >
              {Platform.OS !== 'web' ? (
                <MapView
                  style={styles.nativeMapView}
                  customMapStyle={DARK_MAP_STYLE}
                  userInterfaceStyle="dark"
                  showsUserLocation
                  showsMyLocationButton
                  initialRegion={{
                    latitude: -23.5614,
                    longitude: -46.6558,
                    latitudeDelta: 0.025,
                    longitudeDelta: 0.025,
                  }}
                >
                  {ocorrenciasFiltradas.map((item) => {
                    const markerColor = getMarkerColor(item);
                    const statusLabel = STATUS_META[item.status].label;
                    const catLabel = CATEGORIAS_META[item.categoria].label;

                    return (
                      <Marker
                        key={item.id}
                        coordinate={{
                          latitude: item.latitude,
                          longitude: item.longitude,
                        }}
                        pinColor={markerColor}
                        onPress={() => setSelectedPin(item)}
                      >
                        <Callout tooltip>
                          <View style={styles.calloutCard}>
                            <View style={styles.calloutTopRow}>
                              <View
                                style={[
                                  styles.calloutDot,
                                  { backgroundColor: markerColor },
                                ]}
                              />
                              <Text
                                style={[
                                  styles.calloutStatus,
                                  { color: markerColor },
                                ]}
                              >
                                {statusLabel.toUpperCase()} • {item.criticidade}
                              </Text>
                            </View>
                            <Text style={styles.calloutTitle} numberOfLines={2}>
                              {item.titulo}
                            </Text>
                            <Text style={styles.calloutCategory}>
                              {catLabel}
                            </Text>
                            <Text
                              style={styles.calloutAddress}
                              numberOfLines={1}
                            >
                              {item.enderecoReferencia}
                            </Text>
                          </View>
                        </Callout>
                      </Marker>
                    );
                  })}
                </MapView>
              ) : (
                <>
                  <View style={[styles.gridLineHorizontal, { top: '25%' }]} />
                  <View style={[styles.gridLineHorizontal, { top: '50%' }]} />
                  <View style={[styles.gridLineHorizontal, { top: '75%' }]} />
                  <View style={[styles.gridLineVertical, { left: '25%' }]} />
                  <View style={[styles.gridLineVertical, { left: '50%' }]} />
                  <View style={[styles.gridLineVertical, { left: '75%' }]} />

                  <View style={styles.avenuePaulista} />
                  <View style={styles.avenueConsolacao} />
                  <View style={styles.avenueBrigadeiro} />

                  <View style={[styles.mapRoadLabel, { top: 12, left: 12 }]}>
                    <Ionicons
                      name="navigate-circle-outline"
                      size={13}
                      color={colors.primary}
                    />
                    <Text style={styles.mapRoadText}>
                      SÃO PAULO • EIXO PAULISTA / CENTRO EXPANDIDO
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.mapStreetName,
                      { top: '44%', left: '34%' },
                    ]}
                  >
                    AV. PAULISTA
                  </Text>
                  <Text
                    style={[
                      styles.mapStreetName,
                      { top: '20%', left: '14%' },
                    ]}
                  >
                    CONSOLAÇÃO
                  </Text>
                  <Text
                    style={[
                      styles.mapStreetName,
                      { bottom: '18%', right: '14%' },
                    ]}
                  >
                    JARDINS / BELA VISTA
                  </Text>

                  {ocorrenciasFiltradas.map((item, idx) => {
                    const pos = coordsToCanvasPosition(
                      item.latitude,
                      item.longitude,
                      idx
                    );
                    const pinColor = getMarkerColor(item);
                    const isSelected = activePin?.id === item.id;
                    const catMeta = CATEGORIAS_META[item.categoria];

                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.85}
                        onPress={() => setSelectedPin(item)}
                        style={[
                          styles.mapPinWrapper,
                          pos,
                          isSelected && styles.mapPinWrapperSelected,
                        ]}
                      >
                        <View
                          style={[
                            styles.pinHalo,
                            {
                              backgroundColor: `${pinColor}35`,
                              borderColor: pinColor,
                              transform: [{ scale: isSelected ? 1.25 : 1 }],
                            },
                          ]}
                        >
                          <View
                            style={[
                              styles.pinCore,
                              { backgroundColor: pinColor },
                            ]}
                          >
                            <Ionicons
                              name={catMeta.icon as any}
                              size={isSelected ? 15 : 13}
                              color="#0A0A0A"
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </>
              )}

              <View style={styles.mapLegendBar}>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: '#EF4444' }]}
                  />
                  <Text style={styles.legendText}>Aberto/Crítico</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: '#F59E0B' }]}
                  />
                  <Text style={styles.legendText}>Em Análise</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: '#38BDF8' }]}
                  />
                  <Text style={styles.legendText}>Execução</Text>
                </View>
                <View style={styles.legendItem}>
                  <View
                    style={[styles.legendDot, { backgroundColor: '#00E676' }]}
                  />
                  <Text style={styles.legendText}>Concluído</Text>
                </View>
              </View>
            </View>

            {activePin && (
              <View style={styles.selectedPinCard}>
                <View style={styles.selectedPinHeader}>
                  <View style={styles.selectedPinBadgeRow}>
                    <View
                      style={[
                        styles.criticidadePill,
                        {
                          backgroundColor: `${
                            colors.criticidade[activePin.criticidade]
                          }22`,
                          borderColor:
                            colors.criticidade[activePin.criticidade],
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.criticidadePillText,
                          {
                            color: colors.criticidade[activePin.criticidade],
                          },
                        ]}
                      >
                        CRITICIDADE {activePin.criticidade} •{' '}
                        {CRITICIDADE_META[activePin.criticidade].slaHoras}
                      </Text>
                    </View>

                    <Text style={styles.coordsMono}>
                      {activePin.latitude.toFixed(4)},{' '}
                      {activePin.longitude.toFixed(4)}
                    </Text>
                  </View>

                  <Text style={styles.selectedPinTitle}>
                    {activePin.titulo}
                  </Text>
                  <Text style={styles.selectedPinAddress}>
                    {activePin.enderecoReferencia}
                  </Text>

                  <View style={styles.selectedPinFooter}>
                    <View style={styles.statusInline}>
                      <Ionicons
                        name={STATUS_META[activePin.status].icon as any}
                        size={14}
                        color={colors.status[activePin.status]}
                      />
                      <Text
                        style={[
                          styles.statusInlineText,
                          { color: colors.status[activePin.status] },
                        ]}
                      >
                        {STATUS_META[activePin.status].label}
                      </Text>
                    </View>

                    <Text style={styles.secretariaText} numberOfLines={1}>
                      {activePin.secretariaRecomendada}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {(modoView === 'MAPA_LISTA' || modoView === 'LISTA') && (
          <View style={styles.listSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>
                Ocorrências Georreferenciadas
              </Text>
              <Text style={styles.sectionCount}>
                {ocorrenciasFiltradas.length} registros
              </Text>
            </View>

            {!!error && (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle-outline"
                  size={24}
                  color="#EF4444"
                />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => listarOcorrencias().catch(() => {})}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={16}
                    color={colors.textInverse}
                  />
                  <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                </TouchableOpacity>
              </View>
            )}

            {loading && ocorrencias.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>
                  Sincronizando ocorrências com a API Fix-It...
                </Text>
              </View>
            ) : (
              ocorrenciasFiltradas.map((item) => (
                <OcorrenciaCard
                  key={item.id}
                  ocorrencia={item}
                  onPress={() => setSelectedPin(item)}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#121212',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    flex: 1,
  },
  greetingBox: {
    flex: 1,
  },
  greetingLabel: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  greetingName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  newCallBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
  },
  newCallBtnText: {
    color: colors.textInverse,
    fontSize: 13,
    fontWeight: '800',
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
  aboutHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  kpiCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#1E1E1E',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#333333',
  },
  kpiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kpiValue: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  kpiLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  modeSwitchContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E1E1E',
    borderRadius: radius.md,
    padding: 4,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: spacing.md,
  },
  modeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  modeBtnActive: {
    backgroundColor: colors.primary,
  },
  modeBtnText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  modeBtnTextActive: {
    color: colors.textInverse,
  },
  filterScroll: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E1E1E',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#333333',
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterChipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  mapSection: {
    marginBottom: spacing.lg,
  },
  mapContainer: {
    height: 270,
    backgroundColor: '#0D1117',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#333333',
    overflow: 'hidden',
    position: 'relative',
  },
  mapContainerExpanded: {
    height: 390,
  },
  nativeMapView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  calloutCard: {
    width: 220,
    backgroundColor: '#1E1E1E',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#333333',
  },
  calloutTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  calloutDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  calloutStatus: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  calloutTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 17,
  },
  calloutCategory: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
  calloutAddress: {
    color: '#A1A1AA',
    fontSize: 11,
    marginTop: 2,
  },
  gridLineHorizontal: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  avenuePaulista: {
    position: 'absolute',
    top: '48%',
    left: -20,
    right: -20,
    height: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    transform: [{ rotate: '-14deg' }],
  },
  avenueConsolacao: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    left: '32%',
    width: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    transform: [{ rotate: '18deg' }],
  },
  avenueBrigadeiro: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    left: '68%',
    width: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    transform: [{ rotate: '-22deg' }],
  },
  mapRoadLabel: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(10, 10, 10, 0.85)',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#333333',
  },
  mapRoadText: {
    color: colors.textSecondary,
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  mapStreetName: {
    position: 'absolute',
    color: 'rgba(255, 255, 255, 0.22)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
  },
  mapPinWrapper: {
    position: 'absolute',
    marginLeft: -18,
    marginTop: -18,
    zIndex: 2,
  },
  mapPinWrapperSelected: {
    zIndex: 10,
  },
  pinHalo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinCore: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLegendBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(18, 18, 18, 0.92)',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: colors.textSecondary,
    fontSize: 10.5,
    fontWeight: '700',
  },
  selectedPinCard: {
    marginTop: spacing.sm,
    backgroundColor: '#1E1E1E',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#333333',
  },
  selectedPinHeader: {
    gap: 4,
  },
  selectedPinBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  criticidadePill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  criticidadePillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  coordsMono: {
    ...typography.mono,
    fontSize: 11,
  },
  selectedPinTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  selectedPinAddress: {
    color: '#A1A1AA',
    fontSize: 12,
  },
  selectedPinFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    gap: spacing.sm,
  },
  statusInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusInlineText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  secretariaText: {
    flex: 1,
    textAlign: 'right',
    color: colors.textMuted,
    fontSize: 11,
  },
  listSection: {
    marginTop: spacing.xs,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
  },
  sectionCount: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#333333',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  loadingText: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.md,
    textAlign: 'center',
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: colors.dangerMuted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EF4444',
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13.5,
    fontWeight: '600',
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#00E676',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    marginTop: spacing.xs,
  },
  retryButtonText: {
    color: '#0A0A0A',
    fontSize: 13,
    fontWeight: '800',
  },
});

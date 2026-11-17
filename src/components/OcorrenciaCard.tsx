import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  CATEGORIAS_META,
  CRITICIDADE_META,
  STATUS_META,
} from '../services/mockData';
import { colors, radius, spacing } from '../styles/theme';
import { Ocorrencia } from '../types';

interface OcorrenciaCardProps {
  ocorrencia: Ocorrencia;
  onPress?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export const OcorrenciaCard: React.FC<OcorrenciaCardProps> = ({
  ocorrencia,
  onPress,
  onDelete,
  showActions = false,
}) => {
  const criticidadeColor = colors.criticidade[ocorrencia.criticidade];
  const statusColor = colors.status[ocorrencia.status];
  const categoriaMeta = CATEGORIAS_META[ocorrencia.categoria];
  const statusMeta = STATUS_META[ocorrencia.status];
  const criticidadeMeta = CRITICIDADE_META[ocorrencia.criticidade];

  const formattedDate = new Date(ocorrencia.dataAbertura).toLocaleDateString(
    'pt-BR',
    {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }
  );

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      style={styles.card}
    >
      {/* Barra lateral de criticidade */}
      <View
        style={[
          styles.criticidadeStripe,
          { backgroundColor: criticidadeColor },
        ]}
      />

      <View style={styles.content}>
        {/* Cabeçalho com Badges */}
        <View style={styles.headerRow}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: `${criticidadeColor}20`,
                borderColor: criticidadeColor,
              },
            ]}
          >
            <View
              style={[styles.dot, { backgroundColor: criticidadeColor }]}
            />
            <Text style={[styles.badgeText, { color: criticidadeColor }]}>
              {criticidadeMeta.label.toUpperCase()}
            </Text>
          </View>

          <View
            style={[
              styles.badge,
              {
                backgroundColor: `${statusColor}18`,
                borderColor: statusColor,
              },
            ]}
          >
            <Ionicons
              name={statusMeta.icon as any}
              size={12}
              color={statusColor}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {statusMeta.label}
            </Text>
          </View>

          {ocorrencia.protocoloOs && (
            <Text style={styles.protocolText}>#{ocorrencia.protocoloOs}</Text>
          )}
        </View>

        {/* Título e Categoria */}
        <View style={styles.titleRow}>
          <View style={styles.categoryIconBox}>
            <Ionicons
              name={categoriaMeta.icon as any}
              size={20}
              color={colors.primary}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title} numberOfLines={2}>
              {ocorrencia.titulo}
            </Text>
            <Text style={styles.categoryLabel}>{categoriaMeta.label}</Text>
          </View>
          {ocorrencia.fotoUrl && (
            <Image
              source={{ uri: ocorrencia.fotoUrl }}
              style={styles.thumbnail}
            />
          )}
        </View>

        {/* Descrição */}
        <Text style={styles.description} numberOfLines={2}>
          {ocorrencia.descricao}
        </Text>

        {/* Localização e Data */}
        <View style={styles.metaRow}>
          <View style={styles.locationRow}>
            <Ionicons
              name="location-outline"
              size={14}
              color={colors.accent}
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {ocorrencia.enderecoReferencia}
            </Text>
          </View>
          <Text style={styles.dateText}>{formattedDate}</Text>
        </View>

        {/* Resumo Triagem IA */}
        {ocorrencia.parecerIa && (
          <View style={styles.aiBox}>
            <Ionicons
              name="sparkles-outline"
              size={14}
              color={colors.primary}
              style={{ marginTop: 2 }}
            />
            <Text style={styles.aiText} numberOfLines={2}>
              {ocorrencia.parecerIa}
            </Text>
          </View>
        )}

        {/* Ações (Detalhes e Cancelamento na tela Minhas Ocorrências) */}
        {showActions && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.detailButton}
              onPress={onPress}
              activeOpacity={0.8}
            >
              <Ionicons
                name="eye-outline"
                size={16}
                color={colors.accent}
              />
              <Text style={styles.detailButtonText}>Ver Parecer & OS</Text>
            </TouchableOpacity>

            {onDelete && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={onDelete}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={colors.danger}
                />
                <Text style={styles.deleteButtonText}>Cancelar Chamado</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  criticidadeStripe: {
    width: 5,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm + 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  protocolText: {
    marginLeft: 'auto',
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    marginBottom: spacing.sm,
  },
  categoryIconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  categoryLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.sm + 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  locationRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  dateText: {
    color: colors.textMuted,
    fontSize: 11,
  },
  aiBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: spacing.sm + 2,
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  aiText: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 11.5,
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
    gap: spacing.sm,
  },
  detailButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.accentMuted,
  },
  detailButtonText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.dangerMuted,
  },
  deleteButtonText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
});

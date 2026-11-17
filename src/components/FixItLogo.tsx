import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../styles/theme';

interface FixItLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const FixItLogo: React.FC<FixItLogoProps> = ({
  size = 'md',
  showTagline = true,
}) => {
  const dimensions =
    size === 'lg' ? 132 : size === 'md' ? 92 : 44;

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.logoWrapper,
          {
            width: dimensions,
            height: dimensions,
            borderRadius: size === 'sm' ? radius.md : radius.xl,
          },
        ]}
      >
        <Image
          source={require('../../assets/logo.png')}
          style={{ width: dimensions - 6, height: dimensions - 6 }}
          resizeMode="contain"
        />
      </View>

      {showTagline && (
        <View style={styles.textBlock}>
          <View style={styles.badgeRow}>
            <View style={styles.liveDot} />
            <Text style={styles.badgeText}>CITIZENTECH • ZELADORIA INTELIGENTE</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoWrapper: {
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  textBlock: {
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginRight: 6,
  },
  badgeText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
});

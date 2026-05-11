import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Stack, useLocalSearchParams } from 'expo-router';
import { GlassBackground, GlassCard, ThemedText } from '@dental/components';
import { useDentistQuery } from '@/features/dentists/hooks';

export function DentistDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const dentistId = Number(id);

  const { data: dentist, isLoading } = useDentistQuery(dentistId);

  if (isLoading || !dentist) {
    return (
      <GlassBackground>
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      </GlassBackground>
    );
  }

  return (
    <GlassBackground>
      <Stack.Screen options={{ title: dentist.name }} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type='title' style={styles.title}>
          {dentist.name}
        </ThemedText>

        <GlassCard variant='tinted' borderRadius={16} style={styles.card}>
          <InfoRow
            label={t('dentists.specialty', 'Specialty')}
            value={dentist.specialty}
          />
          <InfoRow label={t('dentists.phone', 'Phone')} value={dentist.phone} />
          <InfoRow label={t('dentists.email', 'Email')} value={dentist.email} />
          <InfoRow
            label={t('dentists.licenseNumber', 'License')}
            value={dentist.licenseNumber}
          />
          <InfoRow
            label={t('dentists.consultationDuration', 'Duration')}
            value={
              dentist.consultationDuration
                ? `${dentist.consultationDuration} min`
                : null
            }
          />
          <InfoRow
            label={t('dentists.status', 'Status')}
            value={
              dentist.isAvailable
                ? t('dentists.available', 'Available')
                : t('dentists.unavailable', 'Unavailable')
            }
          />
          {dentist.bio && (
            <View style={{ marginTop: 8 }}>
              <ThemedText type='default' style={styles.label}>
                {t('dentists.bio', 'Bio')}
              </ThemedText>
              <ThemedText type='default'>{dentist.bio}</ThemedText>
            </View>
          )}
        </GlassCard>
      </ScrollView>
    </GlassBackground>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <ThemedText type='default' style={styles.label}>
        {label}
      </ThemedText>
      <ThemedText type='default' weight='semibold'>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: 16,
    paddingBottom: 105,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  title: {
    marginBottom: 16,
  },
  card: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  label: {
    color: '#6B7280',
  },
});

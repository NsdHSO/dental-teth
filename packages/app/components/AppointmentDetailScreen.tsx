import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  GlassBackground,
  GlassCard,
  IconSymbol,
  ThemedText,
} from '@yuhuu/components';
import { useAppointmentQuery } from '@/features/appointments/hooks';
import {
  useAppointmentAttachmentsQuery,
  useDeleteAppointmentAttachmentMutation,
} from '@/features/appointment-attachments/hooks';

export function AppointmentDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: appointment, isLoading, isError } = useAppointmentQuery(id);

  const appointmentIdNum = Number(id);
  const { data: attachmentsData } = useAppointmentAttachmentsQuery(
    appointmentIdNum,
    { limit: 50 },
  );
  const deleteMutation =
    useDeleteAppointmentAttachmentMutation(appointmentIdNum);

  const handleDelete = useCallback(
    (attachmentId: number) => {
      Alert.alert(
        t('attachments.deleteTitle', 'Delete attachment'),
        t('attachments.deleteConfirm', 'Are you sure?'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.delete'),
            style: 'destructive',
            onPress: () => deleteMutation.mutate(attachmentId),
          },
        ],
      );
    },
    [deleteMutation, t],
  );

  if (isLoading) {
    return (
      <GlassBackground>
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      </GlassBackground>
    );
  }

  if (isError || !appointment) {
    return (
      <GlassBackground>
        <View style={styles.centered}>
          <ThemedText type='default'>
            {t('appointments.notFound', 'Appointment not found')}
          </ThemedText>
        </View>
      </GlassBackground>
    );
  }

  const attachments = attachmentsData?.data ?? [];

  return (
    <GlassBackground>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type='title' style={styles.title}>
          {t('appointments.detailTitle', 'Appointment')}
        </ThemedText>

        <GlassCard variant='tinted' borderRadius={16} style={styles.card}>
          <InfoRow
            label={t('appointments.date', 'Date')}
            value={`${appointment.date} ${appointment.time}`}
          />
          <InfoRow
            label={t('appointments.dentist', 'Dentist')}
            value={appointment.dentist}
          />
          <InfoRow
            label={t('appointments.patient', 'Patient')}
            value={
              appointment.patient.fullName ??
              `Patient #${appointment.patient.id}`
            }
          />
          {appointment.patient.phone && (
            <InfoRow
              label={t('patients.phone', 'Phone')}
              value={appointment.patient.phone}
            />
          )}
          {appointment.patient.email && (
            <InfoRow
              label={t('patients.email', 'Email')}
              value={appointment.patient.email}
            />
          )}
          {appointment.reason && (
            <InfoRow
              label={t('appointments.reason', 'Reason')}
              value={appointment.reason}
            />
          )}
        </GlassCard>

        <ThemedText type='subtitle' style={styles.sectionTitle}>
          {t('attachments.title', 'Attachments')}
        </ThemedText>

        {attachments.length === 0 && (
          <ThemedText type='default' style={{ color: '#9CA3AF' }}>
            {t('attachments.none', 'No attachments yet')}
          </ThemedText>
        )}

        {attachments.map((att) => (
          <GlassCard
            key={att.id}
            variant='tinted'
            borderRadius={12}
            style={styles.attachmentCard}
          >
            <View style={styles.attachmentRow}>
              <ThemedText type='default' weight='semibold'>
                {att.filename ?? `Attachment #${att.id}`}
              </ThemedText>
              <Pressable onPress={() => handleDelete(att.id)} hitSlop={8}>
                <IconSymbol name='trash' size={18} color='#EF4444' />
              </Pressable>
            </View>
            <ThemedText type='default' style={styles.meta}>
              {att.mimeType} · {formatBytes(att.sizeBytes)}
            </ThemedText>
          </GlassCard>
        ))}

        <Pressable
          onPress={() => {
            // TODO: integrate document/image picker
            Alert.alert(
              t('attachments.addTitle', 'Add attachment'),
              t(
                'attachments.pickerPlaceholder',
                'Image picker integration pending',
              ),
            );
          }}
          style={styles.addButton}
        >
          <IconSymbol name='plus' size={18} color='#1E40AF' />
          <ThemedText
            type='default'
            weight='semibold'
            style={styles.addButtonText}
          >
            {t('attachments.add', 'Add attachment')}
          </ThemedText>
        </Pressable>
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
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
    marginBottom: 20,
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
  sectionTitle: {
    marginTop: 8,
    marginBottom: 12,
  },
  attachmentCard: {
    padding: 14,
    marginBottom: 8,
  },
  attachmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  meta: {
    opacity: 0.7,
    marginTop: 2,
  },
  addButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DBEAFE',
    paddingVertical: 12,
    borderRadius: 12,
  },
  addButtonText: {
    color: '#1E40AF',
  },
});

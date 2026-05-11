import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  InteractionManager,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { getValidAccessToken, APP_BASE } from '@dental/auth';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  GlassBackground,
  GlassCard,
  IconSymbol,
  ThemedText,
} from '@dental/components';
import { useAppointmentQuery } from '@/features/appointments/hooks';
import {
  useAppointmentAttachmentsQuery,
  useDeleteAppointmentAttachmentMutation,
  useUploadAppointmentAttachmentMutation,
} from '@/features/appointment-attachments/hooks';
import { defaultExpoAttachmentPickerRepository } from '@/features/appointment-attachments/picker';
import type { UploadFile } from '@/features/appointment-attachments/types';
import { AttachmentPickerSheet } from './AttachmentPickerSheet';
import { AttachmentImageViewer } from './AttachmentImageViewer';

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
  const uploadMutation =
    useUploadAppointmentAttachmentMutation(appointmentIdNum);
  const sheetRef = useRef<BottomSheetModal>(null);
  const [token, setToken] = useState<string | null>(null);
  const [viewedAttachment, setViewedAttachment] = useState<typeof attachments[number] | null>(null);

  useEffect(() => {
    getValidAccessToken().then(setToken);
  }, []);

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

  const handleAddAttachment = useCallback(() => {
    if (Platform.OS === 'android') {
      InteractionManager.runAfterInteractions(() => {
        requestAnimationFrame(() => {
          sheetRef.current?.present();
        });
      });
    } else {
      sheetRef.current?.present();
    }
  }, []);

  const handleFileSelected = useCallback(
    (file: UploadFile) => {
      sheetRef.current?.dismiss();
      uploadMutation.mutate(file);
    },
    [uploadMutation],
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

        {attachments.map((att) => {
          const isImage = att.mimeType?.startsWith('image/');
          const thumbUri = isImage
            ? `${APP_BASE}/appointments/${appointmentIdNum}/attachments/${att.id}/download`
            : null;

          return (
            <Pressable
              key={att.id}
              onPress={() => isImage && setViewedAttachment(att)}
              disabled={!isImage}
            >
              <GlassCard
                variant='tinted'
                borderRadius={12}
                style={styles.attachmentCard}
              >
                <View style={styles.attachmentRow}>
                  <View style={styles.attachmentLeft}>
                    {isImage && token && thumbUri ? (
                      <Image
                        source={{
                          uri: thumbUri,
                          headers: { Authorization: `Bearer ${token}` },
                        }}
                        style={styles.thumbnail}
                        resizeMode='cover'
                      />
                    ) : (
                      <IconSymbol
                        name='doc.text'
                        size={24}
                        color='#6B7280'
                        style={{ marginRight: 12 }}
                      />
                    )}
                    <View>
                      <ThemedText type='default' weight='semibold'>
                        {att.filename ?? `Attachment #${att.id}`}
                      </ThemedText>
                      <ThemedText type='default' style={styles.meta}>
                        {att.mimeType} · {formatBytes(att.sizeBytes)}
                      </ThemedText>
                    </View>
                  </View>
                  <Pressable onPress={() => handleDelete(att.id)} hitSlop={8}>
                    <IconSymbol name='trash' size={18} color='#EF4444' />
                  </Pressable>
                </View>
              </GlassCard>
            </Pressable>
          );
        })}

        {uploadMutation.isPending ? (
          <View style={styles.uploadingRow}>
            <ActivityIndicator size='small' color='#1E40AF' />
            <ThemedText type='default' style={styles.uploadingText}>
              {t('attachments.uploading', 'Uploading...')}
            </ThemedText>
          </View>
        ) : (
          <Pressable onPress={handleAddAttachment} style={styles.addButton}>
            <IconSymbol name='plus' size={18} color='#1E40AF' />
            <ThemedText
              type='default'
              weight='semibold'
              style={styles.addButtonText}
            >
              {t('attachments.add', 'Add attachment')}
            </ThemedText>
          </Pressable>
        )}
        <AttachmentPickerSheet
          ref={sheetRef}
          onSelect={handleFileSelected}
          repository={defaultExpoAttachmentPickerRepository}
        />
        <AttachmentImageViewer
          visible={viewedAttachment !== null}
          onClose={() => setViewedAttachment(null)}
          appointmentId={appointmentIdNum}
          attachmentId={viewedAttachment?.id ?? 0}
          filename={viewedAttachment?.filename ?? null}
        />
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
  attachmentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
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
  uploadingRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  uploadingText: {
    color: '#1E40AF',
  },
});

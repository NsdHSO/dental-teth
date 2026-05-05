import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
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
import { usePatientQuery } from '@/features/patients/hooks';
import { useAppointmentsQuery } from '@/features/appointments/hooks';
import {
  usePatientBillingsQuery,
  useMarkPatientBillingPaidMutation,
} from '@/features/patient-billings/hooks';
import { usePatientAttachmentsQuery } from '@/features/patient-attachments/hooks';

function formatAmount(cents: number, currency: string): string {
  const main = Math.floor(cents / 100);
  const frac = cents % 100;
  const symbol = currency?.toUpperCase() ?? 'USD';
  return `${symbol} ${main}.${String(frac).padStart(2, '0')}`;
}

export function PatientDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const patientId = Number(id);

  const { data: patient, isLoading: patientLoading } =
    usePatientQuery(patientId);
  const { data: appointmentsData } = useAppointmentsQuery({
    patient_id: patientId,
    limit: 20,
  });
  const { data: billingsData } = usePatientBillingsQuery(patientId, {
    limit: 20,
  });
  const { data: attachmentsData } = usePatientAttachmentsQuery(patientId, {
    limit: 20,
  });
  const markPaid = useMarkPatientBillingPaidMutation(patientId);

  if (patientLoading || !patient) {
    return (
      <GlassBackground>
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      </GlassBackground>
    );
  }

  const appointments = appointmentsData?.data ?? [];
  const billings = billingsData?.data ?? [];
  const attachments = attachmentsData?.data ?? [];

  const handleMarkPaid = (billingId: number) => {
    Alert.alert(
      t('billings.markPaidTitle', 'Mark as Paid'),
      t('billings.markPaidConfirm', 'Confirm this billing is paid?'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: () => markPaid.mutate(billingId),
        },
      ],
    );
  };

  const handleOpenAttachment = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert(t('common.error'), t('attachments.openFailed'));
    });
  };

  return (
    <GlassBackground>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type='title' style={styles.title}>
          {patient.fullName ?? `Patient #${patient.id}`}
        </ThemedText>

        <GlassCard variant='tinted' borderRadius={16} style={styles.card}>
          <InfoRow label={t('patients.phone', 'Phone')} value={patient.phone} />
          <InfoRow label={t('patients.email', 'Email')} value={patient.email} />
          <InfoRow label={t('patients.cnp', 'CNP')} value={patient.cnp} />
          <InfoRow
            label={t('patients.allergies', 'Allergies')}
            value={patient.allergies}
          />
          <InfoRow
            label={t('patients.medicalNotes', 'Medical Notes')}
            value={patient.medicalNotes}
          />
        </GlassCard>

        <ThemedText type='subtitle' style={styles.sectionTitle}>
          {t('patients.appointmentsHistory', 'Appointments History')}
        </ThemedText>

        {appointments.length === 0 && (
          <ThemedText type='default' style={{ color: '#9CA3AF' }}>
            {t('patients.noAppointments', 'No appointments yet')}
          </ThemedText>
        )}

        {appointments.map((apt) => (
          <GlassCard
            key={apt.id}
            variant='tinted'
            borderRadius={12}
            style={styles.appointmentCard}
          >
            <View style={styles.appointmentRow}>
              <ThemedText type='default' weight='semibold'>
                {apt.date} {apt.time}
              </ThemedText>
              <ThemedText type='default' style={styles.meta}>
                {apt.dentist}
              </ThemedText>
            </View>
            {apt.reason && (
              <ThemedText type='default' style={styles.meta}>
                {apt.reason}
              </ThemedText>
            )}
          </GlassCard>
        ))}

        <ThemedText type='subtitle' style={styles.sectionTitle}>
          {t('patients.billings', 'Billings')}
        </ThemedText>

        {billings.length === 0 && (
          <ThemedText type='default' style={{ color: '#9CA3AF' }}>
            {t('patients.noBillings', 'No billings yet')}
          </ThemedText>
        )}

        {billings.map((b) => (
          <GlassCard
            key={b.id}
            variant='tinted'
            borderRadius={12}
            style={styles.billingCard}
          >
            <View style={styles.billingRow}>
              <ThemedText type='default' weight='semibold'>
                {formatAmount(b.amountCents, b.currency)}
              </ThemedText>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor:
                      b.status === 'paid' ? '#10B981' : '#FBBF24',
                  },
                ]}
              >
                <ThemedText size='xs' style={styles.statusText}>
                  {b.status.toUpperCase()}
                </ThemedText>
              </View>
            </View>
            {b.description && (
              <ThemedText type='default' style={styles.meta}>
                {b.description}
              </ThemedText>
            )}
            {b.status !== 'paid' && (
              <Pressable
                onPress={() => handleMarkPaid(b.id)}
                style={styles.markPaidButton}
              >
                <ThemedText type='default' style={styles.markPaidText}>
                  {t('billings.markPaid', 'Mark Paid')}
                </ThemedText>
              </Pressable>
            )}
          </GlassCard>
        ))}

        <ThemedText type='subtitle' style={styles.sectionTitle}>
          {t('patients.attachments', 'Attachments')}
        </ThemedText>

        {attachments.length === 0 && (
          <ThemedText type='default' style={{ color: '#9CA3AF' }}>
            {t('patients.noAttachments', 'No attachments yet')}
          </ThemedText>
        )}

        {attachments.map((att) => (
          <Pressable
            key={att.id}
            onPress={() => handleOpenAttachment(att.storageUrl)}
          >
            <GlassCard
              variant='tinted'
              borderRadius={12}
              style={styles.attachmentCard}
            >
              <ThemedText type='default' weight='semibold'>
                {att.originalFilename ?? `Attachment #${att.id}`}
              </ThemedText>
              <ThemedText type='default' style={styles.meta}>
                {att.mimeType} · {att.kind}
              </ThemedText>
            </GlassCard>
          </Pressable>
        ))}
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
  appointmentCard: {
    padding: 14,
    marginBottom: 8,
  },
  appointmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  billingCard: {
    padding: 14,
    marginBottom: 8,
  },
  billingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    color: '#FFF',
    fontWeight: '600',
  },
  markPaidButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  markPaidText: {
    color: '#1E40AF',
    fontWeight: '600',
  },
  attachmentCard: {
    padding: 14,
    marginBottom: 8,
  },
  meta: {
    opacity: 0.7,
    marginTop: 2,
  },
});

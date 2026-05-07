import React, { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';

import {
  AppointmentsCalendarOrganism,
  ThemedText,
  type AppointmentAgendaItem,
  type CreateAppointmentInput,
  type PatientSuggestion,
} from '@dental/components';

import {
  useAppointmentsQuery,
  useCreateAppointmentMutation,
} from '@/features/appointments/hooks';
import {
  type Appointment,
  type AppointmentInput,
} from '@/features/appointments/types';
import { type AppointmentsRepository } from '@/features/appointments/repository';
import { usePatientAutocompleteQuery } from '@/features/patients/hooks';

export type AppointmentsCalendarContainerProps = {
  /** Optional repository (defaults to the feature's default). Useful for tests/mocks. */
  repo?: AppointmentsRepository;
  initialDate?: string;
  testID?: string;
};

function toAgendaItem(a: Appointment): AppointmentAgendaItem {
  return {
    id: a.id,
    date: a.date,
    time: a.time,
    dentist: a.dentist,
    reason: a.reason ?? '',
    patient_name: a.patient.fullName ?? a.dentist,
    status: undefined,
  };
}

function toAppointmentInput(input: CreateAppointmentInput): AppointmentInput {
  return {
    patient_id: input.patient_id,
    dentist_id: input.dentist_id,
    appointment_date: input.date,
    appointment_time: input.time,
    duration: input.duration,
    reason: input.reason,
  };
}

/**
 * Connects the appointments React-Query hooks (list + create) to the
 * presentational `AppointmentsCalendarOrganism`. This is the integration
 * layer — the organism stays UI-only.
 */
export function AppointmentsCalendarContainer({
  repo,
  initialDate,
  testID = 'appointments-calendar',
}: AppointmentsCalendarContainerProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate ?? new Date().toISOString().split('T')[0],
  );
  const [patientQuery, setPatientQuery] = useState('');

  const { data, isLoading, isError, refetch } = useAppointmentsQuery(
    { limit: 100 },
    repo,
  );
  const createMutation = useCreateAppointmentMutation(repo);
  const { data: patientResults, isLoading: patientsLoading } =
    usePatientAutocompleteQuery(patientQuery);

  const appointments = useMemo<AppointmentAgendaItem[]>(
    () => (data?.data ?? []).map(toAgendaItem),
    [data],
  );

  const patientSuggestions: PatientSuggestion[] = useMemo(
    () =>
      (patientResults ?? []).map((p) => ({
        id: p.patientId,
        label: p.fullName ?? `Patient #${p.patientId}`,
      })),
    [patientResults],
  );

  const handleCreate = (input: CreateAppointmentInput) => {
    createMutation.mutate(toAppointmentInput(input), {
      onSuccess: () => {
        // Jump the agenda to the date we just created an appointment on.
        setSelectedDate(input.date);
        setPatientQuery('');
      },
    });
  };

  const handleAppointmentPress = (item: AppointmentAgendaItem) => {
    router.push(`/appointments/${item.id}`);
  };

  if (isLoading) {
    return (
      <View testID={`${testID}-loading`} style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isError) {
    return (
      <View testID={`${testID}-error`} style={styles.centered}>
        <ThemedText>{t('common.error', 'Something went wrong')}</ThemedText>
        <ThemedText
          onPress={() => {
            refetch().catch(() => {});
          }}
          style={styles.retry}
          type='link'
        >
          {t('common.retry', 'Retry')}
        </ThemedText>
      </View>
    );
  }

  return (
    <AppointmentsCalendarOrganism
      appointments={appointments}
      selectedDate={selectedDate}
      onDateSelect={setSelectedDate}
      onCreateAppointment={handleCreate}
      onAppointmentPress={handleAppointmentPress}
      patientSuggestions={patientSuggestions}
      patientSuggestionsLoading={patientsLoading}
      onPatientQueryChange={setPatientQuery}
      isCreating={createMutation.isPending}
      testID={testID}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  retry: {
    marginTop: 8,
  },
});

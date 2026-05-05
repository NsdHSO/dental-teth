import React, {useMemo, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useRouter} from 'expo-router';
import {GlassBackground, ThemedText} from '@yuhuu/components';
import {AppointmentsCalendarOrganism, type AppointmentAgendaItemExtended, type CreateAppointmentInput, type PatientSuggestion} from '@yuhuu/components';
import {useAppointmentsQuery, useCreateAppointmentMutation} from '@/features/appointments/hooks';
import type {Appointment, AppointmentInput} from '@/features/appointments/types';
import {defaultAppointmentsRepository} from '@/features/appointments/repository';
import {usePatientAutocompleteQuery} from '@/features/patients/hooks';

export function AppointmentsScreen() {
    const {t} = useTranslation();
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [patientQuery, setPatientQuery] = useState('');
    const {data, isLoading, isError, refetch} = useAppointmentsQuery({limit: 100}, defaultAppointmentsRepository);
    const createMutation = useCreateAppointmentMutation(defaultAppointmentsRepository);
    const {data: patientResults, isLoading: patientsLoading} = usePatientAutocompleteQuery(patientQuery);

    const appointments = useMemo<AppointmentAgendaItemExtended[]>(() => (data?.data ?? []).map(toAgendaItem), [data]);

    const patientSuggestions: PatientSuggestion[] = useMemo(
        () => (patientResults ?? []).map((p) => ({id: p.patientId, label: p.fullName ?? `Patient #${p.patientId}`})),
        [patientResults]
    );

    const handleCreate = (input: CreateAppointmentInput) => {
        createMutation.mutate(toAppointmentInput(input), {
            onSuccess: () => {
                setSelectedDate(input.date);
                setPatientQuery('');
            },
        });
    };

    const handleAppointmentPress = (item: AppointmentAgendaItemExtended) => {
        router.push(`/appointments/${item.id}`);
    };

    if (isLoading) return <View style={styles.centered}><ActivityIndicator /></View>;
    if (isError) return <View style={styles.centered}><ThemedText>{t('common.error')}</ThemedText><ThemedText onPress={() => { refetch().catch(() => {}); }} type="link">{t('common.retry')}</ThemedText></View>;

    return (
        <GlassBackground>
            <View style={styles.container}>
                <ThemedText type="title" style={styles.title}>{t('appointments.title')}</ThemedText>
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
                    testID="appointments-calendar"
                />
            </View>
        </GlassBackground>
    );
}

function toAgendaItem(a: Appointment): AppointmentAgendaItemExtended {
    return {id: a.id, date: a.date, time: a.time, dentist: a.dentist, reason: a.reason ?? '', patient_name: a.patient.fullName ?? a.dentist, status: undefined};
}

function toAppointmentInput(input: CreateAppointmentInput): AppointmentInput {
    return {patient_id: input.patient_id, dentist_id: input.dentist_id, appointment_date: input.date, appointment_time: input.time, duration: input.duration, reason: input.reason};
}

const styles = StyleSheet.create({
    centered: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8},
    container: {flex: 1, padding: 16, paddingBottom: 105},
    title: {paddingTop: 8, marginBottom: 16},
});

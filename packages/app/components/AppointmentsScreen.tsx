import React, {useMemo, useState} from 'react';
import {ActivityIndicator, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {GlassBackground, ThemedText} from '@yuhuu/components';
import {AppointmentsCalendarOrganism, type AppointmentAgendaItemExtended} from '@yuhuu/components';
import {useAppointmentsQuery, useCreateAppointmentMutation} from '@/features/appointments/hooks';
import type {Appointment, AppointmentInput} from '@/features/appointments/types';
import {defaultAppointmentsRepository} from '@/features/appointments/repository';

type CreateAppointmentInputUI = {
    date: string;
    time: string;
    patient_name: string;
    patient_phone?: string;
    patient_email?: string;
    dentist_id?: number;
    duration?: number;
    reason?: string;
};

export function AppointmentsScreen() {
    const {t} = useTranslation();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const {data, isLoading, isError, refetch} = useAppointmentsQuery({limit: 100}, defaultAppointmentsRepository);
    const createMutation = useCreateAppointmentMutation(defaultAppointmentsRepository);

    const appointments = useMemo<AppointmentAgendaItemExtended[]>(() => (data?.data ?? []).map(toAgendaItem), [data]);

    const handleCreate = (input: CreateAppointmentInputUI) => {
        createMutation.mutate(toAppointmentInput(input), {
            onSuccess: () => setSelectedDate(input.date),
        });
    };

    if (isLoading) return <View style={styles.centered}><ActivityIndicator /></View>;
    if (isError) return <View style={styles.centered}><ThemedText>{t('common.error')}</ThemedText><ThemedText onPress={() => refetch()} type="link">{t('common.retry')}</ThemedText></View>;

    return (
        <GlassBackground>
            <View style={styles.container}>
                <ThemedText type="title" style={styles.title}>{t('appointments.title')}</ThemedText>
                <AppointmentsCalendarOrganism appointments={appointments} selectedDate={selectedDate} onDateSelect={setSelectedDate} onCreateAppointment={handleCreate} isCreating={createMutation.isPending} testID="appointments-calendar" />
            </View>
        </GlassBackground>
    );
}

function toAgendaItem(a: Appointment): AppointmentAgendaItemExtended {
    return {id: a.id, date: a.appointmentDate, time: a.appointmentTime, dentist: '', reason: a.reason ?? '', patient_name: a.patientName, status: a.status};
}

function toAppointmentInput(input: CreateAppointmentInputUI): AppointmentInput {
    return {patient_name: input.patient_name, patient_phone: input.patient_phone, patient_email: input.patient_email, appointment_date: input.date, appointment_time: input.time, dentist_id: input.dentist_id, duration: input.duration, reason: input.reason};
}

const styles = StyleSheet.create({
    centered: {flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8},
    container: {flex: 1, padding: 16, paddingBottom: 105},
    title: {paddingTop: 8, marginBottom: 16},
});
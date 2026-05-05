import React, {useCallback, useRef} from 'react';
import {View, Pressable, Text} from 'react-native';
import {useTranslation} from 'react-i18next';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {CalendarExpandableAtom, type AppointmentAgendaItem} from '../../atoms/calendar-expandable';
import {ThemedText} from '../../themed-text';
import {useColorScheme} from '../../hooks/use-color-scheme';
import {Colors} from '../../constants/theme';
import {IconSymbol} from '../../ui/icon-symbol';
import {GlassBottomSheet} from '../../molecules/glass-interactive/GlassBottomSheet';
import {AppointmentForm, type CreateAppointmentInput, type PatientSuggestion} from '../../molecules/appointment-form';

export type AppointmentAgendaItemExtended = AppointmentAgendaItem & {
    patient_name?: string;
    status?: 'scheduled' | 'completed' | 'cancelled';
};

export type AppointmentsCalendarOrganismProps = {
    appointments: AppointmentAgendaItemExtended[];
    selectedDate: string;
    onDateSelect: (date: string) => void;
    onCreateAppointment?: (input: CreateAppointmentInput) => void;
    onAppointmentPress?: (appointment: AppointmentAgendaItemExtended) => void;
    patientSuggestions?: PatientSuggestion[];
    patientSuggestionsLoading?: boolean;
    onPatientQueryChange?: (q: string) => void;
    isCreating?: boolean;
    testID?: string;
};

export function AppointmentsCalendarOrganism({appointments, selectedDate, onDateSelect, onCreateAppointment, onAppointmentPress, patientSuggestions = [], patientSuggestionsLoading = false, onPatientQueryChange, isCreating = false, testID}: AppointmentsCalendarOrganismProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];
    const formSheetRef = useRef<BottomSheetModal>(null);

    const openForm = useCallback(() => { formSheetRef.current?.present(); }, []);
    const closeForm = useCallback(() => { formSheetRef.current?.dismiss(); }, []);
    const handleSubmit = useCallback((input: CreateAppointmentInput) => { onCreateAppointment?.(input); closeForm(); }, [onCreateAppointment, closeForm]);

    const calendarAppointments = appointments.map(a => ({...a, time: a.time ?? '', dentist: a.patient_name ?? '', reason: a.reason ?? ''}));

    return (
        <View testID={testID} style={{flex: 1}}>
            <CalendarExpandableAtom selectedDate={selectedDate} onDateSelect={onDateSelect} appointments={calendarAppointments} onAppointmentPress={onAppointmentPress} testID={testID ? `${testID}-calendar` : undefined} />
            {onCreateAppointment && (
                <View style={{paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12}}>
                    <Pressable onPress={openForm} testID="appointment-add-button" style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: colors.tint}}>
                        <IconSymbol size={18} name="plus" color="#FFFFFF" />
                        <ThemedText type="default" weight="semibold" style={{color: '#FFFFFF', fontSize: 16}}>{t('appointments.addAppointment', 'Add appointment')}</ThemedText>
                    </Pressable>
                </View>
            )}
            <GlassBottomSheet ref={formSheetRef} snapPoints={['80%']} testID={testID ? `${testID}-sheet` : undefined}>
                <AppointmentForm initialDate={selectedDate} onSubmit={handleSubmit} onCancel={closeForm} isSubmitting={isCreating} patientSuggestions={patientSuggestions} patientSuggestionsLoading={patientSuggestionsLoading} onPatientQueryChange={onPatientQueryChange} testID={testID} />
            </GlassBottomSheet>
        </View>
    );
}
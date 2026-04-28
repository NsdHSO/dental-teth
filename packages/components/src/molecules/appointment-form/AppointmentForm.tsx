import React from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {GlassCard} from '../glass-interactive/GlassCard';
import {GlassInput} from '../glass-content/GlassInput';
import {ThemedText} from '../../themed-text';
import {PatientFields} from './PatientFields';
import {DurationPicker} from './DurationPicker';
import {DentistSelector} from './DentistSelector';
import {FormActions} from './FormActions';
import {useAppointmentForm, type CreateAppointmentInput} from './useAppointmentForm';
import {TimePicker} from './TimePicker';

export type AppointmentFormProps = {
    initialDate?: string;
    onSubmit: (data: CreateAppointmentInput) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
    testID?: string;
};

export function AppointmentForm({initialDate = '', onSubmit, onCancel, isSubmitting = false, testID}: AppointmentFormProps) {
    const {t} = useTranslation();
    const form = useAppointmentForm({initialDate, onSubmit});

    return (
        <View testID={testID} style={{padding: 16}}>
            <GlassCard variant="frosted" borderRadius={20}>
                <ThemedText type="subtitle" style={{marginBottom: 16}}>{t('appointments.form.title', 'New appointment')}</ThemedText>
                <PatientFields name={form.patientName} phone={form.patientPhone} email={form.patientEmail}
                    onNameChange={form.setPatientName} onPhoneChange={form.setPatientPhone} onEmailChange={form.setPatientEmail}
                    disabled={isSubmitting} testID={testID} />
                <View style={{marginTop: 16}}>
                    <TimePicker value={form.time} customTime={form.customTime} showCustomError={form.showCustomError}
                        onPickSlot={form.pickSlot} onCustomTimeChange={form.setCustomTimeValue} onClearCustomTime={form.clearCustomTime}
                        disabled={isSubmitting} testID={testID} />
                </View>
                <View style={{marginTop: 16}}><DurationPicker value={form.duration} onChange={form.setDuration} disabled={isSubmitting} testID={testID} /></View>
                <View style={{marginTop: 16}}><DentistSelector value={form.dentistId} onChange={form.setDentistId} disabled={isSubmitting} testID={testID} /></View>
                <View style={{marginTop: 16}}><GlassInput value={form.reason} onChangeText={form.setReason} placeholder={t('appointments.form.reasonPlaceholder', 'Reason')} editable={!isSubmitting} variant="tinted" multiline numberOfLines={2} testID={testID} /></View>
                <FormActions onCancel={onCancel} onSubmit={form.submit} isSubmitting={isSubmitting} testID={testID} />
            </GlassCard>
        </View>
    );
}
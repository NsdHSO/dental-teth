import {useCallback, useState} from 'react';
import {Alert} from 'react-native';
import {useTranslation} from 'react-i18next';
import {autoFormatTime, isValidDate, isValidTime} from './validation';

export type CreateAppointmentInput = {
    date: string;
    time: string;
    patient_name: string;
    patient_phone?: string;
    patient_email?: string;
    dentist_id?: number;
    duration?: number;
    reason?: string;
};

export type UseAppointmentFormParams = {
    initialDate: string;
    onSubmit: (input: CreateAppointmentInput) => void;
};

export function useAppointmentForm({
    initialDate,
    onSubmit,
}: UseAppointmentFormParams) {
    const {t} = useTranslation();

    const [date] = useState(initialDate);
    const [time, setTime] = useState('');
    const [customTime, setCustomTime] = useState('');
    const [patientName, setPatientName] = useState('');
    const [patientPhone, setPatientPhone] = useState('');
    const [patientEmail, setPatientEmail] = useState('');
    const [dentistId, setDentistId] = useState<number | undefined>();
    const [duration, setDuration] = useState(30);
    const [reason, setReason] = useState('');

    const isCustomValid = customTime === '' || isValidTime(customTime);
    const showCustomError = customTime !== '' && !isCustomValid;

    const pickSlot = useCallback((slot: string) => {
        setTime(slot);
        setCustomTime('');
    }, []);

    const setCustomTimeValue = useCallback((raw: string) => {
        const next = autoFormatTime(raw);
        setCustomTime(next);
        setTime(isValidTime(next) ? next.trim() : '');
    }, []);

    const clearCustomTime = useCallback(() => {
        setCustomTime('');
        setTime('');
    }, []);

    const reset = useCallback(() => {
        setTime('');
        setCustomTime('');
        setPatientName('');
        setPatientPhone('');
        setPatientEmail('');
        setDentistId(undefined);
        setDuration(30);
        setReason('');
    }, []);

    const submit = useCallback(() => {
        const trimmedDate = date.trim();
        const trimmedTime = time.trim();
        const trimmedPatientName = patientName.trim();
        const trimmedReason = reason.trim();

        if (!isValidDate(trimmedDate)) {
            Alert.alert(t('common.error'), t('appointments.form.invalidDate', 'Date must be YYYY-MM-DD'));
            return;
        }
        if (!isValidTime(trimmedTime)) {
            Alert.alert(t('common.error'), t('appointments.form.invalidTime', 'Pick a time slot or enter HH:mm'));
            return;
        }
        if (!trimmedPatientName) {
            Alert.alert(t('common.error'), t('appointments.form.patientNameRequired', 'Patient name is required'));
            return;
        }

        onSubmit({
            date: trimmedDate,
            time: trimmedTime,
            patient_name: trimmedPatientName,
            patient_phone: patientPhone.trim() || undefined,
            patient_email: patientEmail.trim() || undefined,
            dentist_id: dentistId,
            duration: duration,
            reason: trimmedReason || undefined,
        });
        reset();
    }, [date, time, patientName, patientPhone, patientEmail, dentistId, duration, reason, t, onSubmit, reset]);

    return {
        date, time, customTime,
        patientName, patientPhone, patientEmail,
        dentistId, duration, reason,
        showCustomError,
        setPatientName, setPatientPhone, setPatientEmail,
        setDentistId, setDuration, setReason,
        pickSlot, setCustomTimeValue, clearCustomTime, submit,
    };
}
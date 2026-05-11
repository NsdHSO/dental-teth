import {useCallback, useState} from 'react';
import {Alert} from 'react-native';
import {useTranslation} from 'react-i18next';
import {autoFormatTime, isValidDate, isValidTime} from './validation';

export type CreateAppointmentInput = {
    date: string;
    time: string;
    patient_id: number;
    dentist_id: number;
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
    const [selectedPatientId, setSelectedPatientId] = useState<number | undefined>();
    const [dentistId, setDentistId] = useState('');
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
        setSelectedPatientId(undefined);
        setDentistId('');
        setDuration(30);
        setReason('');
    }, []);

    const submit = useCallback(() => {
        const trimmedDate = date.trim();
        const trimmedTime = time.trim();
        const parsedDentistId = Number(dentistId.trim());

        if (!isValidDate(trimmedDate)) {
            Alert.alert(t('common.error'), t('appointments.form.invalidDate', 'Date must be YYYY-MM-DD'));
            return;
        }
        if (!isValidTime(trimmedTime)) {
            Alert.alert(t('common.error'), t('appointments.form.invalidTime', 'Pick a time slot or enter HH:mm'));
            return;
        }
        if (!selectedPatientId || selectedPatientId <= 0) {
            Alert.alert(t('common.error'), t('appointments.form.patientRequired', 'Patient is required'));
            return;
        }
        if (!Number.isFinite(parsedDentistId) || parsedDentistId <= 0) {
            Alert.alert(t('common.error'), t('appointments.form.dentistIdRequired', 'Dentist ID is required'));
            return;
        }

        onSubmit({
            date: trimmedDate,
            time: trimmedTime,
            patient_id: selectedPatientId,
            dentist_id: parsedDentistId,
            duration: duration,
            reason: reason.trim() || undefined,
        });
        reset();
    }, [date, time, selectedPatientId, dentistId, duration, reason, t, onSubmit, reset]);

    return {
        date, time, customTime,
        selectedPatientId, dentistId, duration, reason,
        showCustomError,
        setSelectedPatientId, setDentistId, setDuration, setReason,
        pickSlot, setCustomTimeValue, clearCustomTime, submit,
    };
}

import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, View } from 'react-native';
import { useState } from 'react';
import { ThemedText } from '../../themed-text';
import { GlassInput } from '../glass-content/GlassInput';
import { DentistSelector } from './DentistSelector';
import { DurationPicker } from './DurationPicker';
import { FormActions } from './FormActions';
import { PatientFields, type PatientSuggestion } from './PatientFields';
import { TimePicker } from './TimePicker';
import {
  useAppointmentForm,
  type CreateAppointmentInput,
} from './useAppointmentForm';

export type AppointmentFormProps = {
  initialDate?: string;
  onSubmit: (data: CreateAppointmentInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  patientSuggestions?: PatientSuggestion[];
  patientSuggestionsLoading?: boolean;
  onPatientQueryChange?: (q: string) => void;
  testID?: string;
};

export function AppointmentForm({
  initialDate = '',
  onSubmit,
  onCancel,
  isSubmitting = false,
  patientSuggestions = [],
  patientSuggestionsLoading = false,
  onPatientQueryChange,
  testID,
}: AppointmentFormProps) {
  const { t } = useTranslation();
  const form = useAppointmentForm({ initialDate, onSubmit });
  const [patientQuery, setPatientQuery] = useState('');

  const handlePatientQueryChange = (v: string) => {
    setPatientQuery(v);
    onPatientQueryChange?.(v);
    if (form.selectedPatientId) {
      form.setSelectedPatientId(undefined);
    }
  };

  const handlePatientSelect = (id: number) => {
    if (id === 0) {
      form.setSelectedPatientId(undefined);
      setPatientQuery('');
    } else {
      form.setSelectedPatientId(id);
      const found = patientSuggestions.find((s) => s.id === id);
      setPatientQuery(found?.label ?? String(id));
    }
  };

  const FormScrollView =
    Platform.OS === 'web' ? ScrollView : BottomSheetScrollView;

  return (
    <FormScrollView
      testID={testID ? `${testID}-form` : 'appointment-form'}
      style={{ flex: 1, padding: Platform.OS === 'web' ? 8 : 0 }}
      keyboardShouldPersistTaps='handled'
    >
      <ThemedText type='subtitle' style={{ marginBottom: 16 }}>
        {t('appointments.form.title', 'New appointment')}
      </ThemedText>
      <PatientFields
        query={patientQuery}
        onQueryChange={handlePatientQueryChange}
        results={patientSuggestions}
        selectedId={form.selectedPatientId}
        onSelect={handlePatientSelect}
        loading={patientSuggestionsLoading}
        disabled={isSubmitting}
        testID={testID}
      />
      <View style={{ marginTop: 16 }}>
        <TimePicker
          value={form.time}
          customTime={form.customTime}
          showCustomError={form.showCustomError}
          onPickSlot={form.pickSlot}
          onCustomTimeChange={form.setCustomTimeValue}
          onClearCustomTime={form.clearCustomTime}
          disabled={isSubmitting}
          testID={testID}
        />
      </View>
      <View style={{ marginTop: 16 }}>
        <DurationPicker
          value={form.duration}
          onChange={form.setDuration}
          disabled={isSubmitting}
          testID={testID}
        />
      </View>
      <View style={{ marginTop: 16 }}>
        <DentistSelector
          dentistId={form.dentistId}
          onDentistIdChange={form.setDentistId}
          disabled={isSubmitting}
          testID={testID}
        />
      </View>
      <View style={{ marginTop: 16 }}>
        <GlassInput
          value={form.reason}
          onChangeText={form.setReason}
          placeholder={t('appointments.form.reasonPlaceholder', 'Reason')}
          editable={!isSubmitting}
          variant='tinted'
          multiline
          numberOfLines={2}
          testID={testID ? `${testID}-reason` : undefined}
        />
      </View>
      <FormActions
        onCancel={onCancel}
        onSubmit={form.submit}
        isSubmitting={isSubmitting}
        testID={testID}
      />
    </FormScrollView>
  );
}

import React, {useMemo, useState} from 'react';
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useColorScheme} from '../hooks/use-color-scheme';
import {Colors} from '../constants/theme';
import {useGlowVariant} from '../hooks/useGlowVariant';
import {getGlowColor} from '../constants/glowColors';
import {GlassInput} from './glass-content/GlassInput';
import {GlassCard} from './glass-interactive/GlassCard';
import {ThemedText} from '../themed-text';

export type CreateAppointmentInput = {
    date: string;
    time: string;
    dentist: string;
    reason: string;
};

export type AppointmentFormProps = {
    /** Pre-fills the date field. */
    initialDate?: string;
    /** Called with the validated form data. */
    onSubmit: (data: CreateAppointmentInput) => void;
    /** Cancel/close the form. */
    onCancel: () => void;
    /** Disables inputs and shows the submitting label. */
    isSubmitting?: boolean;
    /** Time slots to show as chips. Defaults to 09:00–18:00 every 30 minutes. */
    timeSlots?: string[];
    testID?: string;
};

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function defaultTimeSlots(): string[] {
    const slots: string[] = [];
    for (let h = 9; h <= 18; h++) {
        slots.push(`${String(h).padStart(2, '0')}:00`);
        if (h !== 18) slots.push(`${String(h).padStart(2, '0')}:30`);
    }
    return slots;
}

/**
 * Inline form for creating a new appointment. Presentational only — the
 * caller is responsible for actually submitting (e.g. via a mutation hook).
 *
 * UI:
 *   • Wrapped in a GlassCard for depth.
 *   • Date is shown as a read-only chip-like field reflecting the selected day.
 *   • Time is selected from a horizontal scroll of preset slots (chips), with
 *     the active slot highlighted using the active glow color.
 *   • Dentist & reason are theme-aware text inputs with labels.
 *   • Cancel = outlined, Create = filled (glow color).
 */
export function AppointmentForm({
    initialDate = '',
    onSubmit,
    onCancel,
    isSubmitting = false,
    timeSlots,
    testID,
}: AppointmentFormProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];
    const {glowVariant} = useGlowVariant();
    const activeColor = getGlowColor(glowVariant, scheme);

    const slots = useMemo(() => timeSlots ?? defaultTimeSlots(), [timeSlots]);

    const [date] = useState(initialDate);
    const [time, setTime] = useState('');
    const [dentist, setDentist] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = () => {
        const trimmedDate = date.trim();
        const trimmedTime = time.trim();
        const trimmedDentist = dentist.trim();
        const trimmedReason = reason.trim();

        if (!DATE_RE.test(trimmedDate)) {
            Alert.alert(
                t('common.error'),
                t('appointments.form.invalidDate', 'Date must be in YYYY-MM-DD format')
            );
            return;
        }
        if (!TIME_RE.test(trimmedTime)) {
            Alert.alert(
                t('common.error'),
                t('appointments.form.invalidTime', 'Pick a time slot')
            );
            return;
        }
        if (!trimmedDentist) {
            Alert.alert(
                t('common.error'),
                t('appointments.form.dentistRequired', 'Dentist is required')
            );
            return;
        }
        if (!trimmedReason) {
            Alert.alert(
                t('common.error'),
                t('appointments.form.reasonRequired', 'Reason is required')
            );
            return;
        }

        onSubmit({
            date: trimmedDate,
            time: trimmedTime,
            dentist: trimmedDentist,
            reason: trimmedReason,
        });

        // Clear locally so re-opening the form is empty.
        setTime('');
        setDentist('');
        setReason('');
    };

    const labelColor = scheme === 'dark' ? '#9CA3AF' : '#6B7280';
    const mutedBorder = scheme === 'dark' ? '#374151' : '#E5E7EB';
    const dateChipBg = `${activeColor}${scheme === 'dark' ? '33' : '1A'}`;

    const morningSlots = useMemo(
        () => slots.filter((s) => parseInt(s.split(':')[0], 10) < 12),
        [slots]
    );
    const afternoonSlots = useMemo(
        () => slots.filter((s) => parseInt(s.split(':')[0], 10) >= 12),
        [slots]
    );

    const renderSlot = (slot: string) => {
        const selected = slot === time;
        return (
            <Pressable
                key={slot}
                disabled={isSubmitting}
                onPress={() => setTime(slot)}
                testID={testID ? `${testID}-time-${slot}` : `time-${slot}`}
                accessibilityRole="button"
                accessibilityState={{selected}}
                style={({pressed}) => [
                    styles.slot,
                    {
                        borderColor: selected ? activeColor : mutedBorder,
                        backgroundColor: selected ? activeColor : 'transparent',
                        opacity: pressed ? 0.7 : 1,
                        transform: [{scale: selected ? 1.02 : 1}],
                        shadowColor: selected ? activeColor : 'transparent',
                        shadowOffset: {width: 0, height: selected ? 3 : 0},
                        shadowOpacity: selected ? 0.3 : 0,
                        shadowRadius: selected ? 6 : 0,
                        elevation: selected ? 3 : 0,
                    },
                ]}
            >
                <Text
                    style={{
                        color: selected ? '#FFFFFF' : colors.text,
                        fontWeight: selected ? '700' : '500',
                        fontVariant: ['tabular-nums'],
                        fontSize: 14,
                    }}
                >
                    {slot}
                </Text>
            </Pressable>
        );
    };

    return (
        <View testID={testID} style={styles.outer}>
            <GlassCard
                variant="frosted"
                borderRadius={16}
                enableElectric={false}
                enableWaves={false}
                style={styles.card}
            >
                <View style={styles.cardInner}>
                    {/* Title */}
                    <ThemedText
                        type="subtitle"
                        style={styles.cardTitle}
                    >
                        {t('appointments.form.title', 'New appointment')}
                    </ThemedText>

                    {/* Date (read-only display) */}
                    <View style={styles.field}>
                        <Text style={[styles.label, {color: labelColor}]}>
                            {t('appointments.selectDate', 'Date')}
                        </Text>
                        <View
                            style={[
                                styles.dateChip,
                                {
                                    backgroundColor: dateChipBg,
                                    borderColor: activeColor,
                                },
                            ]}
                            testID={testID ? `${testID}-date` : undefined}
                        >
                            <Text style={[styles.dateChipDot, {backgroundColor: activeColor}]} />
                            <Text style={[styles.dateChipText, {color: colors.text}]}>
                                {date || t('appointments.selectDate', 'Date')}
                            </Text>
                        </View>
                    </View>

                    {/* Time slots — grouped Morning / Afternoon, full grid */}
                    <View style={styles.field}>
                        <View style={styles.timeHeader}>
                            <Text style={[styles.label, {color: labelColor}]}>
                                {t('appointments.selectTime', 'Time')}
                            </Text>
                            <View
                                style={[
                                    styles.selectedTime,
                                    {
                                        borderColor: time ? activeColor : mutedBorder,
                                        backgroundColor: time
                                            ? `${activeColor}${scheme === 'dark' ? '33' : '1A'}`
                                            : 'transparent',
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.selectedTimeText,
                                        {
                                            color: time ? activeColor : labelColor,
                                            fontStyle: time ? 'normal' : 'italic',
                                        },
                                    ]}
                                >
                                    {time || t('appointments.form.pickTime', 'Pick a time')}
                                </Text>
                            </View>
                        </View>

                        <View testID={testID ? `${testID}-time` : undefined}>
                            <Text style={[styles.daypartLabel, {color: labelColor}]}>
                                {t('appointments.form.morning', 'Morning')}
                            </Text>
                            <View style={styles.slotGrid}>
                                {morningSlots.map((slot) =>
                                    renderSlot(slot)
                                )}
                            </View>

                            <Text
                                style={[
                                    styles.daypartLabel,
                                    {color: labelColor, marginTop: 12},
                                ]}
                            >
                                {t('appointments.form.afternoon', 'Afternoon')}
                            </Text>
                            <View style={styles.slotGrid}>
                                {afternoonSlots.map((slot) =>
                                    renderSlot(slot)
                                )}
                            </View>
                        </View>
                    </View>

                    {/* Dentist */}
                    <View style={styles.field}>
                        <Text style={[styles.label, {color: labelColor}]}>
                            {t('appointments.selectDentist', 'Dentist')}
                        </Text>
                        <GlassInput
                            value={dentist}
                            onChangeText={setDentist}
                            placeholder={t(
                                'appointments.form.dentistPlaceholder',
                                'Dentist'
                            )}
                            editable={!isSubmitting}
                            variant="tinted"
                            testID={testID ? `${testID}-dentist` : undefined}
                        />
                    </View>

                    {/* Reason */}
                    <View style={styles.field}>
                        <Text style={[styles.label, {color: labelColor}]}>
                            {t('appointments.reason', 'Reason')}
                        </Text>
                        <GlassInput
                            value={reason}
                            onChangeText={setReason}
                            placeholder={t(
                                'appointments.form.reasonPlaceholder',
                                'Reason'
                            )}
                            editable={!isSubmitting}
                            variant="tinted"
                            multiline
                            numberOfLines={2}
                            style={styles.reasonInput}
                            testID={testID ? `${testID}-reason` : undefined}
                        />
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        <Pressable
                            onPress={onCancel}
                            disabled={isSubmitting}
                            style={({pressed}) => [
                                styles.button,
                                styles.cancelButton,
                                {borderColor: mutedBorder},
                                pressed && styles.buttonPressed,
                            ]}
                            testID={testID ? `${testID}-cancel` : undefined}
                        >
                            <Text
                                style={[
                                    styles.buttonText,
                                    {color: colors.text},
                                ]}
                            >
                                {t('common.cancel')}
                            </Text>
                        </Pressable>

                        <Pressable
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                            style={({pressed}) => [
                                styles.button,
                                styles.submitButton,
                                {
                                    backgroundColor: isSubmitting
                                        ? mutedBorder
                                        : activeColor,
                                    shadowColor: activeColor,
                                },
                                pressed && styles.buttonPressed,
                            ]}
                            testID={testID ? `${testID}-submit` : undefined}
                        >
                            <Text
                                style={[
                                    styles.buttonText,
                                    {color: '#FFFFFF'},
                                ]}
                            >
                                {isSubmitting
                                    ? t('common.creating', 'Creating...')
                                    : t('appointments.form.create', 'Create')}
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </GlassCard>
        </View>
    );
}

const styles = StyleSheet.create({
    outer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    card: {
        overflow: 'hidden',
    },
    cardInner: {
        padding: 16,
        gap: 14,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 4,
    },
    field: {
        gap: 6,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    dateChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1.5,
        alignSelf: 'flex-start',
    },
    dateChipDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    dateChipText: {
        fontSize: 15,
        fontWeight: '600',
        fontVariant: ['tabular-nums'],
    },
    timeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    selectedTime: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        borderWidth: 1.5,
        minWidth: 84,
        alignItems: 'center',
    },
    selectedTimeText: {
        fontSize: 14,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
        letterSpacing: 0.3,
    },
    daypartLabel: {
        fontSize: 11,
        fontWeight: '600',
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        marginBottom: 8,
        opacity: 0.85,
    },
    slotGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    slot: {
        paddingHorizontal: 14,
        paddingVertical: 9,
        borderRadius: 12,
        borderWidth: 1.5,
        minWidth: 68,
        alignItems: 'center',
    },
    reasonInput: {
        minHeight: 64,
        textAlignVertical: 'top',
    },
    buttonRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: {
        borderWidth: 1.5,
        backgroundColor: 'transparent',
    },
    submitButton: {
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonPressed: {
        opacity: 0.75,
        transform: [{scale: 0.98}],
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.3,
    },
});

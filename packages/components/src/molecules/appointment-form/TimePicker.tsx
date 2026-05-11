import React, {useMemo} from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useColorScheme} from '../../hooks/use-color-scheme';
import {Colors} from '../../constants/theme';
import {useGlowVariant} from '../../hooks/useGlowVariant';
import {getGlowColor} from '../../constants/glowColors';
import {GlassInput} from '../glass-content/GlassInput';
import {defaultTimeSlots, splitByDaypart} from './validation';

export type TimePickerProps = {
    /** Currently selected HH:mm value (empty string = nothing picked yet). */
    value: string;
    /** Raw text in the custom-time field (separate from `value`). */
    customTime: string;
    /** True when the custom field has invalid content. */
    showCustomError: boolean;
    /** Tap a preset slot. */
    onPickSlot: (slot: string) => void;
    /** Live edit of the custom-time field. */
    onCustomTimeChange: (raw: string) => void;
    /** Clear the custom-time field. */
    onClearCustomTime: () => void;
    /** Override the preset slots (defaults to 09:00-18:00 / 30 min). */
    timeSlots?: string[];
    disabled?: boolean;
    testID?: string;
};

/**
 * SRP: this component is the entire time-selection UX. It is fully controlled
 * (props in, callbacks out) so it remains substitutable and easy to test.
 */
export function TimePicker({
    value,
    customTime,
    showCustomError,
    onPickSlot,
    onCustomTimeChange,
    onClearCustomTime,
    timeSlots,
    disabled = false,
    testID,
}: TimePickerProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];
    const {glowVariant} = useGlowVariant();
    const activeColor = getGlowColor(glowVariant, scheme);

    const slots = useMemo(() => timeSlots ?? defaultTimeSlots(), [timeSlots]);
    const {morning, afternoon} = useMemo(() => splitByDaypart(slots), [slots]);

    const labelColor = scheme === 'dark' ? '#9CA3AF' : '#6B7280';
    const mutedBorder = scheme === 'dark' ? '#4B5563' : '#94A3B8';
    const slotBg =
        scheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)';

    const renderSlot = (slot: string) => (
        <Slot
            key={slot}
            slot={slot}
            selected={slot === value}
            disabled={disabled}
            activeColor={activeColor}
            mutedBorder={mutedBorder}
            slotBg={slotBg}
            textColor={colors.text}
            onPress={() => onPickSlot(slot)}
            testID={testID ? `${testID}-${slot}` : `time-${slot}`}
        />
    );

    return (
        <View>
            <View style={styles.timeHeader}>
                <Text style={[styles.label, {color: labelColor}]}>
                    {t('appointments.selectTime', 'Time')}
                </Text>
                <SelectedBadge
                    value={value}
                    activeColor={activeColor}
                    mutedBorder={mutedBorder}
                    slotBg={slotBg}
                    labelColor={labelColor}
                    placeholder={t('appointments.form.pickTime', 'Pick a time')}
                    scheme={scheme}
                />
            </View>

            <View testID={testID}>
                <Text style={[styles.daypartLabel, {color: labelColor}]}>
                    {t('appointments.form.morning', 'Morning')}
                </Text>
                <View style={styles.slotGrid}>{morning.map(renderSlot)}</View>

                <Text
                    style={[
                        styles.daypartLabel,
                        {color: labelColor, marginTop: 12},
                    ]}
                >
                    {t('appointments.form.afternoon', 'Afternoon')}
                </Text>
                <View style={styles.slotGrid}>{afternoon.map(renderSlot)}</View>

                <Text
                    style={[
                        styles.daypartLabel,
                        {color: labelColor, marginTop: 12},
                    ]}
                >
                    {t('appointments.form.custom', 'Custom')}
                </Text>
                <CustomTimeInput
                    value={customTime}
                    showError={showCustomError}
                    onChange={onCustomTimeChange}
                    onClear={onClearCustomTime}
                    disabled={disabled}
                    mutedBorder={mutedBorder}
                    textColor={colors.text}
                    placeholder={t(
                        'appointments.form.customTimePlaceholder',
                        'HH:mm (e.g. 13:15)'
                    )}
                    clearLabel={t(
                        'appointments.form.clearCustomTime',
                        'Clear custom time'
                    )}
                    errorMessage={t(
                        'appointments.form.invalidTime',
                        'Pick a time slot or enter HH:mm'
                    )}
                    testID={testID ? `${testID}-custom` : 'time-custom'}
                />
            </View>
        </View>
    );
}

// ---------- Sub-components (private to this module) ----------

type SlotProps = {
    slot: string;
    selected: boolean;
    disabled: boolean;
    activeColor: string;
    mutedBorder: string;
    slotBg: string;
    textColor: string;
    onPress: () => void;
    testID: string;
};

function Slot({
    slot,
    selected,
    disabled,
    activeColor,
    mutedBorder,
    slotBg,
    textColor,
    onPress,
    testID,
}: SlotProps) {
    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{selected}}
            testID={testID}
            style={({pressed}) => [
                styles.slot,
                {
                    borderColor: selected ? activeColor : mutedBorder,
                    backgroundColor: selected ? activeColor : slotBg,
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
                    color: selected ? '#FFFFFF' : textColor,
                    fontWeight: selected ? '700' : '500',
                    fontVariant: ['tabular-nums'],
                    fontSize: 14,
                }}
            >
                {slot}
            </Text>
        </Pressable>
    );
}

type SelectedBadgeProps = {
    value: string;
    activeColor: string;
    mutedBorder: string;
    slotBg: string;
    labelColor: string;
    placeholder: string;
    scheme: 'light' | 'dark';
};

function SelectedBadge({
    value,
    activeColor,
    mutedBorder,
    slotBg,
    labelColor,
    placeholder,
    scheme,
}: SelectedBadgeProps) {
    const filled = Boolean(value);
    return (
        <View
            style={[
                styles.selectedTime,
                {
                    borderColor: filled ? activeColor : mutedBorder,
                    backgroundColor: filled
                        ? `${activeColor}${scheme === 'dark' ? '33' : '1A'}`
                        : slotBg,
                },
            ]}
        >
            <Text
                style={[
                    styles.selectedTimeText,
                    {
                        color: filled ? activeColor : labelColor,
                        fontStyle: filled ? 'normal' : 'italic',
                    },
                ]}
            >
                {value || placeholder}
            </Text>
        </View>
    );
}

type CustomTimeInputProps = {
    value: string;
    showError: boolean;
    onChange: (raw: string) => void;
    onClear: () => void;
    disabled: boolean;
    mutedBorder: string;
    textColor: string;
    placeholder: string;
    clearLabel: string;
    errorMessage: string;
    testID: string;
};

function CustomTimeInput({
    value,
    showError,
    onChange,
    onClear,
    disabled,
    mutedBorder,
    textColor,
    placeholder,
    clearLabel,
    errorMessage,
    testID,
}: CustomTimeInputProps) {
    return (
        <>
            <View style={styles.customRow}>
                <GlassInput
                    value={value}
                    onChangeText={onChange}
                    placeholder={placeholder}
                    editable={!disabled}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="numbers-and-punctuation"
                    maxLength={5}
                    variant="tinted"
                    style={[
                        styles.customInput,
                        showError && {
                            borderWidth: 1.5,
                            borderColor: '#EF4444',
                            borderRadius: 8,
                        },
                    ]}
                    testID={testID}
                />
                {value ? (
                    <Pressable
                        onPress={onClear}
                        disabled={disabled}
                        accessibilityRole="button"
                        accessibilityLabel={clearLabel}
                        testID={`${testID}-clear`}
                        style={({pressed}) => [
                            styles.customClear,
                            {
                                borderColor: mutedBorder,
                                opacity: pressed ? 0.6 : 1,
                            },
                        ]}
                    >
                        <Text style={{color: textColor, fontWeight: '700'}}>×</Text>
                    </Pressable>
                ) : null}
            </View>
            {showError ? (
                <Text style={styles.customError} testID={`${testID}-error`}>
                    {errorMessage}
                </Text>
            ) : null}
        </>
    );
}

const styles = StyleSheet.create({
    label: {
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    timeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 8,
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
    customRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    customInput: {
        flex: 1,
        textAlign: 'center',
        letterSpacing: 1,
        fontVariant: ['tabular-nums'],
    },
    customClear: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    customError: {
        marginTop: 6,
        fontSize: 12,
        fontWeight: '600',
        color: '#EF4444',
    },
});

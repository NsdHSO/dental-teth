import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "../../hooks/use-color-scheme";
import { Colors } from "../../constants/theme";
import { useGlowVariant } from "../../hooks/useGlowVariant";
import { getGlowColor } from "../../constants/glowColors";
import { GlassInput } from "../glass-content/GlassInput";
import { GlassCard } from "../glass-interactive/GlassCard";
import { ThemedText } from "../../themed-text";
import { TimePicker } from "./TimePicker";
import {
    type CreateAppointmentInput,
    useAppointmentForm,
} from "./useAppointmentForm";

export type { CreateAppointmentInput };

export type AppointmentFormProps = {
    initialDate?: string;
    onSubmit: (data: CreateAppointmentInput) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
    timeSlots?: string[];
    testID?: string;
};

/**
 * Orchestrator: composes the form-state hook with the dumb sub-views.
 * Stays small (~ a hundred lines) because each concern lives elsewhere:
 *   - state/validation/i18n  \u2192 useAppointmentForm
 *   - time selection UX      \u2192 TimePicker
 *   - regexes/formatting     \u2192 validation.ts
 */
export function AppointmentForm({
    initialDate = "",
    onSubmit,
    onCancel,
    isSubmitting = false,
    timeSlots,
    testID,
}: AppointmentFormProps) {
    const { t } = useTranslation();
    const scheme = useColorScheme() ?? "light";
    const colors = Colors[scheme];
    const { glowVariant } = useGlowVariant();
    const activeColor = getGlowColor(glowVariant, scheme);

    const form = useAppointmentForm({ initialDate, onSubmit });

    const labelColor = scheme === "dark" ? "#9CA3AF" : "#6B7280";
    const mutedBorder = scheme === "dark" ? "#4B5563" : "#94A3B8";
    const dateChipBg = `${activeColor}${scheme === "dark" ? "33" : "1A"}`;

    return (
        <View testID={testID} style={styles.outer}>
            <GlassCard variant="frosted" borderRadius={20} style={styles.card}>
                <View style={styles.cardInner}>
                    <ThemedText type="subtitle" style={styles.cardTitle}>
                        {t("appointments.form.title", "New appointment")}
                    </ThemedText>

                    {/* Date (read-only) */}
                    <Field
                        label={t("appointments.selectDate", "Date")}
                        labelColor={labelColor}
                    >
                        <View
                            style={[
                                styles.dateChip,
                                { backgroundColor: dateChipBg, borderColor: activeColor },
                            ]}
                            testID={testID ? `${testID}-date` : undefined}
                        >
                            <View
                                style={[styles.dateChipDot, { backgroundColor: activeColor }]}
                            />
                            <Text style={[styles.dateChipText, { color: colors.text }]}>
                                {form.date || t("appointments.selectDate", "Date")}
                            </Text>
                        </View>
                    </Field>

                    {/* Time */}
                    <View style={styles.field}>
                        <TimePicker
                            value={form.time}
                            customTime={form.customTime}
                            showCustomError={form.showCustomError}
                            onPickSlot={form.pickSlot}
                            onCustomTimeChange={form.setCustomTimeValue}
                            onClearCustomTime={form.clearCustomTime}
                            timeSlots={timeSlots}
                            disabled={isSubmitting}
                            testID={testID ? `${testID}-time` : undefined}
                        />
                    </View>

                    {/* Dentist */}
                    <Field
                        label={t("appointments.selectDentist", "Dentist")}
                        labelColor={labelColor}
                    >
                        <GlassInput
                            value={form.dentist}
                            onChangeText={form.setDentist}
                            placeholder={t("appointments.form.dentistPlaceholder", "Dentist")}
                            editable={!isSubmitting}
                            variant="tinted"
                            testID={testID ? `${testID}-dentist` : undefined}
                        />
                    </Field>

                    {/* Reason */}
                    <Field
                        label={t("appointments.reason", "Reason")}
                        labelColor={labelColor}
                    >
                        <GlassInput
                            value={form.reason}
                            onChangeText={form.setReason}
                            placeholder={t("appointments.form.reasonPlaceholder", "Reason")}
                            editable={!isSubmitting}
                            variant="tinted"
                            multiline
                            numberOfLines={2}
                            style={styles.reasonInput}
                            testID={testID ? `${testID}-reason` : undefined}
                        />
                    </Field>

                    {/* Buttons */}
                    <View style={styles.buttonRow}>
                        <FormButton
                            label={t("common.cancel")}
                            onPress={onCancel}
                            disabled={isSubmitting}
                            variant="outline"
                            mutedBorder={mutedBorder}
                            textColor={colors.text}
                            testID={testID ? `${testID}-cancel` : undefined}
                        />
                        <FormButton
                            label={
                                isSubmitting
                                    ? t("common.creating", "Creating...")
                                    : t("appointments.form.create", "Create")
                            }
                            onPress={form.submit}
                            disabled={isSubmitting}
                            variant="solid"
                            activeColor={activeColor}
                            mutedBorder={mutedBorder}
                            testID={testID ? `${testID}-submit` : undefined}
                        />
                    </View>
                </View>
            </GlassCard>
        </View>
    );
}

// ---------- Tiny private sub-components ----------

function Field({
    label,
    labelColor,
    children,
}: {
    label: string;
    labelColor: string;
    children: React.ReactNode;
}) {
    return (
        <View style={styles.field}>
            <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
            {children}
        </View>
    );
}

type FormButtonProps = {
    label: string;
    onPress: () => void;
    disabled: boolean;
    variant: "outline" | "solid";
    activeColor?: string;
    mutedBorder: string;
    textColor?: string;
    testID?: string;
};

function FormButton({
    label,
    onPress,
    disabled,
    variant,
    activeColor,
    mutedBorder,
    textColor,
    testID,
}: FormButtonProps) {
    const isSolid = variant === "solid";
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            testID={testID}
            style={({ pressed }) => [
                styles.button,
                isSolid
                    ? {
                        backgroundColor: disabled ? mutedBorder : activeColor,
                        shadowColor: activeColor,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 4,
                    }
                    : {
                        borderWidth: 1.5,
                        borderColor: mutedBorder,
                        backgroundColor: "transparent",
                    },
                pressed && styles.buttonPressed,
            ]}
        >
            <Text
                style={[
                    styles.buttonText,
                    { color: isSolid ? "#FFFFFF" : (textColor ?? "#000") },
                ]}
            >
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    outer: {
        paddingHorizontal: 2,
        paddingVertical: 2,
    },
    card: {
        overflow: "hidden",
    },
    cardInner: {
        padding: 6,
        gap: 14,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 4,
    },
    field: {
        gap: 6,
    },
    label: {
        fontSize: 12,
        fontWeight: "600",
        letterSpacing: 0.5,
        textTransform: "uppercase",
    },
    dateChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1.5,
        alignSelf: "flex-start",
    },
    dateChipDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    dateChipText: {
        fontSize: 15,
        fontWeight: "600",
        fontVariant: ["tabular-nums"],
    },
    reasonInput: {
        minHeight: 64,
        textAlignVertical: "top",
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 8,
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonPressed: {
        opacity: 0.75,
        transform: [{ scale: 0.98 }],
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
});

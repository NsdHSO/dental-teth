import React from "react";
import { Platform, Pressable, StyleSheet, Text, View, ScrollView } from "react-native";
import { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useTranslation } from "react-i18next";
import { useColorScheme } from "../../hooks/use-color-scheme";
import { Colors } from "../../constants/theme";
import { useGlowVariant } from "../../hooks/useGlowVariant";
import { getGlowColor } from "../../constants/glowColors";
import { GlassInput } from "../glass-content/GlassInput";
import { GlassCard } from "../glass-interactive/GlassCard";
import { ThemedText } from "../../themed-text";
import { TimePicker } from "./TimePicker";
import { PatientFields, type PatientSuggestion } from "./PatientFields";
import {
    type CreateAppointmentInput,
    useAppointmentForm,
} from "./useAppointmentForm";

export type { CreateAppointmentInput, PatientSuggestion };

export type AppointmentFormProps = {
    initialDate?: string;
    onSubmit: (data: CreateAppointmentInput) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
    timeSlots?: string[];
    patientSuggestions?: PatientSuggestion[];
    patientSuggestionsLoading?: boolean;
    onPatientQueryChange?: (q: string) => void;
    testID?: string;
};

export function AppointmentForm({
    initialDate = "",
    onSubmit,
    onCancel,
    isSubmitting = false,
    timeSlots,
    patientSuggestions = [],
    patientSuggestionsLoading = false,
    onPatientQueryChange,
    testID,
}: AppointmentFormProps) {
    const { t } = useTranslation();
    const scheme = useColorScheme() ?? "light";
    const colors = Colors[scheme];
    const { glowVariant } = useGlowVariant();
    const activeColor = getGlowColor(glowVariant, scheme);

    const form = useAppointmentForm({ initialDate, onSubmit });
    const [patientQuery, setPatientQuery] = React.useState("");

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
            setPatientQuery("");
        } else {
            form.setSelectedPatientId(id);
            const found = patientSuggestions.find((s) => s.id === id);
            setPatientQuery(found?.label ?? String(id));
        }
    };

    const labelColor = scheme === "dark" ? "#9CA3AF" : "#6B7280";
    const mutedBorder = scheme === "dark" ? "#4B5563" : "#94A3B8";
    const dateChipBg = `${activeColor}${scheme === "dark" ? "33" : "1A"}`;

    const FormScrollView = Platform.OS === "web" ? ScrollView : BottomSheetScrollView;

    return (
        <FormScrollView testID={testID} style={styles.outer} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <GlassCard variant="frosted" borderRadius={20} style={styles.card}>
                <View style={styles.cardInner}>
                    <ThemedText type="subtitle" style={styles.cardTitle}>
                        {t("appointments.form.title", "New appointment")}
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

                    <Field
                        label={t("appointments.dentistId", "Dentist ID")}
                        labelColor={labelColor}
                    >
                        <GlassInput
                            value={form.dentistId}
                            onChangeText={form.setDentistId}
                            placeholder={t("appointments.form.dentistIdPlaceholder", "Dentist ID")}
                            keyboardType="number-pad"
                            editable={!isSubmitting}
                            variant="tinted"
                            testID={testID ? `${testID}-dentist-id` : undefined}
                        />
                    </Field>

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
        </FormScrollView>
    );
}

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
        flex: 1,
    },
    scrollContent: {
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

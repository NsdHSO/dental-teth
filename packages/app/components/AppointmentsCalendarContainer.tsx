import React, { useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import {
    AppointmentsCalendarOrganism,
    ThemedText,
    type AppointmentAgendaItem,
    type CreateAppointmentInput,
} from "@yuhuu/components";

import {
    useAppointmentsQuery,
    useCreateAppointmentMutation,
} from "@/features/appointments/hooks";
import {
    type Appointment,
    type AppointmentInput,
} from "@/features/appointments/types";
import { type AppointmentsRepository } from "@/features/appointments/repository";

export type AppointmentsCalendarContainerProps = {
    /** Optional repository (defaults to the feature's default). Useful for tests/mocks. */
    repo?: AppointmentsRepository;
    initialDate?: string;
    testID?: string;
};

function toAgendaItem(a: Appointment): AppointmentAgendaItem {
    return {
        id: a.id,
        date: a.date,
        time: a.time,
        dentist: a.dentist,
        reason: a.reason,
    };
}

function toAppointmentInput(input: CreateAppointmentInput): AppointmentInput {
    return {
        date: input.date,
        time: input.time,
        dentist: input.dentist,
        reason: input.reason,
    };
}

/**
 * Connects the appointments React-Query hooks (list + create) to the
 * presentational `AppointmentsCalendarOrganism`. This is the integration
 * layer — the organism stays UI-only.
 */
export function AppointmentsCalendarContainer({
    repo,
    initialDate,
    testID = "appointments-calendar",
}: AppointmentsCalendarContainerProps) {
    const { t } = useTranslation();
    const [selectedDate, setSelectedDate] = useState<string>(
        initialDate ?? new Date().toISOString().split("T")[0]
    );

    const { data, isLoading, isError, refetch } = useAppointmentsQuery(
        { limit: 100 },
        repo
    );
    const createMutation = useCreateAppointmentMutation(repo);

    const appointments = useMemo<AppointmentAgendaItem[]>(
        () => (data?.data ?? []).map(toAgendaItem),
        [data]
    );

    const handleCreate = (input: CreateAppointmentInput) => {
        createMutation.mutate(toAppointmentInput(input), {
            onSuccess: () => {
                // Jump the agenda to the date we just created an appointment on.
                setSelectedDate(input.date);
            },
        });
    };

    if (isLoading) {
        return (
            <View testID={`${testID}-loading`} style={styles.centered}>
                <ActivityIndicator />
            </View>
        );
    }

    if (isError) {
        return (
            <View testID={`${testID}-error`} style={styles.centered}>
                <ThemedText>
                    {t("common.error", "Something went wrong")}
                </ThemedText>
                <ThemedText
                    onPress={() => refetch()}
                    style={styles.retry}
                    type="link"
                >
                    {t("common.retry", "Retry")}
                </ThemedText>
            </View>
        );
    }

    return (
        <AppointmentsCalendarOrganism
            appointments={appointments}
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onCreateAppointment={handleCreate}
            isCreating={createMutation.isPending}
            testID={testID}
        />
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    retry: {
        marginTop: 8,
    },
});

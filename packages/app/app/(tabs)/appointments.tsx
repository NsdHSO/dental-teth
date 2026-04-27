import { useTranslation } from "react-i18next";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { GlassBackground, ThemedText } from "@yuhuu/components";

import { AppointmentsCalendarContainer } from "@/components/AppointmentsCalendarContainer";
import { MockAppointmentsRepository } from "@/features/appointments/repository";

// While the backend isn't ready, use the in-memory mock repository.
// Swap to `defaultAppointmentsRepository` (or remove the prop) to hit the API.
const appointmentsRepo = new MockAppointmentsRepository();

export default function AppointmentsScreen() {
    const { t } = useTranslation();

    return (
        <GlassBackground>
            <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
                <View style={styles.content}>
                    <ThemedText type="title" className="mb-4" style={styles.title}>
                        {t("appointments.title")}
                    </ThemedText>

                    <View style={styles.calendarContainer}>
                        <AppointmentsCalendarContainer
                            repo={appointmentsRepo}
                            testID="appointments-calendar"
                        />
                    </View>
                </View>
            </SafeAreaView>
        </GlassBackground>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: 16,
        paddingBottom: 65 + 40,
    },
    title: {
        paddingTop: 8,
    },
    calendarContainer: {
        flex: 1,
    },
});

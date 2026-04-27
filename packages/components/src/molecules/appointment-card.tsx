import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors } from '../constants/theme';
import { ThemedText } from '../themed-text';
import { GlassCard } from './glass-interactive';

export type Appointment = {
    id: string;
    date: string;
    time: string;
    dentist: string;
    reason: string;
};

export type AppointmentCardMoleculeProps = {
    appointment: Appointment;
    testID?: string;
};

export function AppointmentCardMolecule({
    appointment,
    testID
}: AppointmentCardMoleculeProps) {
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];

    return (
        <GlassCard
            testID={testID}
            variant="tinted"
            borderRadius={12}
            enableElectric={true}
            enableWaves={true}
            style={[styles.card, { borderLeftColor: colors.tint }]}
        >
            <View style={styles.timeContainer}>
                <ThemedText type="subtitle" style={styles.time}>
                    {appointment.time}
                </ThemedText>
            </View>

            <View style={styles.detailsContainer}>
                <ThemedText type="default" className="font-semibold">
                    {appointment.dentist}
                </ThemedText>
                <ThemedText type="default" className="opacity-70" style={styles.reason}>
                    {appointment.reason}
                </ThemedText>
            </View>
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        flexDirection: 'row',
        gap: 16,
    },
    timeContainer: {
        minWidth: 60,
    },
    time: {
        fontWeight: '700',
    },
    detailsContainer: {
        flex: 1,
    },
    reason: {
        marginTop: 4,
    },
});
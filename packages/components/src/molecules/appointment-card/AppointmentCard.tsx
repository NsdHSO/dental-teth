import React from 'react';
import {View} from 'react-native';
import {useColorScheme} from '../../hooks/use-color-scheme';
import {Colors} from '../../constants/theme';
import {ThemedText} from '../../themed-text';
import {GlassCard} from '../glass-interactive/GlassCard';
import {StatusBadge} from '../../atoms/status-badge';

export type AppointmentCardProps = {
    id: string;
    patientName: string;
    time: string;
    reason?: string;
    status?: 'pending' | 'confirmed' | 'cancelled';
    testID?: string;
};

export function AppointmentCard({id, patientName, time, reason, status, testID}: AppointmentCardProps) {
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];

    return (
        <GlassCard testID={testID} variant="tinted" borderRadius={12} enableElectric={true} enableWaves={true}
            style={{borderLeftWidth: 4, borderLeftColor: colors.tint, padding: 16, marginBottom: 12, flexDirection: 'row', gap: 16}}>
            <View style={{minWidth: 60}}><ThemedText type="subtitle" weight="700">{time}</ThemedText></View>
            <View style={{flex: 1}}>
                <ThemedText type="default" weight="semibold">{patientName}</ThemedText>
                {reason && <ThemedText type="default" style={{opacity: 0.7, marginTop: 4}}>{reason}</ThemedText>}
            </View>
            {status && <StatusBadge status={status} testID={testID ? `${testID}-status` : undefined} />}
        </GlassCard>
    );
}
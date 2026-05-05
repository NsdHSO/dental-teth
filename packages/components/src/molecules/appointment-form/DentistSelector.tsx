import React from 'react';
import {View} from 'react-native';
import {ThemedText} from '../../themed-text';
import {GlassInput} from '../glass-content/GlassInput';

export type DentistSelectorProps = {
    dentistId: string;
    onDentistIdChange: (v: string) => void;
    disabled?: boolean;
    testID?: string;
};

export function DentistSelector({dentistId, onDentistIdChange, disabled, testID}: DentistSelectorProps) {
    return (
        <View testID={testID} style={{gap: 12}}>
            <ThemedText size="xs" weight="semibold" style={{marginBottom: 4, color: '#6B7280'}}>
                DENTIST ID *
            </ThemedText>
            <GlassInput
                value={dentistId}
                onChangeText={onDentistIdChange}
                placeholder="Dentist ID"
                keyboardType="number-pad"
                editable={!disabled}
                variant="tinted"
                testID={testID ? `${testID}-dentist-id` : undefined}
            />
        </View>
    );
}

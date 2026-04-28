import React from 'react';
import {View} from 'react-native';
import {GlassInput} from '../glass-content/GlassInput';
import {ThemedText} from '../../themed-text';

export type PatientFieldsProps = {
    name: string;
    phone: string;
    email: string;
    onNameChange: (v: string) => void;
    onPhoneChange: (v: string) => void;
    onEmailChange: (v: string) => void;
    disabled?: boolean;
    testID?: string;
};

export function PatientFields({
    name, phone, email,
    onNameChange, onPhoneChange, onEmailChange,
    disabled, testID,
}: PatientFieldsProps) {
    return (
        <View testID={testID} style={{gap: 12}}>
            <View>
                <ThemedText size="xs" weight="semibold" style={{marginBottom: 4, color: '#6B7280'}}>
                    PATIENT NAME *
                </ThemedText>
                <GlassInput
                    value={name}
                    onChangeText={onNameChange}
                    placeholder="Patient name"
                    editable={!disabled}
                    variant="tinted"
                    testID={testID ? `${testID}-name` : undefined}
                />
            </View>
            <View>
                <ThemedText size="xs" weight="semibold" style={{marginBottom: 4, color: '#6B7280'}}>
                    PHONE
                </ThemedText>
                <GlassInput
                    value={phone}
                    onChangeText={onPhoneChange}
                    placeholder="+1234567890"
                    keyboardType="phone-pad"
                    editable={!disabled}
                    variant="tinted"
                />
            </View>
            <View>
                <ThemedText size="xs" weight="semibold" style={{marginBottom: 4, color: '#6B7280'}}>
                    EMAIL
                </ThemedText>
                <GlassInput
                    value={email}
                    onChangeText={onEmailChange}
                    placeholder="patient@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!disabled}
                    variant="tinted"
                />
            </View>
        </View>
    );
}
import React from 'react';
import {View, Pressable, Text} from 'react-native';
import {useTranslation} from 'react-i18next';
import {ThemedText} from '../../themed-text';
import {useColorScheme} from '../../hooks/use-color-scheme';
import {useGlowVariant} from '../../hooks/useGlowVariant';
import {getGlowColor} from '../../constants/glowColors';

export type DurationPickerProps = {
    value?: number;
    onChange: (duration: number) => void;
    disabled?: boolean;
    testID?: string;
};

const DURATIONS = [15, 30, 45, 60];

export function DurationPicker({value = 30, onChange, disabled, testID}: DurationPickerProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme() ?? 'light';
    const {glowVariant} = useGlowVariant();
    const accentColor = getGlowColor(glowVariant, scheme);

    return (
        <View testID={testID}>
            <ThemedText size="xs" weight="semibold" style={{marginBottom: 8, color: '#6B7280'}}>
                DURATION
            </ThemedText>
            <View style={{flexDirection: 'row', gap: 8, flexWrap: 'wrap'}}>
                {DURATIONS.map(d => (
                    <Pressable
                        key={d}
                        onPress={() => !disabled && onChange(d)}
                        disabled={disabled}
                        style={{
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 20,
                        backgroundColor: value === d ? accentColor : '#E5E7EB',
                        }}
                    >
                        <Text style={{color: value === d ? '#FFF' : '#374151', fontWeight: '600'}}>
                            {d} min
                        </Text>
                    </Pressable>
                ))}
            </View>
        </View>
    );
}
import {View, Pressable, Text} from 'react-native';
import {useTranslation} from 'react-i18next';
import {ThemedText} from '../themed-text';

export type DurationPickerProps = {
    value?: number;
    onChange: (duration: number) => void;
    disabled?: boolean;
    testID?: string;
};

const DURATIONS = [15, 30, 45, 60];

export function DurationPicker({value = 30, onChange, disabled, testID}: DurationPickerProps) {
    const {t} = useTranslation();

    return (
        <View testID={testID} style={{flexDirection: 'row', gap: 8, flexWrap: 'wrap'}}>
            {DURATIONS.map(d => (
                <Pressable
                    key={d}
                    onPress={() => !disabled && onChange(d)}
                    disabled={disabled}
                    style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: value === d ? '#6366F1' : '#E5E7EB',
                        borderWidth: 1,
                        borderColor: value === d ? '#6366F1' : '#D1D5DB',
                    }}
                >
                    <Text style={{color: value === d ? '#FFF' : '#374151', fontWeight: '600'}}>
                        {d} {t('appointments.minutes', 'min')}
                    </Text>
                </Pressable>
            ))}
        </View>
    );
}
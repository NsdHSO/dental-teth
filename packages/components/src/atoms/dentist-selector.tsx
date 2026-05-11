import {View, Text} from 'react-native';
import {useTranslation} from 'react-i18next';
import {ThemedText} from '../themed-text';

export type DentistSelectorProps = {
    value?: number;
    onChange: (dentistId: number | undefined) => void;
    disabled?: boolean;
    testID?: string;
};

export function DentistSelector({value, onChange, disabled, testID}: DentistSelectorProps) {
    const {t} = useTranslation();

    return (
        <View testID={testID}>
            <ThemedText size="xs" weight="semibold" style={{marginBottom: 4, color: '#6B7280'}}>
                DENTIST
            </ThemedText>
            <View
                style={{
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: '#F3F4F6',
                    borderWidth: 1,
                    borderColor: '#D1D5DB',
                }}
            >
                <Text style={{color: '#9CA3AF', fontSize: 15}}>
                    {t('appointments.dentistComingSoon', 'Coming soon')}
                </Text>
            </View>
        </View>
    );
}
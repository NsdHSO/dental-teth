import React from 'react';
import {View, Pressable, Text} from 'react-native';
import {useTranslation} from 'react-i18next';

export type FormActionsProps = {
    onCancel: () => void;
    onSubmit: () => void;
    isSubmitting?: boolean;
    testID?: string;
};

export function FormActions({onCancel, onSubmit, isSubmitting = false, testID}: FormActionsProps) {
    const {t} = useTranslation();

    return (
        <View testID={testID} style={{flexDirection: 'row', gap: 12, marginTop: 24}}>
            <Pressable
                onPress={onCancel}
                disabled={isSubmitting}
                style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 12,
                    borderWidth: 1.5,
                    borderColor: '#94A3B8',
                    alignItems: 'center',
                }}
            >
                <Text style={{color: '#374151', fontSize: 16, fontWeight: '700'}}>
                    {t('common.cancel')}
                </Text>
            </Pressable>
            <Pressable
                onPress={onSubmit}
                disabled={isSubmitting}
                style={{
                    flex: 1,
                    paddingVertical: 14,
                    borderRadius: 12,
                    backgroundColor: isSubmitting ? '#94A3B8' : '#6366F1',
                    alignItems: 'center',
                }}
            >
                <Text style={{color: '#FFF', fontSize: 16, fontWeight: '700'}}>
                    {isSubmitting ? t('common.creating', 'Creating...') : t('appointments.form.create', 'Create')}
                </Text>
            </Pressable>
        </View>
    );
}
import React, { forwardRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { GlassBottomSheet } from './glass-interactive/GlassBottomSheet';
import { ThemedText } from '../themed-text';
import { LanguagePicker } from './language-picker';
import { GlowVariantPicker } from './glow-variant-picker';

export type SettingsPanelProps = {
    testID?: string;
};

/**
 * Bottom-sheet settings panel bundling the glow theme picker and the language
 * picker. Forwarded ref exposes the underlying `BottomSheetModal` so the
 * parent can `present()`/`dismiss()` it imperatively (e.g. on avatar tap).
 */
export const SettingsPanel = forwardRef<BottomSheetModal, SettingsPanelProps>(
    function SettingsPanel({ testID }, ref) {
        const { t } = useTranslation();

        return (
            <GlassBottomSheet
                ref={ref}
                snapPoints={['60%']}
                testID={testID ? `${testID}-bottom-sheet` : undefined}
            >
                <View style={styles.bottomSheetContent}>
                    <ThemedText style={styles.modalTitle}>
                        {t('avatar.modalTitle')}
                    </ThemedText>

                    <View style={styles.body}>
                        <GlowVariantPicker
                            testID={testID ? `${testID}-glow` : 'settings-glow'}
                        />
                        <LanguagePicker />
                    </View>
                </View>
            </GlassBottomSheet>
        );
    }
);

const styles = StyleSheet.create({
    bottomSheetContent: {
        flex: 1,
        paddingTop: 8,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 24,
        textAlign: 'center',
    },
    body: {
        gap: 16,
    },
});

import React from 'react';
import { Pressable, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '../themed-text';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors } from '../constants/theme';
import { useGlowVariant } from '../hooks/useGlowVariant';
import { getGlowColor, type GlowVariant } from '../constants/glowColors';

export const GLOW_VARIANTS: Array<{ key: GlowVariant; color: string }> = [
    { key: 'subtle', color: '#94A3B8' },
    { key: 'vibrant', color: '#A78BFA' },
    { key: 'warm', color: '#FB923C' },
    { key: 'cool', color: '#60A5FA' },
];

export type GlowVariantPickerProps = {
    testID?: string;
};

/**
 * Theme-color picker. Shows one circle per available `GlowVariant` and updates
 * the global `useGlowVariant()` context (which persists to storage).
 */
export function GlowVariantPicker({ testID }: GlowVariantPickerProps) {
    const { t } = useTranslation();
    const { glowVariant, setGlowVariant } = useGlowVariant();
    const scheme = useColorScheme() ?? 'light';

    return (
        <View testID={testID}>
            <ThemedText style={{ fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                {t('profile.glowTheme')}
            </ThemedText>
            <View style={{ flexDirection: 'row', gap: 8 }}>
                {GLOW_VARIANTS.map(({ key, color }) => {
                    const isSelected = glowVariant === key;
                    // Use the live theme color when selected so the swatch always
                    // reflects what the rest of the app will use after the choice.
                    const swatchColor = isSelected
                        ? getGlowColor(key, scheme)
                        : color;
                    return (
                        <Pressable
                            key={key}
                            testID={testID ? `${testID}-glow-${key}` : `glow-${key}`}
                            onPress={() => setGlowVariant(key)}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isSelected }}
                            accessibilityLabel={`Glow theme ${key}`}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: swatchColor,
                                borderWidth: isSelected ? 3 : 1,
                                borderColor: isSelected
                                    ? Colors[scheme].text
                                    : (scheme === 'dark' ? '#374151' : '#D1D5DB'),
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        />
                    );
                })}
            </View>
        </View>
    );
}

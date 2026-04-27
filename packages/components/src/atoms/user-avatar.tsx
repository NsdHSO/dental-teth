import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { useColorScheme } from '../hooks/use-color-scheme';
import { useGlowVariant } from '../hooks/useGlowVariant';
import { getGlowColor } from '../constants/glowColors';
import { ThemedText } from '../themed-text';

export type UserAvatarProps = {
    /** Display name used to compute the initials (falls back to email/local-part). */
    name?: string | null;
    /** Email used as fallback for the initials. */
    email?: string | null;
    /** Avatar diameter in pixels. */
    size?: number;
    /** Tap handler — when provided the avatar becomes pressable. */
    onPress?: () => void;
    accessibilityLabel?: string;
    style?: ViewStyle;
    testID?: string;
};

function computeInitials(name?: string | null, email?: string | null): string {
    const source = (name ?? '').trim() || (email ?? '').split('@')[0]?.trim() || '';
    if (!source) return '?';
    const parts = source.split(/\s+|[._-]/).filter(Boolean);
    if (parts.length === 0) return source.slice(0, 1).toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Circular avatar with initials, theme-aware glow tinting, and optional tap.
 */
export function UserAvatar({
    name,
    email,
    size = 44,
    onPress,
    accessibilityLabel,
    style,
    testID,
}: UserAvatarProps) {
    const scheme = useColorScheme() ?? 'light';
    const { glowVariant } = useGlowVariant();
    const glow = getGlowColor(glowVariant, scheme);

    const initials = useMemo(() => computeInitials(name, email), [name, email]);

    const containerStyle: ViewStyle = {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 2,
        borderColor: glow,
        backgroundColor: `${glow}${scheme === 'dark' ? '33' : '22'}`,
        alignItems: 'center',
        justifyContent: 'center',
    };

    const content = (
        <View
            testID={testID}
            style={[containerStyle, style]}
            accessibilityRole={onPress ? 'button' : 'image'}
            accessibilityLabel={accessibilityLabel ?? `${initials} avatar`}
        >
            <ThemedText
                style={{
                    fontSize: size * 0.4,
                    fontWeight: '700',
                    color: scheme === 'dark' ? '#FFFFFF' : glow,
                }}
            >
                {initials}
            </ThemedText>
        </View>
    );

    if (!onPress) return content;
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [styles.pressable, { opacity: pressed ? 0.7 : 1 }]}
            testID={testID ? `${testID}-pressable` : undefined}
        >
            {content}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    pressable: {
        alignSelf: 'flex-start',
    },
});

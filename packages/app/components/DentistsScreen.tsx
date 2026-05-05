import React, { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import {
    GlassBackground,
    GlassCard,
    GlassInput,
    ThemedText,
} from '@yuhuu/components';
import {
    useDentistsQuery,
    useDentistAutocompleteQuery,
} from '@/features/dentists/hooks';
import type { Dentist } from '@/features/dentists/types';

function DentistListItem({
    dentist,
    onPress,
}: {
    dentist: Dentist;
    onPress: () => void;
}) {
    return (
        <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
            <GlassCard variant="tinted" borderRadius={12} style={styles.card}>
                <View style={styles.row}>
                    <ThemedText type="default" weight="semibold">
                        {dentist.name}
                    </ThemedText>
                    {!dentist.isAvailable && (
                        <View style={styles.badge}>
                            <ThemedText size="xs" style={styles.badgeText}>
                                {t('dentists.unavailable', 'Unavailable')}
                            </ThemedText>
                        </View>
                    )}
                </View>
                {dentist.specialty && (
                    <ThemedText type="default" style={styles.meta}>
                        {dentist.specialty}
                    </ThemedText>
                )}
                {dentist.phone && (
                    <ThemedText type="default" style={styles.meta}>
                        {dentist.phone}
                    </ThemedText>
                )}
            </GlassCard>
        </Pressable>
    );
}

export function DentistsScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [showAutocomplete, setShowAutocomplete] = useState(false);

    const { data, isLoading, isError, refetch } = useDentistsQuery({ limit: 50 });
    const { data: autocompleteResults, isLoading: autocompleteLoading } =
        useDentistAutocompleteQuery(searchQuery);

    const dentists = data?.data ?? [];

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
        setShowAutocomplete(text.trim().length >= 2);
    };

    const handleSelectDentist = (dentistId: number) => {
        setSearchQuery('');
        setShowAutocomplete(false);
        router.push(`/dentists/${dentistId}`);
    };

    const handleDentistPress = (dentist: Dentist) => {
        router.push(`/dentists/${dentist.id}`);
    };

    if (isLoading) {
        return (
            <GlassBackground>
                <View style={styles.centered}>
                    <ActivityIndicator />
                </View>
            </GlassBackground>
        );
    }

    if (isError) {
        return (
            <GlassBackground>
                <View style={styles.centered}>
                    <ThemedText>{t('common.error')}</ThemedText>
                    <Pressable onPress={() => { refetch().catch(() => {}); }}>
                        <ThemedText type="link">{t('common.retry')}</ThemedText>
                    </Pressable>
                </View>
            </GlassBackground>
        );
    }

    return (
        <GlassBackground>
            <View style={styles.container}>
                <ThemedText type="title" style={styles.title}>
                    {t('dentists.title', 'Dentists')}
                </ThemedText>

                <View style={styles.searchRow}>
                    <GlassInput
                        value={searchQuery}
                        onChangeText={handleSearchChange}
                        placeholder={t('dentists.searchPlaceholder', 'Search dentists...')}
                        variant="tinted"
                        style={{ flex: 1 }}
                    />
                </View>

                {showAutocomplete && (
                    <View style={styles.autocompleteBox}>
                        {autocompleteLoading && <ActivityIndicator />}
                        {!autocompleteLoading &&
                            (autocompleteResults ?? []).length === 0 && (
                                <ThemedText style={{ color: '#9CA3AF' }}>
                                    {t('dentists.noResults', 'No dentists found')}
                                </ThemedText>
                            )}
                        {(autocompleteResults ?? []).map((item) => (
                            <Pressable
                                key={item.dentistId}
                                onPress={() => handleSelectDentist(item.dentistId)}
                                style={({ pressed }) => [
                                    styles.suggestion,
                                    { backgroundColor: pressed ? '#E5E7EB' : 'transparent' },
                                ]}
                            >
                                <ThemedText>
                                    {item.fullName ?? `Dentist #${item.dentistId}`}
                                </ThemedText>
                                {item.specialty && (
                                    <ThemedText style={{ color: '#9CA3AF', fontSize: 12 }}>
                                        {item.specialty}
                                    </ThemedText>
                                )}
                            </Pressable>
                        ))}
                    </View>
                )}

                <FlatList
                    data={dentists}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({ item }) => (
                        <DentistListItem
                            dentist={item}
                            onPress={() => handleDentistPress(item)}
                        />
                    )}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                />
            </View>
        </GlassBackground>
    );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    container: {
        flex: 1,
        padding: 16,
        paddingBottom: 105,
    },
    title: {
        paddingTop: 8,
        marginBottom: 16,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    autocompleteBox: {
        backgroundColor: '#F9FAFB',
        borderRadius: 8,
        padding: 8,
        marginBottom: 12,
        maxHeight: 200,
    },
    suggestion: {
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    list: {
        gap: 8,
        paddingBottom: 16,
    },
    card: {
        padding: 14,
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    badge: {
        backgroundColor: '#EF4444',
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    badgeText: {
        color: '#FFF',
        fontWeight: '600',
    },
    meta: {
        opacity: 0.7,
        marginTop: 2,
    },
});

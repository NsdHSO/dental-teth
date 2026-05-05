import React, {useState} from 'react';
import {ActivityIndicator, FlatList, Pressable, StyleSheet, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useRouter} from 'expo-router';
import {GlassBackground, GlassCard, GlassInput, ThemedText} from '@yuhuu/components';
import {
    usePatientsQuery,
    usePatientAutocompleteQuery,
} from '@/features/patients/hooks';
import type {Patient} from '@/features/patients/types';

function PatientListItem({
    patient,
    onPress,
}: {
    patient: Patient;
    onPress: () => void;
}) {
    return (
        <Pressable onPress={onPress} style={({pressed}) => ({opacity: pressed ? 0.7 : 1})}>
            <GlassCard variant="tinted" borderRadius={12} style={styles.card}>
                <ThemedText type="default" weight="semibold">
                    {patient.fullName ?? `Patient #${patient.id}`}
                </ThemedText>
                {patient.phone && (
                    <ThemedText type="default" style={styles.meta}>
                        {patient.phone}
                    </ThemedText>
                )}
                {patient.email && (
                    <ThemedText type="default" style={styles.meta}>
                        {patient.email}
                    </ThemedText>
                )}
            </GlassCard>
        </Pressable>
    );
}

export function PatientsScreen() {
    const {t} = useTranslation();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [showAutocomplete, setShowAutocomplete] = useState(false);

    const {data, isLoading, isError, refetch} = usePatientsQuery({limit: 50});
    const {data: autocompleteResults, isLoading: autocompleteLoading} =
        usePatientAutocompleteQuery(searchQuery);

    const patients = data?.data ?? [];

    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
        setShowAutocomplete(text.trim().length >= 2);
    };

    const handleSelectPatient = (patientId: number) => {
        setSearchQuery('');
        setShowAutocomplete(false);
        router.push(`/patients/${patientId}`);
    };

    const handlePatientPress = (patient: Patient) => {
        router.push(`/patients/${patient.id}`);
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
                    {t('patients.title', 'Patients')}
                </ThemedText>

                <View style={styles.searchRow}>
                    <GlassInput
                        value={searchQuery}
                        onChangeText={handleSearchChange}
                        placeholder={t('patients.searchPlaceholder', 'Search patients...')}
                        variant="tinted"
                        style={{flex: 1}}
                    />
                </View>

                {showAutocomplete && (
                    <View style={styles.autocompleteBox}>
                        {autocompleteLoading && <ActivityIndicator />}
                        {!autocompleteLoading &&
                            (autocompleteResults ?? []).length === 0 && (
                                <ThemedText style={{color: '#9CA3AF'}}>
                                    No patients found
                                </ThemedText>
                            )}
                        {(autocompleteResults ?? []).map((item) => (
                            <Pressable
                                key={item.patientId}
                                onPress={() => handleSelectPatient(item.patientId)}
                                style={({pressed}) => [
                                    styles.suggestion,
                                    {backgroundColor: pressed ? '#E5E7EB' : 'transparent'},
                                ]}
                            >
                                <ThemedText>
                                    {item.fullName ?? `Patient #${item.patientId}`}
                                </ThemedText>
                            </Pressable>
                        ))}
                    </View>
                )}

                <FlatList
                    data={patients}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={({item}) => (
                        <PatientListItem
                            patient={item}
                            onPress={() => handlePatientPress(item)}
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
    searchInput: {
        flex: 1,
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
    meta: {
        opacity: 0.7,
        marginTop: 2,
    },
});

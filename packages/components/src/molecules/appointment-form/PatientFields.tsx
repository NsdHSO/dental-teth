import React from 'react';
import {View, Pressable, ActivityIndicator, ScrollView} from 'react-native';
import {GlassInput} from '../glass-content/GlassInput';
import {ThemedText} from '../../themed-text';

export type PatientSuggestion = {
    id: number;
    label: string;
};

export type PatientFieldsProps = {
    query: string;
    onQueryChange: (v: string) => void;
    results: PatientSuggestion[];
    selectedId?: number;
    onSelect: (id: number) => void;
    loading?: boolean;
    disabled?: boolean;
    testID?: string;
};

export function PatientFields({
    query, onQueryChange, results, selectedId, onSelect, loading, disabled, testID,
}: PatientFieldsProps) {
    const hasQuery = query.trim().length > 0;
    const showResults = hasQuery && !selectedId;

    return (
        <View testID={testID} style={{gap: 12}}>
            <View>
                <ThemedText size="xs" weight="semibold" style={{marginBottom: 4, color: '#6B7280'}}>
                    PATIENT *
                </ThemedText>
                <GlassInput
                    value={query}
                    onChangeText={onQueryChange}
                    placeholder="Search patient by name..."
                    editable={!disabled}
                    variant="tinted"
                    testID={testID ? `${testID}-patient-query` : undefined}
                />
            </View>
            {loading && hasQuery && (
                <ActivityIndicator style={{marginTop: 8}} />
            )}
            {showResults && results.length > 0 && (
                <View style={{maxHeight: 160, backgroundColor: '#F9FAFB', borderRadius: 8, padding: 4}}>
                    <ScrollView keyboardShouldPersistTaps="handled">
                        {results.map((item, index) => (
                            <Pressable
                                key={item.id}
                                onPress={() => onSelect(item.id)}
                                testID={testID ? `${testID}-patient-suggestion-${index}` : undefined}
                                style={({pressed}) => ({
                                    paddingVertical: 10,
                                    paddingHorizontal: 12,
                                    borderRadius: 6,
                                    backgroundColor: pressed ? '#E5E7EB' : 'transparent',
                                    marginBottom: 2,
                                })}
                            >
                                <ThemedText type="default">{item.label}</ThemedText>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            )}
            {showResults && !loading && results.length === 0 && hasQuery && (
                <ThemedText type="default" style={{color: '#9CA3AF', paddingHorizontal: 4}}>
                    No patients found
                </ThemedText>
            )}
            {selectedId && (
                <Pressable
                    onPress={() => onSelect(0)}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        backgroundColor: '#DBEAFE',
                    }}
                >
                    <ThemedText type="default" style={{color: '#1E40AF'}}>
                        Selected patient #{selectedId}
                    </ThemedText>
                    <ThemedText type="default" style={{color: '#1E40AF'}}>
                        Change
                    </ThemedText>
                </Pressable>
            )}
        </View>
    );
}

import React, { useCallback, useRef } from 'react';
import {
    InteractionManager,
    Platform,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { CalendarExpandableAtom, type AppointmentAgendaItem } from '../atoms/calendar-expandable';
import { ThemedText } from '../themed-text';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors } from '../constants/theme';
import { IconSymbol } from '../ui/icon-symbol';
import { GlassBottomSheet } from '../molecules/glass-interactive/GlassBottomSheet';
import {
    AppointmentForm,
    type CreateAppointmentInput,
} from '../molecules/appointment-form';

export type AppointmentsCalendarOrganismProps = {
    appointments: AppointmentAgendaItem[];
    selectedDate: string;
    onDateSelect: (date: string) => void;
    /** When provided, the "Add appointment" button + bottom-sheet form are shown. */
    onCreateAppointment?: (input: CreateAppointmentInput) => void;
    /** Disables the form while a create mutation is in flight. */
    isCreating?: boolean;
    testID?: string;
};

export function AppointmentsCalendarOrganism({
    appointments,
    selectedDate,
    onDateSelect,
    onCreateAppointment,
    isCreating = false,
    testID,
}: AppointmentsCalendarOrganismProps) {
    const { t } = useTranslation();
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];
    const formSheetRef = useRef<BottomSheetModal>(null);

    const openForm = useCallback(() => {
        // Mirror the GenderPicker pattern — wait for interactions on Android Fabric.
        if (Platform.OS === 'android') {
            InteractionManager.runAfterInteractions(() => {
                requestAnimationFrame(() => {
                    formSheetRef.current?.present();
                });
            });
        } else {
            formSheetRef.current?.present();
        }
    }, []);

    const closeForm = useCallback(() => {
        formSheetRef.current?.dismiss();
    }, []);

    const handleSubmit = useCallback(
        (input: CreateAppointmentInput) => {
            onCreateAppointment?.(input);
            closeForm();
        },
        [onCreateAppointment, closeForm]
    );

    return (
        <View testID={testID} style={styles.container}>
            <CalendarExpandableAtom
                selectedDate={selectedDate}
                onDateSelect={onDateSelect}
                appointments={appointments}
                testID="calendar-expandable"
            />

            {onCreateAppointment ? (
                <>
                    <View style={styles.createSection}>
                        <Pressable
                            onPress={openForm}
                            style={({ pressed }) => [
                                styles.addButton,
                                { backgroundColor: colors.tint },
                                pressed && styles.addButtonPressed,
                            ]}
                            testID="appointment-add-button"
                        >
                            <IconSymbol size={18} name="plus" color="#FFFFFF" />
                            <ThemedText
                                type="default"
                                weight="semibold"
                                style={styles.addButtonText}
                            >
                                {t('appointments.addAppointment', 'Add appointment')}
                            </ThemedText>
                        </Pressable>
                    </View>

                    <GlassBottomSheet
                        ref={formSheetRef}
                        snapPoints={['90%']}
                        testID="appointment-form-sheet"
                    >
                        <AppointmentForm
                            initialDate={selectedDate}
                            onSubmit={handleSubmit}
                            onCancel={closeForm}
                            isSubmitting={isCreating}
                            testID="appointment-form"
                        />
                    </GlassBottomSheet>
                </>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    createSection: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
    },
    addButtonPressed: {
        opacity: 0.7,
    },
    addButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
});

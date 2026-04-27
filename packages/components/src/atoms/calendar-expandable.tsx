import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Calendar, DateData, AgendaList } from 'react-native-calendars';
import { useColorScheme } from '../hooks/use-color-scheme';
import { Colors } from '../constants/theme';
import { ThemedText } from '../themed-text';
import { IconSymbol } from '../ui/icon-symbol';
import { GlassCard } from '../molecules/glass-interactive';

export type AppointmentAgendaItem = {
    id: string;
    date: string;
    time: string;
    dentist: string;
    reason: string;
};

export type CalendarExpandableAtomProps = {
    selectedDate: string;
    onDateSelect: (date: string) => void;
    appointments: AppointmentAgendaItem[];
    testID?: string;
};

type AgendaItem = AppointmentAgendaItem & { name?: string; height?: number };

export function CalendarExpandableAtom({
    selectedDate = '',
    onDateSelect,
    appointments = [],
    testID
}: CalendarExpandableAtomProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];
    const tintColor = colors.tint;

    const toggleExpanded = () => setIsExpanded(!isExpanded);

    const handleDayPress = (day: DateData) => {
        onDateSelect(day.dateString);
    };

    type MarkedDate = {
        marked?: boolean;
        dotColor?: string;
        selected?: boolean;
        selectedColor?: string;
    };

    const markedDates = appointments.reduce((acc, apt) => {
        acc[apt.date] = {
            marked: true,
            dotColor: tintColor,
        };
        return acc;
    }, {} as Record<string, MarkedDate>);

    if (selectedDate) {
        markedDates[selectedDate] = {
            ...(markedDates[selectedDate] || {}),
            selected: true,
            selectedColor: tintColor,
        };
    }

    const sections = React.useMemo(() => {
        if (!selectedDate) return [];
        const dayAppointments = appointments.filter(apt => apt.date === selectedDate);
        if (dayAppointments.length === 0) return [];
        return [
            {
                title: selectedDate,
                data: dayAppointments.map(apt => ({
                    ...apt,
                    name: apt.dentist,
                    height: 80,
                })),
            },
        ];
    }, [appointments, selectedDate]);

    // SectionList passes `{ item, index, section }`. We only need `item` here.
    const renderItem = useCallback(({ item }: { item: AgendaItem }) => {
        if (!item) return null;
        return (
            <View style={styles.itemContainer}>
                <GlassCard
                    variant="tinted"
                    borderRadius={12}
                    enableElectric={true}
                    enableWaves={true}
                    style={[styles.appointmentCard, { borderLeftColor: tintColor }]}
                >
                    <View style={styles.appointmentTime}>
                        <ThemedText type="subtitle" style={styles.timeText}>
                            {item.time}
                        </ThemedText>
                    </View>
                    <View style={styles.appointmentDetails}>
                        <ThemedText type="default" className="font-semibold">
                            {item.dentist}
                        </ThemedText>
                        <ThemedText type="default" className="opacity-70">
                            {item.reason}
                        </ThemedText>
                    </View>
                </GlassCard>
            </View>
        );
    }, [tintColor]);

    // AgendaList passes the section title (string) to renderSectionHeader, not the section object.
    // The wider SectionList type expects `(info: { section }) => ...`, so we widen via `any`.
    const renderSectionHeader = useCallback((title: any) => {
        const text = typeof title === 'string' ? title : title?.section?.title ?? '';
        return (
            <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
                <ThemedText type="subtitle">
                    {text}
                </ThemedText>
            </View>
        );
    }, [colors.background]);

    return (
        <View testID={testID} style={styles.container}>
            <Pressable
                onPress={toggleExpanded}
                style={[styles.header, { backgroundColor: colors.background }]}
            >
                <View style={styles.headerContent}>
                    <ThemedText type="subtitle">
                        {selectedDate || 'Select Date'}
                    </ThemedText>
                    <IconSymbol
                        size={20}
                        name={isExpanded ? 'chevron.up' : 'chevron.down'}
                        color={colors.text}
                    />
                </View>
            </Pressable>

            {isExpanded && (
                <View style={[styles.calendarContainer, { backgroundColor: colors.background }]}>
                    <Calendar
                        onDayPress={handleDayPress}
                        markedDates={markedDates}
                        theme={{
                            backgroundColor: 'transparent',
                            calendarBackground: 'transparent',
                            textSectionTitleColor: colors.text,
                            selectedDayBackgroundColor: tintColor,
                            selectedDayTextColor: '#ffffff',
                            todayTextColor: tintColor,
                            dayTextColor: colors.text,
                            textDisabledColor: colors.text + '60',
                            dotColor: tintColor,
                            selectedDotColor: '#ffffff',
                            arrowColor: tintColor,
                            monthTextColor: colors.text,
                            indicatorColor: tintColor,
                        }}
                        style={styles.calendar}
                    />
                </View>
            )}

            {sections.length > 0 && (
                <View style={styles.agendaContainer}>
                    <AgendaList
                        sections={sections}
                        renderItem={renderItem}
                        renderSectionHeader={renderSectionHeader}
                        scrollEnabled={true}
                        showsVerticalScrollIndicator={false}
                        sectionStyle={styles.sectionStyle}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    calendarContainer: {
        padding: 8,
    },
    calendar: {
        borderRadius: 8,
    },
    agendaContainer: {
        flex: 1,
        marginTop: 16,
    },
    sectionHeader: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    sectionStyle: {
        marginBottom: 8,
    },
    itemContainer: {
        paddingHorizontal: 0,
    },
    appointmentCard: {
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        flexDirection: 'row',
        gap: 16,
    },
    appointmentTime: {
        minWidth: 60,
    },
    timeText: {
        fontWeight: '700',
    },
    appointmentDetails: {
        flex: 1,
    },
});
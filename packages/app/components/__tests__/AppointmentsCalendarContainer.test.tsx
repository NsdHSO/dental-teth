/**
 * Container integration test.
 *
 * Verifies that the container:
 *  - shows a loading indicator while the (mock) API simulates latency,
 *  - renders the calendar once data resolves,
 *  - drives `MockAppointmentsRepository.create(...)` when the user submits the form.
 *
 * Time is mocked via `jest.useFakeTimers()` so the simulated network latency
 * doesn't slow the test.
 */
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';

import { MockAppointmentsRepository } from '@/features/appointments/repository';
import { AppointmentsCalendarContainer } from '../AppointmentsCalendarContainer';

// Mock patient autocomplete hook so the form receives suggestions inline
jest.mock('@/features/patients/hooks', () => ({
    usePatientAutocompleteQuery: jest.fn((query: string) => ({
        data: query.length >= 2
            ? [{ patientId: 1, fullName: 'John Doe', userId: 1, phone: null, email: null, cnp: null, score: 1 }]
            : [],
        isLoading: false,
    })),
}));

// Mock react-i18next so useTranslation returns a simple t() that uses fallbacks
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string, fallback?: string) => fallback || key }),
    I18nextProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock @gorhom/bottom-sheet so BottomSheetModal renders its children inline
// once `present()` is called — lets us interact with the appointment form.
jest.mock('@gorhom/bottom-sheet', () => {
    const RealReact = require('react');
    const RN = require('react-native');
    return {
        BottomSheetModal: RealReact.forwardRef(
            ({ children, testID }: any, ref: any) => {
                const [visible, setVisible] = RealReact.useState(false);
                RealReact.useImperativeHandle(ref, () => ({
                    present: () => setVisible(true),
                    dismiss: () => setVisible(false),
                }));
                if (!visible) return null;
                return RealReact.createElement(RN.View, { testID }, children);
            }
        ),
        BottomSheetView: ({ children, style }: any) =>
            require('react').createElement(
                require('react-native').View,
                { style },
                children
            ),
        BottomSheetScrollView: ({ children, style, testID }: any) =>
            require('react').createElement(
                require('react-native').ScrollView,
                { style, testID },
                children
            ),
        BottomSheetModalProvider: ({ children }: any) => children,
    };
});

// react-i18next: use the real provider with empty resources so `t(key, fallback)`
// returns the fallback string. Avoid mocking i18next entirely.
async function flush(ms: number) {
    await act(async () => {
        jest.advanceTimersByTime(ms);
        await Promise.resolve();
    });
}

function renderWithClient(ui: React.ReactElement) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false, gcTime: 0 },
            mutations: { retry: false },
        },
    });
    const utils = render(
        <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
    );
    return { queryClient, ...utils };
}

describe('AppointmentsCalendarContainer', () => {
    const LATENCY = 200;
    let repo: MockAppointmentsRepository;
    let createSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.useFakeTimers();
        repo = new MockAppointmentsRepository({
            latencyMs: LATENCY,
            seed: [
                { id: '1', date: '2026-04-28', time: '10:00', dentist: 'Dr. Smith', reason: 'Checkup' },
            ],
        });
        createSpy = jest.spyOn(repo, 'create');
    });

    afterEach(() => {
        jest.useRealTimers();
        createSpy.mockRestore();
    });

    it('shows loading then renders the calendar once data resolves', async () => {
        const { getByTestId, queryByTestId } = renderWithClient(
            <AppointmentsCalendarContainer
                repo={repo}
                initialDate="2026-04-28"
                testID="ac"
            />
        );

        // Loading indicator visible while the mock API "request" is in flight.
        expect(getByTestId('ac-loading')).toBeTruthy();

        await flush(LATENCY);
        await waitFor(() => expect(queryByTestId('ac-loading')).toBeNull());

        // Calendar organism is mounted.
        expect(getByTestId('ac')).toBeTruthy();
        // Add-button is shown (since onCreateAppointment is provided).
        expect(getByTestId('appointment-add-button')).toBeTruthy();
    });

    it('opens the form, submits a new appointment, and calls repo.create', async () => {
        const { getByTestId, queryByTestId } = renderWithClient(
            <AppointmentsCalendarContainer
                repo={repo}
                initialDate="2026-04-28"
                testID="ac"
            />
        );

        // Wait for initial fetch.
        await flush(LATENCY);
        await waitFor(() => expect(queryByTestId('ac-loading')).toBeNull());

        // Open the form.
        fireEvent.press(getByTestId('appointment-add-button'));
        expect(getByTestId('ac-form')).toBeTruthy();

        // Fill in the form.
        // 1. Search and select patient
        fireEvent.changeText(getByTestId('ac-patient-query'), 'Jo');
        await flush(0);
        const suggestion = await waitFor(() => getByTestId('ac-patient-suggestion-0'));
        fireEvent.press(suggestion);

        // 2. Select time slot
        fireEvent.press(getByTestId('ac-11:30'));

        // 3. Enter dentist ID
        fireEvent.changeText(getByTestId('ac-dentist-id'), '2');

        // 4. Enter reason
        fireEvent.changeText(getByTestId('ac-reason'), 'X-Ray');

        // Submit.
        fireEvent.press(getByTestId('ac-submit'));

        // Mutation runs through the simulated latency.
        await flush(LATENCY);
        await waitFor(() => expect(createSpy).toHaveBeenCalledTimes(1));
        expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
            patient_id: expect.any(Number),
            dentist_id: 2,
            appointment_date: '2026-04-28',
            appointment_time: '11:30',
            reason: 'X-Ray',
        }));

        // After success, the inline form should auto-close (back to the add button).
        await waitFor(() => expect(queryByTestId('ac-form')).toBeNull());
        expect(getByTestId('appointment-add-button')).toBeTruthy();
    });

    it('lets the user submit a free/custom time outside the preset slots', async () => {
        const { getByTestId, queryByTestId } = renderWithClient(
            <AppointmentsCalendarContainer
                repo={repo}
                initialDate="2026-04-28"
                testID="ac"
            />
        );

        await flush(LATENCY);
        await waitFor(() => expect(queryByTestId('ac-loading')).toBeNull());

        fireEvent.press(getByTestId('appointment-add-button'));
        expect(getByTestId('ac-form')).toBeTruthy();

        // 1. Patient autocomplete
        fireEvent.changeText(getByTestId('ac-patient-query'), 'Jo');
        await flush(0);
        const suggestion2 = await waitFor(() => getByTestId('ac-patient-suggestion-0'));
        fireEvent.press(suggestion2);

        // Type a custom time that isn't one of the preset chips.
        fireEvent.changeText(getByTestId('ac-custom'), '13:15');

        // Enter dentist ID
        fireEvent.changeText(getByTestId('ac-dentist-id'), '3');
        fireEvent.changeText(getByTestId('ac-reason'), 'Whitening');

        fireEvent.press(getByTestId('ac-submit'));

        await flush(LATENCY);
        await waitFor(() => expect(createSpy).toHaveBeenCalledTimes(1));
        expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
            dentist_id: 3,
            appointment_date: '2026-04-28',
            appointment_time: '13:15',
            reason: 'Whitening',
        }));
    });

    it('preset chip overrides a previously typed custom time', async () => {
        const { getByTestId, queryByTestId } = renderWithClient(
            <AppointmentsCalendarContainer
                repo={repo}
                initialDate="2026-04-28"
                testID="ac"
            />
        );

        await flush(LATENCY);
        await waitFor(() => expect(queryByTestId('ac-loading')).toBeNull());

        fireEvent.press(getByTestId('appointment-add-button'));

        // Select patient first
        fireEvent.changeText(getByTestId('ac-patient-query'), 'Jo');
        await flush(0);
        const suggestion3 = await waitFor(() => getByTestId('ac-patient-suggestion-0'));
        fireEvent.press(suggestion3);

        // Start by typing a free time, then tap a preset chip — the chip wins.
        fireEvent.changeText(getByTestId('ac-custom'), '13:15');
        fireEvent.press(getByTestId('ac-15:00'));

        fireEvent.changeText(getByTestId('ac-dentist-id'), '4');
        fireEvent.changeText(getByTestId('ac-reason'), 'Implant');

        fireEvent.press(getByTestId('ac-submit'));

        await flush(LATENCY);
        await waitFor(() => expect(createSpy).toHaveBeenCalledTimes(1));
        expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
            dentist_id: 4,
            appointment_date: '2026-04-28',
            appointment_time: '15:00',
            reason: 'Implant',
        }));
    });
});

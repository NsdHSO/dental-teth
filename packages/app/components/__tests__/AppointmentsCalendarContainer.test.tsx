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
        BottomSheetModalProvider: ({ children }: any) => children,
    };
});

import { MockAppointmentsRepository } from '@/features/appointments/repository';
import { AppointmentsCalendarContainer } from '../AppointmentsCalendarContainer';

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
        expect(getByTestId('appointment-form')).toBeTruthy();

        // Fill in the form. Time is now a chip selector — tap the 11:30 slot.
        fireEvent.press(getByTestId('appointment-form-time-11:30'));
        fireEvent.changeText(getByTestId('appointment-form-dentist'), 'Dr. New');
        fireEvent.changeText(getByTestId('appointment-form-reason'), 'X-Ray');

        // Submit.
        fireEvent.press(getByTestId('appointment-form-submit'));

        // Mutation runs through the simulated latency.
        await flush(LATENCY);
        await waitFor(() => expect(createSpy).toHaveBeenCalledTimes(1));
        expect(createSpy).toHaveBeenCalledWith({
            date: '2026-04-28',
            time: '11:30',
            dentist: 'Dr. New',
            reason: 'X-Ray',
        });

        // After success, the inline form should auto-close (back to the add button).
        await waitFor(() => expect(queryByTestId('appointment-form')).toBeNull());
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
        expect(getByTestId('appointment-form')).toBeTruthy();

        // Type a custom time that isn't one of the preset chips.
        fireEvent.changeText(getByTestId('appointment-form-time-custom'), '13:15');
        fireEvent.changeText(getByTestId('appointment-form-dentist'), 'Dr. Custom');
        fireEvent.changeText(getByTestId('appointment-form-reason'), 'Whitening');

        fireEvent.press(getByTestId('appointment-form-submit'));

        await flush(LATENCY);
        await waitFor(() => expect(createSpy).toHaveBeenCalledTimes(1));
        expect(createSpy).toHaveBeenCalledWith({
            date: '2026-04-28',
            time: '13:15',
            dentist: 'Dr. Custom',
            reason: 'Whitening',
        });
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

        // Start by typing a free time, then tap a preset chip — the chip wins.
        fireEvent.changeText(getByTestId('appointment-form-time-custom'), '13:15');
        fireEvent.press(getByTestId('appointment-form-time-15:00'));
        fireEvent.changeText(getByTestId('appointment-form-dentist'), 'Dr. Override');
        fireEvent.changeText(getByTestId('appointment-form-reason'), 'Implant');

        fireEvent.press(getByTestId('appointment-form-submit'));

        await flush(LATENCY);
        await waitFor(() => expect(createSpy).toHaveBeenCalledTimes(1));
        expect(createSpy).toHaveBeenCalledWith({
            date: '2026-04-28',
            time: '15:00',
            dentist: 'Dr. Override',
            reason: 'Implant',
        });
    });
});

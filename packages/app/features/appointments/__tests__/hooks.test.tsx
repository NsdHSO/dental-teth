/**
 * Appointments hook tests.
 *
 * The MockAppointmentsRepository simulates network latency via `setTimeout`.
 * We use Jest fake timers to advance the clock so the awaited promises resolve
 * synchronously — no real waiting in tests.
 */
import React from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {act, renderHook, waitFor} from '@testing-library/react-native';

import {
    MockAppointmentsRepository,
    type AppointmentsRepository,
} from '../repository';
import {
    useAppointmentsQuery,
    useCreateAppointmentMutation,
    useDeleteAppointmentMutation,
    useUpdateAppointmentMutation,
} from '../hooks';

// Helper: advance fake timers AND let microtasks (promise continuations) flush.
async function advanceAsync(ms: number) {
    await act(async () => {
        jest.advanceTimersByTime(ms);
        // Yield once so any chained then()s after the timer can run.
        await Promise.resolve();
    });
}

// Helper: drain ALL pending fake timers (and the microtasks they queue) until
// none remain. Necessary when a chain of timers is queued by then-handlers
// (e.g. mutation onSuccess → invalidateQueries → refetch → another sleep).
async function flushAllTimers() {
    await act(async () => {
        // Up to 20 cycles is plenty for our test scenarios.
        for (let i = 0; i < 20 && jest.getTimerCount() > 0; i++) {
            jest.runOnlyPendingTimers();
            // Drain microtasks before checking timer count again.
            await Promise.resolve();
            await Promise.resolve();
        }
    });
}

function makeWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {retry: false, gcTime: 0},
            mutations: {retry: false},
        },
    });
    const wrapper: React.FC<{ children: React.ReactNode }> = ({children}) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    return {queryClient, wrapper};
}

describe('appointments hooks (mock repository + fake timers)', () => {
    const LATENCY = 500;

    let repo: MockAppointmentsRepository;

    beforeEach(() => {
        jest.useFakeTimers();
        repo = new MockAppointmentsRepository({
            latencyMs: LATENCY,
            seed: [
                {id: '1', date: '2026-04-28', time: '10:00', dentist: 'Dr. Smith', reason: 'Checkup'},
                {id: '2', date: '2026-04-28', time: '14:30', dentist: 'Dr. Johnson', reason: 'Cleaning'},
                {id: '3', date: '2026-05-05', time: '09:00', dentist: 'Dr. Williams', reason: 'Follow-up'},
            ],
        });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('starts in loading state and resolves only after the simulated latency elapses', async () => {
        const {wrapper} = makeWrapper();
        const {result} = renderHook(() => useAppointmentsQuery(undefined, repo), {wrapper});

        // Before any time advances, the query is still pending.
        expect(result.current.isLoading).toBe(true);
        expect(result.current.data).toBeUndefined();

        // Advance just before the latency window — still pending.
        await advanceAsync(LATENCY - 1);
        expect(result.current.isLoading).toBe(true);

        // Cross the threshold — promise resolves and React Query commits the data.
        await advanceAsync(1);
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data?.data).toHaveLength(3);
        expect(result.current.data?.pagination.total).toBe(3);
    });

    it('filters by selected date', async () => {
        const {wrapper} = makeWrapper();
        const {result} = renderHook(
            () => useAppointmentsQuery({date: '2026-04-28'}, repo),
            {wrapper}
        );

        await advanceAsync(LATENCY);
        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(result.current.data?.data.map((a) => a.id)).toEqual(['1', '2']);
    });

    it('create → invalidates list and exposes the new appointment on refetch', async () => {
        // React Query's internal scheduling combined with fake timers is fragile
        // for chained mutate → invalidate → refetch flows. Use real timers and a
        // tiny latency so the test stays fast.
        jest.useRealTimers();
        const fastRepo = new MockAppointmentsRepository({
            latencyMs: 10,
            seed: [
                {id: '1', date: '2026-04-28', time: '10:00', dentist: 'Dr. Smith', reason: 'Checkup'},
                {id: '2', date: '2026-04-28', time: '14:30', dentist: 'Dr. Johnson', reason: 'Cleaning'},
                {id: '3', date: '2026-05-05', time: '09:00', dentist: 'Dr. Williams', reason: 'Follow-up'},
            ],
        });

        const {wrapper} = makeWrapper();

        const list = renderHook(() => useAppointmentsQuery(undefined, fastRepo), {wrapper});
        await waitFor(() => expect(list.result.current.isSuccess).toBe(true));
        expect(list.result.current.data?.data).toHaveLength(3);

        const create = renderHook(() => useCreateAppointmentMutation(fastRepo), {wrapper});
        act(() => {
            create.result.current.mutate({
                appointment_date: '2026-04-29',
                appointment_time: '11:00',
                patient_id: 99,
                dentist_id: 42,
                reason: 'Consult',
            });
        });

        await waitFor(() => expect(create.result.current.isSuccess).toBe(true));
        await waitFor(() => expect(list.result.current.data?.data).toHaveLength(4));
        expect(list.result.current.data?.data.find((a) => a.dentist === 'Dentist #42')).toBeDefined();
    });

    it('update mutation patches an appointment', async () => {
        const {wrapper} = makeWrapper();
        const update = renderHook(() => useUpdateAppointmentMutation('1', repo), {wrapper});

        act(() => {
            update.result.current.mutate({reason: 'Updated reason'});
        });

        await advanceAsync(LATENCY);
        await waitFor(() => expect(update.result.current.isSuccess).toBe(true));

        expect(update.result.current.data?.id).toBe('1');
        expect(update.result.current.data?.reason).toBe('Updated reason');
    });

    it('delete mutation removes an appointment', async () => {
        const {wrapper} = makeWrapper();
        const del = renderHook(() => useDeleteAppointmentMutation('2', repo), {wrapper});

        act(() => {
            del.result.current.mutate();
        });

        await advanceAsync(LATENCY);
        await waitFor(() => expect(del.result.current.isSuccess).toBe(true));

        // Confirm via list query that id '2' is gone.
        const list = renderHook(() => useAppointmentsQuery(undefined, repo), {wrapper});
        await advanceAsync(LATENCY);
        await waitFor(() => expect(list.result.current.isSuccess).toBe(true));
        expect(list.result.current.data?.data.map((a) => a.id)).toEqual(['1', '3']);
    });

    it('hook respects an injected repository (DI)', async () => {
        const customRepo: AppointmentsRepository = {
            list: jest.fn().mockResolvedValue({
                data: [],
                pagination: {page: 1, limit: 20, total: 0, total_pages: 1},
            }),
            get: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        };

        const {wrapper} = makeWrapper();
        const {result} = renderHook(() => useAppointmentsQuery({date: '2026-04-28'}, customRepo), {wrapper});

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(customRepo.list).toHaveBeenCalledWith(
            expect.objectContaining({date: '2026-04-28'})
        );
    });
});

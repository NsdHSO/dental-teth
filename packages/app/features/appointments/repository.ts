import {appApi, unwrap} from '@yuhuu/auth';
import type {
    Appointment,
    AppointmentDto,
    AppointmentInput,
    AppointmentsList,
    ListAppointmentsParams,
    Pagination,
} from './types';
import {toAppointment, toAppointmentDto, toAppointmentsList} from './mapper';

export interface AppointmentsRepository {
    list(params?: ListAppointmentsParams): Promise<AppointmentsList>;

    get(id: string): Promise<Appointment>;

    create(body: AppointmentInput): Promise<Appointment>;

    update(id: string, body: Partial<AppointmentInput>): Promise<Appointment>;

    delete(id: string): Promise<void>;
}

/**
 * Real backend implementation. Uses the shared `appApi` (axios instance from
 * `@yuhuu/http` via `@yuhuu/auth`) so envelope-unwrapping and bearer-auth
 * interceptors are applied automatically.
 */
export class HttpAppointmentsRepository implements AppointmentsRepository {
    async list(params?: ListAppointmentsParams): Promise<AppointmentsList> {
        const {page = 1, limit = 20, date, from, to} = params ?? {};
        const q = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(date ? {date} : {}),
            ...(from ? {from} : {}),
            ...(to ? {to} : {}),
        });
        const res = await unwrap<{ data: AppointmentDto[]; pagination: Pagination }>(
            appApi.get(`/appointments?${q.toString()}`)
        );
        return toAppointmentsList(res);
    }

    async get(id: string): Promise<Appointment> {
        return toAppointment(await unwrap<AppointmentDto>(appApi.get(`/appointments/${id}`)));
    }

    async create(body: AppointmentInput): Promise<Appointment> {
        return toAppointment(
            await unwrap<AppointmentDto>(appApi.post('/appointments', toAppointmentDto(body)))
        );
    }

    async update(id: string, body: Partial<AppointmentInput>): Promise<Appointment> {
        return toAppointment(
            await unwrap<AppointmentDto>(appApi.put(`/appointments/${id}`, body))
        );
    }

    async delete(id: string): Promise<void> {
        await unwrap(appApi.delete(`/appointments/${id}`));
    }
}

// ----------------------------------------------------------------------------
// Mock repository (in-memory) — simulates a network call so the UI shows the
// loading state realistically, and tests can advance fake timers to flush it.
// ----------------------------------------------------------------------------

export const DEFAULT_MOCK_LATENCY_MS = 400;

const sleep = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

const SEED_APPOINTMENTS: Appointment[] = [
    {id: '1', date: '2026-04-28', time: '10:00', dentist: 'Dr. Smith', reason: 'Regular checkup'},
    {id: '2', date: '2026-04-28', time: '14:30', dentist: 'Dr. Johnson', reason: 'Cleaning'},
    {id: '3', date: '2026-05-05', time: '09:00', dentist: 'Dr. Williams', reason: 'Follow-up'},
];

export type MockAppointmentsRepositoryOptions = {
    /** Artificial latency added to every call (ms). */
    latencyMs?: number;
    /** Initial dataset. Defaults to a small built-in seed. */
    seed?: Appointment[];
};

export class MockAppointmentsRepository implements AppointmentsRepository {
    private items: Appointment[];
    private nextId: number;
    private readonly latencyMs: number;

    constructor(opts: MockAppointmentsRepositoryOptions = {}) {
        this.items = (opts.seed ?? SEED_APPOINTMENTS).map((a) => ({...a}));
        this.latencyMs = opts.latencyMs ?? DEFAULT_MOCK_LATENCY_MS;
        const maxId = this.items.reduce((m, a) => Math.max(m, Number(a.id) || 0), 0);
        this.nextId = maxId + 1;
    }

    async list(params?: ListAppointmentsParams): Promise<AppointmentsList> {
        await sleep(this.latencyMs);
        const {page = 1, limit = 20, date, from, to} = params ?? {};
        let filtered = [...this.items];
        if (date) filtered = filtered.filter((a) => a.date === date);
        if (from) filtered = filtered.filter((a) => a.date >= from);
        if (to) filtered = filtered.filter((a) => a.date <= to);
        filtered.sort((a, b) =>
            a.date === b.date ? a.time.localeCompare(b.time) : a.date.localeCompare(b.date)
        );
        const total = filtered.length;
        const start = (page - 1) * limit;
        return {
            data: filtered.slice(start, start + limit),
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.max(1, Math.ceil(total / limit)),
            },
        };
    }

    async get(id: string): Promise<Appointment> {
        await sleep(this.latencyMs);
        const found = this.items.find((a) => a.id === id);
        if (!found) throw new Error(`Appointment ${id} not found`);
        return {...found};
    }

    async create(body: AppointmentInput): Promise<Appointment> {
        await sleep(this.latencyMs);
        const now = new Date().toISOString();
        const created: Appointment = {
            id: String(this.nextId++),
            ...body,
            createdAt: now,
            updatedAt: now,
        };
        this.items.push(created);
        return {...created};
    }

    async update(id: string, body: Partial<AppointmentInput>): Promise<Appointment> {
        await sleep(this.latencyMs);
        const idx = this.items.findIndex((a) => a.id === id);
        if (idx === -1) throw new Error(`Appointment ${id} not found`);
        const updated: Appointment = {
            ...this.items[idx],
            ...body,
            updatedAt: new Date().toISOString(),
        };
        this.items[idx] = updated;
        return {...updated};
    }

    async delete(id: string): Promise<void> {
        await sleep(this.latencyMs);
        const idx = this.items.findIndex((a) => a.id === id);
        if (idx === -1) throw new Error(`Appointment ${id} not found`);
        this.items.splice(idx, 1);
    }

    /** Test helper: replace the entire dataset. */
    __setItemsForTesting(items: Appointment[]): void {
        this.items = items.map((a) => ({...a}));
        const maxId = this.items.reduce((m, a) => Math.max(m, Number(a.id) || 0), 0);
        this.nextId = maxId + 1;
    }
}

/**
 * Default repository. Set `EXPO_PUBLIC_USE_APPOINTMENTS_MOCK=1` (or import
 * `MockAppointmentsRepository` directly in screens) to use the in-memory mock
 * while the real backend isn't available.
 */
export const defaultAppointmentsRepository: AppointmentsRepository =
    process.env.EXPO_PUBLIC_USE_APPOINTMENTS_MOCK === '1'
        ? new MockAppointmentsRepository()
        : new HttpAppointmentsRepository();

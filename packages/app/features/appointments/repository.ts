import { appApi, unwrap } from '@dental/auth';
import type {
  Appointment,
  AppointmentDto,
  AppointmentInput,
  AppointmentsList,
  ListAppointmentsParams,
  Pagination,
} from './types';
import { toAppointment, toAppointmentDto, toAppointmentsList } from './mapper';

export interface AppointmentsRepository {
  list(params?: ListAppointmentsParams): Promise<AppointmentsList>;
  get(id: string): Promise<Appointment>;
  create(body: AppointmentInput): Promise<Appointment>;
  update(id: string, body: Partial<AppointmentInput>): Promise<Appointment>;
  delete(id: string): Promise<void>;
}

export class HttpAppointmentsRepository implements AppointmentsRepository {
  async list(params?: ListAppointmentsParams): Promise<AppointmentsList> {
    const {
      page = 1,
      limit = 20,
      date,
      from,
      to,
      dentist_id,
      patient_id,
      status,
    } = params ?? {};
    const q = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(date ? { date } : {}),
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      ...(dentist_id ? { dentist_id: String(dentist_id) } : {}),
      ...(patient_id ? { patient_id: String(patient_id) } : {}),
      ...(status ? { status } : {}),
    });
    const res = await unwrap<{
      data: AppointmentDto[];
      pagination: Pagination;
    }>(appApi.get(`/appointments?${q.toString()}`));
    return toAppointmentsList(res);
  }

  async get(id: string): Promise<Appointment> {
    return toAppointment(
      await unwrap<AppointmentDto>(appApi.get(`/appointments/${id}`)),
    );
  }

  async create(body: AppointmentInput): Promise<Appointment> {
    return toAppointment(
      await unwrap<AppointmentDto>(
        appApi.post('/appointments', toAppointmentDto(body)),
      ),
    );
  }

  async update(
    id: string,
    body: Partial<AppointmentInput>,
  ): Promise<Appointment> {
    return toAppointment(
      await unwrap<AppointmentDto>(appApi.put(`/appointments/${id}`, body)),
    );
  }

  async delete(id: string): Promise<void> {
    await unwrap(appApi.delete(`/appointments/${id}`));
  }
}

export const defaultAppointmentsRepository: AppointmentsRepository =
  new HttpAppointmentsRepository();

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

export class MockAppointmentsRepository implements AppointmentsRepository {
  private latencyMs: number;
  private data: Appointment[];

  constructor({
    latencyMs,
    seed,
  }: {
    latencyMs: number;
    seed: Array<{
      id: string;
      date: string;
      time: string;
      dentist: string;
      patient?: { id: number; fullName: string | null };
      reason: string | null;
    }>;
  }) {
    this.latencyMs = latencyMs;
    this.data = seed.map((s) => ({
      id: s.id,
      date: s.date,
      time: s.time,
      dentist: s.dentist,
      patient: {
        id: s.patient?.id ?? 0,
        fullName: s.patient?.fullName ?? null,
        phone: null,
        email: null,
      },
      reason: s.reason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  async list(params?: ListAppointmentsParams): Promise<AppointmentsList> {
    await delay(this.latencyMs);
    let filtered = this.data;
    if (params?.date) {
      filtered = filtered.filter((a) => a.date === params.date);
    }
    if (params?.from) {
      filtered = filtered.filter((a) => a.date >= params.from!);
    }
    if (params?.to) {
      filtered = filtered.filter((a) => a.date <= params.to!);
    }
    if (params?.dentist_id) {
      filtered = filtered.filter(
        (a) => a.dentist === `Dentist #${params.dentist_id}`,
      );
    }
    if (params?.patient_id) {
      filtered = filtered.filter((a) => a.patient.id === params.patient_id);
    }
    return {
      data: filtered,
      pagination: {
        page: 1,
        limit: 20,
        total: filtered.length,
        total_pages: 1,
      },
    };
  }

  async get(id: string): Promise<Appointment> {
    await delay(this.latencyMs);
    const item = this.data.find((d) => d.id === id);
    if (!item) throw new Error('Not found');
    return item;
  }

  async create(body: AppointmentInput): Promise<Appointment> {
    await delay(this.latencyMs);
    const appointment: Appointment = {
      id: String(this.data.length + 1),
      date: body.appointment_date,
      time: body.appointment_time,
      dentist: `Dentist #${body.dentist_id}`,
      patient: {
        id: body.patient_id,
        fullName: null,
        phone: null,
        email: null,
      },
      reason: body.reason ?? null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.push(appointment);
    return appointment;
  }

  async update(
    id: string,
    body: Partial<AppointmentInput>,
  ): Promise<Appointment> {
    await delay(this.latencyMs);
    const idx = this.data.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error('Not found');
    const existing = this.data[idx];
    this.data[idx] = {
      ...existing,
      date: body.appointment_date ?? existing.date,
      time: body.appointment_time ?? existing.time,
      dentist: body.dentist_id
        ? `Dentist #${body.dentist_id}`
        : existing.dentist,
      patient: body.patient_id
        ? { ...existing.patient, id: body.patient_id }
        : existing.patient,
      reason:
        body.reason !== undefined ? (body.reason ?? null) : existing.reason,
      updatedAt: new Date().toISOString(),
    };
    return this.data[idx];
  }

  async delete(id: string): Promise<void> {
    await delay(this.latencyMs);
    this.data = this.data.filter((d) => d.id !== id);
  }
}

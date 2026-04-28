import { appApi, unwrap } from '@yuhuu/auth';
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
        const { page = 1, limit = 20, date, from, to, dentist_id, status } = params ?? {};
        const q = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(date ? { date } : {}),
            ...(from ? { from } : {}),
            ...(to ? { to } : {}),
            ...(dentist_id ? { dentist_id: String(dentist_id) } : {}),
            ...(status ? { status } : {}),
        });
        const res = await unwrap<{
            data: AppointmentDto[];
            pagination: Pagination;
        }>(appApi.get(`/v1/appointments?${q.toString()}`));
        return toAppointmentsList(res);
    }

    async get(id: string): Promise<Appointment> {
        return toAppointment(
            await unwrap<AppointmentDto>(appApi.get(`/v1/appointments/${id}`)),
        );
    }

    async create(body: AppointmentInput): Promise<Appointment> {
        return toAppointment(
            await unwrap<AppointmentDto>(
                appApi.post('/v1/appointments', toAppointmentDto(body)),
            ),
        );
    }

    async update(id: string, body: Partial<AppointmentInput>): Promise<Appointment> {
        return toAppointment(
            await unwrap<AppointmentDto>(appApi.put(`/v1/appointments/${id}`, body)),
        );
    }

    async delete(id: string): Promise<void> {
        await unwrap(appApi.delete(`/v1/appointments/${id}`));
    }
}

export const defaultAppointmentsRepository: AppointmentsRepository =
    new HttpAppointmentsRepository();
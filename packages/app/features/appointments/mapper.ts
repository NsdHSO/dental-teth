import type {
    Appointment,
    AppointmentDto,
    AppointmentInput,
    AppointmentsList,
    Pagination,
} from './types';

export function toAppointment(dto: AppointmentDto): Appointment {
    return {
        id: dto.id,
        date: dto.date,
        time: dto.time,
        dentist: dto.dentist,
        reason: dto.reason,
        createdAt: dto.created_at,
        updatedAt: dto.updated_at,
    };
}

export function toAppointmentDto(input: AppointmentInput): Omit<AppointmentDto, 'id'> {
    return {
        date: input.date,
        time: input.time,
        dentist: input.dentist,
        reason: input.reason,
    };
}

export function toAppointmentsList(res: { data: AppointmentDto[]; pagination: Pagination }): AppointmentsList {
    return {
        data: res.data.map(toAppointment),
        pagination: res.pagination,
    };
}

import type {
    Appointment,
    AppointmentDto,
    AppointmentInput,
    AppointmentsList,
    Pagination,
} from './types';

function toPatientSummary(dto: AppointmentDto['patient']) {
    return {
        id: dto.id,
        fullName: dto.full_name,
        phone: dto.phone,
        email: dto.email,
    };
}

export function toAppointment(dto: AppointmentDto): Appointment {
    return {
        id: dto.id,
        date: dto.date,
        time: dto.time,
        dentist: dto.dentist,
        patient: toPatientSummary(dto.patient),
        reason: dto.reason,
        createdAt: dto.created_at,
        updatedAt: dto.updated_at,
    };
}

export function toAppointmentDto(input: AppointmentInput): AppointmentInput {
    return {
        patient_id: input.patient_id,
        dentist_id: input.dentist_id,
        appointment_date: input.appointment_date,
        appointment_time: input.appointment_time,
        duration: input.duration,
        reason: input.reason,
    };
}

export function toAppointmentsList(res: { data: AppointmentDto[]; pagination: Pagination }): AppointmentsList {
    return {
        data: res.data.map(toAppointment),
        pagination: res.pagination,
    };
}

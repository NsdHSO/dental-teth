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
        patientName: dto.patient_name,
        patientPhone: dto.patient_phone,
        patientEmail: dto.patient_email,
        appointmentDate: dto.appointment_date,
        appointmentTime: dto.appointment_time,
        dentistId: dto.dentist_id,
        duration: dto.duration,
        reason: dto.reason,
        status: dto.status,
        createdAt: dto.created_at,
        updatedAt: dto.updated_at,
    };
}

export function toAppointmentDto(input: AppointmentInput): Omit<AppointmentDto, 'id'> {
    return {
        patient_name: input.patient_name,
        patient_phone: input.patient_phone,
        patient_email: input.patient_email,
        appointment_date: input.appointment_date,
        appointment_time: input.appointment_time,
        dentist_id: input.dentist_id,
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
export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export type AppointmentPatientSummaryDto = {
    id: number;
    full_name: string | null;
    phone: string | null;
    email: string | null;
};

export type AppointmentPatientSummary = {
    id: number;
    fullName: string | null;
    phone: string | null;
    email: string | null;
};

export type AppointmentDto = {
    id: string;
    date: string;
    time: string;
    dentist: string;
    patient: AppointmentPatientSummaryDto;
    reason: string | null;
    created_at: string | null;
    updated_at: string | null;
};

export type Appointment = {
    id: string;
    date: string;
    time: string;
    dentist: string;
    patient: AppointmentPatientSummary;
    reason: string | null;
    createdAt: string | null;
    updatedAt: string | null;
};

export type Pagination = {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
};

export type AppointmentsList = { data: Appointment[]; pagination: Pagination };

export type AppointmentInput = {
    patient_id: number;
    dentist_id: number;
    appointment_date: string;
    appointment_time: string;
    duration?: number;
    reason?: string;
};

export type ListAppointmentsParams = {
    page?: number;
    limit?: number;
    date?: string;
    from?: string;
    to?: string;
    dentist_id?: number;
    patient_id?: number;
    status?: AppointmentStatus;
};

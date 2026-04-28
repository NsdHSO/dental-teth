export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';

export type AppointmentDto = {
    id: string;
    patient_name: string;
    patient_phone?: string;
    patient_email?: string;
    appointment_date: string;
    appointment_time: string;
    dentist_id?: number;
    duration?: number;
    reason?: string;
    status?: AppointmentStatus;
    created_at?: string;
    updated_at?: string;
};

export type Appointment = {
    id: string;
    patientName: string;
    patientPhone?: string;
    patientEmail?: string;
    appointmentDate: string;
    appointmentTime: string;
    dentistId?: number;
    duration?: number;
    reason?: string;
    status?: AppointmentStatus;
    createdAt?: string;
    updatedAt?: string;
};

export type Pagination = {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
};

export type AppointmentsList = { data: Appointment[]; pagination: Pagination };

export type AppointmentInput = {
    patient_name: string;
    patient_phone?: string;
    patient_email?: string;
    appointment_date: string;
    appointment_time: string;
    dentist_id?: number;
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
    status?: AppointmentStatus;
};
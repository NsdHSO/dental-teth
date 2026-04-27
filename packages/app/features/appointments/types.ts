// Domain and transport types for Appointments feature

// Raw shape returned by the API
export type AppointmentDto = {
    id: string;
    date: string;        // YYYY-MM-DD
    time: string;        // HH:mm
    dentist: string;
    reason: string;
    created_at?: string;
    updated_at?: string;
};

// Normalized domain model used by the app/UI
export type Appointment = {
    id: string;
    date: string;
    time: string;
    dentist: string;
    reason: string;
    createdAt?: string;
    updatedAt?: string;
};

// Pagination envelope used by list endpoints
export type Pagination = {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
};

export type AppointmentsList = { data: Appointment[]; pagination: Pagination };

// Input shapes
export type AppointmentInput = {
    date: string;
    time: string;
    dentist: string;
    reason: string;
};

export type ListAppointmentsParams = {
    page?: number;
    limit?: number;
    /** Filter by exact date (YYYY-MM-DD). */
    date?: string;
    /** Filter by inclusive range (YYYY-MM-DD). */
    from?: string;
    to?: string;
};

export type PatientDto = {
    id: number;
    user_id: number;
    full_name: string | null;
    phone: string | null;
    email: string | null;
    cnp: string | null;
    medical_notes: string | null;
    allergies: string | null;
    created_at: string;
    updated_at: string;
};

export type Patient = {
    id: number;
    userId: number;
    fullName: string | null;
    phone: string | null;
    email: string | null;
    cnp: string | null;
    medicalNotes: string | null;
    allergies: string | null;
    createdAt: string;
    updatedAt: string;
};

export type CreatePatientInput = {
    full_name: string;
    phone?: string;
    email?: string;
    cnp?: string;
    medical_notes?: string;
    allergies?: string;
};

export type UpdatePatientInput = {
    full_name?: string;
    phone?: string;
    email?: string;
    cnp?: string;
    medical_notes?: string;
    allergies?: string;
};

export type Pagination = {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
};

export type PatientsList = { data: Patient[]; pagination: Pagination };

export type ListPatientsParams = {
    page?: number;
    limit?: number;
};

export type PatientAutocompleteItemDto = {
    patient_id: number;
    user_id: number;
    full_name: string | null;
    phone: string | null;
    email: string | null;
    cnp: string | null;
    score: number;
};

export type PatientAutocompleteItem = {
    patientId: number;
    userId: number;
    fullName: string | null;
    phone: string | null;
    email: string | null;
    cnp: string | null;
    score: number;
};

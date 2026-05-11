export type DentistDto = {
    id: number;
    user_id: number;
    name: string;
    email: string | null;
    phone: string | null;
    specialty: string | null;
    license_number: string | null;
    photo_url: string | null;
    bio: string | null;
    is_available: boolean;
    consultation_duration: number;
    created_at: string;
    updated_at: string;
};

export type Dentist = {
    id: number;
    userId: number;
    name: string;
    email: string | null;
    phone: string | null;
    specialty: string | null;
    licenseNumber: string | null;
    photoUrl: string | null;
    bio: string | null;
    isAvailable: boolean;
    consultationDuration: number;
    createdAt: string;
    updatedAt: string;
};

export type CreateDentistInput = {
    user_id: number;
    specialty?: string;
    license_number?: string;
    photo_url?: string;
    bio?: string;
    is_available?: boolean;
    consultation_duration?: number;
};

export type UpdateDentistInput = {
    user_id?: number;
    specialty?: string;
    license_number?: string;
    photo_url?: string;
    bio?: string;
    is_available?: boolean;
    consultation_duration?: number;
};

export type Pagination = {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
};

export type DentistsList = { data: Dentist[]; pagination: Pagination };

export type ListDentistsParams = {
    page?: number;
    limit?: number;
    specialty?: string;
};

export type DentistAutocompleteItemDto = {
    dentist_id: number;
    user_id: number;
    full_name: string | null;
    specialty: string | null;
    is_available: boolean;
    score: number;
};

export type DentistAutocompleteItem = {
    dentistId: number;
    userId: number;
    fullName: string | null;
    specialty: string | null;
    isAvailable: boolean;
    score: number;
};

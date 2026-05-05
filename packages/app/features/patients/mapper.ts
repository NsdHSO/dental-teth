import type {
    Patient,
    PatientDto,
    PatientAutocompleteItem,
    PatientAutocompleteItemDto,
    PatientsList,
    Pagination,
} from './types';

export function toPatient(dto: PatientDto): Patient {
    return {
        id: dto.id,
        userId: dto.user_id,
        fullName: dto.full_name,
        phone: dto.phone,
        email: dto.email,
        cnp: dto.cnp,
        medicalNotes: dto.medical_notes,
        allergies: dto.allergies,
        createdAt: dto.created_at,
        updatedAt: dto.updated_at,
    };
}

export function toPatientAutocompleteItem(
    dto: PatientAutocompleteItemDto,
): PatientAutocompleteItem {
    return {
        patientId: dto.patient_id,
        userId: dto.user_id,
        fullName: dto.full_name,
        phone: dto.phone,
        email: dto.email,
        cnp: dto.cnp,
        score: dto.score,
    };
}

export function toPatientsList(res: {
    data: PatientDto[];
    pagination: Pagination;
}): PatientsList {
    return {
        data: res.data.map(toPatient),
        pagination: res.pagination,
    };
}

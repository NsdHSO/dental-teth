import type {
    Dentist,
    DentistDto,
    DentistAutocompleteItem,
    DentistAutocompleteItemDto,
    DentistsList,
    Pagination,
} from './types';

export function toDentist(dto: DentistDto): Dentist {
    return {
        id: dto.id,
        userId: dto.user_id,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        specialty: dto.specialty,
        licenseNumber: dto.license_number,
        photoUrl: dto.photo_url,
        bio: dto.bio,
        isAvailable: dto.is_available,
        consultationDuration: dto.consultation_duration,
        createdAt: dto.created_at,
        updatedAt: dto.updated_at,
    };
}

export function toDentistAutocompleteItem(
    dto: DentistAutocompleteItemDto,
): DentistAutocompleteItem {
    return {
        dentistId: dto.dentist_id,
        userId: dto.user_id,
        fullName: dto.full_name,
        specialty: dto.specialty,
        isAvailable: dto.is_available,
        score: dto.score,
    };
}

export function toDentistsList(res: {
    data: DentistDto[];
    pagination: Pagination;
}): DentistsList {
    return {
        data: res.data.map(toDentist),
        pagination: res.pagination,
    };
}

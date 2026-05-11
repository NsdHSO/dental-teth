import type {
    PatientAttachment,
    PatientAttachmentDto,
    PatientAttachmentsList,
    Pagination,
} from './types';

export function toPatientAttachment(dto: PatientAttachmentDto): PatientAttachment {
    return {
        id: dto.id,
        patientId: dto.patient_id,
        kind: dto.kind,
        storageUrl: dto.storage_url,
        mimeType: dto.mime_type,
        sizeBytes: dto.size_bytes,
        originalFilename: dto.original_filename,
        uploadedBy: dto.uploaded_by,
        createdAt: dto.created_at,
    };
}

export function toPatientAttachmentsList(res: {
    data: PatientAttachmentDto[];
    pagination: Pagination;
}): PatientAttachmentsList {
    return {
        data: res.data.map(toPatientAttachment),
        pagination: res.pagination,
    };
}

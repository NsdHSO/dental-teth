export type PatientAttachmentDto = {
    id: number;
    patient_id: number;
    kind: string;
    storage_url: string;
    mime_type: string;
    size_bytes: number;
    original_filename: string | null;
    uploaded_by: number | null;
    created_at: string;
};

export type PatientAttachment = {
    id: number;
    patientId: number;
    kind: string;
    storageUrl: string;
    mimeType: string;
    sizeBytes: number;
    originalFilename: string | null;
    uploadedBy: number | null;
    createdAt: string;
};

export type CreatePatientAttachmentInput = {
    kind: string;
    storage_url: string;
    mime_type: string;
    size_bytes: number;
    original_filename?: string;
};

export type Pagination = {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
};

export type PatientAttachmentsList = {
    data: PatientAttachment[];
    pagination: Pagination;
};

export type ListPatientAttachmentsParams = {
    page?: number;
    limit?: number;
};

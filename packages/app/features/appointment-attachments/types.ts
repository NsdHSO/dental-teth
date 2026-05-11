export type AppointmentAttachmentDto = {
    id: number;
    appointment_id: number;
    filename: string | null;
    mime_type: string;
    size_bytes: number;
    uploaded_by: number | null;
    created_at: string;
};

export type AppointmentAttachment = {
    id: number;
    appointmentId: number;
    filename: string | null;
    mimeType: string;
    sizeBytes: number;
    uploadedBy: number | null;
    createdAt: string;
};

export type Pagination = {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
};

export type AppointmentAttachmentsList = {
    data: AppointmentAttachment[];
    pagination: Pagination;
};

export type ListAppointmentAttachmentsParams = {
    page?: number;
    limit?: number;
};

export type UploadFile = {
    uri: string;
    name: string;
    type: string;
};

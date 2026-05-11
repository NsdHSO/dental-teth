import type {
    AppointmentAttachment,
    AppointmentAttachmentDto,
    AppointmentAttachmentsList,
    Pagination,
} from './types';

export function toAppointmentAttachment(dto: AppointmentAttachmentDto): AppointmentAttachment {
    return {
        id: dto.id,
        appointmentId: dto.appointment_id,
        filename: dto.filename,
        mimeType: dto.mime_type,
        sizeBytes: dto.size_bytes,
        uploadedBy: dto.uploaded_by,
        createdAt: dto.created_at,
    };
}

export function toAppointmentAttachmentsList(res: {
    data: AppointmentAttachmentDto[];
    pagination: Pagination;
}): AppointmentAttachmentsList {
    return {
        data: res.data.map(toAppointmentAttachment),
        pagination: res.pagination,
    };
}

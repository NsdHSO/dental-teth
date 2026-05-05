import { appApi, unwrap, getValidAccessToken } from '@yuhuu/auth';
import type {
    AppointmentAttachment,
    AppointmentAttachmentDto,
    AppointmentAttachmentsList,
    ListAppointmentAttachmentsParams,
    Pagination,
    UploadFile,
} from './types';
import { toAppointmentAttachment, toAppointmentAttachmentsList } from './mapper';

const APP_BASE = 'http://localhost:8080/v1'; // TODO: read from env

export interface AppointmentAttachmentsRepository {
    list(
        appointmentId: number,
        params?: ListAppointmentAttachmentsParams,
    ): Promise<AppointmentAttachmentsList>;
    get(appointmentId: number, attachmentId: number): Promise<AppointmentAttachment>;
    upload(
        appointmentId: number,
        file: UploadFile,
    ): Promise<AppointmentAttachment>;
    download(appointmentId: number, attachmentId: number): Promise<Blob>;
    delete(appointmentId: number, attachmentId: number): Promise<void>;
}

export class HttpAppointmentAttachmentsRepository
    implements AppointmentAttachmentsRepository
{
    async list(
        appointmentId: number,
        params?: ListAppointmentAttachmentsParams,
    ): Promise<AppointmentAttachmentsList> {
        const { page = 1, limit = 50 } = params ?? {};
        const q = new URLSearchParams({
            page: String(page),
            limit: String(limit),
        });
        const res = await unwrap<{ data: AppointmentAttachmentDto[]; pagination: Pagination }>(
            appApi.get(`/appointments/${appointmentId}/attachments?${q.toString()}`),
        );
        return toAppointmentAttachmentsList(res);
    }

    async get(appointmentId: number, attachmentId: number): Promise<AppointmentAttachment> {
        return toAppointmentAttachment(
            await unwrap<AppointmentAttachmentDto>(
                appApi.get(`/appointments/${appointmentId}/attachments/${attachmentId}`),
            ),
        );
    }

    async upload(appointmentId: number, file: UploadFile): Promise<AppointmentAttachment> {
        const formData = new FormData();
        formData.append('file', {
            uri: file.uri,
            name: file.name,
            type: file.type,
        } as any);

        const token = await getValidAccessToken();
        const res = await fetch(
            `${APP_BASE}/appointments/${appointmentId}/attachments`,
            {
                method: 'POST',
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: formData,
            },
        );

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Upload failed: ${res.status} ${text}`);
        }

        const json = await res.json();
        return toAppointmentAttachment(json.message);
    }

    async download(appointmentId: number, attachmentId: number): Promise<Blob> {
        const token = await getValidAccessToken();
        const res = await fetch(
            `${APP_BASE}/appointments/${appointmentId}/attachments/${attachmentId}/download`,
            {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            },
        );

        if (!res.ok) {
            throw new Error(`Download failed: ${res.status}`);
        }

        return res.blob();
    }

    async delete(appointmentId: number, attachmentId: number): Promise<void> {
        await unwrap(
            appApi.delete(`/appointments/${appointmentId}/attachments/${attachmentId}`),
        );
    }
}

export const defaultAppointmentAttachmentsRepository: AppointmentAttachmentsRepository =
    new HttpAppointmentAttachmentsRepository();

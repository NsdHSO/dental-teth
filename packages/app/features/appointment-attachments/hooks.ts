import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
    defaultAppointmentAttachmentsRepository,
    AppointmentAttachmentsRepository,
} from './repository';
import type {
    AppointmentAttachment,
    AppointmentAttachmentsList,
    ListAppointmentAttachmentsParams,
    UploadFile,
} from './types';

const QK = {
    all: (appointmentId: number) =>
        ['appointment-attachments', appointmentId] as const,
    list: (appointmentId: number, params: ListAppointmentAttachmentsParams) =>
        ['appointment-attachments', appointmentId, 'list', params] as const,
    one: (appointmentId: number, attachmentId: number) =>
        ['appointment-attachments', appointmentId, attachmentId] as const,
};

export function useAppointmentAttachmentsQuery(
    appointmentId: number,
    params?: ListAppointmentAttachmentsParams,
    repo: AppointmentAttachmentsRepository = defaultAppointmentAttachmentsRepository,
) {
    const {page = 1, limit = 50} = params ?? {};
    const normalized: ListAppointmentAttachmentsParams = {page, limit};
    return useQuery<AppointmentAttachmentsList>({
        queryKey: QK.list(appointmentId, normalized),
        queryFn: () => repo.list(appointmentId, normalized),
        enabled: appointmentId > 0,
    });
}

export function useAppointmentAttachmentQuery(
    appointmentId: number,
    attachmentId: number,
    repo: AppointmentAttachmentsRepository = defaultAppointmentAttachmentsRepository,
) {
    return useQuery<AppointmentAttachment>({
        queryKey: QK.one(appointmentId, attachmentId),
        queryFn: () => repo.get(appointmentId, attachmentId),
        enabled: appointmentId > 0 && attachmentId > 0,
    });
}

export function useUploadAppointmentAttachmentMutation(
    appointmentId: number,
    repo: AppointmentAttachmentsRepository = defaultAppointmentAttachmentsRepository,
) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (file: UploadFile) => repo.upload(appointmentId, file),
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: QK.all(appointmentId)});
        },
    });
}

export function useDeleteAppointmentAttachmentMutation(
    appointmentId: number,
    repo: AppointmentAttachmentsRepository = defaultAppointmentAttachmentsRepository,
) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (attachmentId: number) => repo.delete(appointmentId, attachmentId),
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: QK.all(appointmentId)});
        },
    });
}

export const appointmentAttachmentsQueryKeys = QK;

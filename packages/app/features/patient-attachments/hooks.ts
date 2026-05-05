import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
    defaultPatientAttachmentsRepository,
    PatientAttachmentsRepository,
} from './repository';
import type {
    PatientAttachment,
    PatientAttachmentsList,
    CreatePatientAttachmentInput,
    ListPatientAttachmentsParams,
} from './types';

const QK = {
    all: (patientId: number) => ['patient-attachments', patientId] as const,
    list: (patientId: number, params: ListPatientAttachmentsParams) =>
        ['patient-attachments', patientId, 'list', params] as const,
    one: (patientId: number, attachmentId: number) =>
        ['patient-attachments', patientId, attachmentId] as const,
};

export function usePatientAttachmentsQuery(
    patientId: number,
    params?: ListPatientAttachmentsParams,
    repo: PatientAttachmentsRepository = defaultPatientAttachmentsRepository,
) {
    const {page = 1, limit = 50} = params ?? {};
    const normalized: ListPatientAttachmentsParams = {page, limit};
    return useQuery<PatientAttachmentsList>({
        queryKey: QK.list(patientId, normalized),
        queryFn: () => repo.list(patientId, normalized),
        enabled: patientId > 0,
    });
}

export function usePatientAttachmentQuery(
    patientId: number,
    attachmentId: number,
    repo: PatientAttachmentsRepository = defaultPatientAttachmentsRepository,
) {
    return useQuery<PatientAttachment>({
        queryKey: QK.one(patientId, attachmentId),
        queryFn: () => repo.get(patientId, attachmentId),
        enabled: patientId > 0 && attachmentId > 0,
    });
}

export function useCreatePatientAttachmentMutation(
    patientId: number,
    repo: PatientAttachmentsRepository = defaultPatientAttachmentsRepository,
) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: CreatePatientAttachmentInput) => repo.create(patientId, body),
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: QK.all(patientId)});
        },
    });
}

export function useDeletePatientAttachmentMutation(
    patientId: number,
    repo: PatientAttachmentsRepository = defaultPatientAttachmentsRepository,
) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (attachmentId: number) => repo.delete(patientId, attachmentId),
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: QK.all(patientId)});
        },
    });
}

export const patientAttachmentsQueryKeys = QK;

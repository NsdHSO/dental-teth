import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    defaultPatientBillingsRepository,
    PatientBillingsRepository,
} from './repository';
import type {
    Billing,
    BillingsList,
    CreateBillingInput,
    ListBillingsParams,
    UpdateBillingInput,
} from './types';

const QK = {
    all: (patientId: number) => ['patient-billings', patientId] as const,
    list: (patientId: number, params: ListBillingsParams) =>
        ['patient-billings', patientId, 'list', params] as const,
    one: (patientId: number, billingId: number) =>
        ['patient-billings', patientId, billingId] as const,
};

export function usePatientBillingsQuery(
    patientId: number,
    params?: ListBillingsParams,
    repo: PatientBillingsRepository = defaultPatientBillingsRepository,
) {
    const { page = 1, limit = 20, status } = params ?? {};
    const normalized: ListBillingsParams = { page, limit, status };
    return useQuery<BillingsList>({
        queryKey: QK.list(patientId, normalized),
        queryFn: () => repo.list(patientId, normalized),
        enabled: patientId > 0,
    });
}

export function usePatientBillingQuery(
    patientId: number,
    billingId: number,
    repo: PatientBillingsRepository = defaultPatientBillingsRepository,
) {
    return useQuery<Billing>({
        queryKey: QK.one(patientId, billingId),
        queryFn: () => repo.get(patientId, billingId),
        enabled: patientId > 0 && billingId > 0,
    });
}

export function useCreatePatientBillingMutation(
    patientId: number,
    repo: PatientBillingsRepository = defaultPatientBillingsRepository,
) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateBillingInput) => repo.create(patientId, body),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: QK.all(patientId) });
        },
    });
}

export function useUpdatePatientBillingMutation(
    patientId: number,
    billingId: number,
    repo: PatientBillingsRepository = defaultPatientBillingsRepository,
) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: UpdateBillingInput) => repo.update(patientId, billingId, body),
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: QK.all(patientId) }),
                qc.invalidateQueries({ queryKey: QK.one(patientId, billingId) }),
            ]);
        },
    });
}

export function useDeletePatientBillingMutation(
    patientId: number,
    repo: PatientBillingsRepository = defaultPatientBillingsRepository,
) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (billingId: number) => repo.delete(patientId, billingId),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: QK.all(patientId) });
        },
    });
}

export function useMarkPatientBillingPaidMutation(
    patientId: number,
    repo: PatientBillingsRepository = defaultPatientBillingsRepository,
) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (billingId: number) => repo.markPaid(patientId, billingId),
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: QK.all(patientId) }),
                qc.invalidateQueries({ queryKey: QK.one(patientId, billingId) }),
            ]);
        },
    });
}

export const patientBillingsQueryKeys = QK;

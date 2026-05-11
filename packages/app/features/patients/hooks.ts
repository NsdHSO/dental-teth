import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {defaultPatientsRepository, PatientsRepository} from './repository';
import type {CreatePatientInput, ListPatientsParams, Patient, PatientsList, UpdatePatientInput} from './types';

const QK = {
    all: ['patients'] as const,
    list: (params: ListPatientsParams) => ['patients', 'list', params] as const,
    one: (id: number) => ['patients', id] as const,
    autocomplete: (q: string) => ['patients', 'autocomplete', q] as const,
};

export function usePatientsQuery(
    params?: ListPatientsParams,
    repo: PatientsRepository = defaultPatientsRepository,
) {
    const {page = 1, limit = 20} = params ?? {};
    const normalized: ListPatientsParams = {page, limit};
    return useQuery<PatientsList>({
        queryKey: QK.list(normalized),
        queryFn: () => repo.list(normalized),
    });
}

export function usePatientQuery(
    id: number,
    repo: PatientsRepository = defaultPatientsRepository,
) {
    return useQuery<Patient>({
        queryKey: QK.one(id),
        queryFn: () => repo.get(id),
        enabled: typeof id === 'number' && id > 0,
    });
}

export function usePatientAutocompleteQuery(
    q: string,
    repo: PatientsRepository = defaultPatientsRepository,
) {
    return useQuery({
        queryKey: QK.autocomplete(q),
        queryFn: () => repo.autocomplete(q),
        enabled: q.trim().length >= 2,
        staleTime: 60_000,
    });
}

export function useCreatePatientMutation(
    repo: PatientsRepository = defaultPatientsRepository,
) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: CreatePatientInput) => repo.create(body),
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: QK.all});
        },
    });
}

export function useUpdatePatientMutation(
    id: number,
    repo: PatientsRepository = defaultPatientsRepository,
) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: UpdatePatientInput) => repo.update(id, body),
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({queryKey: QK.all}),
                qc.invalidateQueries({queryKey: QK.one(id)}),
            ]);
        },
    });
}

export function useDeletePatientMutation(
    repo: PatientsRepository = defaultPatientsRepository,
) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => repo.delete(id),
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: QK.all});
        },
    });
}

export const patientsQueryKeys = QK;

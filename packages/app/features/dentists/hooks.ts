import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { defaultDentistsRepository, DentistsRepository } from './repository';
import type { CreateDentistInput, ListDentistsParams, Dentist, DentistsList, UpdateDentistInput } from './types';

const QK = {
    all: ['dentists'] as const,
    list: (params: ListDentistsParams) => ['dentists', 'list', params] as const,
    one: (id: number) => ['dentists', id] as const,
    autocomplete: (q: string) => ['dentists', 'autocomplete', q] as const,
};

export function useDentistsQuery(
    params?: ListDentistsParams,
    repo: DentistsRepository = defaultDentistsRepository,
) {
    const { page = 1, limit = 20, specialty } = params ?? {};
    const normalized: ListDentistsParams = { page, limit, specialty };
    return useQuery<DentistsList>({
        queryKey: QK.list(normalized),
        queryFn: () => repo.list(normalized),
    });
}

export function useDentistQuery(
    id: number,
    repo: DentistsRepository = defaultDentistsRepository,
) {
    return useQuery<Dentist>({
        queryKey: QK.one(id),
        queryFn: () => repo.get(id),
        enabled: typeof id === 'number' && id > 0,
    });
}

export function useDentistAutocompleteQuery(
    q: string,
    repo: DentistsRepository = defaultDentistsRepository,
) {
    return useQuery({
        queryKey: QK.autocomplete(q),
        queryFn: () => repo.autocomplete(q),
        enabled: q.trim().length >= 2,
        staleTime: 60_000,
    });
}

export function useCreateDentistMutation(
    repo: DentistsRepository = defaultDentistsRepository,
) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateDentistInput) => repo.create(body),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: QK.all });
        },
    });
}

export function useUpdateDentistMutation(
    id: number,
    repo: DentistsRepository = defaultDentistsRepository,
) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: UpdateDentistInput) => repo.update(id, body),
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({ queryKey: QK.all }),
                qc.invalidateQueries({ queryKey: QK.one(id) }),
            ]);
        },
    });
}

export function useDeleteDentistMutation(
    repo: DentistsRepository = defaultDentistsRepository,
) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => repo.delete(id),
        onSuccess: async () => {
            await qc.invalidateQueries({ queryKey: QK.all });
        },
    });
}

export const dentistsQueryKeys = QK;

import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
    AppointmentsRepository,
    defaultAppointmentsRepository,
} from './repository';
import type {
    Appointment,
    AppointmentInput,
    AppointmentsList,
    ListAppointmentsParams,
} from './types';

const QK = {
    all: ['appointments'] as const,
    list: (params: ListAppointmentsParams) => ['appointments', 'list', params] as const,
    one: (id: string) => ['appointments', id] as const,
};

export function useAppointmentsQuery(
    params?: ListAppointmentsParams,
    repo: AppointmentsRepository = defaultAppointmentsRepository
) {
    const {page = 1, limit = 20, date, from, to} = params ?? {};
    const normalized: ListAppointmentsParams = {page, limit, date, from, to};
    return useQuery<AppointmentsList>({
        queryKey: QK.list(normalized),
        queryFn: () => repo.list(normalized),
    });
}

export function useAppointmentQuery(
    id: string,
    repo: AppointmentsRepository = defaultAppointmentsRepository
) {
    return useQuery<Appointment>({
        queryKey: QK.one(id),
        queryFn: () => repo.get(id),
        enabled: typeof id === 'string' && id.length > 0,
    });
}

export function useCreateAppointmentMutation(
    repo: AppointmentsRepository = defaultAppointmentsRepository
) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: AppointmentInput) => repo.create(body),
        onSuccess: async () => {
            await qc.invalidateQueries({queryKey: QK.all});
        },
    });
}

export function useUpdateAppointmentMutation(
    id: string,
    repo: AppointmentsRepository = defaultAppointmentsRepository
) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: Partial<AppointmentInput>) => repo.update(id, body),
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({queryKey: QK.all}),
                qc.invalidateQueries({queryKey: QK.one(id)}),
            ]);
        },
    });
}

export function useDeleteAppointmentMutation(
    id: string,
    repo: AppointmentsRepository = defaultAppointmentsRepository
) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => repo.delete(id),
        onSuccess: async () => {
            await Promise.all([
                qc.invalidateQueries({queryKey: QK.all}),
                qc.invalidateQueries({queryKey: QK.one(id)}),
            ]);
        },
    });
}

export const appointmentsQueryKeys = QK;

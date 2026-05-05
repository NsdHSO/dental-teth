import {useEffect, useState} from 'react';
import {useQuery, useQueryClient, useMutation} from '@tanstack/react-query';
import type {AxiosError} from 'axios';
import type {UserProfileRepository} from './repository';
import {defaultUserProfileRepository} from './repository';
import {seedFromUserProfile} from './service';
import type {UserProfileGateState, CreateUserProfileInput} from './types';

let inflight: Promise<UserProfileGateState> | null = null;

export async function ensureUserProfile(
    qc: ReturnType<typeof useQueryClient>,
    repo: UserProfileRepository = defaultUserProfileRepository
): Promise<UserProfileGateState> {
    const seeded = qc.getQueryData<boolean>(['user-profile', 'seeded']);
    if (seeded) return {ready: true, hasProfile: true};

    if (inflight) return inflight;

    inflight = (async () => {
        try {
            const data = await repo.get();
            seedFromUserProfile(qc, data);
            return {ready: true, hasProfile: true};
        } catch (error) {
            const axiosError = error as AxiosError;
            if (axiosError.response?.status === 404) {
                try {
                    const created = await repo.create({
                        attributes: {roles: ['Patient']}
                    });
                    seedFromUserProfile(qc, created);
                    return {ready: true, hasProfile: true};
                } catch (createError) {
                    console.error('Failed to auto-create user profile:', createError);
                }
            } else {
                console.error('Failed to fetch user profile:', error);
            }
            qc.setQueryData(['user-profile', 'seeded'], true);
            return {ready: true, hasProfile: false};
        } finally {
            inflight = null;
        }
    })();

    return inflight;
}

export function useUserProfileGate(repo: UserProfileRepository = defaultUserProfileRepository): UserProfileGateState {
    const qc = useQueryClient();
    const [state, setState] = useState<UserProfileGateState>({ready: false, hasProfile: false});

    const {data: seeded} = useQuery({
        queryKey: ['user-profile', 'seeded'],
        queryFn: async () => {
            return qc.getQueryData<boolean>(['user-profile', 'seeded']) ?? false;
        },
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
    });

    useEffect(() => {
        if (seeded !== undefined) {
            const hasProfile = qc.getQueryData(['me', 'profile']) !== undefined;
            setState({ready: true, hasProfile});
            return;
        }

        const init = async () => {
            try {
                const result = await ensureUserProfile(qc, repo);
                setState(result);
            } catch (error) {
                console.error('Unexpected error in user profile gate:', error);
                setState({ready: true, hasProfile: false});
            }
        };
        init();
    }, [seeded, qc, repo]);

    return state;
}

export function useCreateUserProfileMutation(repo: UserProfileRepository = defaultUserProfileRepository) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (body: CreateUserProfileInput) => repo.create(body),
        onSuccess: (data) => {
            seedFromUserProfile(qc, data);
        },
    });
}
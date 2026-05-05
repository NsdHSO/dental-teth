import type {QueryClient} from '@tanstack/react-query';
import type {UserProfileResponse} from './types';
import type {UserProfileRepository} from './repository';
import {defaultUserProfileRepository} from './repository';

export function seedFromUserProfile(qc: QueryClient, data: UserProfileResponse) {
    qc.setQueryData(['me', 'profile'], data);
    qc.setQueryData(['user-profile', 'seeded'], true);
}

export async function fetchAndSeedUserProfile(
    qc: QueryClient,
    repo: UserProfileRepository = defaultUserProfileRepository
): Promise<UserProfileResponse> {
    const data = await repo.get();
    seedFromUserProfile(qc, data);
    return data;
}

export async function createAndSeedUserProfile(
    qc: QueryClient,
    body: { attributes: { roles: string[] } },
    repo: UserProfileRepository = defaultUserProfileRepository
): Promise<UserProfileResponse> {
    const data = await repo.create(body);
    seedFromUserProfile(qc, data);
    return data;
}
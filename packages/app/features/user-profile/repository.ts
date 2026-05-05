import { appApi, unwrap } from '@yuhuu/auth';
import type {
    UserProfileResponse,
    CreateUserProfileInput,
    UpdateUserProfileInput,
} from './types';

export interface UserProfileRepository {
    get(): Promise<UserProfileResponse>;
    create(body: CreateUserProfileInput): Promise<UserProfileResponse>;
    update(body: UpdateUserProfileInput): Promise<UserProfileResponse>;
}

export class HttpUserProfileRepository implements UserProfileRepository {
    async get(): Promise<UserProfileResponse> {
        return unwrap<UserProfileResponse>(appApi.get('/user-profiles/me'));
    }

    async create(body: CreateUserProfileInput): Promise<UserProfileResponse> {
        return unwrap<UserProfileResponse>(appApi.post('/user-profiles/me', body));
    }

    async update(body: UpdateUserProfileInput): Promise<UserProfileResponse> {
        return unwrap<UserProfileResponse>(appApi.put('/user-profiles/me', body));
    }
}

export const defaultUserProfileRepository: UserProfileRepository = new HttpUserProfileRepository();
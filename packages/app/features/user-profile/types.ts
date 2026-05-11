export type UserProfileAttributes = {
    roles: string[];
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
};

export type UserProfileResponse = {
    id: string;
    attributes: UserProfileAttributes;
};

export type CreateUserProfileInput = {
    attributes: UserProfileAttributes;
};

export type UpdateUserProfileInput = Partial<CreateUserProfileInput>;

export type UserProfileGateState = {
    ready: boolean;
    hasProfile: boolean;
};
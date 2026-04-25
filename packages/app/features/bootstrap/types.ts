import type { UserResponse } from '@/features/roles/meRoles';
import type { MyRole } from '@/features/roles/meRoles';

export type BootstrapResponse = {
    user: UserResponse;
    roles?: MyRole[];
};
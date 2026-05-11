export type BillingDto = {
    id: number;
    patient_id: number;
    appointment_id: number | null;
    amount_cents: number;
    currency: string;
    status: string;
    description: string | null;
    paid_at: string | null;
    created_at: string;
    updated_at: string;
};

export type Billing = {
    id: number;
    patientId: number;
    appointmentId: number | null;
    amountCents: number;
    currency: string;
    status: string;
    description: string | null;
    paidAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export type CreateBillingInput = {
    appointment_id?: number;
    amount_cents: number;
    currency?: string;
    status?: string;
    description?: string;
};

export type UpdateBillingInput = {
    appointment_id?: number;
    amount_cents?: number;
    currency?: string;
    status?: string;
    description?: string;
    paid_at?: string;
};

export type Pagination = {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
};

export type BillingsList = { data: Billing[]; pagination: Pagination };

export type ListBillingsParams = {
    page?: number;
    limit?: number;
    status?: string;
};

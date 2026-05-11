import type { Billing, BillingDto, BillingsList, Pagination } from './types';

export function toBilling(dto: BillingDto): Billing {
    return {
        id: dto.id,
        patientId: dto.patient_id,
        appointmentId: dto.appointment_id,
        amountCents: dto.amount_cents,
        currency: dto.currency,
        status: dto.status,
        description: dto.description,
        paidAt: dto.paid_at,
        createdAt: dto.created_at,
        updatedAt: dto.updated_at,
    };
}

export function toBillingsList(res: { data: BillingDto[]; pagination: Pagination }): BillingsList {
    return {
        data: res.data.map(toBilling),
        pagination: res.pagination,
    };
}

import { appApi, unwrap } from '@dental/auth';
import type {
  Billing,
  BillingDto,
  BillingsList,
  ListBillingsParams,
  CreateBillingInput,
  UpdateBillingInput,
  Pagination,
} from './types';
import { toBilling, toBillingsList } from './mapper';

export interface PatientBillingsRepository {
  list(patientId: number, params?: ListBillingsParams): Promise<BillingsList>;
  get(patientId: number, billingId: number): Promise<Billing>;
  create(patientId: number, body: CreateBillingInput): Promise<Billing>;
  update(
    patientId: number,
    billingId: number,
    body: UpdateBillingInput,
  ): Promise<Billing>;
  delete(patientId: number, billingId: number): Promise<void>;
  markPaid(patientId: number, billingId: number): Promise<Billing>;
}

export class HttpPatientBillingsRepository implements PatientBillingsRepository {
  async list(
    patientId: number,
    params?: ListBillingsParams,
  ): Promise<BillingsList> {
    const { page = 1, limit = 20, status } = params ?? {};
    const q = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      ...(status ? { status } : {}),
    });
    const res = await unwrap<{ data: BillingDto[]; pagination: Pagination }>(
      appApi.get(`/patients/${patientId}/billings?${q.toString()}`),
    );
    return toBillingsList(res);
  }

  async get(patientId: number, billingId: number): Promise<Billing> {
    return toBilling(
      await unwrap<BillingDto>(
        appApi.get(`/patients/${patientId}/billings/${billingId}`),
      ),
    );
  }

  async create(patientId: number, body: CreateBillingInput): Promise<Billing> {
    return toBilling(
      await unwrap<BillingDto>(
        appApi.post(`/patients/${patientId}/billings`, body),
      ),
    );
  }

  async update(
    patientId: number,
    billingId: number,
    body: UpdateBillingInput,
  ): Promise<Billing> {
    return toBilling(
      await unwrap<BillingDto>(
        appApi.put(`/patients/${patientId}/billings/${billingId}`, body),
      ),
    );
  }

  async delete(patientId: number, billingId: number): Promise<void> {
    await unwrap(appApi.delete(`/patients/${patientId}/billings/${billingId}`));
  }

  async markPaid(patientId: number, billingId: number): Promise<Billing> {
    return toBilling(
      await unwrap<BillingDto>(
        appApi.put(
          `/patients/${patientId}/billings/${billingId}/mark-paid`,
          {},
        ),
      ),
    );
  }
}

export const defaultPatientBillingsRepository: PatientBillingsRepository =
  new HttpPatientBillingsRepository();

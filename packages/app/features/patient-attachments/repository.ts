import { appApi, unwrap } from '@dental/auth';
import type {
  PatientAttachment,
  PatientAttachmentDto,
  PatientAttachmentsList,
  ListPatientAttachmentsParams,
  CreatePatientAttachmentInput,
  Pagination,
} from './types';
import { toPatientAttachment, toPatientAttachmentsList } from './mapper';

export interface PatientAttachmentsRepository {
  list(
    patientId: number,
    params?: ListPatientAttachmentsParams,
  ): Promise<PatientAttachmentsList>;
  get(patientId: number, attachmentId: number): Promise<PatientAttachment>;
  create(
    patientId: number,
    body: CreatePatientAttachmentInput,
  ): Promise<PatientAttachment>;
  delete(patientId: number, attachmentId: number): Promise<void>;
}

export class HttpPatientAttachmentsRepository implements PatientAttachmentsRepository {
  async list(
    patientId: number,
    params?: ListPatientAttachmentsParams,
  ): Promise<PatientAttachmentsList> {
    const { page = 1, limit = 50 } = params ?? {};
    const q = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    const res = await unwrap<{
      data: PatientAttachmentDto[];
      pagination: Pagination;
    }>(appApi.get(`/patients/${patientId}/attachments?${q.toString()}`));
    return toPatientAttachmentsList(res);
  }

  async get(
    patientId: number,
    attachmentId: number,
  ): Promise<PatientAttachment> {
    return toPatientAttachment(
      await unwrap<PatientAttachmentDto>(
        appApi.get(`/patients/${patientId}/attachments/${attachmentId}`),
      ),
    );
  }

  async create(
    patientId: number,
    body: CreatePatientAttachmentInput,
  ): Promise<PatientAttachment> {
    return toPatientAttachment(
      await unwrap<PatientAttachmentDto>(
        appApi.post(`/patients/${patientId}/attachments`, body),
      ),
    );
  }

  async delete(patientId: number, attachmentId: number): Promise<void> {
    await unwrap(
      appApi.delete(`/patients/${patientId}/attachments/${attachmentId}`),
    );
  }
}

export const defaultPatientAttachmentsRepository: PatientAttachmentsRepository =
  new HttpPatientAttachmentsRepository();

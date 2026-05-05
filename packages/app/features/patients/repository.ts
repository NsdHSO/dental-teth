import { appApi, unwrap } from '@yuhuu/auth';
import type {
    Patient,
    PatientDto,
    PatientAutocompleteItem,
    PatientAutocompleteItemDto,
    PatientsList,
    ListPatientsParams,
    CreatePatientInput,
    UpdatePatientInput,
    Pagination,
} from './types';
import { toPatient, toPatientAutocompleteItem, toPatientsList } from './mapper';

export interface PatientsRepository {
    list(params?: ListPatientsParams): Promise<PatientsList>;
    get(id: number): Promise<Patient>;
    create(body: CreatePatientInput): Promise<Patient>;
    update(id: number, body: UpdatePatientInput): Promise<Patient>;
    delete(id: number): Promise<void>;
    autocomplete(q: string, limit?: number): Promise<PatientAutocompleteItem[]>;
}

export class HttpPatientsRepository implements PatientsRepository {
    async list(params?: ListPatientsParams): Promise<PatientsList> {
        const { page = 1, limit = 20 } = params ?? {};
        const q = new URLSearchParams({
            page: String(page),
            limit: String(limit),
        });
        const res = await unwrap<{ data: PatientDto[]; pagination: Pagination }>(
            appApi.get(`/patients?${q.toString()}`),
        );
        return toPatientsList(res);
    }

    async get(id: number): Promise<Patient> {
        return toPatient(await unwrap<PatientDto>(appApi.get(`/patients/${id}`)));
    }

    async create(body: CreatePatientInput): Promise<Patient> {
        return toPatient(await unwrap<PatientDto>(appApi.post('/patients', body)));
    }

    async update(id: number, body: UpdatePatientInput): Promise<Patient> {
        return toPatient(await unwrap<PatientDto>(appApi.put(`/patients/${id}`, body)));
    }

    async delete(id: number): Promise<void> {
        await unwrap(appApi.delete(`/patients/${id}`));
    }

    async autocomplete(q: string, limit = 10): Promise<PatientAutocompleteItem[]> {
        const res = await unwrap<PatientAutocompleteItemDto[]>(
            appApi.get(`/patients/autocomplete?q=${encodeURIComponent(q)}&limit=${limit}`),
        );
        return res.map(toPatientAutocompleteItem);
    }
}

export const defaultPatientsRepository: PatientsRepository = new HttpPatientsRepository();

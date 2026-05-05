import { appApi, unwrap } from '@yuhuu/auth';
import type {
    Dentist,
    DentistDto,
    DentistAutocompleteItem,
    DentistAutocompleteItemDto,
    DentistsList,
    ListDentistsParams,
    CreateDentistInput,
    UpdateDentistInput,
    Pagination,
} from './types';
import { toDentist, toDentistAutocompleteItem, toDentistsList } from './mapper';

export interface DentistsRepository {
    list(params?: ListDentistsParams): Promise<DentistsList>;
    get(id: number): Promise<Dentist>;
    create(body: CreateDentistInput): Promise<Dentist>;
    update(id: number, body: UpdateDentistInput): Promise<Dentist>;
    delete(id: number): Promise<void>;
    autocomplete(q: string, limit?: number): Promise<DentistAutocompleteItem[]>;
}

export class HttpDentistsRepository implements DentistsRepository {
    async list(params?: ListDentistsParams): Promise<DentistsList> {
        const { page = 1, limit = 20, specialty } = params ?? {};
        const q = new URLSearchParams({
            page: String(page),
            limit: String(limit),
            ...(specialty ? { specialty } : {}),
        });
        const res = await unwrap<{ data: DentistDto[]; pagination: Pagination }>(
            appApi.get(`/dentists?${q.toString()}`),
        );
        return toDentistsList(res);
    }

    async get(id: number): Promise<Dentist> {
        return toDentist(await unwrap<DentistDto>(appApi.get(`/dentists/${id}`)));
    }

    async create(body: CreateDentistInput): Promise<Dentist> {
        return toDentist(await unwrap<DentistDto>(appApi.post('/dentists', body)));
    }

    async update(id: number, body: UpdateDentistInput): Promise<Dentist> {
        return toDentist(await unwrap<DentistDto>(appApi.put(`/dentists/${id}`, body)));
    }

    async delete(id: number): Promise<void> {
        await unwrap(appApi.delete(`/dentists/${id}`));
    }

    async autocomplete(q: string, limit = 10): Promise<DentistAutocompleteItem[]> {
        const res = await unwrap<DentistAutocompleteItemDto[]>(
            appApi.get(`/dentists/autocomplete?q=${encodeURIComponent(q)}&limit=${limit}`),
        );
        return res.map(toDentistAutocompleteItem);
    }
}

export const defaultDentistsRepository: DentistsRepository = new HttpDentistsRepository();

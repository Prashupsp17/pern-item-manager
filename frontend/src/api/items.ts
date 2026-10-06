import { apiDelete, apiGet, apiPost, apiPut } from './client';
import type {
  CreateItemPayload,
  Item,
  ItemsQueryParams,
  PaginatedResponse,
  UpdateItemPayload,
} from '../types/item';

const ITEMS_PATH = '/items';

export function fetchItems(params: ItemsQueryParams = {}) {
  return apiGet<PaginatedResponse<Item>>(ITEMS_PATH, {
    search: params.search,
    category: params.category,
    status: params.status,
    page: params.page ?? 1,
    limit: params.limit ?? 10,
  });
}

export function fetchItemById(id: string) {
  return apiGet<Item>(`${ITEMS_PATH}/${id}`);
}

export function createItem(payload: CreateItemPayload) {
  return apiPost<Item, CreateItemPayload>(ITEMS_PATH, payload);
}

export function updateItem(id: string, payload: UpdateItemPayload) {
  return apiPut<Item, UpdateItemPayload>(`${ITEMS_PATH}/${id}`, payload);
}

export function deleteItem(id: string) {
  return apiDelete(`${ITEMS_PATH}/${id}`);
}

export type ItemStatus = 'active' | 'inactive' | 'draft';

export interface Item {
  id: string;
  title: string;
  description: string;
  category: string;
  status: ItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemPayload {
  title: string;
  description: string;
  category: string;
  status: ItemStatus;
}

export type UpdateItemPayload = Partial<CreateItemPayload>;

export interface ItemsQueryParams {
  search?: string;
  category?: string;
  status?: ItemStatus | '';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ItemMutationResponse {
  message: string;
  item: Item;
}

export interface MessageResponse {
  message: string;
}

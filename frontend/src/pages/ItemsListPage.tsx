import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { deleteItem, fetchItems } from '../api/items';
import ConfirmDialog from '../components/ConfirmDialog';
import FilterBar from '../components/FilterBar';
import ItemTable from '../components/ItemTable';
import Pagination from '../components/Pagination';
import SearchBar from '../components/SearchBar';
import { useToast } from '../context/ToastContext';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { Item, ItemStatus } from '../types/item';

const PAGE_SIZE_OPTIONS = [5, 10, 20] as const;
const DEFAULT_PAGE_SIZE = 10;

function parsePageSize(value: string | null): number {
  const parsed = Number(value ?? DEFAULT_PAGE_SIZE);
  return PAGE_SIZE_OPTIONS.includes(parsed as (typeof PAGE_SIZE_OPTIONS)[number])
    ? parsed
    : DEFAULT_PAGE_SIZE;
}

export default function ItemsListPage() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  const search = searchParams.get('search') ?? '';
  const category = searchParams.get('category') ?? '';
  const status = (searchParams.get('status') ?? '') as ItemStatus | '';
  const page = Math.max(1, Number(searchParams.get('page') ?? '1') || 1);
  const limit = parsePageSize(searchParams.get('limit'));

  const debouncedSearch = useDebouncedValue(search);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const next = new URLSearchParams(searchParams);

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
      });

      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetchItems({
        search: debouncedSearch,
        category,
        status,
        page,
        limit,
      });

      setItems(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);

      if (response.totalPages > 0 && page > response.totalPages) {
        updateParams({ page: String(response.totalPages) });
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load items');
      setItems([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, category, status, page, limit, updateParams]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  async function handleDeleteConfirm() {
    if (!itemToDelete) {
      return;
    }

    try {
      const { message } = await deleteItem(itemToDelete.id);
      showToast(message);
      setItemToDelete(null);
      await loadItems();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete item');
      setItemToDelete(null);
    }
  }

  function handleResetFilters() {
    setSearchParams({});
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Items</h1>
          <p className="page-subtitle">Search, filter, and manage your items.</p>
        </div>
      </div>

      <div className="toolbar">
        <SearchBar
          value={search}
          onChange={(value) => updateParams({ search: value, page: '1' })}
        />
        <FilterBar
          category={category}
          status={status}
          onCategoryChange={(value) => updateParams({ category: value, page: '1' })}
          onStatusChange={(value) => updateParams({ status: value, page: '1' })}
          onReset={handleResetFilters}
        />
        <div className="filter-field page-size-field">
          <label htmlFor="page-size">Per page</label>
          <select
            id="page-size"
            value={limit}
            onChange={(event) =>
              updateParams({ limit: event.target.value, page: '1' })
            }
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="status-message">Loading items...</p>}
      {error && <p className="status-message status-message--error">{error}</p>}

      {!loading && !error && (
        <>
          <ItemTable items={items} onDelete={setItemToDelete} />
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={total}
            onPageChange={(nextPage) => updateParams({ page: String(nextPage) })}
          />
        </>
      )}

      <ConfirmDialog
        open={itemToDelete !== null}
        title="Delete item"
        message={`Are you sure you want to delete "${itemToDelete?.title}"? This action cannot be undone.`}
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setItemToDelete(null)}
      />
    </section>
  );
}

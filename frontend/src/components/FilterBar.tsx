import type { ItemStatus } from '../types/item';

const CATEGORIES = ['Electronics', 'Books', 'Clothing', 'Home', 'Other'] as const;
const STATUSES: ItemStatus[] = ['active', 'inactive', 'draft'];

interface FilterBarProps {
  category: string;
  status: ItemStatus | '';
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: ItemStatus | '') => void;
  onReset: () => void;
}

export default function FilterBar({
  category,
  status,
  onCategoryChange,
  onStatusChange,
  onReset,
}: FilterBarProps) {
  return (
    <div className="filter-bar">
      <div className="filter-field">
        <label htmlFor="category-filter">Category</label>
        <select
          id="category-filter"
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          <option value="">All categories</option>
          {CATEGORIES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="status-filter">Status</label>
        <select
          id="status-filter"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as ItemStatus | '')}
        >
          <option value="">All statuses</option>
          {STATUSES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <button type="button" className="btn btn-secondary" onClick={onReset}>
        Reset filters
      </button>
    </div>
  );
}

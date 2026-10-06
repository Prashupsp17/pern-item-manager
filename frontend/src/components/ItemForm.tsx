import { useState, type FormEvent } from 'react';
import type { CreateItemPayload, ItemStatus } from '../types/item';

const CATEGORIES = ['Electronics', 'Books', 'Clothing', 'Home', 'Other'] as const;
const STATUSES: ItemStatus[] = ['active', 'inactive', 'draft'];

export interface ItemFormValues {
  title: string;
  description: string;
  category: string;
  status: ItemStatus;
}

interface ItemFormProps {
  initialValues?: ItemFormValues;
  submitLabel: string;
  onSubmit: (values: CreateItemPayload) => Promise<void>;
  onCancel: () => void;
}

const defaultValues: ItemFormValues = {
  title: '',
  description: '',
  category: CATEGORIES[0],
  status: 'draft',
};

export default function ItemForm({ initialValues, submitLabel, onSubmit, onCancel }: ItemFormProps) {
  const [values, setValues] = useState<ItemFormValues>(initialValues ?? defaultValues);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(values);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save item');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="item-form" onSubmit={handleSubmit}>
      <div className="form-field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          required
          value={values.title}
          onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
        />
      </div>

      <div className="form-field">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          required
          rows={4}
          value={values.description}
          onChange={(event) =>
            setValues((current) => ({ ...current, description: event.target.value }))
          }
        />
      </div>

      <div className="form-row">
        <div className="form-field">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={values.category}
            onChange={(event) =>
              setValues((current) => ({ ...current, category: event.target.value }))
            }
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={values.status}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                status: event.target.value as ItemStatus,
              }))
            }
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

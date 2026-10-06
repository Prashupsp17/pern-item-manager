import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchItemById, updateItem } from '../api/items';
import ItemForm, { type ItemFormValues } from '../components/ItemForm';
import type { CreateItemPayload, Item } from '../types/item';

export default function ItemEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Item not found');
      return;
    }

    const itemId = id;

    async function loadItem() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchItemById(itemId);
        setItem(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load item');
      } finally {
        setLoading(false);
      }
    }

    void loadItem();
  }, [id]);

  async function handleSubmit(values: CreateItemPayload) {
    if (!id) {
      return;
    }

    await updateItem(id, values);
    navigate(`/items/${id}`);
  }

  if (loading) {
    return <p className="status-message">Loading item...</p>;
  }

  if (error || !item) {
    return (
      <section className="page page--narrow">
        <p className="status-message status-message--error">{error ?? 'Item not found'}</p>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/')}>
          Back to list
        </button>
      </section>
    );
  }

  const initialValues: ItemFormValues = {
    title: item.title,
    description: item.description,
    category: item.category,
    status: item.status,
  };

  return (
    <section className="page page--narrow">
      <div className="page-header">
        <h1>Edit Item</h1>
        <p className="page-subtitle">Update details for {item.title}.</p>
      </div>
      <ItemForm
        initialValues={initialValues}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        onCancel={() => navigate(`/items/${id}`)}
      />
    </section>
  );
}

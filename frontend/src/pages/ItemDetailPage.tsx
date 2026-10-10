import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteItem, fetchItemById } from '../api/items';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import type { Item } from '../types/item';

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  async function handleDelete() {
    if (!id) {
      return;
    }

    try {
      const { message } = await deleteItem(id);
      showToast(message);
      navigate('/');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete item');
      setShowDeleteDialog(false);
    }
  }

  if (loading) {
    return <p className="status-message">Loading item...</p>;
  }

  if (error || !item) {
    return (
      <section className="page page--narrow">
        <p className="status-message status-message--error">{error ?? 'Item not found'}</p>
        <Link to="/" className="btn btn-secondary">
          Back to list
        </Link>
      </section>
    );
  }

  return (
    <section className="page page--narrow">
      <div className="page-header">
        <div>
          <Link to="/" className="back-link">
            ← Back to items
          </Link>
          <h1>{item.title}</h1>
          <p className="page-subtitle">Item details</p>
        </div>
        <div className="page-actions">
          <Link to={`/items/${item.id}/edit`} className="btn btn-primary">
            Edit
          </Link>
          <button type="button" className="btn btn-danger" onClick={() => setShowDeleteDialog(true)}>
            Delete
          </button>
        </div>
      </div>

      <dl className="detail-list">
        <div>
          <dt>Description</dt>
          <dd>{item.description}</dd>
        </div>
        <div>
          <dt>Category</dt>
          <dd>{item.category}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>
            <span className={`status-badge status-badge--${item.status}`}>{item.status}</span>
          </dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{new Date(item.createdAt).toLocaleString()}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{new Date(item.updatedAt).toLocaleString()}</dd>
        </div>
      </dl>

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete item"
        message={`Are you sure you want to delete "${item.title}"?`}
        onConfirm={() => void handleDelete()}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </section>
  );
}

import { useNavigate } from 'react-router-dom';
import { createItem } from '../api/items';
import ItemForm from '../components/ItemForm';
import { useToast } from '../context/ToastContext';
import type { CreateItemPayload } from '../types/item';

export default function ItemCreatePage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  async function handleSubmit(values: CreateItemPayload) {
    const { message, item } = await createItem(values);
    showToast(message);
    navigate(`/items/${item.id}`);
  }

  return (
    <section className="page page--narrow">
      <div className="page-header">
        <h1>Create Item</h1>
        <p className="page-subtitle">Add a new item to your catalog.</p>
      </div>
      <ItemForm
        submitLabel="Create item"
        onSubmit={handleSubmit}
        onCancel={() => navigate('/')}
      />
    </section>
  );
}

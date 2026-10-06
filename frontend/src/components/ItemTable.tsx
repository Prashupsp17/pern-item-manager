import { Link } from 'react-router-dom';
import type { Item } from '../types/item';

interface ItemTableProps {
  items: Item[];
  onDelete: (item: Item) => void;
}

export default function ItemTable({ items, onDelete }: ItemTableProps) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        <p>No items found. Try adjusting your search or filters.</p>
        <Link to="/items/new" className="btn btn-primary">
          Create your first item
        </Link>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="item-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Updated</th>
            <th aria-label="Actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <Link to={`/items/${item.id}`} className="item-link">
                  {item.title}
                </Link>
                <p className="item-description">{item.description}</p>
              </td>
              <td>{item.category}</td>
              <td>
                <span className={`status-badge status-badge--${item.status}`}>{item.status}</span>
              </td>
              <td>{new Date(item.updatedAt).toLocaleDateString()}</td>
              <td>
                <div className="row-actions">
                  <Link to={`/items/${item.id}/edit`} className="btn btn-secondary btn-sm">
                    Edit
                  </Link>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(item)}>
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

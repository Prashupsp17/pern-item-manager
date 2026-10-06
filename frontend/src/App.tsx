import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ItemCreatePage from './pages/ItemCreatePage';
import ItemDetailPage from './pages/ItemDetailPage';
import ItemEditPage from './pages/ItemEditPage';
import ItemsListPage from './pages/ItemsListPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<ItemsListPage />} />
        <Route path="items/new" element={<ItemCreatePage />} />
        <Route path="items/:id" element={<ItemDetailPage />} />
        <Route path="items/:id/edit" element={<ItemEditPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

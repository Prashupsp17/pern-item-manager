import { Link, NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand">
          Item Manager
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end>
            All Items
          </NavLink>
          <NavLink to="/items/new">Create Item</NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

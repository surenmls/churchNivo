import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const sidebarLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/inbox', label: 'Approval Inbox', icon: '📥' },
  { to: '/admin/churches', label: 'Churches', icon: '⛪' },
  { to: '/admin/promotions', label: 'Promotions', icon: '📢' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-admin-sidebar text-gray-300">
        <div className="flex h-16 items-center gap-3 border-b border-gray-700 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-admin-accent text-sm font-bold text-white">
            G
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Gull Admin</p>
            <p className="text-xs text-gray-500">Super Admin Panel</p>
          </div>
        </div>

        <nav className="mt-4 px-3">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-admin-sidebarHover text-white'
                    : 'text-gray-400 hover:bg-admin-sidebarHover hover:text-white'
                }`
              }
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full border-t border-gray-700 p-4">
          <div className="mb-3 px-2">
            <p className="truncate text-sm font-medium text-white">{user?.name}</p>
            <p className="truncate text-xs text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full rounded-lg bg-gray-700 px-4 py-2 text-sm text-gray-300 transition hover:bg-gray-600"
          >
            Sign Out
          </button>
        </div>
      </aside>

      <div className="ml-64 flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
          <h1 className="text-lg font-semibold text-gray-800">Platform Administration</h1>
          <Link to="/" className="text-sm text-primary-600 hover:text-primary-700">
            View Public Site
          </Link>
        </header>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

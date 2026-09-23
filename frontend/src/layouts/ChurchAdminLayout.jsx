import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';

const sidebarLinks = [
  { to: '/church-admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/church-admin/events', label: 'Events', icon: '📅' },
  { to: '/church-admin/media', label: 'Media', icon: '🎬' },
  { to: '/church-admin/pastors', label: 'Pastors', icon: '✝' },
  { to: '/church-admin/announcements', label: 'Announcements', icon: '📣' },
  { to: '/church-admin/gallery', label: 'Gallery', icon: '🖼️' },
  { to: '/church-admin/blog', label: 'Blog', icon: '📝' },
  { to: '/church-admin/members', label: 'Members', icon: '👥' },
  { to: '/church-admin/contact', label: 'Contact Inbox', icon: '✉️' },
  { to: '/church-admin/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/church-admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function ChurchAdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user?.church_id || location.pathname === '/church-admin/onboarding') {
      setChecking(false);
      return;
    }

    api
      .get('/churches')
      .then((churches) => {
        const mine = churches.find((c) => c.id === user.church_id);
        if (mine) {
          return api.get(`/churches/${mine.slug}`).then((full) => {
            if (!full.onboarding_completed) {
              navigate('/church-admin/onboarding', { replace: true });
            }
          });
        }
      })
      .catch(console.error)
      .finally(() => setChecking(false));
  }, [user, location.pathname, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/church-admin/login');
  };

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-admin-sidebar text-gray-300">
        <div className="flex h-16 items-center gap-3 border-b border-gray-700 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
            C
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Church Admin</p>
            <p className="text-xs text-gray-500">Manage your church</p>
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
          <h1 className="text-lg font-semibold text-gray-800">Church Management</h1>
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

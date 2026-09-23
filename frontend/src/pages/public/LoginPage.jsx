import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ApiError } from '../../api/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'super_admin') navigate('/admin/dashboard');
      else if (user.role === 'church_admin') navigate('/church-admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-md px-4">
        <div className="card">
          <div className="mb-8 text-center">
            <img src="/logo-icon.svg" alt="" className="mx-auto h-12 w-12 rounded-xl shadow-lg shadow-primary-500/30" width={48} height={48} />
            <h1 className="mt-4 font-display text-2xl font-bold text-gray-900">Sign In</h1>
            <p className="mt-2 text-sm text-gray-600">Access your ChurchNivo account</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 border-t border-gray-100 pt-6 text-center text-sm text-gray-500">
            <p>Admin access:</p>
            <div className="mt-2 flex justify-center gap-4">
              <Link to="/admin/login" className="text-primary-600 hover:text-primary-700">Super Admin</Link>
              <Link to="/church-admin/login" className="text-primary-600 hover:text-primary-700">Church Admin</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

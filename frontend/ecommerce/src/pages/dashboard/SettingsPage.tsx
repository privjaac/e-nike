import { useState } from 'react';
import { Settings, LogOut, User, Mail, Shield, Crown, Save, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:3001/api/v1';

export function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/users/profile`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ firstName, lastName, email }),
      });

      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const json = (await res.json()) as { message?: string; error?: string };
          msg = json.message || json.error || msg;
        } catch {
          // response is not JSON
        }
        throw new Error(msg);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="p-8">
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6 text-primary" />
          <h1 className="text-4xl font-black font-headline tracking-tighter uppercase italic leading-none">
            Settings
          </h1>
        </div>
        <p className="text-xs text-on-surface-variant">Manage your account and preferences.</p>
      </header>

      <div className="max-w-2xl space-y-8">
        {/* Profile Card */}
        <div className="bg-surface-container-lowest p-8">
          <h2 className="text-sm font-black font-headline uppercase tracking-tight italic mb-6">Profile</h2>

          {user ? (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-zinc-900 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-primary-container" />
                </div>
                <div>
                  <p className="text-lg font-black font-headline">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wide">{user.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full h-10 bg-zinc-100 px-3 text-xs font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full h-10 bg-zinc-100 px-3 text-xs font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">Email</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-zinc-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 h-10 bg-zinc-100 px-3 text-xs font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>

              {saveError && (
                <div className="flex items-center gap-2 text-error text-xs font-bold">
                  <AlertCircle className="w-4 h-4" />
                  {saveError}
                </div>
              )}

              {saveSuccess && (
                <div className="text-primary text-xs font-bold">Profile updated successfully.</div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-primary-container text-on-primary-container px-6 py-3 text-xs font-black uppercase tracking-widest hover:brightness-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving…' : 'Save Profile'}
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-100">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-zinc-400" />
                  <div>
                    <p className="text-[10px] font-bold uppercase text-zinc-400">Role</p>
                    <p className="text-xs font-bold capitalize">{user.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Crown className="w-4 h-4 text-zinc-400" />
                  <div>
                    <p className="text-[10px] font-bold uppercase text-zinc-400">Membership</p>
                    <p className="text-xs font-bold capitalize">{user.membershipTier}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-zinc-400" />
                  <div>
                    <p className="text-[10px] font-bold uppercase text-zinc-400">User ID</p>
                    <p className="text-xs font-bold">{user.id}</p>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="text-xs font-bold text-zinc-400">No user data available. Please log in.</div>
          )}
        </div>

        {/* Actions */}
        <div className="bg-surface-container-lowest p-8">
          <h2 className="text-sm font-black font-headline uppercase tracking-tight italic mb-6">Account Actions</h2>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 bg-error-container text-on-error-container px-6 py-3 text-xs font-black uppercase tracking-widest hover:brightness-95 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

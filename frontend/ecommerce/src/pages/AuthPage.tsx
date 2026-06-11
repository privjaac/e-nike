import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function AuthPage() {
  const navigate = useNavigate();
  const { login, register, isLoading, error } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const [formError, setFormError] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!loginEmail || !loginPassword) {
      setFormError('Please enter both email and password');
      return;
    }
    try {
      await login(loginEmail, loginPassword);
      navigate('/');
    } catch {
      // error is already set in the store
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!firstName || !lastName || !registerEmail || !registerPassword) {
      setFormError('Please fill in all fields');
      return;
    }
    try {
      await register({ firstName, lastName, email: registerEmail, password: registerPassword });
      navigate('/');
    } catch {
      // error is already set in the store
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-black font-headline uppercase italic tracking-tighter mb-8 text-on-surface">
          {isLogin ? 'Member Sign In' : 'Join the Club'}
        </h1>

        {(error || formError) && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container text-sm font-medium rounded">
            {formError || error}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="sr-only">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 focus:outline-none focus:border-primary text-on-surface rounded"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="sr-only">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 focus:outline-none focus:border-primary text-on-surface rounded"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-on-surface text-surface font-headline font-black uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed rounded"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="sr-only">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 focus:outline-none focus:border-primary text-on-surface rounded"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="sr-only">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 focus:outline-none focus:border-primary text-on-surface rounded"
                />
              </div>
            </div>
            <div>
              <label htmlFor="register-email" className="sr-only">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                placeholder="Email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 focus:outline-none focus:border-primary text-on-surface rounded"
              />
            </div>
            <div>
              <label htmlFor="register-password" className="sr-only">
                Password
              </label>
              <input
                id="register-password"
                type="password"
                placeholder="Password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 focus:outline-none focus:border-primary text-on-surface rounded"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-on-surface text-surface font-headline font-black uppercase tracking-widest hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed rounded"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        <p className="mt-6 text-sm text-center text-on-surface-variant">
          {isLogin ? "Don't have an account? " : 'Already a member? '}
          <button
            onClick={toggleMode}
            className="font-bold underline text-on-surface hover:text-primary transition-colors"
          >
            {isLogin ? 'Join Now' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';

interface NavLinkDef {
  label: string;
  to: string;
  match: (pathname: string, search: string) => boolean;
}

const navLinks: NavLinkDef[] = [
  { label: 'New', to: '/', match: (p) => p === '/' },
  {
    label: 'Men',
    to: '/products?gender=men',
    match: (p, s) => p === '/products' && s.includes('gender=men'),
  },
  {
    label: 'Women',
    to: '/products?gender=women',
    match: (p, s) => p === '/products' && s.includes('gender=women'),
  },
  {
    label: 'Kids',
    to: '/products?gender=kids',
    match: (p, s) => p === '/products' && s.includes('gender=kids'),
  },
  {
    label: 'Sale',
    to: '/products?sale=true',
    match: (p, s) => p === '/products' && s.includes('sale=true'),
  },
];

function getInitials(firstName?: string, lastName?: string) {
  if (!firstName) return 'U';
  return `${firstName[0]}${lastName?.[0] ?? ''}`.toUpperCase();
}

export function Navbar() {
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount);
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (location.pathname === '/products') {
      const params = new URLSearchParams(location.search);
      setSearchQuery(params.get('search') || '');
    } else {
      setSearchQuery('');
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const performSearch = (query: string) => {
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/products');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      performSearch(searchQuery);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl shadow-[0_32px_0_0_rgba(0,0,0,0.04)]">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto">
        <Link
          to="/"
          className="text-3xl font-black italic tracking-tighter text-on-surface font-headline"
        >
          NIKE
        </Link>

        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => {
            const isSale = link.label === 'Sale';
            const isActive = link.match(location.pathname, location.search);
            return (
              <Link
                key={link.label}
                to={link.to}
                className={[
                  'font-headline tracking-tighter uppercase font-bold pb-1 transition-colors duration-150 ease-in-out',
                  isActive && !isSale
                    ? 'text-on-surface border-b-2 border-primary-container'
                    : 'text-secondary hover:text-primary-container',
                  isSale ? 'text-primary-container hover:text-inverse-primary' : '',
                ].join(' ')}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center bg-surface-container-low px-4 py-2 rounded-full">
            <Search className="text-on-surface-variant w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none focus:ring-0 text-sm w-32 font-medium ml-2 outline-none placeholder:text-on-surface-variant"
            />
          </div>

          <div className="flex gap-4 items-center">
            <Link to="/favorites" className="hover:scale-95 duration-100">
              <Heart className="w-5 h-5 text-on-surface" />
            </Link>

            <Link
              to="/cart"
              className="hover:scale-95 duration-100 relative"
            >
              <ShoppingBag className="w-5 h-5 text-on-surface" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-on-primary text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {!isInitialized ? (
              <div className="w-8 h-8 rounded-full bg-surface-container-high animate-pulse" />
            ) : isAuthenticated && user ? (
              <Link
                to="/dashboard"
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary-container bg-primary-container flex items-center justify-center"
              >
                <span className="text-[10px] font-bold text-on-primary-container">
                  {getInitials(user.firstName, user.lastName)}
                </span>
              </Link>
            ) : (
              <Link
                to="/auth"
                className="text-sm font-bold uppercase tracking-tight flex items-center gap-1 hover:text-primary-container transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

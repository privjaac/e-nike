import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, User } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export function MobileNav() {
  const { isAuthenticated } = useAuthStore();

  const mobileLinks = [
    { label: 'Home', to: '/', icon: Home },
    { label: 'Shop', to: '/products', icon: ShoppingBag },
    { label: 'Account', to: isAuthenticated ? '/dashboard' : '/auth', icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 w-full bg-surface/90 backdrop-blur-xl z-50 flex justify-around py-4 border-t border-outline-variant/10">
      {mobileLinks.map((link) => {
        const Icon = link.icon;
        return (
          <NavLink
            key={link.label}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              [
                'flex flex-col items-center gap-1',
                isActive ? 'text-primary' : 'text-on-surface-variant',
              ].join(' ')
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase">{link.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

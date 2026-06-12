import { NavLink } from 'react-router-dom';
import { Zap, LayoutDashboard, Package, BarChart3, Truck, Settings } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/dashboard/inventory', label: 'Inventory', icon: Package },
  { to: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/dashboard/orders', label: 'Orders', icon: Truck },
  { to: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardSidebar() {
  return (
    <aside className="h-screen w-64 border-r border-zinc-100 bg-zinc-50 flex flex-col py-8 sticky top-0 shrink-0">
      <div className="px-6 mb-10">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-container" fill="currentColor" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900 font-headline leading-tight">
              Merch Central
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
              Global Dashboard
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-r-full transition-all duration-200 font-bold ${
                isActive ? 'bg-lime-400 text-zinc-950' : 'text-zinc-500 hover:bg-zinc-200'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-headline text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-6 mt-auto border-t border-zinc-100 pt-6">
        <div className="flex items-center gap-3">
          <img
            src="https://placehold.co/64x64/1c1b1b/ffffff?text=MJ"
            alt="Admin Avatar"
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <p className="text-xs font-bold text-zinc-900">Marcus Jordan</p>
            <p className="text-[10px] text-zinc-500">Sr. Merchandiser</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

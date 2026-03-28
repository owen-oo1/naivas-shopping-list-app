import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  ShoppingCart,
  BarChart3,
  Package,
  Users,
  LogOut,
  ChevronLeft,
  Menu,
} from 'lucide-react';
import { useState } from 'react';

export default function AppSidebar() {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['manager', 'staff', 'customer'] as const },
    { to: '/lists', icon: ShoppingCart, label: 'Shopping Lists', roles: ['manager', 'staff', 'customer'] as const },
    { to: '/reports', icon: BarChart3, label: 'Reports', roles: ['manager', 'staff'] as const },
    { to: '/analytics', icon: Package, label: 'Analytics', roles: ['manager'] as const },
    { to: '/customers', icon: Users, label: 'Customers', roles: ['manager'] as const },
  ];

  const visibleItems = navItems.filter(item => hasRole(...item.roles));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-sidebar flex items-center px-4 gap-3">
        <button onClick={() => setCollapsed(!collapsed)} className="text-sidebar-foreground">
          <Menu className="w-5 h-5" />
        </button>
        <span className="font-display font-bold text-sidebar-foreground text-lg">Naivas</span>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-sidebar transition-all duration-200 flex flex-col
          ${collapsed ? 'w-16' : 'w-60'}
          ${collapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-sidebar-border">
          {!collapsed && (
            <span className="font-display font-bold text-sidebar-foreground text-lg tracking-tight">
              Naivas CRM
            </span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-sidebar-foreground/70 hover:text-sidebar-foreground hidden lg:block"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {visibleItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => window.innerWidth < 1024 && setCollapsed(true)}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'}`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-sidebar-border p-3">
          {!collapsed && user && (
            <div className="px-2 mb-2">
              <div className="text-sidebar-foreground/80 text-xs truncate">{user.email}</div>
              <div className="text-sidebar-foreground/50 text-[10px] uppercase tracking-wider mt-0.5">{user.role}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="nav-item text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 w-full"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-foreground/20 z-30 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}
    </>
  );
}

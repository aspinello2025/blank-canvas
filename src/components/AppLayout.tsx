import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MapPin, Users, Package, Wrench, ClipboardList, FileText, Menu, X, Moon, Sun, LogOut, ClipboardCheck, UserPlus } from 'lucide-react';
import logoSsd from '@/assets/logo-ssd.png';
import { useState, useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const ALL_NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', adminOnly: false },
  { to: '/locais', icon: MapPin, label: 'Locais', adminOnly: true },
  { to: '/funcionarios', icon: Users, label: 'Funcionários', adminOnly: true },
  { to: '/insumos', icon: Package, label: 'Insumos', adminOnly: true },
  { to: '/manutencao', icon: Wrench, label: 'Manutenção', adminOnly: false },
  { to: '/historico', icon: ClipboardList, label: 'Histórico', adminOnly: false },
  { to: '/leads', icon: UserPlus, label: 'Leads / CRM', adminOnly: true },
  { to: '/relatorios', icon: FileText, label: 'Relatórios', adminOnly: true },
  { to: '/modelos-checklists', icon: ClipboardCheck, label: 'Modelos de Checklist', adminOnly: true },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isAdmin, signOut, user, role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);

  const navItems = ALL_NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-foreground/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform lg:static lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col items-center gap-1 px-5 py-5 border-b border-sidebar-border">
          <img src={logoSsd} alt="SSD Logo" className="h-24 w-auto" />
          <p className="text-[10px] text-sidebar-foreground/50 tracking-wide uppercase mt-1">Sistema de Monitoramento</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-white font-semibold"
                    : "text-sidebar-foreground/85 hover:bg-sidebar-accent hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info & actions */}
        <div className="p-3 border-t border-sidebar-border space-y-1">
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-sidebar-foreground/90 truncate">{user?.email}</p>
            <span className={cn(
              "inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
              isAdmin ? "bg-primary/20 text-primary" : "bg-accent text-accent-foreground"
            )}>
              {role === 'admin' ? 'Administrador' : 'Técnico'}
            </span>
          </div>
          <button
            onClick={() => setDark(!dark)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent transition-colors"
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            {dark ? 'Modo Claro' : 'Modo Escuro'}
          </button>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-muted">
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <img src={logoSsd} alt="SSD" className="h-12 w-auto" />
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>

        <nav className="flex items-center justify-around border-t border-border bg-card py-2 lg:hidden">
          {navItems.slice(0, 5).map(item => {
            const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 text-xs font-medium px-2 py-1 rounded-lg transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="truncate max-w-[60px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

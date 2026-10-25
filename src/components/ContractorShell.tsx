import { useState } from 'react';
import * as Icons from 'lucide-react';
import { Logo } from './ui';

export type ContractorView = 'dashboard' | 'projects';

interface Props {
  view: ContractorView;
  setView: (v: ContractorView) => void;
  onExitRole: () => void;
  children: React.ReactNode;
}

interface NavItem {
  key: ContractorView;
  label: string;
  icon: string;
}

const NAV: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { key: 'projects', label: 'Projects', icon: 'FolderKanban' },
];

export function ContractorShell({ view, setView, onExitRole, children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-navy-50 flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 bg-white border-r border-navy-100 z-30">
        <div className="px-5 py-5 border-b border-navy-100">
          <Logo size="md" />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(item => (
            <NavButton key={item.key} item={item} active={view === item.key} onClick={() => setView(item.key)} />
          ))}
        </nav>
        <div className="p-3 border-t border-navy-100">
          <button onClick={onExitRole} className="btn-secondary w-full justify-start">
            <Icons.ArrowLeftRight className="w-4 h-4" /> Switch role
          </button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm animate-fade-in" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white border-r border-navy-100 flex flex-col animate-slide-in-right">
            <div className="px-5 py-5 border-b border-navy-100 flex items-center justify-between">
              <Logo size="md" />
              <button onClick={() => setMobileOpen(false)} className="btn-ghost p-2"><Icons.X className="w-5 h-5" /></button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {NAV.map(item => (
                <NavButton key={item.key} item={item} active={view === item.key} onClick={() => { setView(item.key); setMobileOpen(false); }} />
              ))}
            </nav>
            <div className="p-3 border-t border-navy-100">
              <button onClick={onExitRole} className="btn-secondary w-full justify-start">
                <Icons.ArrowLeftRight className="w-4 h-4" /> Switch role
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <header className="lg:hidden sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-navy-100 px-4 h-14 flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)} className="btn-ghost p-2"><Icons.Menu className="w-5 h-5" /></button>
          <Logo size="sm" />
          <button onClick={onExitRole} className="btn-ghost p-2"><Icons.LogOut className="w-5 h-5" /></button>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavButton({ item, active, onClick }: { item: NavItem; active: boolean; onClick: () => void }) {
  const Icon = (Icons as any)[item.icon] as React.ComponentType<{ className?: string }>;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-600 transition-all ${
        active ? 'bg-brand-50 text-brand-700' : 'text-navy-600 hover:bg-navy-50'
      }`}
    >
      {Icon && <Icon className={`w-5 h-5 ${active ? 'text-brand-600' : 'text-navy-400'}`} />}
      {item.label}
      {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />}
    </button>
  );
}
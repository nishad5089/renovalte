import { type ReactNode, useEffect } from 'react';
import * as Icons from 'lucide-react';

/* ---------- Modal ---------- */
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}

export function Modal({ open, onClose, title, subtitle, children, footer, maxWidth = 'max-w-2xl' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} max-h-[92vh] sm:max-h-[88vh] overflow-hidden card-surface rounded-t-3xl sm:rounded-2xl flex flex-col animate-slide-up`}>
        {(title || subtitle) && (
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-navy-100">
            <div>
              {title && <h2 className="font-display text-lg font-700 text-navy-900">{title}</h2>}
              {subtitle && <p className="mt-0.5 text-sm text-navy-500">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="btn-ghost -m-2 p-2 rounded-lg" aria-label="Close">
              <Icons.X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-navy-100 bg-navy-50/50">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Badge ---------- */
export function Badge({ children, color = 'bg-navy-100 text-navy-700', icon }: { children: ReactNode; color?: string; icon?: string }) {
  const Icon = icon ? (Icons as any)[icon] as React.ComponentType<{ className?: string }> : null;
  return (
    <span className={`badge ${color}`}>
      {Icon && <Icon className="w-3 h-3" />}
      {children}
    </span>
  );
}

/* ---------- Card ---------- */
export function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`card-surface p-5 ${onClick ? 'cursor-pointer hover:shadow-glow hover:border-brand-300 transition-all duration-200' : ''} ${className}`}>
      {children}
    </div>
  );
}

/* ---------- Stat card ---------- */
export function StatCard({ icon, label, value, sub, color = 'brand' }: { icon: string; label: string; value: string | number; sub?: string; color?: string }) {
  const Icon = (Icons as any)[icon] as React.ComponentType<{ className?: string }>;
  const colorMap: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600',
    accent: 'bg-accent-100 text-accent-700',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-600',
    navy: 'bg-navy-100 text-navy-700',
  };
  return (
    <div className="card-surface p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorMap[color]}`}>
        {Icon && <Icon className="w-6 h-6" />}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-500 text-navy-500 uppercase tracking-wide">{label}</p>
        <p className="font-display text-2xl font-700 text-navy-900 truncate">{value}</p>
        {sub && <p className="text-xs text-navy-400 mt-0.5 truncate">{sub}</p>}
      </div>
    </div>
  );
}

/* ---------- Section title ---------- */
export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div>
        <h2 className="font-display text-xl font-700 text-navy-900">{title}</h2>
        {subtitle && <p className="text-sm text-navy-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- Empty state ---------- */
export function EmptyState({ icon = 'Inbox', title, description }: { icon?: string; title: string; description?: string }) {
  const Icon = (Icons as any)[icon] as React.ComponentType<{ className?: string }>;
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl bg-navy-100 flex items-center justify-center mb-4">
        {Icon && <Icon className="w-8 h-8 text-navy-400" />}
      </div>
      <h3 className="font-display text-lg font-700 text-navy-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-navy-500 max-w-sm">{description}</p>}
    </div>
  );
}

/* ---------- Logo ---------- */
export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-9 h-9';
  const iconSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base';
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${dims} rounded-xl bg-gradient-to-br from-navy-900 to-brand-600 text-white flex items-center justify-center shadow-soft shrink-0`}>
        <Icons.Hammer className={iconSize} />
      </div>
      <div className="leading-none">
        <p className={`font-display font-800 text-navy-900 ${textSize}`}>RenovAIte</p>
        {size !== 'sm' && <p className="text-[10px] text-navy-500 uppercase tracking-wider leading-none mt-1">AI Renovation Assistant</p>}
      </div>
    </div>
  );
}

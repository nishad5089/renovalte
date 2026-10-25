import { type ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

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
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${maxWidth} max-h-[92vh] sm:max-h-[88vh] overflow-hidden card-surface rounded-t-3xl sm:rounded-2xl flex flex-col animate-slide-up`}>
        {(title || subtitle) && (
          <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-navy-100">
            <div>
              {title && <h2 className="font-display text-lg font-700 text-navy-900">{title}</h2>}
              {subtitle && <p className="mt-0.5 text-sm text-navy-500">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="btn-ghost -m-2 p-2 rounded-lg" aria-label="Schließen">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-navy-100 bg-navy-50/40">{footer}</div>}
      </div>
    </div>
  );
}

import * as Icons from 'lucide-react';
import { Logo } from './ui';

interface Props {
  onExitRole: () => void;
}

export function CraftsmanPlaceholder({ onExitRole }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-950 via-navy-900 to-brand-900 flex flex-col">
      {/* Top bar */}
      <header className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur text-white flex items-center justify-center">
            <Icons.Hammer className="w-5 h-5" />
          </div>
          <div>
            <p className="font-display font-800 text-white leading-none">RenovAIte</p>
            <p className="text-[10px] text-navy-300 uppercase tracking-wider mt-1">Craftsman</p>
          </div>
        </div>
        <button onClick={onExitRole} className="btn bg-white/10 text-white border border-white/20 hover:bg-white/20">
          <Icons.ArrowLeftRight className="w-4 h-4" /> Switch role
        </button>
      </header>

      {/* Centered content */}
      <main className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="max-w-md w-full text-center animate-slide-up">
          <div className="relative w-24 h-24 mx-auto mb-7">
            <div className="absolute inset-0 rounded-3xl bg-accent-500/20 blur-2xl animate-pulse-soft" />
            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-accent-500 to-brand-500 text-white flex items-center justify-center shadow-glow">
              <Icons.HardHat className="w-12 h-12" />
            </div>
          </div>

          <span className="badge bg-white/10 text-white border border-white/20 mx-auto mb-5">
            <Icons.Construction className="w-3.5 h-3.5" /> Coming soon
          </span>

          <h1 className="font-display text-3xl font-800 text-white tracking-tight">
            Craftsman assistant
          </h1>
          <p className="mt-3 text-navy-200 leading-relaxed">
            The on-site AI assistant for step-by-step renovation guidance, photo upload, voice
            questions, and safety warnings is being prepared for the next stage.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 text-left">
            <Feature icon="MessageSquare" label="AI chat" />
            <Feature icon="Mic" label="Voice questions" />
            <Feature icon="Camera" label="Photo upload" />
            <Feature icon="ShieldAlert" label="Safety warnings" />
            <Feature icon="ListChecks" label="Step guidance" />
            <Feature icon="Image" label="Image previews" />
          </div>

          <button onClick={onExitRole} className="mt-8 btn bg-white text-navy-900 hover:bg-navy-50 active:scale-[0.98] shadow-soft">
            <Icons.ArrowLeft className="w-4 h-4" /> Back to role selection
          </button>
        </div>
      </main>

      <footer className="px-6 py-5 text-center text-xs text-navy-400">
        © 2026 RenovAIte GmbH · Prototype
      </footer>
    </div>
  );
}

function Feature({ icon, label }: { icon: string; label: string }) {
  const Icon = (Icons as any)[icon] as React.ComponentType<{ className?: string }>;
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/5 border border-white/10">
      <div className="w-8 h-8 rounded-lg bg-white/10 text-white flex items-center justify-center shrink-0">
        {Icon && <Icon className="w-4 h-4" />}
      </div>
      <span className="text-sm text-navy-100 font-500">{label}</span>
    </div>
  );
}

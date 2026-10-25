import * as Icons from 'lucide-react';
import { Logo } from './ui';
import type { Role } from '../types';

interface Props {
  onChoose: (role: Role) => void;
}

export function Welcome({ onChoose }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-navy-50">
      {/* Hero background */}
      <div className="relative flex-1 flex flex-col">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full bg-brand-500/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-accent-500/10 blur-3xl" />
        </div>

        <header className="relative z-10 px-6 py-5 sm:px-10">
          <Logo size="md" />
        </header>

        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-10">
          <div className="max-w-3xl w-full text-center animate-slide-up">
            <span className="badge bg-brand-50 text-brand-700 mb-5">
              <Icons.Sparkles className="w-3.5 h-3.5" /> AI-assisted renovation platform
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-800 text-navy-900 tracking-tight leading-tight">
              Smarter renovation proposals,
              <br className="hidden sm:block" /> guided on-site work.
            </h1>
            <p className="mt-4 text-lg text-navy-500 max-w-2xl mx-auto">
              RenovAIte helps contractors turn customer requirements into clear proposals, and gives
              on-site craftsmen AI-guided step-by-step instructions.
            </p>
          </div>

          {/* Role selection cards */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl w-full animate-slide-up" style={{ animationDelay: '80ms' }}>
            <RoleCard
              icon="MonitorSmartphone"
              title="Contractor"
              description="Manage projects, customer requirements, AI summaries, and prepare renovation proposals."
              bullets={['Project dashboard', 'AI requirement summaries', 'Proposal preparation']}
              accent="brand"
              onClick={() => onChoose('contractor')}
            />
            <RoleCard
              icon="HardHat"
              title="Craftsman"
              description="On-site AI assistant for step-by-step guidance, safety warnings, and photo-based support."
              bullets={['AI chat & voice', 'Photo upload', 'Safety guidance']}
              accent="accent"
              onClick={() => onChoose('craftsman')}
            />
          </div>

          <p className="mt-8 text-xs text-navy-400 flex items-center gap-1.5">
            <Icons.Lock className="w-3.5 h-3.5" />
            Prototype · No login required · Data stored locally in your browser
          </p>
        </main>

        <footer className="relative z-10 px-6 py-5 text-center text-xs text-navy-400">
          © 2026 RenovAIte GmbH · Frankfurt am Main
        </footer>
      </div>
    </div>
  );
}

function RoleCard({
  icon, title, description, bullets, accent, onClick,
}: {
  icon: string; title: string; description: string; bullets: string[]; accent: 'brand' | 'accent'; onClick: () => void;
}) {
  const Icon = (Icons as any)[icon] as React.ComponentType<{ className?: string }>;
  const grad = accent === 'brand' ? 'from-brand-500 to-brand-700' : 'from-accent-500 to-accent-700';
  const ringHover = accent === 'brand' ? 'hover:border-brand-300 hover:shadow-glow' : 'hover:border-accent-300';
  const textColor = accent === 'brand' ? 'text-brand-600' : 'text-accent-600';
  const chevronBg = accent === 'brand' ? 'bg-brand-600 group-hover:bg-brand-700' : 'bg-accent-500 group-hover:bg-accent-600';

  return (
    <button
      onClick={onClick}
      className={`group text-left card-surface p-6 transition-all duration-200 ${ringHover} hover:-translate-y-0.5`}
    >
      <div className="flex items-start justify-between">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} text-white flex items-center justify-center shadow-soft`}>
          {Icon && <Icon className="w-7 h-7" />}
        </div>
        <div className={`w-9 h-9 rounded-full ${chevronBg} text-white flex items-center justify-center transition-all duration-200 group-hover:translate-x-0.5 opacity-0 group-hover:opacity-100`}>
          <Icons.ArrowRight className="w-4 h-4" />
        </div>
      </div>
      <h3 className="mt-5 font-display text-xl font-700 text-navy-900">{title}</h3>
      <p className="mt-1.5 text-sm text-navy-500 leading-relaxed">{description}</p>
      <ul className="mt-4 space-y-1.5">
        {bullets.map(b => (
          <li key={b} className="flex items-center gap-2 text-sm text-navy-700">
            <Icons.Check className={`w-4 h-4 ${textColor}`} /> {b}
          </li>
        ))}
      </ul>
    </button>
  );
}

import * as Icons from 'lucide-react';
import type { Project } from '../types';
import { statusLabels, statusDotColors, typeLabels, typeIcons, formatEuro } from '../data/projects';
import { Card, Badge, StatCard, SectionTitle } from './ui';

interface Props {
  projects: Project[];
  onOpenProject: (id: string) => void;
  onViewAll: () => void;
}

export function Dashboard({ projects, onOpenProject, onViewAll }: Props) {
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const newCount = projects.filter(p => p.status === 'new').length;
  const summarizedCount = projects.filter(p => p.status === 'summarized').length;
  const recent = [...projects].sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)).slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-brand-800 p-7 sm:p-9 text-white shadow-navy">
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute right-10 bottom-0 w-40 h-40 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="relative">
          <p className="text-brand-200 text-sm font-500 flex items-center gap-1.5">
            <Icons.Sparkles className="w-4 h-4" /> Good day, Contractor
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-800 mt-1 tracking-tight">Renovation pipeline overview</h1>
          <p className="text-navy-200 mt-2 max-w-xl text-sm sm:text-base">
            {projects.length} active projects · {newCount} new lead{newCount === 1 ? '' : 's'} awaiting AI summary ·
            {summarizedCount} ready for inspection.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button onClick={onViewAll} className="btn bg-white text-navy-900 hover:bg-navy-50 active:scale-[0.98] shadow-soft">
              <Icons.FolderKanban className="w-4 h-4" /> View projects
            </button>
            <button onClick={() => recent[0] && onOpenProject(recent[0].id)} className="btn bg-white/10 text-white border border-white/20 hover:bg-white/20">
              <Icons.Sparkles className="w-4 h-4" /> Open latest lead
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="FolderKanban" label="Active projects" value={projects.length} sub="across 5 cities" color="brand" />
        <StatCard icon="Euro" label="Total pipeline" value={formatEuro(totalBudget)} sub="combined budget" color="accent" />
        <StatCard icon="Sparkles" label="Awaiting summary" value={newCount} sub="new status" color="warning" />
        <StatCard icon="Send" label="Proposals sent" value={projects.filter(p => p.status === 'sent').length} sub="awaiting reply" color="success" />
      </div>

      {/* Recent activity */}
      <div>
        <SectionTitle
          title="Recent activity"
          subtitle="Latest updated projects in your pipeline"
          action={
            <button onClick={onViewAll} className="btn-secondary text-xs">
              View all <Icons.ChevronRight className="w-3.5 h-3.5" />
            </button>
          }
        />
        <div className="space-y-3">
          {recent.map(p => <RecentRow key={p.id} project={p} onOpen={() => onOpenProject(p.id)} />)}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <SectionTitle title="Quick actions" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuickAction icon="Sparkles" title="Generate AI summary" desc="Summarise customer requirements" onClick={() => onViewAll()} />
          <QuickAction icon="FolderKanban" title="Browse projects" desc="Search and filter all projects" onClick={onViewAll} />
        </div>
      </div>
    </div>
  );
}

function RecentRow({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const Icon = (Icons as any)[typeIcons[project.type]] as React.ComponentType<{ className?: string }>;
  const photo = project.photos[0]?.url;
  return (
    <Card onClick={onOpen} className="flex items-center gap-4 p-4">
      {photo ? (
        <img src={photo} alt={project.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
      ) : (
        <div className="w-16 h-16 rounded-xl bg-navy-100 flex items-center justify-center shrink-0">
          <Icons.ImageOff className="w-6 h-6 text-navy-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-display font-700 text-navy-900 truncate">{project.name}</p>
          <span className="text-xs font-500 text-navy-400">{project.id}</span>
        </div>
        <p className="text-xs text-navy-500 mt-0.5 flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1">{Icon && <Icon className="w-3.5 h-3.5" />}{typeLabels[project.type]}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Icons.MapPin className="w-3 h-3" />{project.city}</span>
          <span>·</span>
          <span className="font-600 text-navy-700">{formatEuro(project.budget)}</span>
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="badge bg-navy-50 text-navy-700 hidden sm:inline-flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${statusDotColors[project.status]}`} />
          {statusLabels[project.status]}
        </span>
        <Icons.ChevronRight className="w-5 h-5 text-navy-400" />
      </div>
    </Card>
  );
}

function QuickAction({ icon, title, desc, onClick, disabled }: { icon: string; title: string; desc: string; onClick?: () => void; disabled?: boolean }) {
  const Icon = (Icons as any)[icon] as React.ComponentType<{ className?: string }>;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`card-surface p-5 text-left transition-all ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-glow hover:border-brand-300 hover:-translate-y-0.5'}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        <div>
          <p className="font-display font-700 text-navy-900 flex items-center gap-1.5">
            {title}
            {disabled && <Icons.Lock className="w-3 h-3 text-navy-400" />}
          </p>
          <p className="text-xs text-navy-500">{desc}</p>
        </div>
      </div>
    </button>
  );
}

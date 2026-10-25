import { useMemo, useState } from 'react';
import * as Icons from 'lucide-react';
import type { Project, ProjectStatusKey, ProjectStatus } from '../types';
import { statusLabels, statusDotColors, statusBadgeColors, typeLabels, typeIcons, formatEuro } from '../data/projects';
import { Card, Badge, EmptyState, SectionTitle } from './ui';

interface Props {
  projects: Project[];
  onOpenProject: (id: string) => void;
}

const STATUS_FILTERS: { key: ProjectStatusKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'summarized', label: 'Summarized' },
  { key: 'inspected', label: 'Inspected' },
  { key: 'draft', label: 'Draft' },
  { key: 'sent', label: 'Sent' },
];

export function ProjectsPage({ projects, onOpenProject }: Props) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<ProjectStatusKey>('all');

  const filtered = useMemo(() => {
    return projects.filter(p => {
      if (status !== 'all' && p.status !== status) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const haystack = `${p.name} ${p.id} ${p.city} ${p.customerName} ${typeLabels[p.type]}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [projects, query, status]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: projects.length };
    for (const p of projects) c[p.status] = (c[p.status] ?? 0) + 1;
    return c;
  }, [projects]);

  return (
    <div className="space-y-6 animate-fade-in">
      <SectionTitle
        title="Projects"
        subtitle={`${projects.length} renovation projects across the Rhein-Main region`}
      />

      {/* Search bar */}
      <div className="relative">
        <Icons.Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name, project ID, city, customer, or type…"
          className="input-field pl-11 py-3"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 btn-ghost p-1.5">
            <Icons.X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Status filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {STATUS_FILTERS.map(f => {
          const active = status === f.key;
          const count = counts[f.key] ?? 0;
          return (
            <button
              key={f.key}
              onClick={() => setStatus(f.key)}
              className={`badge whitespace-nowrap px-3.5 py-1.5 transition-all ${
                active ? 'bg-brand-600 text-white' : 'bg-white text-navy-600 border border-navy-200 hover:border-navy-300'
              }`}
            >
              {f.key !== 'all' && <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-white/80' : statusDotColors[f.key as ProjectStatus] ?? 'bg-navy-300'}`} />}
              {f.label}
              <span className={`ml-1 px-1.5 rounded-full text-[10px] font-700 ${active ? 'bg-white/20' : 'bg-navy-100 text-navy-500'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <EmptyState icon="FolderSearch" title="No projects found" description="Try adjusting your search query or status filter." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(p => <ProjectCard key={p.id} project={p} onOpen={() => onOpenProject(p.id)} />)}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const Icon = (Icons as any)[typeIcons[project.type]] as React.ComponentType<{ className?: string }>;
  const photo = project.photos[0]?.url;
  return (
    <div className="card-surface overflow-hidden group hover:shadow-glow hover:border-brand-300 transition-all duration-200 flex flex-col">
      {/* Photo header */}
      <div className="relative h-44 overflow-hidden">
        {photo ? (
          <img src={photo} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full bg-navy-100 flex items-center justify-center">
            <Icons.ImageOff className="w-8 h-8 text-navy-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <Badge color={statusBadgeColors[project.status]}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusDotColors[project.status]}`} />
            {statusLabels[project.status]}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
          <div className="text-white">
            <p className="text-[11px] font-500 opacity-80">{project.id}</p>
            <p className="font-display font-700 text-lg leading-tight drop-shadow">{project.name}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-white/90 backdrop-blur text-navy-700 flex items-center justify-center shrink-0">
            {Icon && <Icon className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-3 text-xs text-navy-500 mb-3 flex-wrap">
          <span className="flex items-center gap-1"><Icons.MapPin className="w-3.5 h-3.5" /> {project.city}</span>
          <span className="flex items-center gap-1"><Icons.User className="w-3.5 h-3.5" /> {project.customerName}</span>
          <span className="flex items-center gap-1"><Icons.Calendar className="w-3.5 h-3.5" /> {project.createdAt}</span>
        </div>

        <p className="text-sm text-navy-600 leading-relaxed line-clamp-2 mb-4 flex-1">
          {project.customerRequirement}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-navy-100">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-navy-400 font-500">Budget</p>
            <p className="font-display text-lg font-700 text-navy-900">{formatEuro(project.budget)}</p>
          </div>
          <button onClick={onOpen} className="btn-primary">
            Open project <Icons.ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

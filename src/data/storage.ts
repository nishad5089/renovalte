import type { Project, ProjectAIState, ProjectSiteVisitState, ProjectProposalState, CraftsmanProjectState, CraftsmanLang } from '../types';
import { projects as seedProjects } from './projects';

const KEY = 'renovaite.projects.v1';
const ROLE_KEY = 'renovaite.role.v1';
const AI_KEY = 'renovaite.ai.v1';
const SITE_KEY = 'renovaite.sitevisits.v1';
const PROPOSAL_KEY = 'renovaite.proposals.v1';
const CRAFTSMAN_KEY = 'renovaite.craftsman.v1';
const CRAFTSMAN_LANG_KEY = 'renovaite.craftsman.lang.v1';

export function loadProjects(): Project[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(seedProjects));
      return seedProjects;
    }
    const parsed = JSON.parse(raw) as Project[];
    if (!Array.isArray(parsed) || parsed.length === 0) return seedProjects;
    return parsed;
  } catch {
    return seedProjects;
  }
}

export function saveProjects(list: Project[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore quota errors in prototype */
  }
}

export function loadRole(): 'contractor' | 'craftsman' | null {
  try {
    return (localStorage.getItem(ROLE_KEY) as 'contractor' | 'craftsman') ?? null;
  } catch {
    return null;
  }
}

export function saveRole(role: 'contractor' | 'craftsman'): void {
  try {
    localStorage.setItem(ROLE_KEY, role);
  } catch {
    /* ignore */
  }
}

export function resetProjects(): Project[] {
  localStorage.removeItem(KEY);
  localStorage.setItem(KEY, JSON.stringify(seedProjects));
  return seedProjects;
}

/* ---------- Per-project AI state (chat + structured summary) ---------- */

export function loadAIState(): Record<string, ProjectAIState> {
  try {
    const raw = localStorage.getItem(AI_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ProjectAIState>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveAIState(map: Record<string, ProjectAIState>): void {
  try {
    localStorage.setItem(AI_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota errors in prototype */
  }
}

export function loadProjectAI(projectId: string): ProjectAIState {
  const all = loadAIState();
  return all[projectId] ?? { chat: [], structuredSummary: null };
}

export function saveProjectAI(projectId: string, state: ProjectAIState): void {
  const all = loadAIState();
  all[projectId] = state;
  saveAIState(all);
}

/* ---------- Per-project site visits ---------- */

export function loadAllSiteVisits(): Record<string, ProjectSiteVisitState> {
  try {
    const raw = localStorage.getItem(SITE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ProjectSiteVisitState>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveAllSiteVisits(map: Record<string, ProjectSiteVisitState>): void {
  try {
    localStorage.setItem(SITE_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota errors in prototype */
  }
}

export function loadProjectSiteVisits(projectId: string): ProjectSiteVisitState {
  const all = loadAllSiteVisits();
  return all[projectId] ?? [];
}

export function saveProjectSiteVisits(projectId: string, visits: ProjectSiteVisitState): void {
  const all = loadAllSiteVisits();
  all[projectId] = visits;
  saveAllSiteVisits(all);
}

/* ---------- Per-project proposal state ---------- */

export function loadAllProposals(): Record<string, ProjectProposalState> {
  try {
    const raw = localStorage.getItem(PROPOSAL_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, ProjectProposalState>;
    if (!parsed || typeof parsed !== 'object') return {};
    // Normalize older saved states that predate the `visualizations` field
    // (and any draft sub-arrays) so downstream code never sees `undefined`.
    for (const id of Object.keys(parsed)) {
      const s = parsed[id];
      if (!s) continue;
      if (!Array.isArray(s.visualizations)) s.visualizations = [];
      if (!Array.isArray(s.versions)) s.versions = [];
      if (!Array.isArray(s.sendHistory)) s.sendHistory = [];
      if (s.options !== null && !Array.isArray(s.options)) s.options = null;
      if (s.draft) {
        const d = s.draft;
        if (!Array.isArray(d.workSteps)) d.workSteps = [];
        if (!Array.isArray(d.materials)) d.materials = [];
        if (!Array.isArray(d.assumptions)) d.assumptions = [];
        if (typeof d.scope !== 'string') d.scope = '';
        if (typeof d.title !== 'string') d.title = '';
        if (typeof d.timeline !== 'string') d.timeline = '';
        if (typeof d.priceMin !== 'number') d.priceMin = 0;
        if (typeof d.priceMax !== 'number') d.priceMax = 0;
      }
    }
    return parsed;
  } catch {
    return {};
  }
}

export function saveAllProposals(map: Record<string, ProjectProposalState>): void {
  try {
    localStorage.setItem(PROPOSAL_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota errors in prototype */
  }
}

export function loadProjectProposal(projectId: string): ProjectProposalState {
  const all = loadAllProposals();
  return all[projectId] ?? { options: null, optionsGeneratedAt: null, selectedTier: null, draft: null, versions: [], sendHistory: [], visualizations: [] };
}

export function saveProjectProposal(projectId: string, state: ProjectProposalState): void {
  const all = loadAllProposals();
  all[projectId] = state;
  saveAllProposals(all);
}

/* ---------- Per-project craftsman state ---------- */

export function loadAllCraftsmanState(): Record<string, CraftsmanProjectState> {
  try {
    const raw = localStorage.getItem(CRAFTSMAN_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, CraftsmanProjectState>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveAllCraftsmanState(map: Record<string, CraftsmanProjectState>): void {
  try {
    localStorage.setItem(CRAFTSMAN_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota errors in prototype */
  }
}

export function loadCraftsmanState(projectId: string): CraftsmanProjectState {
  const all = loadAllCraftsmanState();
  return all[projectId] ?? { chat: [], photos: [], questions: [], guidance: [], guidanceGeneratedFor: null, visualizations: [], activeVisualizationId: null };
}

export function saveCraftsmanState(projectId: string, state: CraftsmanProjectState): void {
  const all = loadAllCraftsmanState();
  all[projectId] = state;
  saveAllCraftsmanState(all);
}

/* ---------- Craftsman language preference ---------- */

export function loadCraftsmanLang(): CraftsmanLang {
  try {
    return (localStorage.getItem(CRAFTSMAN_LANG_KEY) as CraftsmanLang) ?? 'en';
  } catch {
    return 'en';
  }
}

export function saveCraftsmanLang(lang: CraftsmanLang): void {
  try {
    localStorage.setItem(CRAFTSMAN_LANG_KEY, lang);
  } catch {
    /* ignore */
  }
}

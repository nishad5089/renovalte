import { useEffect, useState } from 'react';
import type { Project, Role, ChatMessage, StructuredSummary, ProjectAIState, SiteVisit, ProjectProposalState, CraftsmanProjectState, CraftsmanLang } from './types';
import { loadProjects, saveProjects, loadRole, saveRole, loadProjectAI, saveProjectAI, loadProjectSiteVisits, saveProjectSiteVisits, loadProjectProposal, saveProjectProposal, loadAllCraftsmanState, saveAllCraftsmanState, loadCraftsmanState, saveCraftsmanState, loadCraftsmanLang, saveCraftsmanLang } from './data/storage';
import { Welcome } from './components/Welcome';
import { ContractorShell, type ContractorView } from './components/ContractorShell';
import { Dashboard } from './components/Dashboard';
import { ProjectsPage } from './components/ProjectsPage';
import { ProjectDetail } from './components/ProjectDetail';
import { CraftsmanShell } from './components/CraftsmanShell';

type Screen = 'welcome' | 'contractor' | 'craftsman';

export default function App() {
  const [screen, setScreen] = useState<Screen>('welcome');
  const [projects, setProjects] = useState<Project[]>([]);
  const [view, setView] = useState<ContractorView>('dashboard');
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);
  // Per-project AI assistant state (chat + structured summary), persisted to localStorage
  const [aiState, setAIState] = useState<Record<string, ProjectAIState>>({});
  // Per-project site visits, persisted to localStorage
  const [siteVisits, setSiteVisits] = useState<Record<string, SiteVisit[]>>({});
  // Per-project proposal state, persisted to localStorage
  const [proposalStates, setProposalStates] = useState<Record<string, ProjectProposalState>>({});
  // Per-project craftsman state, persisted to localStorage
  const [craftsmanStates, setCraftsmanStates] = useState<Record<string, CraftsmanProjectState>>({});
  // Craftsman language preference
  const [craftsmanLang, setCraftsmanLang] = useState<CraftsmanLang>('en');

  // Initialise from localStorage on mount
  useEffect(() => {
    setProjects(loadProjects());
    setCraftsmanLang(loadCraftsmanLang());
    const savedRole = loadRole();
    if (savedRole === 'contractor') setScreen('contractor');
    else if (savedRole === 'craftsman') setScreen('craftsman');
  }, []);

  // Persist projects whenever they change
  useEffect(() => {
    if (projects.length > 0) saveProjects(projects);
  }, [projects]);

  // When a project is opened, load its AI state + site visits + proposals from localStorage (lazy)
  useEffect(() => {
    if (openProjectId && !aiState[openProjectId]) {
      setAIState(prev => ({ ...prev, [openProjectId]: loadProjectAI(openProjectId) }));
    }
    if (openProjectId && !siteVisits[openProjectId]) {
      setSiteVisits(prev => ({ ...prev, [openProjectId]: loadProjectSiteVisits(openProjectId) }));
    }
    if (openProjectId && !proposalStates[openProjectId]) {
      setProposalStates(prev => ({ ...prev, [openProjectId]: loadProjectProposal(openProjectId) }));
    }
  }, [openProjectId, aiState, siteVisits, proposalStates]);

  function chooseRole(role: Role) {
    saveRole(role);
    if (role === 'contractor') {
      setScreen('contractor');
      setView('dashboard');
    } else {
      setScreen('craftsman');
    }
  }

  function exitRole() {
    setScreen('welcome');
    setOpenProjectId(null);
    setView('dashboard');
  }

  function handleStatusChange(projectId: string, status: Project['status']) {
    setProjects(prev => prev.map(p => p.id === projectId ? { ...p, status } : p));
  }

  function handleSummaryGenerated(projectId: string, summary: string) {
    setProjects(prev => prev.map(p =>
      p.id === projectId
        ? { ...p, aiSummary: summary, status: p.status === 'new' ? 'summarized' : p.status }
        : p
    ));
  }

  function openProject(id: string) {
    setOpenProjectId(id);
    setView('projects');
  }

  function handleChatChange(projectId: string, chat: ChatMessage[]) {
    setAIState(prev => {
      const next = { ...prev, [projectId]: { ...prev[projectId], chat } };
      saveProjectAI(projectId, next[projectId]);
      return next;
    });
  }

  function handleStructuredSummaryChange(projectId: string, s: StructuredSummary | null) {
    setAIState(prev => {
      const next = { ...prev, [projectId]: { chat: prev[projectId]?.chat ?? [], structuredSummary: s } };
      saveProjectAI(projectId, next[projectId]);
      return next;
    });
  }

  function handleSiteVisitsChange(projectId: string, visits: SiteVisit[]) {
    setSiteVisits(prev => {
      const next = { ...prev, [projectId]: visits };
      saveProjectSiteVisits(projectId, visits);
      return next;
    });
  }

  function handleProposalStateChange(projectId: string, state: ProjectProposalState) {
    setProposalStates(prev => {
      const next = { ...prev, [projectId]: state };
      saveProjectProposal(projectId, state);
      return next;
    });
  }

  function handleCraftsmanStateChange(projectId: string, state: CraftsmanProjectState) {
    setCraftsmanStates(prev => {
      const next = { ...prev, [projectId]: state };
      saveCraftsmanState(projectId, state);
      return next;
    });
  }

  function handleCraftsmanLangChange(lang: CraftsmanLang) {
    setCraftsmanLang(lang);
    saveCraftsmanLang(lang);
  }

  const activeProject = projects.find(p => p.id === openProjectId) ?? null;
  const activeAI = activeProject ? aiState[activeProject.id] : undefined;

  if (screen === 'welcome') {
    return <Welcome onChoose={chooseRole} />;
  }

  if (screen === 'craftsman') {
    // Eagerly load all craftsman states for the project list on first entry
    const loadedCraftsman = craftsmanStates;
    if (Object.keys(loadedCraftsman).length === 0) {
      const all = loadAllCraftsmanState();
      if (Object.keys(all).length > 0) {
        setCraftsmanStates(all);
      }
    }
    return (
      <CraftsmanShell
        projects={projects}
        siteVisits={siteVisits}
        craftsmanState={craftsmanStates}
        onCraftsmanStateChange={handleCraftsmanStateChange}
        lang={craftsmanLang}
        onLangChange={handleCraftsmanLangChange}
        onExitRole={exitRole}
      />
    );
  }

  // Contractor
  return (
    <ContractorShell view={view} setView={(v) => { setView(v); setOpenProjectId(null); }} onExitRole={exitRole}>
      {activeProject ? (
        <ProjectDetail
          project={activeProject}
          onBack={() => setOpenProjectId(null)}
          onSummaryGenerated={(summary) => handleSummaryGenerated(activeProject.id, summary)}
          onStatusChange={(status) => handleStatusChange(activeProject.id, status)}
          chat={activeAI?.chat ?? []}
          structuredSummary={activeAI?.structuredSummary ?? null}
          onChatChange={(chat) => handleChatChange(activeProject.id, chat)}
          onStructuredSummaryChange={(s) => handleStructuredSummaryChange(activeProject.id, s)}
          siteVisits={siteVisits[activeProject.id] ?? []}
          onSiteVisitsChange={(visits) => handleSiteVisitsChange(activeProject.id, visits)}
          proposalState={proposalStates[activeProject.id] ?? { options: null, optionsGeneratedAt: null, selectedTier: null, draft: null, versions: [], sendHistory: [], visualizations: [] }}
          onProposalStateChange={(state) => handleProposalStateChange(activeProject.id, state)}
        />
      ) : view === 'dashboard' ? (
        <Dashboard projects={projects} onOpenProject={openProject} onViewAll={() => setView('projects')} />
      ) : (
        <ProjectsPage projects={projects} onOpenProject={openProject} />
      )}
    </ContractorShell>
  );
}

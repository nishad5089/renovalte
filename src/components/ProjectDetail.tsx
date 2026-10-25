import { useState } from 'react';
import * as Icons from 'lucide-react';
import type { Project, ChatMessage, StructuredSummary, SiteVisit, ProposalOption, ProposalDraft, ProposalVersion, PackageTier, ProjectProposalState, SendRecord } from '../types';
import { statusLabels, statusDotColors, statusBadgeColors, typeLabels, typeIcons, formatEuro } from '../data/projects';
import { buildAISummary } from '../data/ai';
import { createDraftFromOption } from '../data/proposals';
import { Card, Badge, SectionTitle } from './ui';
import { Modal } from './Modal';
import { AIAssistant } from './AIAssistant';
import { SiteVisitPanel } from './SiteVisitPanel';
import { ProposalGenerator } from './ProposalGenerator';
import { ProposalWorkspace } from './ProposalWorkspace';
import { ContractorVisualizationPanel } from './ContractorVisualizationPanel';

interface Props {
  project: Project;
  onBack: () => void;
  onSummaryGenerated: (summary: string) => void;
  onStatusChange: (status: Project['status']) => void;
  chat: ChatMessage[];
  structuredSummary: StructuredSummary | null;
  onChatChange: (chat: ChatMessage[]) => void;
  onStructuredSummaryChange: (s: StructuredSummary | null) => void;
  siteVisits: SiteVisit[];
  onSiteVisitsChange: (visits: SiteVisit[]) => void;
  proposalState: ProjectProposalState;
  onProposalStateChange: (state: ProjectProposalState) => void;
}

export function ProjectDetail({ project, onBack, onSummaryGenerated, onStatusChange, chat, structuredSummary, onChatChange, onStructuredSummaryChange, siteVisits, onSiteVisitsChange, proposalState, onProposalStateChange }: Props) {
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState<string | null>(project.aiSummary);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [siteVisitOpen, setSiteVisitOpen] = useState(false);
  const [proposalOpen, setProposalOpen] = useState(false);

  const Icon = (Icons as any)[typeIcons[project.type]] as React.ComponentType<{ className?: string }>;
  const hasSiteVisit = siteVisits.length > 0;
  const hasDraft = proposalState.draft !== null;

  function generateSummary() {
    setGenerating(true);
    setTimeout(() => {
      const s = buildAISummary(project);
      setSummary(s);
      onSummaryGenerated(s);
      setGenerating(false);
    }, 1500);
  }

  function handleOptionsGenerated(options: ProposalOption[]) {
    onProposalStateChange({ ...proposalState, options, optionsGeneratedAt: Date.now() });
  }

  function handleSelectOption(option: ProposalOption) {
    const draft = createDraftFromOption(project, option);
    onProposalStateChange({ ...proposalState, selectedTier: option.tier, draft });
  }

  function handleDraftChange(draft: ProposalDraft) {
    onProposalStateChange({ ...proposalState, draft });
  }

  function handleSaveVersion() {
    if (!proposalState.draft) return;
    const version: ProposalVersion = {
      id: `ver_${Date.now()}`,
      savedAt: Date.now(),
      label: `Draft ${proposalState.versions.length + 1}`,
      snapshot: { ...proposalState.draft },
    };
    onProposalStateChange({ ...proposalState, versions: [...proposalState.versions, version] });
  }

  function handleRestoreVersion(version: ProposalVersion) {
    onProposalStateChange({ ...proposalState, draft: { ...version.snapshot, updatedAt: Date.now() } });
  }

  function handleSendComplete(record: SendRecord) {
    onProposalStateChange({ ...proposalState, sendHistory: [...proposalState.sendHistory, record] });
    if (record.status === 'success' && project.status !== 'sent') {
      onStatusChange('sent');
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back link + actions */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button onClick={onBack} className="btn-ghost -ml-2 text-sm">
          <Icons.ArrowLeft className="w-4 h-4" /> Back to projects
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setSiteVisitOpen(o => !o)} className="btn-secondary text-sm">
            <Icons.MapPinned className="w-4 h-4" /> {siteVisitOpen ? 'Hide site visit' : 'Site visit'}
            {hasSiteVisit && <span className="w-2 h-2 rounded-full bg-warning-500 ml-1" />}
          </button>
          <button onClick={() => setProposalOpen(o => !o)} className="btn-secondary text-sm">
            <Icons.FileText className="w-4 h-4" /> {proposalOpen ? 'Hide proposal' : 'Proposal'}
            {hasDraft && <span className="w-2 h-2 rounded-full bg-brand-500 ml-1" />}
          </button>
          <button onClick={() => setAssistantOpen(o => !o)} className="btn-primary text-sm">
            <Icons.Sparkles className="w-4 h-4" /> {assistantOpen ? 'Hide AI assistant' : 'Open AI assistant'}
          </button>
        </div>
      </div>

      {/* Header */}
      <Card className="overflow-hidden p-0">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/3 h-48 lg:h-auto relative overflow-hidden">
            <img src={project.photos[0]?.url} alt={project.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 to-transparent lg:bg-gradient-to-r" />
            <div className="absolute top-4 left-4">
              <Badge color={statusBadgeColors[project.status]}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusDotColors[project.status]}`} />
                {statusLabels[project.status]}
              </Badge>
            </div>
          </div>
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs font-500 text-navy-400 uppercase tracking-wide">{project.id} · {typeLabels[project.type]}</p>
                <h1 className="font-display text-2xl font-800 text-navy-900 mt-1">{project.name}</h1>
                <p className="text-sm text-navy-500 mt-1 flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1"><Icons.MapPin className="w-3.5 h-3.5" /> {project.address}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wide text-navy-400 font-500">Budget</p>
                <p className="font-display text-3xl font-800 text-navy-900">{formatEuro(project.budget)}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 flex-wrap">
              <span className="badge bg-navy-50 text-navy-700"><Icons.User className="w-3.5 h-3.5" /> {project.customerName}</span>
              <span className="badge bg-navy-50 text-navy-700"><Icons.Mail className="w-3.5 h-3.5" /> {project.customerEmail}</span>
              <span className="badge bg-navy-50 text-navy-700"><Icons.Calendar className="w-3.5 h-3.5" /> {project.createdAt}</span>
              {project.style && <span className="badge bg-navy-50 text-navy-700"><Icons.Palette className="w-3.5 h-3.5" /> {project.style}</span>}
              {project.rooms && <span className="badge bg-navy-50 text-navy-700">{Icon && <Icon className="w-3.5 h-3.5" />} {project.rooms}</span>}
            </div>
          </div>
        </div>
      </Card>

      {/* AI assistant (collapsible, project-aware) */}
      {assistantOpen && (
        <AIAssistant
          project={project}
          chat={chat}
          structuredSummary={structuredSummary}
          onChatChange={onChatChange}
          onSummaryChange={onStructuredSummaryChange}
        />
      )}

      {/* Site visit (optional, collapsible) */}
      {siteVisitOpen && (
        <SiteVisitPanel
          project={project}
          visits={siteVisits}
          onChange={onSiteVisitsChange}
          originalSummary={summary}
          onSummaryUpdate={(updated) => { setSummary(updated); onSummaryGenerated(updated); }}
        />
      )}

      {/* Proposal generator + workspace (collapsible) */}
      {proposalOpen && (
        <div className="space-y-6">
          <ProposalGenerator
            project={project}
            options={proposalState.options}
            optionsGeneratedAt={proposalState.optionsGeneratedAt}
            onGenerate={(options) => handleOptionsGenerated(options)}
            onSelect={handleSelectOption}
            selectedTier={proposalState.selectedTier}
          />
          {proposalState.draft && (
            <>
              <ContractorVisualizationPanel
                project={project}
                proposalState={proposalState}
                onStateChange={onProposalStateChange}
              />
              <ProposalWorkspace
                project={project}
                draft={proposalState.draft}
                versions={proposalState.versions}
                sendHistory={proposalState.sendHistory}
                visualizations={proposalState.visualizations}
                onDraftChange={handleDraftChange}
                onSaveVersion={handleSaveVersion}
                onRestoreVersion={handleRestoreVersion}
                onSendComplete={handleSendComplete}
              />
            </>
          )}
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: customer requirements + photos + audio */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer requirement */}
          <Card>
            <SectionTitle title="Customer renovation requirement" subtitle="Provided via the Digital Twin customer app (dummy data)" action={
              <Badge color="bg-navy-100 text-navy-700"><Icons.FileText className="w-3.5 h-3.5" /> Requirement</Badge>
            } />
            <blockquote className="border-l-4 border-brand-500 pl-4 text-navy-700 leading-relaxed italic">
              "{project.customerRequirement}"
            </blockquote>
          </Card>

          {/* Photos */}
          <Card>
            <SectionTitle title="Customer Reference Photos" subtitle="Customer-provided reference images" action={
              <Badge color="bg-navy-100 text-navy-700"><Icons.Camera className="w-3.5 h-3.5" /> {project.photos.length}</Badge>
            } />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {project.photos.map(photo => (
                <button key={photo.id} onClick={() => setLightbox(photo.url)} className="group text-left">
                  <div className="relative rounded-xl overflow-hidden border border-navy-100">
                    <img src={photo.url} alt={photo.caption} className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between gap-2">
                      <p className="text-xs text-white font-500 leading-tight">{photo.caption}</p>
                      <Icons.ZoomIn className="w-4 h-4 text-white/80 shrink-0" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Audio transcript */}
          <Card>
            <SectionTitle
              title="Audio interview transcript"
              subtitle="Recorded customer interview — auto-transcribed"
              action={<Badge color="bg-accent-100 text-accent-700"><Icons.Mic className="w-3.5 h-3.5" /> Transcript</Badge>}
            />
            <div className="flex items-start gap-3 p-4 rounded-xl bg-navy-50/60 border border-navy-100">
              <div className="w-9 h-9 rounded-lg bg-accent-100 text-accent-700 flex items-center justify-center shrink-0">
                <Icons.FileAudio className="w-4.5 h-4.5" />
              </div>
              <p className="text-sm text-navy-700 leading-relaxed whitespace-pre-line">{project.audioTranscript}</p>
            </div>
          </Card>
        </div>

        {/* Right column: AI summary panel */}
        <div className="space-y-6">
          <Card className="lg:sticky lg:top-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-white flex items-center justify-center">
                  <Icons.Sparkles className="w-4 h-4" />
                </div>
                <p className="font-display font-700 text-navy-900">AI summary</p>
              </div>
              {summary && <Badge color="bg-success-100 text-success-700"><Icons.CheckCircle2 className="w-3.5 h-3.5" /> Ready</Badge>}
            </div>

            {!summary && !generating && (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-3">
                  <Icons.Sparkles className="w-7 h-7 text-brand-500" />
                </div>
                <p className="text-sm text-navy-600 font-500">No AI summary yet</p>
                <p className="text-xs text-navy-400 mt-1 mb-4">Generate a summary from the customer requirement, photos, and transcript.</p>
                <button onClick={generateSummary} className="btn-primary w-full">
                  <Icons.Sparkles className="w-4 h-4" /> Generate AI summary
                </button>
              </div>
            )}

            {generating && (
              <div className="text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
                  <Icons.Loader2 className="w-7 h-7 text-brand-500 animate-spin" />
                </div>
                <p className="text-sm font-600 text-navy-700">Analysing project…</p>
                <div className="mt-4 space-y-2 text-left">
                  <SkeletonLine width="w-3/4" />
                  <SkeletonLine width="w-full" />
                  <SkeletonLine width="w-5/6" />
                  <SkeletonLine width="w-2/3" />
                </div>
              </div>
            )}

            {summary && !generating && (
              <div className="animate-slide-up">
                <div className="p-4 rounded-xl bg-gradient-to-br from-brand-50/60 to-accent-50/60 border border-brand-100">
                  <div className="whitespace-pre-line text-sm text-navy-700 leading-relaxed">{summary}</div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <button onClick={generateSummary} className="btn-secondary flex-1 text-xs">
                    <Icons.RefreshCw className="w-3.5 h-3.5" /> Regenerate
                  </button>
                  <button onClick={() => setAssistantOpen(true)} className="btn-primary text-xs flex-1">
                    <Icons.MessageSquare className="w-3.5 h-3.5" /> Chat with AI
                  </button>
                </div>
                <p className="mt-3 text-[11px] text-navy-400 flex items-center gap-1">
                  <Icons.Info className="w-3 h-3" /> Simulated AI — no external service.
                </p>
              </div>
            )}
          </Card>

          {/* Budget breakdown mini */}
          <Card>
            <p className="font-display font-700 text-navy-900 mb-3">Budget snapshot</p>
            <div className="space-y-2.5">
              <BudgetRow label="Customer budget" value={formatEuro(project.budget)} strong />
              <BudgetRow label="Materials (est.)" value={formatEuro(Math.round(project.budget * 0.55))} />
              <BudgetRow label="Labour (est.)" value={formatEuro(Math.round(project.budget * 0.30))} />
              <BudgetRow label="Contingency (est.)" value={formatEuro(Math.round(project.budget * 0.15))} />
            </div>
          </Card>
        </div>
      </div>

      {lightbox && (
        <Modal open onClose={() => setLightbox(null)} maxWidth="max-w-3xl">
          <img src={lightbox} alt="Reference" className="w-full rounded-xl" />
        </Modal>
      )}
    </div>
  );
}

function SkeletonLine({ width }: { width: string }) {
  return <div className={`skeleton h-3.5 ${width}`} />;
}

function BudgetRow({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${strong ? 'text-navy-700 font-600' : 'text-navy-500'}`}>{label}</span>
      <span className={`font-600 ${strong ? 'text-navy-900 font-700' : 'text-navy-700'}`}>{value}</span>
    </div>
  );
}

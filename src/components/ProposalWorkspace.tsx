import { useState } from 'react';
import * as Icons from 'lucide-react';
import type { Project, ProposalDraft, ProposalVersion, ProposalWorkStep, ProposalMaterial, SendRecord, ContractorVisualization } from '../types';
import { formatEuro } from '../data/projects';
import { estimateDisclaimer, regenerateScope, regenerateWorkSteps, regenerateMaterials, regenerateAssumptions, regeneratePrice } from '../data/proposals';
import { generateProposalPDF, pdfFilename, preloadVisualizationImages } from '../data/pdf';
import { visualizationDisclaimer } from '../data/visualization';
import { Card, Badge } from './ui';
import { ProposalSender } from './ProposalSender';
import { SendHistoryPanel } from './SendHistoryPanel';

interface Props {
  project: Project;
  draft: ProposalDraft;
  versions: ProposalVersion[];
  sendHistory: SendRecord[];
  visualizations: ContractorVisualization[];
  onDraftChange: (draft: ProposalDraft) => void;
  onSaveVersion: () => void;
  onRestoreVersion: (version: ProposalVersion) => void;
  onSendComplete: (record: SendRecord) => void;
}

type View = 'edit' | 'preview';

let idCounter = 0;
function uid(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

export function ProposalWorkspace({ project, draft, versions, sendHistory, visualizations, onDraftChange, onSaveVersion, onRestoreVersion, onSendComplete }: Props) {
  const safeViz = visualizations ?? [];
  const workSteps = draft.workSteps ?? [];
  const materials = draft.materials ?? [];
  const assumptions = draft.assumptions ?? [];
  const [view, setView] = useState<View>('edit');
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  function update(patch: Partial<ProposalDraft>) {
    onDraftChange({ ...draft, ...patch, updatedAt: Date.now() });
  }

  function handleRegenerate(section: string) {
    setRegenerating(section);
    setTimeout(() => {
      switch (section) {
        case 'scope':
          update({ scope: regenerateScope(project, draft) });
          break;
        case 'workSteps':
          update({ workSteps: regenerateWorkSteps(project, draft) });
          break;
        case 'materials':
          update({ materials: regenerateMaterials(project, draft) });
          break;
        case 'assumptions':
          update({ assumptions: regenerateAssumptions(project, draft) });
          break;
        case 'price': {
          const p = regeneratePrice(draft);
          update({ priceMin: p.min, priceMax: p.max });
          break;
        }
      }
      setRegenerating(null);
    }, 1000);
  }

  return (
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between flex-wrap gap-3 bg-gradient-to-r from-navy-900 to-brand-800 text-white">
        <button
          type="button"
          onClick={() => setCollapsed(c => !c)}
          className="flex items-center gap-2.5 text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shrink-0">
            <Icons.PencilRuler className="w-4 h-4" />
          </div>
          <div className="leading-none">
            <p className="font-display font-700 text-sm">Proposal Workspace</p>
            <p className="text-[10px] text-navy-300 mt-1">Edit, save drafts, preview A4 document</p>
          </div>
          <Icons.ChevronDown className={`w-4 h-4 text-white/80 transition-transform ml-1 ${collapsed ? '' : 'rotate-180'}`} />
        </button>
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/10">
          <TabButton active={view === 'edit'} onClick={() => setView('edit')} icon="Pencil" label="Edit" />
          <TabButton active={view === 'preview'} onClick={() => setView('preview')} icon="FileText" label="A4 Preview" />
          <TabButton active={false} onClick={() => {}} icon="History" label={`History (${versions.length})`} historyMode />
        </div>
      </div>

      {!collapsed && (
      <>
      {/* Disclaimer */}
      <div className="px-5 py-2 bg-warning-50 border-b border-warning-100 flex items-center gap-2 text-xs text-warning-700">
        <Icons.AlertCircle className="w-3.5 h-3.5 shrink-0" />
        <span>{estimateDisclaimer()}</span>
      </div>

      {view === 'edit' ? (
        <div className="p-5 space-y-6">
          {/* Title */}
          <FieldGroup label="Proposal title">
            <input
              value={draft.title}
              onChange={e => update({ title: e.target.value })}
              className="input-field"
            />
          </FieldGroup>

          {/* Scope */}
          <FieldGroup label="Scope" action={
            <button onClick={() => handleRegenerate('scope')} disabled={regenerating === 'scope'} className="btn-secondary text-xs">
              {regenerating === 'scope' ? <Icons.Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icons.RefreshCw className="w-3.5 h-3.5" />} Regenerate
            </button>
          }>
            <textarea
              value={draft.scope}
              onChange={e => update({ scope: e.target.value })}
              rows={5}
              className="input-field resize-y"
            />
          </FieldGroup>

          {/* Work steps */}
          <FieldGroup label="Work steps" action={
            <button onClick={() => handleRegenerate('workSteps')} disabled={regenerating === 'workSteps'} className="btn-secondary text-xs">
              {regenerating === 'workSteps' ? <Icons.Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icons.RefreshCw className="w-3.5 h-3.5" />} Regenerate
            </button>
          }>
            <div className="space-y-2">
              {workSteps.map((step, i) => (
                <div key={step.id} className="flex gap-2 items-start p-3 rounded-xl bg-navy-50/60 border border-navy-100">
                  <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-700 shrink-0">{i + 1}</div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      value={step.title}
                      onChange={e => update({ workSteps: workSteps.map(s => s.id === step.id ? { ...s, title: e.target.value } : s) })}
                      placeholder="Step title"
                      className="input-field text-sm sm:col-span-1"
                    />
                    <input
                      value={step.description}
                      onChange={e => update({ workSteps: workSteps.map(s => s.id === step.id ? { ...s, description: e.target.value } : s) })}
                      placeholder="Description"
                      className="input-field text-sm"
                    />
                    <input
                      value={step.duration}
                      onChange={e => update({ workSteps: workSteps.map(s => s.id === step.id ? { ...s, duration: e.target.value } : s) })}
                      placeholder="Duration"
                      className="input-field text-sm"
                    />
                  </div>
                  <button onClick={() => update({ workSteps: workSteps.filter(s => s.id !== step.id) })} className="btn-ghost p-1.5 rounded-lg text-danger-500 shrink-0">
                    <Icons.Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button onClick={() => update({ workSteps: [...workSteps, { id: uid('step'), title: '', description: '', duration: '' }] })} className="btn-secondary text-xs w-full">
                <Icons.Plus className="w-3.5 h-3.5" /> Add work step
              </button>
            </div>
          </FieldGroup>

          {/* Materials */}
          <FieldGroup label="Materials" action={
            <button onClick={() => handleRegenerate('materials')} disabled={regenerating === 'materials'} className="btn-secondary text-xs">
              {regenerating === 'materials' ? <Icons.Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icons.RefreshCw className="w-3.5 h-3.5" />} Regenerate
            </button>
          }>
            <div className="space-y-2">
              {materials.map((mat) => (
                <div key={mat.id} className="flex gap-2 items-start p-3 rounded-xl bg-navy-50/60 border border-navy-100">
                  <Icons.Box className="w-4 h-4 text-accent-500 mt-1.5 shrink-0" />
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      value={mat.name}
                      onChange={e => update({ materials: materials.map(m => m.id === mat.id ? { ...m, name: e.target.value } : m) })}
                      placeholder="Material name"
                      className="input-field text-sm"
                    />
                    <input
                      value={mat.spec}
                      onChange={e => update({ materials: materials.map(m => m.id === mat.id ? { ...m, spec: e.target.value } : m) })}
                      placeholder="Specification"
                      className="input-field text-sm"
                    />
                    <input
                      value={mat.quantity}
                      onChange={e => update({ materials: materials.map(m => m.id === mat.id ? { ...m, quantity: e.target.value } : m) })}
                      placeholder="Quantity"
                      className="input-field text-sm"
                    />
                  </div>
                  <button onClick={() => update({ materials: materials.filter(m => m.id !== mat.id) })} className="btn-ghost p-1.5 rounded-lg text-danger-500 shrink-0">
                    <Icons.Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button onClick={() => update({ materials: [...materials, { id: uid('mat'), name: '', spec: '', quantity: '' }] })} className="btn-secondary text-xs w-full">
                <Icons.Plus className="w-3.5 h-3.5" /> Add material
              </button>
            </div>
          </FieldGroup>

          {/* Price + timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldGroup label="Price range (min)" action={
              <button onClick={() => handleRegenerate('price')} disabled={regenerating === 'price'} className="btn-secondary text-xs">
                {regenerating === 'price' ? <Icons.Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icons.RefreshCw className="w-3.5 h-3.5" />} Regenerate
              </button>
              }>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-navy-400 font-500">Min (€)</label>
                  <input
                    type="number"
                    value={draft.priceMin}
                    onChange={e => update({ priceMin: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[10px] text-navy-400 font-500">Max (€)</label>
                  <input
                    type="number"
                    value={draft.priceMax}
                    onChange={e => update({ priceMax: Number(e.target.value) })}
                    className="input-field"
                  />
                </div>
              </div>
            </FieldGroup>
            <FieldGroup label="Timeline">
              <input
                value={draft.timeline}
                onChange={e => update({ timeline: e.target.value })}
                className="input-field"
              />
            </FieldGroup>
          </div>

          {/* Assumptions */}
          <FieldGroup label="Assumptions" action={
            <button onClick={() => handleRegenerate('assumptions')} disabled={regenerating === 'assumptions'} className="btn-secondary text-xs">
              {regenerating === 'assumptions' ? <Icons.Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icons.RefreshCw className="w-3.5 h-3.5" />} Regenerate
            </button>
          }>
            <div className="space-y-2">
              {assumptions.map((a, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <input
                    value={a}
                    onChange={e => update({ assumptions: assumptions.map((x, j) => j === i ? e.target.value : x) })}
                    className="input-field text-sm flex-1"
                  />
                  <button onClick={() => update({ assumptions: assumptions.filter((_, j) => j !== i) })} className="btn-ghost p-1.5 rounded-lg text-danger-500 shrink-0">
                    <Icons.Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button onClick={() => update({ assumptions: [...assumptions, ''] })} className="btn-secondary text-xs w-full">
                <Icons.Plus className="w-3.5 h-3.5" /> Add assumption
              </button>
            </div>
          </FieldGroup>

          {/* Save draft */}
          <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-brand-50/60 border border-brand-100">
            <div>
              <p className="text-sm font-600 text-navy-700">Save draft</p>
              <p className="text-xs text-navy-500">Save a versioned snapshot of the current proposal.</p>
            </div>
            <button onClick={onSaveVersion} className="btn-primary">
              <Icons.Save className="w-4 h-4" /> Save draft
            </button>
          </div>

          {/* Version history */}
          {versions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Icons.History className="w-4 h-4 text-navy-500" />
                <p className="font-display font-700 text-navy-900 text-sm">Version history</p>
                <Badge color="bg-navy-100 text-navy-700">{versions.length}</Badge>
              </div>
              <div className="relative pl-6 space-y-2 before:absolute before:left-2 before:top-1 before:bottom-1 before:w-0.5 before:bg-navy-100">
                {versions.map(v => (
                  <div key={v.id} className="relative">
                    <div className="absolute -left-4.5 top-1.5 w-3 h-3 rounded-full bg-brand-500 ring-2 ring-white" />
                    <div className="ml-2 p-3 rounded-xl bg-white border border-navy-100 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-600 text-navy-700">{v.label}</p>
                        <p className="text-[11px] text-navy-400">{new Date(v.savedAt).toLocaleString('en-GB')}</p>
                      </div>
                      <button onClick={() => onRestoreVersion(v)} className="btn-secondary text-xs">
                        <Icons.RotateCcw className="w-3.5 h-3.5" /> Restore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Export & send */}
          <ProposalSender
            project={project}
            draft={draft}
            latestVersion={versions.length > 0 ? versions[versions.length - 1] : null}
            approvedVisualizations={safeViz.filter(v => v.approved)}
            onSendComplete={onSendComplete}
            onDownloadPDF={async () => {
              await preloadVisualizationImages(safeViz.filter(v => v.approved));
              const doc = generateProposalPDF(project, draft, safeViz);
              doc.save(pdfFilename(project, draft));
            }}
          />

          {/* Sent history */}
          <SendHistoryPanel history={sendHistory} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end px-5 pt-4">
            <button onClick={async () => {
              await preloadVisualizationImages(safeViz.filter(v => v.approved));
              const doc = generateProposalPDF(project, draft, safeViz);
              doc.save(pdfFilename(project, draft));
            }} className="btn-primary text-sm">
              <Icons.Download className="w-4 h-4" /> Download PDF
            </button>
          </div>
          <A4Preview project={project} draft={draft} visualizations={safeViz} />
        </div>
      )}
      </>
      )}
    </Card>
  );
}

function TabButton({ active, onClick, icon, label, historyMode }: { active: boolean; onClick: () => void; icon: string; label: string; historyMode?: boolean }) {
  const Icon = (Icons as any)[icon] as React.ComponentType<{ className?: string }>;
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-600 transition ${active ? 'bg-white text-navy-900 shadow-soft' : 'text-navy-200 hover:text-white'}`}>
      {Icon && <Icon className="w-3.5 h-3.5" />}{label}
    </button>
  );
}

function FieldGroup({ label, action, children }: { label: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-2">
        <label className="text-sm font-600 text-navy-700">{label}</label>
        {action}
      </div>
      {children}
    </div>
  );
}

/* ---------- A4 Document Preview ---------- */

function A4Preview({ project, draft, visualizations }: { project: Project; draft: ProposalDraft; visualizations: ContractorVisualization[] }) {
  const safeViz = visualizations ?? [];
  const workSteps = draft.workSteps ?? [];
  const materials = draft.materials ?? [];
  const assumptions = draft.assumptions ?? [];
  return (
    <div className="p-5 bg-navy-50/40 flex justify-center">
      <div className="w-full max-w-[794px] bg-white shadow-lg rounded-sm overflow-hidden" style={{ aspectRatio: '210 / 297', minHeight: '600px' }}>
        <div className="p-10 sm:p-12 flex flex-col" style={{ minHeight: '600px' }}>
          {/* Letterhead */}
          <div className="flex items-start justify-between gap-6 border-b-2 border-navy-900 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-navy-900 to-brand-600 text-white flex items-center justify-center">
                <Icons.Hammer className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display font-800 text-navy-900 text-lg leading-none">RenovAIte</p>
                <p className="text-[9px] text-navy-400 uppercase tracking-wider mt-0.5">AI Renovation Assistant</p>
              </div>
            </div>
            <div className="text-right text-[10px] text-navy-500 leading-tight">
              <p>{new Date(draft.updatedAt).toLocaleDateString('en-GB')}</p>
              <p>{project.id} — {project.city}</p>
            </div>
          </div>

          {/* Title */}
          <h1 className="font-display font-800 text-2xl text-navy-900 mb-1">{draft.title}</h1>
          <p className="text-sm text-navy-500 mb-6">Prepared for {project.customerName} — {project.address}</p>

          {/* Price + duration summary box */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 rounded-lg bg-navy-50 border border-navy-100">
              <p className="text-[9px] uppercase tracking-wide text-navy-400 font-500">Price range</p>
              <p className="font-display font-700 text-navy-900 text-sm">{formatEuro(draft.priceMin)} – {formatEuro(draft.priceMax)}</p>
            </div>
            <div className="p-3 rounded-lg bg-navy-50 border border-navy-100">
              <p className="text-[9px] uppercase tracking-wide text-navy-400 font-500">Duration</p>
              <p className="font-display font-700 text-navy-900 text-sm">{draft.timeline}</p>
            </div>
            <div className="p-3 rounded-lg bg-navy-50 border border-navy-100">
              <p className="text-[9px] uppercase tracking-wide text-navy-400 font-500">Package</p>
              <p className="font-display font-700 text-navy-900 text-sm capitalize">{draft.selectedTier}</p>
            </div>
          </div>

          {/* Scope */}
          <Section heading="Scope of work">
            <p className="text-sm text-navy-700 whitespace-pre-line leading-relaxed">{draft.scope}</p>
          </Section>

          {/* Work steps */}
          <Section heading="Work steps">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-200 text-left text-[10px] uppercase text-navy-400">
                  <th className="py-1.5 font-600 w-6">#</th>
                  <th className="py-1.5 font-600">Step</th>
                  <th className="py-1.5 font-600">Description</th>
                  <th className="py-1.5 font-600 w-24">Duration</th>
                </tr>
              </thead>
              <tbody>
                {workSteps.filter(s => s.title.trim()).map((step, i) => (
                  <tr key={step.id} className="border-b border-navy-50">
                    <td className="py-2 text-navy-400 font-600">{i + 1}</td>
                    <td className="py-2 font-600 text-navy-800">{step.title}</td>
                    <td className="py-2 text-navy-600">{step.description}</td>
                    <td className="py-2 text-navy-600">{step.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* Materials */}
          <Section heading="Materials">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-navy-200 text-left text-[10px] uppercase text-navy-400">
                  <th className="py-1.5 font-600">Material</th>
                  <th className="py-1.5 font-600">Specification</th>
                  <th className="py-1.5 font-600 w-28">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {materials.filter(m => m.name.trim()).map((mat) => (
                  <tr key={mat.id} className="border-b border-navy-50">
                    <td className="py-2 font-600 text-navy-800">{mat.name}</td>
                    <td className="py-2 text-navy-600">{mat.spec}</td>
                    <td className="py-2 text-navy-600">{mat.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {/* Assumptions */}
          <Section heading="Assumptions">
            <ul className="space-y-1">
              {assumptions.filter(a => a.trim()).map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-navy-700">
                  <span className="text-navy-400 font-600 shrink-0">{i + 1}.</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </Section>

          {/* Before & After visualization (approved only) */}
          {safeViz.filter(v => v.approved).length > 0 && (
            <Section heading="Before & After — AI Concept Visualization">
              <div className="space-y-3">
                {safeViz.filter(v => v.approved).map((viz, i) => (
                  <div key={viz.id} className="space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wide text-navy-400 font-500">Concept {i + 1}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <img src={viz.beforePhotoUrl} alt="Before" className="w-full h-28 object-cover rounded-lg border border-navy-100" />
                        <span className="absolute top-1 left-1 badge bg-navy-900/80 text-white text-[8px] font-700">BEFORE</span>
                      </div>
                      <div className="relative">
                        <img src={viz.afterPhotoUrl} alt="After" className="w-full h-28 object-cover rounded-lg border border-brand-200" />
                        <span className="absolute top-1 left-1 badge bg-brand-600 text-white text-[8px] font-700">AFTER</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-navy-500 italic">{viz.prompt}</p>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-warning-600 mt-2 italic">{visualizationDisclaimer()}</p>
            </Section>
          )}

          {/* Footer disclaimer */}
          <div className="mt-auto pt-6 border-t border-navy-100">
            <p className="text-[9px] text-navy-400 leading-relaxed">
              {estimateDisclaimer()} This document is a draft generated by the RenovAIte AI Proposal Generator. Prices, timelines, and specifications are illustrative and have not been verified against supplier quotations or on-site conditions. Final pricing is subject to formal quotation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="font-display font-700 text-navy-900 text-sm uppercase tracking-wide border-b border-navy-100 pb-1.5 mb-2">{heading}</h2>
      {children}
    </div>
  );
}

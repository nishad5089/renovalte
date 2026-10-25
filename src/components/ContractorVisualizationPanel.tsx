import { useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import type { Project, PackageTier, ContractorVisualization, ProjectProposalState } from '../types';
import { Card, Badge } from './ui';
import { sampleBeforeAfter, defaultContractorPrompt, visualizationDisclaimer } from '../data/visualization';

interface Props {
  project: Project;
  proposalState: ProjectProposalState;
  onStateChange: (state: ProjectProposalState) => void;
}

let idCounter = 0;
function uid(): string {
  idCounter += 1;
  return `viz_${Date.now()}_${idCounter}`;
}

const GEN_STEPS = [
  { icon: 'ScanSearch', label: 'Analyzing room' },
  { icon: 'Wand2', label: 'Applying renovation concept' },
  { icon: 'ImagePlus', label: 'Generating visualization' },
  { icon: 'CheckCircle2', label: 'Ready' },
] as const;

export function ContractorVisualizationPanel({ project, proposalState, onStateChange }: Props) {
  const [beforePhoto, setBeforePhoto] = useState<string>(project.photos[0]?.url ?? '');
  const [prompt, setPrompt] = useState<string>(defaultContractorPrompt(project, proposalState.selectedTier));
  const [tier, setTier] = useState<PackageTier | null>(proposalState.selectedTier);
  const [generating, setGenerating] = useState(false);
  const [genStep, setGenStep] = useState(0);
  const [result, setResult] = useState<{ before: string; after: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  const visualizations = proposalState.visualizations ?? [];
  const approvedCount = visualizations.filter(v => v.approved).length;

  function startGenerate() {
    if (!beforePhoto || !prompt.trim()) return;
    setGenerating(true);
    setGenStep(0);
    setResult(null);
    let step = 0;
    const tick = setInterval(() => {
      step += 1;
      if (step >= GEN_STEPS.length) {
        clearInterval(tick);
        return;
      }
      setGenStep(step);
    }, 600);
    setTimeout(() => {
      clearInterval(tick);
      const sample = sampleBeforeAfter(project);
      setResult({ before: beforePhoto, after: sample.after });
      setGenStep(GEN_STEPS.length - 1);
      setGenerating(false);
    }, 2600);
  }

  function approve() {
    if (!result) return;
    const record: ContractorVisualization = {
      id: uid(),
      proposalDraftId: proposalState.draft?.id ?? null,
      beforePhotoUrl: result.before,
      afterPhotoUrl: result.after,
      prompt: prompt.trim(),
      tier,
      approved: true,
      createdAt: Date.now(),
    };
    onStateChange({ ...proposalState, visualizations: [...visualizations, record] });
    setResult(null);
    setToast('Visualization approved and attached to the proposal.');
    setTimeout(() => setToast(null), 2800);
  }

  function loadSample() {
    const sample = sampleBeforeAfter(project);
    setBeforePhoto(project.photos[0]?.url ?? sample.before);
    setPrompt(defaultContractorPrompt(project, proposalState.selectedTier));
    setResult({ before: project.photos[0]?.url ?? sample.before, after: sample.after });
  }

  function setApproved(id: string, approved: boolean) {
    onStateChange({
      ...proposalState,
      visualizations: visualizations.map(v => (v.id === id ? { ...v, approved } : v)),
    });
  }

  function removeVisualization(id: string) {
    onStateChange({
      ...proposalState,
      visualizations: visualizations.filter(v => v.id !== id),
    });
  }

  return (
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <button
        type="button"
        onClick={() => setCollapsed(c => !c)}
        className="w-full px-5 py-4 border-b border-navy-100 flex items-center justify-between bg-gradient-to-r from-navy-900 to-brand-800 text-white"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shrink-0">
            <Icons.Image className="w-4 h-4" />
          </div>
          <div className="leading-none text-left">
            <p className="font-display font-700 text-sm">AI Renovation Visualization</p>
            <p className="text-[10px] text-navy-300 mt-1">Before / after concept rendering · simulated AI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {visualizations.length > 0 && (
            <Badge color="bg-success-100 text-success-700">
              <Icons.CheckCircle2 className="w-3.5 h-3.5" /> {approvedCount}/{visualizations.length} approved
            </Badge>
          )}
          <Icons.ChevronDown className={`w-4 h-4 text-white/80 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </div>
      </button>

      {!collapsed && (
      <div className="p-5 space-y-5">
        {/* Disclaimer banner */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-warning-50 border border-warning-200">
          <Icons.AlertTriangle className="w-4 h-4 text-warning-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-700 text-warning-800">AI Visualization — Concept Only</p>
            <p className="text-[11px] text-warning-700 mt-0.5">{visualizationDisclaimer()}</p>
          </div>
        </div>

        {/* Empty state when no customer photos */}
        {project.photos.length === 0 && !beforePhoto && (
          <div className="flex flex-col items-center justify-center gap-3 py-8 rounded-xl border-2 border-dashed border-navy-200">
            <Icons.ImageOff className="w-8 h-8 text-navy-300" />
            <div className="text-center">
              <p className="text-sm font-600 text-navy-600">No customer photograph available</p>
              <p className="text-xs text-navy-400 mt-1 max-w-xs">Upload a before photo to generate a renovation visualization.</p>
            </div>
            <label className="btn-secondary text-sm cursor-pointer">
              <Icons.Upload className="w-4 h-4" /> Upload before photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => setBeforePhoto(String(reader.result));
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>
        )}

        {/* Before image selector */}
        {beforePhoto ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-600 text-navy-700">Before image</p>
              <button onClick={() => setBeforePhoto('')} className="btn-ghost text-xs text-danger-500">
                <Icons.X className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
            <div className="relative rounded-xl overflow-hidden border border-navy-100">
              <img src={beforePhoto} alt="Before" className="w-full h-52 object-cover" />
              <span className="absolute bottom-2 left-2 badge bg-navy-900/80 text-white text-[10px] font-700">BEFORE</span>
            </div>
          </div>
        ) : (
          project.photos.length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-600 text-navy-700">Select a customer reference photo as the BEFORE image</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {project.photos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => setBeforePhoto(photo.url)}
                    className="group relative rounded-xl overflow-hidden border-2 border-transparent hover:border-brand-400 transition"
                  >
                    <img src={photo.url} alt={photo.caption} className="w-full h-24 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/60 to-transparent opacity-0 group-hover:opacity-100 transition" />
                    <p className="absolute bottom-1 left-1.5 right-1.5 text-[9px] text-white leading-tight opacity-0 group-hover:opacity-100 transition">{photo.caption}</p>
                  </button>
                ))}
                <label className="flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-navy-200 cursor-pointer hover:border-brand-400 transition py-4">
                  <Icons.Upload className="w-5 h-5 text-navy-400" />
                  <span className="text-[10px] text-navy-400">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setBeforePhoto(String(reader.result));
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          )
        )}

        {/* Renovation description input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-sm font-600 text-navy-700">Renovation description</label>
            {proposalState.selectedTier && (
              <Badge color="bg-brand-50 text-brand-700 capitalize">{proposalState.selectedTier} package</Badge>
            )}
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            placeholder="Describe the desired renovated appearance…"
            className="input-field resize-y text-sm"
          />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] text-navy-400">Package context:</span>
            {(['basic', 'standard', 'premium'] as PackageTier[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTier(t); setPrompt(defaultContractorPrompt(project, t)); }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-600 capitalize transition ${tier === t ? 'bg-brand-600 text-white' : 'bg-navy-50 text-navy-500 hover:bg-navy-100'}`}
              >
                {t}
              </button>
            ))}
            <button
              onClick={() => setPrompt(defaultContractorPrompt(project, tier))}
              className="btn-ghost text-[11px] text-navy-500"
            >
              <Icons.RefreshCw className="w-3 h-3" /> Auto-fill
            </button>
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={startGenerate}
          disabled={!beforePhoto || !prompt.trim() || generating}
          className="btn-primary w-full disabled:opacity-50 active:scale-[0.98] transition"
        >
          {generating ? (
            <><Icons.Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
          ) : (
            <><Icons.Sparkles className="w-4 h-4" /> Generate After Renovation</>
          )}
        </button>

        {/* Generation progress steps */}
        {generating && (
          <div className="space-y-2 p-4 rounded-xl bg-navy-50/60 border border-navy-100 animate-fade-in">
            {GEN_STEPS.map((s, i) => {
              const Icon = (Icons as any)[s.icon] as React.ComponentType<{ className?: string }>;
              const done = i < genStep;
              const active = i === genStep;
              return (
                <div key={i} className={`flex items-center gap-2.5 text-sm transition ${done || active ? 'opacity-100' : 'opacity-40'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${done ? 'bg-success-100 text-success-600' : active ? 'bg-brand-100 text-brand-600' : 'bg-navy-100 text-navy-400'}`}>
                    {done ? <Icons.Check className="w-4 h-4" /> : active ? <Icons.Loader2 className="w-4 h-4 animate-spin" /> : Icon && <Icon className="w-4 h-4" />}
                  </div>
                  <span className={`font-500 ${active ? 'text-navy-800' : done ? 'text-navy-600' : 'text-navy-400'}`}>{s.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Side-by-side result */}
        {result && !generating && (
          <div className="space-y-4 animate-slide-up">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icons.GitCompare className="w-4 h-4 text-brand-500" />
                <p className="text-sm font-700 text-navy-800">Before / After comparison</p>
              </div>
              <button onClick={startGenerate} className="btn-secondary text-xs">
                <Icons.RefreshCw className="w-3.5 h-3.5" /> Regenerate
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative rounded-xl overflow-hidden border border-navy-100">
                <img src={result.before} alt="Before" className="w-full h-48 object-cover" />
                <span className="absolute top-2 left-2 badge bg-navy-900/80 text-white text-[10px] font-700">BEFORE</span>
              </div>
              <div className="relative rounded-xl overflow-hidden border border-brand-200">
                <img src={result.after} alt="After" className="w-full h-48 object-cover" />
                <span className="absolute top-2 left-2 badge bg-brand-600 text-white text-[10px] font-700">AFTER</span>
                <span className="absolute top-2 right-2 badge bg-warning-100 text-warning-700 text-[9px] font-700">CONCEPT</span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-warning-50 border border-warning-100">
              <Icons.Info className="w-3.5 h-3.5 text-warning-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-warning-700">{visualizationDisclaimer()}</p>
            </div>

            <button onClick={approve} className="btn-primary w-full active:scale-[0.98] transition">
              <Icons.CheckCircle2 className="w-4 h-4" /> Approve and Attach to Proposal
            </button>
          </div>
        )}

        {/* Quick sample loader */}
        {!result && !generating && project.photos.length > 0 && (
          <button onClick={loadSample} className="btn-ghost text-xs w-full text-navy-500">
            <Icons.Lightbulb className="w-3.5 h-3.5" /> Load matching sample visualization
          </button>
        )}

        {/* Saved visualizations */}
        {visualizations.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-navy-100">
            <div className="flex items-center gap-2">
              <Icons.Images className="w-4 h-4 text-navy-500" />
              <p className="text-sm font-600 text-navy-700">Visualization history</p>
              <span className="badge bg-navy-100 text-navy-600 text-[10px] ml-auto">{visualizations.length}</span>
            </div>
            <div className="space-y-3">
              {[...visualizations].reverse().map((v) => (
                <div key={v.id} className={`rounded-xl border p-3 ${v.approved ? 'border-brand-300 bg-brand-50/40' : 'border-navy-100 bg-navy-50/30'}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {v.approved ? (
                      <Badge color="bg-success-100 text-success-700"><Icons.CheckCircle2 className="w-3 h-3" /> Approved</Badge>
                    ) : (
                      <Badge color="bg-navy-100 text-navy-600"><Icons.Clock className="w-3 h-3" /> Pending</Badge>
                    )}
                    {v.tier && <span className="text-[10px] text-navy-400 capitalize">{v.tier}</span>}
                    <span className="text-[10px] text-navy-400 ml-auto">{new Date(v.createdAt).toLocaleString('en-GB')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <img src={v.beforePhotoUrl} alt="Before" className="w-full h-24 object-cover rounded-lg" />
                    <img src={v.afterPhotoUrl} alt="After" className="w-full h-24 object-cover rounded-lg" />
                  </div>
                  <p className="text-[11px] text-navy-500 leading-relaxed line-clamp-2">{v.prompt}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {v.approved ? (
                      <button onClick={() => setApproved(v.id, false)} className="btn-ghost text-[11px] text-navy-500">
                        <Icons.X className="w-3 h-3" /> Unapprove
                      </button>
                    ) : (
                      <button onClick={() => setApproved(v.id, true)} className="btn-secondary text-[11px]">
                        <Icons.Check className="w-3 h-3" /> Approve
                      </button>
                    )}
                    <button onClick={() => removeVisualization(v.id)} className="btn-ghost text-[11px] text-danger-500 ml-auto">
                      <Icons.Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-xl shadow-lg border bg-success-50 border-success-200 text-success-800 animate-slide-up">
            <div className="flex items-center gap-2">
              <Icons.CheckCircle2 className="w-5 h-5 text-success-600 shrink-0" />
              <p className="text-sm font-600">{toast}</p>
            </div>
          </div>
        )}
      </div>
      )}
    </Card>
  );
}

import { useEffect, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import type { Project, SiteVisit, SiteVisitPhoto, SiteObservation, ObservationCategory, RequirementDiff } from '../types';
import { buildSiteVisitDiff, simulateTranscription, updateSummaryWithObservations } from '../data/ai';
import { Card, Badge, SectionTitle } from './ui';

interface Props {
  project: Project;
  visits: SiteVisit[];
  onChange: (visits: SiteVisit[]) => void;
  originalSummary: string | null;
  onSummaryUpdate: (updated: string) => void;
}

const CATEGORY_META: Record<ObservationCategory, { label: string; icon: string; color: string }> = {
  condition: { label: 'Condition', icon: 'ClipboardCheck', color: 'bg-navy-100 text-navy-700' },
  measurement: { label: 'Measurement', icon: 'Ruler', color: 'bg-brand-50 text-brand-700' },
  damage: { label: 'Damage', icon: 'AlertTriangle', color: 'bg-danger-100 text-danger-700' },
  material: { label: 'Material', icon: 'Boxes', color: 'bg-accent-100 text-accent-700' },
  access: { label: 'Access', icon: 'DoorOpen', color: 'bg-success-100 text-success-700' },
  other: { label: 'Other', icon: 'Dot', color: 'bg-warning-100 text-warning-600' },
};

let idCounter = 0;
function uid(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

// Deterministic placeholder photo (data URI SVG) — keeps site photos local, no network.
function placeholderPhoto(label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#e2e8f0"/><text x="300" y="200" font-family="sans-serif" font-size="28" fill="#64748b" text-anchor="middle">${label}</text><text x="300" y="240" font-family="sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle">Site photo placeholder</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export function SiteVisitPanel({ project, visits, onChange, originalSummary, onSummaryUpdate }: Props) {
  const [newNote, setNewNote] = useState('');
  const [category, setCategory] = useState<ObservationCategory>('condition');
  const [recording, setRecording] = useState(false);
  const [recDuration, setRecDuration] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const recTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeVisit = visits.length > 0 ? visits[visits.length - 1] : null;

  useEffect(() => {
    return () => { if (recTimer.current) clearInterval(recTimer.current); };
  }, []);

  function startVisit() {
    const visit: SiteVisit = {
      id: uid('sv'),
      visitDate: Date.now(),
      photos: [],
      observations: [],
      diffs: [],
      updatedSummary: null,
      updatedSummaryAt: null,
    };
    onChange([...visits, visit]);
  }

  function updateActiveVisit(updater: (v: SiteVisit) => SiteVisit) {
    if (!activeVisit) return;
    const idx = visits.length - 1;
    const updated = { ...activeVisit };
    updater(updated);
    const next = [...visits];
    next[idx] = updated;
    onChange(next);
  }

  function addObservation() {
    const text = newNote.trim();
    if (!text || !activeVisit) return;
    const obs: SiteObservation = {
      id: uid('obs'),
      note: text,
      category,
      recordedAt: Date.now(),
    };
    updateActiveVisit(v => { v.observations = [...v.observations, obs]; return v; });
    setNewNote('');
    recomputeDiffs();
  }

  function addPhoto() {
    if (!activeVisit) return;
    const photo: SiteVisitPhoto = {
      id: uid('ph'),
      url: placeholderPhoto(`Photo ${activeVisit.photos.length + 1}`),
      caption: `Site photo ${activeVisit.photos.length + 1}`,
      uploadedAt: Date.now(),
    };
    updateActiveVisit(v => { v.photos = [...v.photos, photo]; return v; });
  }

  function startRecording() {
    setRecording(true);
    setRecDuration(0);
    recTimer.current = setInterval(() => {
      setRecDuration(d => d + 1);
    }, 1000);
  }

  function stopRecording() {
    if (recTimer.current) clearInterval(recTimer.current);
    setRecording(false);
    setTranscribing(true);
    const dur = recDuration;
    setRecDuration(0);
    // Simulate transcription delay
    setTimeout(() => {
      const transcript = simulateTranscription(project, dur);
      const obs: SiteObservation = {
        id: uid('obs'),
        note: transcript,
        category: 'condition',
        recordedAt: Date.now(),
        transcript: `[Voice note — ${dur}s recording]\n${transcript}`,
      };
      updateActiveVisit(v => { v.observations = [...v.observations, obs]; return v; });
      setTranscribing(false);
      recomputeDiffs();
    }, 1400);
  }

  function recomputeDiffs() {
    if (!activeVisit) return;
    // Use latest observations from the visit we're about to commit
    const idx = visits.length - 1;
    const visit = visits[idx];
    if (!visit) return;
    const diffs = buildSiteVisitDiff(project, visit.observations);
    updateActiveVisit(v => { v.diffs = diffs; return v; });
  }

  function updateSummary() {
    if (!activeVisit || !originalSummary) return;
    const updated = updateSummaryWithObservations(project, originalSummary, activeVisit);
    updateActiveVisit(v => { v.updatedSummary = updated; v.updatedSummaryAt = Date.now(); return v; });
    onSummaryUpdate(updated);
  }

  return (
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <button
        type="button"
        onClick={() => setCollapsed(c => !c)}
        className="w-full px-5 py-4 border-b border-navy-100 flex items-center justify-between bg-gradient-to-r from-navy-900 to-navy-800 text-white"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-warning-500 to-brand-500 flex items-center justify-center shrink-0">
            <Icons.ClipboardCheck className="w-4 h-4" />
          </div>
          <div className="leading-none text-left">
            <p className="font-display font-700 text-sm">Site Visit</p>
            <p className="text-[10px] text-navy-300 mt-1">Optional inspection workflow</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeVisit && <Badge color="bg-success-100 text-success-700"><Icons.CheckCircle2 className="w-3.5 h-3.5" /> Active visit</Badge>}
          <Icons.ChevronDown className={`w-4 h-4 text-white/80 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </div>
      </button>

      {!collapsed && (
      <div className="p-5 space-y-6">
        {!activeVisit ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-warning-50 flex items-center justify-center mx-auto mb-3">
              <Icons.MapPinned className="w-7 h-7 text-warning-500" />
            </div>
            <p className="text-sm font-600 text-navy-700">No site visit yet</p>
            <p className="text-xs text-navy-400 mt-1 max-w-xs mx-auto mb-4">
              A site visit is optional. You can generate a preliminary proposal directly from the AI summary. Start a visit to add photos, observations, and voice notes.
            </p>
            <button onClick={startVisit} className="btn-primary">
              <Icons.MapPinned className="w-4 h-4" /> Start site visit
            </button>
          </div>
        ) : (
          <>
            {/* Visit meta */}
            <div className="flex items-center gap-3 flex-wrap text-xs text-navy-500">
              <span className="flex items-center gap-1"><Icons.Calendar className="w-3.5 h-3.5" /> {new Date(activeVisit.visitDate).toLocaleString('en-GB')}</span>
              <span className="flex items-center gap-1"><Icons.Camera className="w-3.5 h-3.5" /> {activeVisit.photos.length} photo(s)</span>
              <span className="flex items-center gap-1"><Icons.List className="w-3.5 h-3.5" /> {activeVisit.observations.length} observation(s)</span>
            </div>

            {/* Upload photos */}
            <div>
              <SectionTitle title="Site photographs" subtitle="Upload photos from your site inspection" action={
                <button onClick={addPhoto} className="btn-secondary text-xs" disabled={!activeVisit}>
                  <Icons.Plus className="w-3.5 h-3.5" /> Add photo
                </button>
              } />
              {activeVisit.photos.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-navy-200 py-8 text-center">
                  <Icons.ImagePlus className="w-8 h-8 text-navy-300 mx-auto mb-2" />
                  <p className="text-xs text-navy-400">No site photos yet. Click "Add photo" to simulate an upload.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {activeVisit.photos.map(ph => (
                    <div key={ph.id} className="relative rounded-xl overflow-hidden border border-navy-100">
                      <img src={ph.url} alt={ph.caption} className="w-full h-28 object-cover" />
                      <div className="absolute bottom-1 left-2 right-2">
                        <p className="text-[10px] text-white font-500 drop-shadow">{ph.caption}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add observation */}
            <div>
              <SectionTitle title="Written observation" subtitle="Add a note about what you found on site" />
              <div className="flex gap-2 mb-3 flex-wrap">
                {(Object.keys(CATEGORY_META) as ObservationCategory[]).map(cat => {
                  const m = CATEGORY_META[cat];
                  const Icon = (Icons as any)[m.icon] as React.ComponentType<{ className?: string }>;
                  return (
                    <button key={cat} onClick={() => setCategory(cat)}
                      className={`badge transition ${category === cat ? m.color + ' ring-2 ring-offset-1 ring-' + (cat === 'damage' ? 'danger' : 'brand') + '-300' : 'bg-navy-50 text-navy-500 hover:bg-navy-100'}`}>
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      {m.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2">
                <textarea
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); addObservation(); } }}
                  rows={2}
                  placeholder="e.g. Moisture marks found behind cabinets. Countertop dimensions need verification."
                  className="input-field flex-1 resize-none"
                />
                <button onClick={addObservation} disabled={!newNote.trim()} className="btn-primary shrink-0 px-4">
                  <Icons.Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>

            {/* Voice recording simulation */}
            <div>
              <SectionTitle title="Voice note" subtitle="Simulate recording a voice observation — auto-transcribed" />
              <div className="flex items-center gap-3 p-4 rounded-xl bg-navy-50/60 border border-navy-100">
                {!recording && !transcribing ? (
                  <button onClick={startRecording} className="btn-secondary">
                    <Icons.Mic className="w-4 h-4" /> Start recording
                  </button>
                ) : recording ? (
                  <>
                    <div className="flex items-center gap-2 text-danger-600">
                      <Icons.Circle className="w-3 h-3 fill-danger-500 animate-pulse" />
                      <span className="font-600 text-sm tabular-nums">{formatDuration(recDuration)}</span>
                    </div>
                    <button onClick={stopRecording} className="btn-primary">
                      <Icons.Square className="w-4 h-4" /> Stop & transcribe
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-navy-500">
                    <Icons.Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Transcribing…</span>
                  </div>
                )}
              </div>
            </div>

            {/* Observations list / timeline */}
            <div>
              <SectionTitle title="Inspection timeline" subtitle="Chronological log of all observations" action={
                <Badge color="bg-navy-100 text-navy-700">{activeVisit.observations.length}</Badge>
              } />
              {activeVisit.observations.length === 0 ? (
                <p className="text-xs text-navy-400 py-4 text-center">No observations recorded yet.</p>
              ) : (
                <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-1 before:bottom-1 before:w-0.5 before:bg-navy-100">
                  {activeVisit.observations.map(obs => {
                    const m = CATEGORY_META[obs.category];
                    const Icon = (Icons as any)[m.icon] as React.ComponentType<{ className?: string }>;
                    return (
                      <div key={obs.id} className="relative animate-slide-up">
                        <div className={`absolute -left-4.5 top-1 w-3.5 h-3.5 rounded-full ${m.color.split(' ')[0]} ring-2 ring-white`} />
                        <div className="ml-2 p-3 rounded-xl bg-white border border-navy-100">
                          <div className="flex items-center gap-2 mb-1">
                            {Icon && <Icon className={`w-3.5 h-3.5 ${m.color.split(' ')[1]}`} />}
                            <span className={`badge ${m.color} text-[10px]`}>{m.label}</span>
                            <span className="text-[10px] text-navy-400 ml-auto">{new Date(obs.recordedAt).toLocaleTimeString('en-GB')}</span>
                          </div>
                          {obs.transcript ? (
                            <p className="text-sm text-navy-700 whitespace-pre-line leading-relaxed">{obs.transcript}</p>
                          ) : (
                            <p className="text-sm text-navy-700 leading-relaxed">{obs.note}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Requirement vs site findings diff */}
            {activeVisit.diffs.length > 0 && (
              <div>
                <SectionTitle title="Requirement vs. site findings" subtitle="Differences between original requirements and on-site findings" />
                <div className="space-y-3">
                  {activeVisit.diffs.map((d, i) => <DiffRow key={i} diff={d} />)}
                </div>
              </div>
            )}

            {/* Update AI summary */}
            <div className="rounded-xl bg-gradient-to-br from-brand-50/60 to-accent-50/60 border border-brand-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icons.Sparkles className="w-4 h-4 text-brand-600" />
                <p className="font-display font-700 text-navy-900 text-sm">Update AI summary with site findings</p>
              </div>
              {activeVisit.updatedSummary ? (
                <>
                  <p className="text-xs text-success-600 flex items-center gap-1 mb-2">
                    <Icons.CheckCircle2 className="w-3.5 h-3.5" /> Summary updated {new Date(activeVisit.updatedSummaryAt ?? 0).toLocaleString('en-GB')}
                  </p>
                  <div className="p-3 rounded-lg bg-white border border-navy-100 text-sm text-navy-700 whitespace-pre-line max-h-48 overflow-y-auto scrollbar-thin">
                    {activeVisit.updatedSummary}
                  </div>
                  <button onClick={updateSummary} className="btn-secondary text-xs mt-3">
                    <Icons.RefreshCw className="w-3.5 h-3.5" /> Regenerate update
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs text-navy-500 mb-3">Incorporate site observations, diffs, and photos into the project AI summary. Original summary is preserved.</p>
                  <button onClick={updateSummary} disabled={!originalSummary} className="btn-primary w-full">
                    <Icons.Sparkles className="w-4 h-4" /> {originalSummary ? 'Update summary with observations' : 'Generate AI summary first'}
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
      )}
    </Card>
  );
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function DiffRow({ diff }: { diff: RequirementDiff }) {
  const impactMeta: Record<RequirementDiff['impact'], { label: string; color: string; icon: string }> = {
    confirmed: { label: 'Confirmed', color: 'bg-success-100 text-success-700', icon: 'CheckCircle2' },
    discrepancy: { label: 'Discrepancy', color: 'bg-danger-100 text-danger-700', icon: 'AlertTriangle' },
    additional: { label: 'Additional', color: 'bg-accent-100 text-accent-700', icon: 'PlusCircle' },
  };
  const m = impactMeta[diff.impact];
  const Icon = (Icons as any)[m.icon] as React.ComponentType<{ className?: string }>;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-white border border-navy-100">
      <div className="flex items-center gap-2">
        {Icon && <Icon className={`w-4 h-4 ${m.color.split(' ')[1]}`} />}
        <div>
          <p className="text-xs font-600 text-navy-700">{diff.field}</p>
          <span className={`badge ${m.color} text-[10px] mt-1`}>{m.label}</span>
        </div>
      </div>
      <div className="sm:col-span-1">
        <p className="text-[10px] uppercase tracking-wide text-navy-400 mb-1">Original requirement</p>
        <p className="text-xs text-navy-600 leading-relaxed">{diff.original}</p>
      </div>
      <div className="sm:col-span-1">
        <p className="text-[10px] uppercase tracking-wide text-navy-400 mb-1">Site finding</p>
        <p className="text-xs text-navy-800 leading-relaxed font-500">{diff.siteFinding}</p>
      </div>
    </div>
  );
}

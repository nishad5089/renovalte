import { useEffect, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import type { Project, SiteVisit, CraftsmanLang, CraftsmanProjectState, CraftsmanMessage, CraftsmanPhoto, QuestionRecord, GuidanceStep, VisualizationRecord } from '../types';
import { typeLabels, typeIcons, formatEuro } from '../data/projects';
import { getCraftsmanI18n, getSuggestedQuestions, type CraftsmanI18n } from '../data/craftsman-i18n';
import { craftsmanAIReply, simulateCraftsmanTranscription, generateGuidance } from '../data/craftsman-ai';
import { defaultPrompt, selectAfterImage, EXAMPLE_AFTER_KITCHEN_URL } from '../data/visualization';
import { Logo } from './ui';

export type CraftsmanTab = 'home' | 'context' | 'chat' | 'guidance' | 'visual' | 'history';

interface Props {
  projects: Project[];
  siteVisits: Record<string, SiteVisit[]>;
  craftsmanState: Record<string, CraftsmanProjectState>;
  onCraftsmanStateChange: (projectId: string, state: CraftsmanProjectState) => void;
  lang: CraftsmanLang;
  onLangChange: (lang: CraftsmanLang) => void;
  onExitRole: () => void;
}

let idCounter = 0;
function uid(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

// Placeholder photo data URI
function placeholderPhoto(label: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="#e2e8f0"/><text x="300" y="200" font-family="sans-serif" font-size="28" fill="#64748b" text-anchor="middle">${label}</text><text x="300" y="240" font-family="sans-serif" font-size="16" fill="#94a3b8" text-anchor="middle">Site photo</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export function CraftsmanShell({ projects, siteVisits, craftsmanState, onCraftsmanStateChange, lang, onLangChange, onExitRole }: Props) {
  const [tab, setTab] = useState<CraftsmanTab>('home');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const t = getCraftsmanI18n(lang);

  const selectedProject = projects.find(p => p.id === selectedProjectId) ?? null;
  const projectState = selectedProjectId ? (craftsmanState[selectedProjectId] ?? emptyCraftsmanState()) : null;

  function handleStateChange(projectId: string, state: CraftsmanProjectState) {
    onCraftsmanStateChange(projectId, state);
  }

  // No project selected — force home tab (in an effect to avoid render-loop)
  useEffect(() => {
    if (!selectedProject && tab !== 'home') {
      setTab('home');
    }
  }, [selectedProject, tab]);

  return (
    <div className="min-h-screen bg-navy-50/40 flex flex-col max-w-md mx-auto" style={{ minHeight: '100dvh' }}>
      {/* Header */}
      <header className="px-4 py-3 flex items-center justify-between bg-gradient-to-r from-navy-900 to-navy-800 text-white sticky top-0 z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-brand-500 flex items-center justify-center shrink-0">
            <Icons.HardHat className="w-5 h-5" />
          </div>
          <div className="leading-none">
            <p className="font-display font-800 text-sm">{t.appName}</p>
            <p className="text-[10px] text-navy-300 uppercase tracking-wider mt-1">{t.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div className="flex p-0.5 rounded-lg bg-white/10">
            <button
              onClick={() => onLangChange('en')}
              className={`px-2.5 py-1 rounded-md text-xs font-700 transition ${lang === 'en' ? 'bg-white text-navy-900' : 'text-navy-200'}`}
            >
              EN
            </button>
            <button
              onClick={() => onLangChange('de')}
              className={`px-2.5 py-1 rounded-md text-xs font-700 transition ${lang === 'de' ? 'bg-white text-navy-900' : 'text-navy-200'}`}
            >
              DE
            </button>
          </div>
          <button onClick={onExitRole} className="btn bg-white/10 text-white border border-white/20 hover:bg-white/20 px-3 py-2 rounded-lg text-xs">
            <Icons.ArrowLeftRight className="w-4 h-4" /> <span className="hidden sm:inline">{t.switchRole}</span>
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {tab === 'home' && (
          <CraftsmanHome
            t={t}
            lang={lang}
            projects={projects}
            siteVisits={siteVisits}
            craftsmanState={craftsmanState}
            selectedProjectId={selectedProjectId}
            onSelectProject={(id) => { setSelectedProjectId(id); setTab('context'); }}
          />
        )}
        {tab === 'context' && selectedProject && (
          <CraftsmanContext
            t={t}
            project={selectedProject}
            siteVisits={siteVisits[selectedProject.id] ?? []}
          />
        )}
        {tab === 'chat' && selectedProject && projectState && (
          <CraftsmanChat
            t={t}
            lang={lang}
            project={selectedProject}
            state={projectState}
            onStateChange={(s) => handleStateChange(selectedProject.id, s)}
          />
        )}
        {tab === 'guidance' && selectedProject && projectState && (
          <CraftsmanGuidance
            t={t}
            lang={lang}
            project={selectedProject}
            state={projectState}
            onStateChange={(s) => handleStateChange(selectedProject.id, s)}
          />
        )}
        {tab === 'visual' && selectedProject && projectState && (
          <CraftsmanVisualization
            t={t}
            lang={lang}
            project={selectedProject}
            state={projectState}
            onStateChange={(s) => handleStateChange(selectedProject.id, s)}
          />
        )}
        {tab === 'history' && selectedProject && projectState && (
          <CraftsmanHistory
            t={t}
            project={selectedProject}
            state={projectState}
          />
        )}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-navy-100 z-40">
        <div className="grid grid-cols-6 gap-0.5 px-1 py-1.5">
          <NavButton active={tab === 'home'} onClick={() => setTab('home')} icon="Home" label={t.navHome} />
          <NavButton active={tab === 'context'} onClick={() => selectedProject && setTab('context')} icon="ClipboardList" label={t.navContext} disabled={!selectedProject} />
          <NavButton active={tab === 'chat'} onClick={() => selectedProject && setTab('chat')} icon="MessageSquare" label={t.navChat} disabled={!selectedProject} badge={projectState ? projectState.chat.length : 0} />
          <NavButton active={tab === 'guidance'} onClick={() => selectedProject && setTab('guidance')} icon="ListChecks" label={t.navGuidance} disabled={!selectedProject} />
          <NavButton active={tab === 'visual'} onClick={() => selectedProject && setTab('visual')} icon="Image" label={t.navVisual} disabled={!selectedProject} badge={projectState ? projectState.visualizations.length : 0} />
          <NavButton active={tab === 'history'} onClick={() => selectedProject && setTab('history')} icon="History" label={t.navHistory} disabled={!selectedProject} />
        </div>
      </nav>
    </div>
  );
}

function emptyCraftsmanState(): CraftsmanProjectState {
  return { chat: [], photos: [], questions: [], guidance: [], guidanceGeneratedFor: null, visualizations: [], activeVisualizationId: null };
}

function NavButton({ active, onClick, icon, label, disabled, badge }: { active: boolean; onClick: () => void; icon: string; label: string; disabled?: boolean; badge?: number }) {
  const Icon = (Icons as any)[icon] as React.ComponentType<{ className?: string }>;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-0.5 py-2 rounded-xl transition-all min-h-[52px] touch-target ${active ? 'text-brand-600 bg-brand-50' : 'text-navy-400'} ${disabled ? 'opacity-40' : 'active:scale-95'}`}
    >
      <div className="relative">
        {Icon && <Icon className={`w-6 h-6 ${active ? 'stroke-2.5' : ''}`} />}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-brand-500 text-white text-[9px] font-700 flex items-center justify-center">{badge > 9 ? '9+' : badge}</span>
        )}
      </div>
      <span className="text-[10px] font-600 leading-none">{label}</span>
    </button>
  );
}

/* ============================================================
 * HOME — project selection
 * ============================================================ */

function CraftsmanHome({ t, lang, projects, siteVisits, craftsmanState, selectedProjectId, onSelectProject }: {
  t: CraftsmanI18n;
  lang: CraftsmanLang;
  projects: Project[];
  siteVisits: Record<string, SiteVisit[]>;
  craftsmanState: Record<string, CraftsmanProjectState>;
  selectedProjectId: string | null;
  onSelectProject: (id: string) => void;
}) {
  const recentProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;

  return (
    <div className="px-4 py-5 space-y-5 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="font-display text-2xl font-800 text-navy-900">{t.welcome}</h1>
        <p className="text-sm text-navy-500 mt-1">{t.selectProjectDesc}</p>
      </div>

      {/* Continue recent project */}
      {recentProject && (
        <button
          onClick={() => onSelectProject(recentProject.id)}
          className="w-full text-left p-4 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-soft active:scale-[0.98] transition"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Icons.PlayCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wide text-white/80 font-600">{lang === 'de' ? 'Fortsetzen' : 'Continue'}</p>
              <p className="font-display font-700 text-sm leading-tight">{recentProject.name}</p>
              <p className="text-[11px] text-white/80 mt-0.5">{recentProject.id} · {recentProject.city}</p>
            </div>
          </div>
        </button>
      )}

      {/* Project list */}
      <div>
        <p className="text-xs font-700 text-navy-500 uppercase tracking-wide mb-3">{t.selectProject}</p>
        <div className="space-y-3">
          {projects.length === 0 && <p className="text-sm text-navy-400 text-center py-8">{t.noProjects}</p>}
          {projects.map(p => {
            const Icon = (Icons as any)[typeIcons[p.type]] as React.ComponentType<{ className?: string }>;
            const photo = p.photos[0]?.url;
            const visitCount = (siteVisits[p.id] ?? []).length;
            const questionCount = (craftsmanState[p.id]?.questions ?? []).length;
            return (
              <button
                key={p.id}
                onClick={() => onSelectProject(p.id)}
                className="w-full text-left card-surface p-4 active:scale-[0.98] transition hover:border-brand-300"
              >
                <div className="flex items-center gap-3">
                  {photo ? (
                    <img src={photo} alt={p.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-navy-100 flex items-center justify-center shrink-0">
                      {Icon && <Icon className="w-6 h-6 text-navy-400" />}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-700 text-navy-900 text-sm truncate">{p.name}</p>
                    <p className="text-[11px] text-navy-500 flex items-center gap-1.5 mt-0.5">
                      {Icon && <Icon className="w-3 h-3" />}{typeLabels[p.type]}
                      <span>·</span>
                      <Icons.MapPin className="w-3 h-3" />{p.city}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {visitCount > 0 && <span className="badge bg-warning-50 text-warning-600 text-[10px]"><Icons.ClipboardCheck className="w-2.5 h-2.5" />{visitCount} {visitCount === 1 ? 'visit' : 'visits'}</span>}
                      {questionCount > 0 && <span className="badge bg-brand-50 text-brand-600 text-[10px]"><Icons.MessageSquare className="w-2.5 h-2.5" />{questionCount} Q</span>}
                    </div>
                  </div>
                  <Icons.ChevronRight className="w-5 h-5 text-navy-300 shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
 * CONTEXT — renovation requirements + site observations
 * ============================================================ */

function CraftsmanContext({ t, project, siteVisits }: { t: CraftsmanI18n; project: Project; siteVisits: SiteVisit[] }) {
  const Icon = (Icons as any)[typeIcons[project.type]] as React.ComponentType<{ className?: string }>;
  const allObservations = siteVisits.flatMap(v => v.observations);

  return (
    <div className="px-4 py-5 space-y-5 animate-fade-in">
      {/* Project header */}
      <div className="card-surface p-4">
        <div className="flex items-center gap-3 mb-3">
          {project.photos[0] && <img src={project.photos[0].url} alt={project.name} className="w-14 h-14 rounded-xl object-cover shrink-0" />}
          <div>
            <p className="text-[10px] font-700 text-navy-400 uppercase">{project.id}</p>
            <p className="font-display font-700 text-navy-900 text-sm">{project.name}</p>
            <p className="text-xs text-navy-500 flex items-center gap-1 mt-0.5">
              {Icon && <Icon className="w-3.5 h-3.5" />}{typeLabels[project.type]} · {project.city}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <InfoChip icon="DoorOpen" label={t.rooms} value={project.rooms ?? '—'} />
          <InfoChip icon="Calendar" label={t.timeline} value={project.timeline ?? '—'} />
          <InfoChip icon="Palette" label={t.style} value={project.style ?? '—'} />
          <InfoChip icon="Euro" label={lang_budget()} value={formatEuro(project.budget)} />
        </div>
      </div>

      {/* Customer requirement */}
      <div className="card-surface p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Icons.FileText className="w-4.5 h-4.5" />
          </div>
          <p className="font-display font-700 text-navy-900 text-sm">{t.customerRequirement}</p>
        </div>
        <blockquote className="border-l-4 border-brand-500 pl-3 text-sm text-navy-700 leading-relaxed italic">
          "{project.customerRequirement}"
        </blockquote>
      </div>

      {/* Site observations */}
      <div className="card-surface p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-warning-50 text-warning-600 flex items-center justify-center shrink-0">
            <Icons.ClipboardCheck className="w-4.5 h-4.5" />
          </div>
          <p className="font-display font-700 text-navy-900 text-sm">{t.siteObservations}</p>
        </div>
        {allObservations.length === 0 ? (
          <p className="text-sm text-navy-400 text-center py-4">{t.noObservations}</p>
        ) : (
          <div className="space-y-2">
            {allObservations.map(obs => (
              <div key={obs.id} className="p-3 rounded-xl bg-navy-50/60 border border-navy-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="badge bg-navy-100 text-navy-600 text-[10px] capitalize">{obs.category}</span>
                  <span className="text-[10px] text-navy-400 ml-auto">{new Date(obs.recordedAt).toLocaleDateString('en-GB')}</span>
                </div>
                <p className="text-sm text-navy-700">{obs.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  function lang_budget() { return 'Budget'; }
}

function InfoChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  const Icon = (Icons as any)[icon] as React.ComponentType<{ className?: string }>;
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-navy-50/60">
      {Icon && <Icon className="w-4 h-4 text-navy-400 shrink-0" />}
      <div className="min-w-0">
        <p className="text-[9px] uppercase text-navy-400 font-600">{label}</p>
        <p className="text-xs text-navy-700 font-500 truncate">{value}</p>
      </div>
    </div>
  );
}

/* ============================================================
 * CHAT — text input, photo upload, voice transcription
 * ============================================================ */

function CraftsmanChat({ t, lang, project, state, onStateChange }: {
  t: CraftsmanI18n;
  lang: CraftsmanLang;
  project: Project;
  state: CraftsmanProjectState;
  onStateChange: (s: CraftsmanProjectState) => void;
}) {
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recDuration, setRecDuration] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [state.chat, thinking]);

  useEffect(() => () => { if (recTimer.current) clearInterval(recTimer.current); }, []);

  function sendQuestion(question: string) {
    if (!question.trim()) return;
    const userMsg: CraftsmanMessage = { id: uid('msg'), role: 'user', content: question, timestamp: Date.now() };
    const newChat = [...state.chat, userMsg];
    onStateChange({ ...state, chat: newChat });
    setInput('');
    setThinking(true);

    setTimeout(() => {
      const response = craftsmanAIReply(question, project, lang);
      const aiMsg: CraftsmanMessage = {
        id: uid('msg'),
        role: response.warningType !== 'none' ? 'warning' : 'assistant',
        content: response.content,
        timestamp: Date.now(),
        warningType: response.warningType,
      };
      const withAI = [...newChat, aiMsg];
      // Save question to history
      const record: QuestionRecord = {
        id: uid('q'),
        question,
        answer: response.content,
        askedAt: Date.now(),
        category: response.category,
      };
      onStateChange({ ...state, chat: withAI, questions: [...state.questions, record] });
      setThinking(false);
    }, 900);
  }

  function addPhoto() {
    const photo: CraftsmanPhoto = {
      id: uid('ph'),
      url: placeholderPhoto(`Photo ${state.photos.length + 1}`),
      caption: `Site photo ${state.photos.length + 1}`,
      uploadedAt: Date.now(),
    };
    onStateChange({ ...state, photos: [...state.photos, photo] });
    // Add a system message noting the photo
    const sysMsg: CraftsmanMessage = {
      id: uid('msg'),
      role: 'system',
      content: lang === 'de' ? `Foto hochgeladen: ${photo.caption}` : `Photo uploaded: ${photo.caption}`,
      timestamp: Date.now(),
      photoId: photo.id,
    };
    onStateChange({ ...state, chat: [...state.chat, sysMsg], photos: [...state.photos, photo] });
  }

  function startRecording() {
    setRecording(true);
    setRecDuration(0);
    recTimer.current = setInterval(() => setRecDuration(d => d + 1), 1000);
  }

  function stopRecording() {
    if (recTimer.current) clearInterval(recTimer.current);
    setRecording(false);
    setTranscribing(true);
    const dur = recDuration;
    setRecDuration(0);
    setTimeout(() => {
      const transcript = simulateCraftsmanTranscription(project, dur, lang);
      setTranscribing(false);
      // Auto-send the transcription as a question
      sendQuestion(transcript);
    }, 1200);
  }

  const suggestions = getSuggestedQuestions(lang);

  return (
    <div className="flex flex-col h-full animate-fade-in" style={{ minHeight: 'calc(100dvh - 130px)' }}>
      {/* Chat scroll area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {state.chat.length === 0 && !thinking && (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-3">
              <Icons.MessageSquare className="w-7 h-7 text-brand-500" />
            </div>
            <p className="text-sm font-600 text-navy-700">{lang === 'de' ? 'Fragen Sie die KI' : 'Ask the AI'}</p>
            <p className="text-xs text-navy-400 mt-1 max-w-xs mx-auto">{t.simulatedAI}</p>
          </div>
        )}

        {state.chat.map(m => <ChatBubble key={m.id} message={m} />)}

        {thinking && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-navy-100 w-fit">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-navy-300 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-navy-300 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-navy-300 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {transcribing && (
          <div className="flex items-center gap-2 text-navy-500 px-2">
            <Icons.Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">{t.transcribing}</span>
          </div>
        )}
      </div>

      {/* Suggested questions */}
      <div className="px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-navy-100 bg-white">
        {suggestions.map((q, i) => (
          <button key={i} onClick={() => sendQuestion(q)} disabled={thinking} className="badge bg-brand-50 text-brand-700 hover:bg-brand-100 whitespace-nowrap shrink-0 disabled:opacity-50 text-xs">
            {q}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="px-3 py-3 bg-white border-t border-navy-100 flex items-center gap-2">
        {/* Photo button */}
        <button onClick={addPhoto} disabled={recording || transcribing} className="btn-ghost p-2.5 rounded-xl shrink-0 text-navy-500 hover:bg-navy-50 active:scale-95 disabled:opacity-50">
          <Icons.Camera className="w-5 h-5" />
        </button>

        {/* Voice or text input */}
        {recording ? (
          <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-danger-50 border border-danger-200">
            <Icons.Circle className="w-3 h-3 fill-danger-500 text-danger-500 animate-pulse" />
            <span className="text-sm font-600 text-danger-600 tabular-nums">{formatDuration(recDuration)}</span>
            <button onClick={stopRecording} className="btn-primary text-xs ml-auto py-1.5 px-3">
              <Icons.Square className="w-3.5 h-3.5" /> {t.stopTranscribe}
            </button>
          </div>
        ) : (
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); sendQuestion(input); } }}
            placeholder={t.askQuestion}
            disabled={thinking}
            className="input-field flex-1"
          />
        )}

        {/* Voice button */}
        {!recording && (
          <button onClick={startRecording} disabled={thinking || transcribing} className="btn-ghost p-2.5 rounded-xl shrink-0 text-navy-500 hover:bg-navy-50 active:scale-95 disabled:opacity-50">
            <Icons.Mic className="w-5 h-5" />
          </button>
        )}

        {/* Send button */}
        {!recording && (
          <button onClick={() => sendQuestion(input)} disabled={!input.trim() || thinking} className="btn-primary p-2.5 rounded-xl shrink-0 active:scale-95 disabled:opacity-50">
            <Icons.Send className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Disclaimer */}
      <div className="px-4 py-1.5 bg-navy-50 text-[10px] text-navy-400 text-center">
        {t.simulatedAI}
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: CraftsmanMessage }) {
  if (message.role === 'system') {
    return (
      <div className="flex justify-center animate-fade-in">
        <span className="text-[11px] text-navy-400 bg-navy-100 rounded-full px-3 py-1 flex items-center gap-1.5">
          {message.photoId && <Icons.Camera className="w-3 h-3" />}{message.content}
        </span>
      </div>
    );
  }

  if (message.role === 'warning') {
    const warningIcon = message.warningType === 'electrical' ? 'Zap' : message.warningType === 'gas' ? 'Flame' : 'Building2';
    const WarningIcon = (Icons as any)[warningIcon] as React.ComponentType<{ className?: string }>;
    return (
      <div className="animate-slide-up">
        <div className="p-4 rounded-2xl bg-danger-50 border-2 border-danger-300">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-danger-500 text-white flex items-center justify-center animate-pulse">
              {WarningIcon && <WarningIcon className="w-5 h-5" />}
            </div>
            <p className="font-display font-800 text-danger-700 text-sm uppercase tracking-wide">Safety Warning</p>
          </div>
          <p className="text-sm text-danger-800 leading-relaxed whitespace-pre-line font-500">{message.content}</p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-danger-600 font-600">
            <Icons.ShieldAlert className="w-4 h-4" /> Stop work · Contact a qualified professional
          </div>
        </div>
      </div>
    );
  }

  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : ''}`}>
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1 px-1">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-brand-500 to-accent-500 text-white flex items-center justify-center">
              <Icons.Sparkles className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-600 text-navy-500 uppercase tracking-wide">AI</span>
            {message.isVoice && <span className="text-[10px] text-accent-500 flex items-center gap-0.5"><Icons.Mic className="w-2.5 h-2.5" />voice</span>}
          </div>
        )}
        <div className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line leading-relaxed ${isUser ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-white border border-navy-100 text-navy-800 rounded-bl-sm'}`}>
          {message.content}
        </div>
      </div>
    </div>
  );
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ============================================================
 * GUIDANCE — step-by-step tools, materials, preparation, safety
 * ============================================================ */

function CraftsmanGuidance({ t, lang, project, state, onStateChange }: {
  t: CraftsmanI18n;
  lang: CraftsmanLang;
  project: Project;
  state: CraftsmanProjectState;
  onStateChange: (s: CraftsmanProjectState) => void;
}) {
  const [generating, setGenerating] = useState(false);
  const guidance = state.guidance;
  const needsGeneration = guidance.length === 0 || state.guidanceGeneratedFor !== `${project.id}_${project.type}_${lang}`;

  function generate() {
    setGenerating(true);
    setTimeout(() => {
      const steps = generateGuidance(project, lang);
      onStateChange({ ...state, guidance: steps, guidanceGeneratedFor: `${project.id}_${project.type}_${lang}` });
      setGenerating(false);
    }, 1200);
  }

  if (needsGeneration && !generating) {
    return (
      <div className="px-4 py-5 animate-fade-in">
        <div className="text-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-3">
            <Icons.ListChecks className="w-7 h-7 text-brand-500" />
          </div>
          <p className="text-sm font-600 text-navy-700">{t.stepByStep}</p>
          <p className="text-xs text-navy-400 mt-1 max-w-xs mx-auto mb-4">{t.stepByStepDesc}</p>
          <button onClick={generate} className="btn-primary w-full max-w-xs">
            <Icons.Sparkles className="w-4 h-4" /> {t.generateGuidance}
          </button>
        </div>
      </div>
    );
  }

  if (generating) {
    return (
      <div className="px-4 py-5 animate-fade-in">
        <div className="text-center py-10">
          <Icons.Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-600 text-navy-700">{lang === 'de' ? 'Anleitung wird generiert…' : 'Generating guidance…'}</p>
        </div>
        <div className="space-y-3">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="card-surface p-4 space-y-2">
              <div className="skeleton h-5 w-1/3" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const categoryMeta: Record<string, { icon: string; color: string; label: string }> = {
    preparation: { icon: 'ClipboardCheck', color: 'bg-navy-100 text-navy-700', label: t.preparation },
    tools: { icon: 'Wrench', color: 'bg-brand-50 text-brand-600', label: t.tools },
    materials: { icon: 'Boxes', color: 'bg-accent-50 text-accent-600', label: t.materials },
    safety: { icon: 'ShieldAlert', color: 'bg-danger-100 text-danger-700', label: t.safety },
    actions: { icon: 'ListChecks', color: 'bg-success-100 text-success-700', label: t.actions },
  };

  return (
    <div className="px-4 py-5 space-y-4 animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="font-display text-lg font-800 text-navy-900">{t.stepByStep}</h1>
          <p className="text-xs text-navy-500">{project.name}</p>
        </div>
        <button onClick={generate} className="btn-secondary text-xs">
          <Icons.RefreshCw className="w-3.5 h-3.5" /> {t.generateGuidance}
        </button>
      </div>

      {guidance.map(step => {
        const meta = categoryMeta[step.category];
        const Icon = (Icons as any)[meta.icon] as React.ComponentType<{ className?: string }>;
        const isSafety = step.category === 'safety';
        return (
          <div key={step.id} className={`card-surface p-4 ${isSafety ? 'border-2 border-danger-200' : ''}`}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                {Icon && <Icon className="w-5 h-5" />}
              </div>
              <div>
                <p className="font-display font-700 text-navy-900 text-sm">{step.title}</p>
                <p className="text-[11px] text-navy-400">{meta.label}</p>
              </div>
            </div>
            {step.description && <p className="text-xs text-navy-500 mb-2">{step.description}</p>}
            {step.items && step.items.length > 0 && (
              <ul className="space-y-1.5">
                {step.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-navy-700">
                    {isSafety ? (
                      <Icons.ShieldAlert className="w-4 h-4 text-danger-500 shrink-0 mt-0.5" />
                    ) : (
                      <Icons.Check className="w-4 h-4 text-success-500 shrink-0 mt-0.5" />
                    )}
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
 * VISUALIZATION — before/after AI concept rendering
 * ============================================================ */

function CraftsmanVisualization({ t, lang, project, state, onStateChange }: {
  t: CraftsmanI18n;
  lang: CraftsmanLang;
  project: Project;
  state: CraftsmanProjectState;
  onStateChange: (s: CraftsmanProjectState) => void;
}) {
  const [beforePhoto, setBeforePhoto] = useState<string>(project.photos[0]?.url ?? '');
  const [prompt, setPrompt] = useState<string>(defaultPrompt(project, lang));
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ before: string; after: string } | null>(null);
  const [justSaved, setJustSaved] = useState(false);

  function handleGenerate() {
    if (!beforePhoto || !prompt.trim()) return;
    setGenerating(true);
    setResult(null);
    setTimeout(() => {
      const after = selectAfterImage(project);
      setResult({ before: beforePhoto, after });
      setGenerating(false);
    }, 2200);
  }

  function handleSave() {
    if (!result) return;
    const record: VisualizationRecord = {
      id: uid('viz'),
      prompt: prompt.trim(),
      beforePhotoUrl: result.before,
      afterPhotoUrl: result.after,
      savedAt: Date.now(),
    };
    onStateChange({
      ...state,
      visualizations: [...state.visualizations, record],
      activeVisualizationId: record.id,
    });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2200);
  }

  function loadExample() {
    setBeforePhoto(project.photos[0]?.url ?? '');
    setPrompt(defaultPrompt(project, lang));
    setResult({ before: project.photos[0]?.url ?? beforePhoto, after: EXAMPLE_AFTER_KITCHEN_URL });
  }

  return (
    <div className="px-4 py-5 space-y-5 animate-fade-in">
      {/* Header + concept-only badge */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent-500 to-brand-500 text-white flex items-center justify-center shrink-0">
            <Icons.Image className="w-5 h-5" />
          </div>
          <h1 className="font-display text-lg font-800 text-navy-900">{t.visualization}</h1>
        </div>
        <p className="text-xs text-navy-500 ml-10">{t.visualizationDesc}</p>
      </div>

      {/* Prominent concept-only label */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-warning-50 border border-warning-200">
        <Icons.AlertTriangle className="w-4 h-4 text-warning-600 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-700 text-warning-800">{t.conceptOnly}</p>
          <p className="text-[11px] text-warning-700 mt-0.5">
            {lang === 'de'
              ? 'Die Visualisierung ist ein simuliertes Konzept und keine Baugenehmigung oder verbindliche Planung.'
              : 'The visualization is a simulated concept and not a building permit or binding plan.'}
          </p>
        </div>
        <span className="badge bg-warning-100 text-warning-800 text-[10px] font-700 shrink-0">{t.conceptOnlyBadge}</span>
      </div>

      {/* Before photo upload */}
      <div className="card-surface p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Icons.Upload className="w-4 h-4 text-navy-500" />
          <p className="text-sm font-700 text-navy-800">{t.uploadBeforePhoto}</p>
        </div>
        <p className="text-[11px] text-navy-400">{t.beforePhotoHint}</p>
        {beforePhoto ? (
          <div className="relative rounded-xl overflow-hidden border border-navy-100">
            <img src={beforePhoto} alt="Before" className="w-full h-44 object-cover" />
            <button
              onClick={() => setBeforePhoto('')}
              className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-navy-900/60 text-white flex items-center justify-center"
            >
              <Icons.X className="w-4 h-4" />
            </button>
            <span className="absolute bottom-2 left-2 badge bg-navy-900/70 text-white text-[10px]">{t.before}</span>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-navy-200 cursor-pointer active:scale-[0.99] transition">
            <Icons.ImagePlus className="w-7 h-7 text-navy-300" />
            <span className="text-xs text-navy-400">{t.uploadBeforePhoto}</span>
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
        )}
        {project.photos[0] && (
          <button onClick={() => setBeforePhoto(project.photos[0].url)} className="btn-secondary text-xs w-full">
            <Icons.Image className="w-3.5 h-3.5" /> {t.useProjectPhoto}
          </button>
        )}
      </div>

      {/* Prompt */}
      <div className="card-surface p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Icons.PencilLine className="w-4 h-4 text-navy-500" />
          <p className="text-sm font-700 text-navy-800">{t.appearancePrompt}</p>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder={t.promptPlaceholder}
          className="input-field resize-y text-sm"
        />
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!beforePhoto || !prompt.trim() || generating}
        className="btn-primary w-full disabled:opacity-50 active:scale-[0.98] transition"
      >
        {generating ? (
          <><Icons.Loader2 className="w-4 h-4 animate-spin" /> {t.generating}</>
        ) : (
          <><Icons.Sparkles className="w-4 h-4" /> {t.generateVisualization}</>
        )}
      </button>

      {/* Generating progress */}
      {generating && (
        <div className="card-surface p-5 space-y-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <Icons.Wand2 className="w-4 h-4 text-brand-500 animate-pulse" />
            <p className="text-sm font-600 text-navy-700">{t.generating}</p>
          </div>
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="skeleton h-3 flex-1" style={{ animationDelay: `${i * 200}ms` }} />
                <Icons.Check className="w-3.5 h-3.5 text-success-500" style={{ animationDelay: `${i * 400}ms` }} />
              </div>
            ))}
          </div>
          <p className="text-[11px] text-navy-400 text-center">{t.generatingSteps}</p>
        </div>
      )}

      {/* Before/After result */}
      {result && !generating && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Icons.GitCompare className="w-4 h-4 text-brand-500" />
              <p className="text-sm font-700 text-navy-800">{t.beforeAfter}</p>
            </div>
            <button onClick={handleGenerate} className="btn-secondary text-xs">
              <Icons.RefreshCw className="w-3.5 h-3.5" /> {t.regenerate}
            </button>
          </div>

          <BeforeAfterSlider before={result.before} after={result.after} beforeLabel={t.before} afterLabel={t.after} hint={t.sliderHint} conceptBadge={t.conceptOnlyBadge} />

          {/* Save button */}
          <div className="flex items-center gap-2">
            <button onClick={handleSave} className="btn-primary flex-1 active:scale-[0.98] transition">
              {justSaved ? (
                <><Icons.CheckCircle2 className="w-4 h-4" /> {t.savedVisualization}</>
              ) : (
                <><Icons.Save className="w-4 h-4" /> {t.saveVisualization}</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Empty-state quick example */}
      {!result && !generating && (
        <button onClick={loadExample} className="btn-ghost text-xs w-full text-navy-500">
          <Icons.Lightbulb className="w-3.5 h-3.5" /> {t.exampleLoaded}
        </button>
      )}

      {/* Saved visualizations history */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Icons.Images className="w-4 h-4 text-navy-500" />
          <p className="text-sm font-700 text-navy-800">{t.visualHistory}</p>
          {state.visualizations.length > 0 && (
            <span className="badge bg-navy-100 text-navy-600 text-[10px] ml-auto">{state.visualizations.length}</span>
          )}
        </div>
        {state.visualizations.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-2">
              <Icons.ImageOff className="w-6 h-6 text-navy-300" />
            </div>
            <p className="text-xs text-navy-400">{t.noVisualizations}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...state.visualizations].reverse().map((v) => (
              <div key={v.id} className="card-surface p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="badge bg-warning-50 text-warning-700 text-[10px] font-700">{t.conceptOnlyBadge}</span>
                  <span className="text-[10px] text-navy-400 ml-auto">{new Date(v.savedAt).toLocaleString('en-GB')}</span>
                </div>
                <BeforeAfterSlider before={v.beforePhotoUrl} after={v.afterPhotoUrl} beforeLabel={t.before} afterLabel={t.after} hint={t.sliderHint} conceptBadge={t.conceptOnlyBadge} compact />
                <div className="flex items-start gap-1.5 pt-1">
                  <Icons.PencilLine className="w-3 h-3 text-navy-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-navy-500 leading-relaxed">{v.prompt}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Before/After comparison slider ---------- */

function BeforeAfterSlider({ before, after, beforeLabel, afterLabel, hint, conceptBadge, compact }: {
  before: string;
  after: string;
  beforeLabel: string;
  afterLabel: string;
  hint: string;
  conceptBadge: string;
  compact?: boolean;
}) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  function update(clientX: number) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.max(0, Math.min(100, x)));
  }

  useEffect(() => {
    function move(e: MouseEvent) { if (dragging.current) update(e.clientX); }
    function touch(e: TouchEvent) { if (dragging.current && e.touches[0]) update(e.touches[0].clientX); }
    function up() { dragging.current = false; }
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', touch);
    window.addEventListener('touchend', up);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', touch);
      window.removeEventListener('touchend', up);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative w-full rounded-xl overflow-hidden border border-navy-200 select-none"
      style={{ aspectRatio: '3 / 2', touchAction: 'none' }}
      onMouseDown={(e) => { dragging.current = true; update(e.clientX); }}
      onTouchStart={(e) => { dragging.current = true; if (e.touches[0]) update(e.touches[0].clientX); }}
    >
      {/* After (full width) */}
      <img src={after} alt={afterLabel} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
      <span className={`absolute top-2 right-2 badge bg-success-600/80 text-white text-[10px] font-700 ${compact ? 'scale-90' : ''}`}>{afterLabel}</span>
      <span className={`absolute top-2 left-2 badge bg-warning-600/90 text-white text-[10px] font-700 ${compact ? 'scale-90' : ''}`}>{conceptBadge}</span>

      {/* Before (clipped to slider) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img src={before} alt={beforeLabel} className="absolute inset-0 h-full object-cover" style={{ width: ref.current?.clientWidth ?? '100%' }} draggable={false} />
        <span className={`absolute bottom-2 left-2 badge bg-navy-900/80 text-white text-[10px] font-700 ${compact ? 'scale-90' : ''}`}>{beforeLabel}</span>
      </div>

      {/* Slider handle */}
      <div className="absolute top-0 bottom-0 w-1 bg-white shadow-lg" style={{ left: `${pos}%`, transform: 'translateX(-50%)' }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center pointer-events-none">
          <Icons.MoveHorizontal className="w-4 h-4 text-navy-600" />
        </div>
      </div>

      {/* Hint */}
      {!compact && (
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] text-white/90 bg-navy-900/60 px-2 py-0.5 rounded-full pointer-events-none">
          {hint}
        </span>
      )}
    </div>
  );
}

/* ============================================================
 * HISTORY — question history per project
 * ============================================================ */

function CraftsmanHistory({ t, project, state }: {
  t: CraftsmanI18n;
  project: Project;
  state: CraftsmanProjectState;
}) {
  const questions = [...state.questions].reverse();

  return (
    <div className="px-4 py-5 space-y-4 animate-fade-in">
      <div>
        <h1 className="font-display text-lg font-800 text-navy-900">{t.questionHistory}</h1>
        <p className="text-xs text-navy-500">{t.questionHistoryDesc}</p>
        <p className="text-[11px] text-navy-400 mt-0.5">{project.name} · {project.id}</p>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-3">
            <Icons.History className="w-7 h-7 text-navy-300" />
          </div>
          <p className="text-sm font-600 text-navy-600">{t.noQuestions}</p>
          <p className="text-xs text-navy-400 mt-1 max-w-xs mx-auto">{t.askHint}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map(q => (
            <div key={q.id} className="card-surface p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="badge bg-brand-50 text-brand-600 text-[10px] capitalize">{q.category}</span>
                <span className="text-[10px] text-navy-400 ml-auto">{new Date(q.askedAt).toLocaleString('en-GB')}</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <Icons.MessageSquare className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-600 text-navy-800">{q.question}</p>
                </div>
                <div className="flex items-start gap-2 pl-6">
                  <Icons.Sparkles className="w-4 h-4 text-accent-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-navy-600 whitespace-pre-line leading-relaxed">{q.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  function lang_ask_hint() {
    return 'Ask a question in the AI Chat tab to build your history.';
  }
}

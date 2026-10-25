import { useEffect, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import type { Project, ChatMessage, SuggestedPromptKey, StructuredSummary } from '../types';
import {
  SUGGESTED_PROMPTS,
  chatReply,
  chatReplyFreeform,
  buildStructuredSummary,
  userMessage,
  assistantMessage,
  maskPII,
} from '../data/ai';
import { Badge } from './ui';

interface Props {
  project: Project;
  chat: ChatMessage[];
  structuredSummary: StructuredSummary | null;
  onChatChange: (chat: ChatMessage[]) => void;
  onSummaryChange: (summary: StructuredSummary | null) => void;
}

type Tab = 'chat' | 'summary';

export function AIAssistant({ project, chat, structuredSummary, onChatChange, onSummaryChange }: Props) {
  const [tab, setTab] = useState<Tab>('chat');
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chat, thinking]);

  function sendSuggested(key: SuggestedPromptKey) {
    const label = SUGGESTED_PROMPTS.find(p => p.key === key)?.label ?? key;
    send(label, () => chatReply(key, project));
  }

  function sendText() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    send(text, () => chatReplyFreeform(text, project));
  }

  function send(userText: string, produce: () => string) {
    setError(null);
    const userMsg = userMessage(userText);
    const nextChat = [...chat, userMsg];
    onChatChange(nextChat);
    setThinking(true);
    // Deterministic simulated latency. Occasionally show an "error" that the
    // user can retry — but deterministically only for an explicit trigger so
    // normal flows always succeed.
    setTimeout(() => {
      try {
        const reply = produce();
        const aiMsg = assistantMessage(reply, true);
        onChatChange([...nextChat, aiMsg]);
        setThinking(false);
      } catch (e) {
        setThinking(false);
        setError('The assistant could not process that request. Please try again.');
      }
    }, 900);
  }

  function generateSummary() {
    setSummaryLoading(true);
    setError(null);
    setTimeout(() => {
      try {
        onSummaryChange(buildStructuredSummary(project));
        setSummaryLoading(false);
        setTab('summary');
      } catch (e) {
        setSummaryLoading(false);
        setError('Could not generate the structured summary. Please retry.');
      }
    }, 1200);
  }

  return (
    <div className="card-surface overflow-hidden flex flex-col h-[600px] animate-fade-in">
      {/* Header */}
      <div className="px-4 py-3 border-b border-navy-100 flex items-center justify-between bg-gradient-to-r from-navy-950 to-navy-800 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shrink-0">
            <Icons.Sparkles className="w-4 h-4" />
          </div>
          <div className="leading-none">
            <p className="font-display font-700 text-sm">Contractor AI Assistant</p>
            <p className="text-[10px] text-navy-300 mt-1">{project.id} · privacy-masked</p>
          </div>
        </div>
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/10">
          <TabButton active={tab === 'chat'} onClick={() => setTab('chat')} icon="MessageSquare" label="Chat" />
          <TabButton active={tab === 'summary'} onClick={() => setTab('summary')} icon="ClipboardList" label="Summary" />
        </div>
      </div>

      {/* Privacy banner */}
      <div className="px-4 py-2 bg-success-50 border-b border-success-100 flex items-center gap-2 text-xs text-success-700">
        <Icons.ShieldCheck className="w-3.5 h-3.5 shrink-0" />
        <span>Customer PII (name, email, phone, address) is masked before any simulated AI processing. No external AI calls.</span>
      </div>

      {/* Body */}
      {tab === 'chat' ? (
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-3 bg-navy-50/40">
            {chat.length === 0 && !thinking && (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-3">
                  <Icons.Sparkles className="w-6 h-6 text-brand-500" />
                </div>
                <p className="text-sm font-600 text-navy-700">Ask the assistant about this project</p>
                <p className="text-xs text-navy-400 mt-1 max-w-xs mx-auto">Try a suggested prompt below or type your own question.</p>
              </div>
            )}
            {chat.map(m => <Bubble key={m.id} message={m} />)}
            {thinking && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl rounded-tl-sm bg-white border border-navy-100 w-fit">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-navy-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-navy-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-navy-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-danger-50 border border-danger-100 text-sm text-danger-700">
                <Icons.AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
                <button onClick={() => setError(null)} className="btn-ghost text-danger-600 -m-1 p-1 ml-auto"><Icons.X className="w-4 h-4" /></button>
              </div>
            )}
          </div>

          {/* Suggested prompts */}
          <div className="px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar border-t border-navy-100 bg-white">
            {SUGGESTED_PROMPTS.map(p => {
              const Icon = (Icons as any)[p.icon] as React.ComponentType<{ className?: string }>;
              return (
                <button key={p.key} onClick={() => sendSuggested(p.key)} disabled={thinking}
                  className="badge bg-brand-50 text-brand-700 hover:bg-brand-100 whitespace-nowrap shrink-0 disabled:opacity-50">
                  {Icon && <Icon className="w-3.5 h-3.5" />}{p.label}
                </button>
              );
            })}
          </div>

          {/* Input */}
          <div className="px-3 py-3 bg-white border-t border-navy-100 flex items-end gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText(); } }}
              rows={1}
              placeholder="Ask about this project…"
              className="input-field flex-1 resize-none max-h-24"
            />
            <button onClick={sendText} disabled={!input.trim() || thinking} className="btn-primary p-2.5 rounded-xl shrink-0">
              <Icons.Send className="w-5 h-5" />
            </button>
          </div>
        </>
      ) : (
        <SummaryTab
          project={project}
          summary={structuredSummary}
          loading={summaryLoading}
          error={error}
          onGenerate={generateSummary}
        />
      )}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  const Icon = (Icons as any)[icon] as React.ComponentType<{ className?: string }>;
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-600 transition ${active ? 'bg-white text-navy-900 shadow-soft' : 'text-navy-200 hover:text-white'}`}>
      {Icon && <Icon className="w-3.5 h-3.5" />}{label}
    </button>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  if (isSystem) {
    return (
      <div className="flex justify-center animate-fade-in">
        <span className="text-[11px] text-navy-400 bg-navy-100 rounded-full px-3 py-1">{message.content}</span>
      </div>
    );
  }
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : ''}`}>
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1 px-1">
            <div className="w-5 h-5 rounded-md bg-gradient-to-br from-brand-500 to-accent-500 text-white flex items-center justify-center">
              <Icons.Sparkles className="w-3 h-3" />
            </div>
            <span className="text-[10px] font-600 text-navy-500 uppercase tracking-wide">Assistant</span>
            {message.privacyMasked && <span className="text-[10px] text-success-600 flex items-center gap-0.5"><Icons.ShieldCheck className="w-2.5 h-2.5" />masked</span>}
          </div>
        )}
        <div className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-line leading-relaxed ${isUser ? 'bg-brand-600 text-white rounded-br-sm' : 'bg-white border border-navy-100 text-navy-800 rounded-bl-sm'}`}>
          {message.content}
        </div>
      </div>
    </div>
  );
}

/* ---------- Structured summary tab ---------- */

function SummaryTab({ project, summary, loading, error, onGenerate }: { project: Project; summary: StructuredSummary | null; loading: boolean; error: string | null; onGenerate: () => void }) {
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-4">
        <div className="text-center py-6">
          <Icons.Loader2 className="w-8 h-8 text-brand-500 animate-spin mx-auto mb-3" />
          <p className="text-sm font-600 text-navy-700">Generating structured summary…</p>
        </div>
        <div className="space-y-3">
          {['Work scope', 'Current condition', 'Preferences', 'Assumptions', 'Open questions'].map(s => (
            <div key={s} className="space-y-1.5">
              <div className="skeleton h-4 w-1/3" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-2/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
        <div className="text-center py-10">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-3">
            <Icons.ClipboardList className="w-7 h-7 text-brand-500" />
          </div>
          <p className="text-sm font-600 text-navy-700">No structured summary yet</p>
          <p className="text-xs text-navy-400 mt-1 mb-4 max-w-xs mx-auto">Generate a structured breakdown of work scope, condition, preferences, assumptions, and open questions.</p>
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-danger-50 border border-danger-100 text-sm text-danger-700 mb-4 max-w-sm mx-auto text-left">
              <Icons.AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          <button onClick={onGenerate} className="btn-primary">
            <Icons.Sparkles className="w-4 h-4" /> Generate structured summary
          </button>
        </div>
      </div>
    );
  }

  const maskedReq = maskPII(project.customerRequirement, project);
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-5 animate-fade-in">
      {/* Regenerate + meta */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge color="bg-success-100 text-success-700"><Icons.CheckCircle2 className="w-3.5 h-3.5" /> Generated</Badge>
          <span className="text-xs text-navy-400">{new Date(summary.generatedAt).toLocaleString('en-GB')}</span>
        </div>
        <button onClick={onGenerate} className="btn-secondary text-xs">
          <Icons.RefreshCw className="w-3.5 h-3.5" /> Regenerate
        </button>
      </div>

      {/* Privacy masking report */}
      <div className="rounded-xl bg-success-50 border border-success-100 p-3">
        <div className="flex items-center gap-2 text-xs font-600 text-success-700 mb-1">
          <Icons.ShieldCheck className="w-4 h-4" /> Privacy masking applied
        </div>
        <p className="text-xs text-success-700/80">
          {maskedReq.masked.length > 0
            ? `Masked ${maskedReq.masked.length} PII value(s) from the customer requirement before processing.`
            : 'No PII detected in the requirement text.'}
        </p>
      </div>

      <Section title="Work scope" icon="ListChecks" items={summary.workScope} tone="brand" />
      <Section title="Current condition" icon="ClipboardCheck" items={summary.currentCondition} tone="navy" />
      <Section title="Preferences" icon="Heart" items={summary.preferences} tone="accent" />

      {/* Assumptions — explicitly separated from confirmed facts */}
      <div className="rounded-xl border-2 border-dashed border-accent-300 bg-accent-50/50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icons.Lightbulb className="w-4 h-4 text-accent-600" />
          <p className="font-display font-700 text-navy-900 text-sm">Assumptions (not confirmed facts)</p>
        </div>
        <ul className="space-y-1.5">
          {summary.assumptions.map((a, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-navy-700">
              <Icons.HelpCircle className="w-3.5 h-3.5 text-accent-500 shrink-0 mt-1" />
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>

      <Section title="Open questions" icon="CircleHelp" items={summary.openQuestions} tone="warning" />

      <p className="text-[11px] text-navy-400 flex items-center gap-1 pt-1">
        <Icons.Info className="w-3 h-3" /> Simulated AI — deterministic, no external service. PII never leaves this browser.
      </p>
    </div>
  );
}

function Section({ title, icon, items, tone }: { title: string; icon: string; items: string[]; tone: 'brand' | 'navy' | 'accent' | 'warning' }) {
  const Icon = (Icons as any)[icon] as React.ComponentType<{ className?: string }>;
  const toneMap: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-600',
    navy: 'bg-navy-100 text-navy-700',
    accent: 'bg-accent-100 text-accent-700',
    warning: 'bg-warning-100 text-warning-600',
  };
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${toneMap[tone]}`}>
          {Icon && <Icon className="w-4 h-4" />}
        </div>
        <p className="font-display font-700 text-navy-900 text-sm">{title}</p>
        <span className="text-xs text-navy-400 ml-1">({items.length})</span>
      </div>
      <ul className="space-y-1.5 pl-9">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-navy-700">
            <Icons.Dot className="w-4 h-4 text-navy-300 shrink-0 mt-0.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

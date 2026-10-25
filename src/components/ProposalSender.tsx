import { useState } from 'react';
import * as Icons from 'lucide-react';
import type { Project, ProposalDraft, ProposalVersion, SendChannel, SendRecord, ContractorVisualization } from '../types';
import { generateProposalPDF, pdfFilename, preloadVisualizationImages } from '../data/pdf';
import { estimateDisclaimer } from '../data/proposals';
import { visualizationDisclaimer } from '../data/visualization';
import { formatEuro } from '../data/projects';
import { Card, Badge } from './ui';
import { Modal } from './Modal';

interface Props {
  project: Project;
  draft: ProposalDraft;
  latestVersion: ProposalVersion | null;
  approvedVisualizations: ContractorVisualization[];
  onSendComplete: (record: SendRecord) => void;
  onDownloadPDF: () => void;
}

type Tab = 'email' | 'whatsapp' | 'link';

let idCounter = 0;
function uid(): string {
  idCounter += 1;
  return `send_${Date.now()}_${idCounter}`;
}

export function ProposalSender({ project, draft, latestVersion, approvedVisualizations, onSendComplete, onDownloadPDF }: Props) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('email');
  const [recipient, setRecipient] = useState(project.customerEmail);
  const [subject, setSubject] = useState(`Renovation Proposal — ${project.name} (${draft.selectedTier})`);
  const [body, setBody] = useState(defaultEmailBody(project, draft));
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const versionLabel = latestVersion?.label ?? `Draft (unsaved)`;
  const filename = pdfFilename(project, draft);

  function handleDownload() {
    onDownloadPDF();
  }

  function handleCopyLink() {
    const shareUrl = `https://renovaite.app/proposal/${project.id}/${draft.id}?t=${draft.selectedTier}`;
    try {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function openSendModal() {
    setConfirmOpen(true);
  }

  function confirmSend() {
    setConfirmOpen(false);
    setSending(true);
    setNotification(null);

    const channel: SendChannel = tab;
    const record: Omit<SendRecord, 'status'> = {
      id: uid(),
      channel,
      recipient: channel === 'email' ? recipient : channel === 'whatsapp' ? project.customerEmail : 'Share link',
      subject: channel === 'email' ? subject : `Renovation Proposal — ${project.name}`,
      body,
      versionLabel,
      sentAt: Date.now(),
      pdfFilename: filename,
      simulated: true,
    };

    // Simulate delivery with deterministic success (no real network)
    setTimeout(() => {
      // Deterministic failure for demonstration: fail if recipient is empty
      const willFail = channel === 'email' && !recipient.trim();

      if (willFail) {
        const failedRecord: SendRecord = { ...record, status: 'failed' };
        onSendComplete(failedRecord);
        setNotification({ type: 'error', message: `Simulated delivery to ${recipient || '(empty)'} failed — no recipient address provided.` });
      } else {
        const successRecord: SendRecord = { ...record, status: 'success' };
        onSendComplete(successRecord);
        const dest = channel === 'email' ? recipient : channel === 'whatsapp' ? 'WhatsApp contact' : 'clipboard';
        setNotification({ type: 'success', message: `Proposal ${channel === 'link' ? 'link copied' : `sent to ${dest}`} (simulated). PDF: ${filename}` });
      }
      setSending(false);
      setOpen(false);
    }, 1600);
  }

  const shareUrl = `https://renovaite.app/proposal/${project.id}/${draft.id}?t=${draft.selectedTier}`;

  return (
    <>
      {/* Download + Send action bar */}
      <Card className="p-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
              <Icons.Send className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-700 text-navy-900 text-sm">Export & send proposal</p>
              <p className="text-xs text-navy-500">Download PDF, send via email or WhatsApp, or copy a share link.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleDownload} className="btn-secondary text-sm">
              <Icons.Download className="w-4 h-4" /> Download PDF
            </button>
            <button onClick={() => setOpen(true)} className="btn-primary text-sm">
              <Icons.Send className="w-4 h-4" /> Send proposal
            </button>
          </div>
        </div>

        {/* Simulated disclaimer */}
        <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-warning-50 border border-warning-100">
          <Icons.AlertCircle className="w-3.5 h-3.5 text-warning-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-warning-700">All delivery actions are simulated. No real emails or WhatsApp messages are sent. {estimateDisclaimer()}</p>
        </div>
      </Card>

      {/* Notification toast */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 max-w-sm p-4 rounded-xl shadow-lg border animate-slide-up ${notification.type === 'success' ? 'bg-success-50 border-success-200 text-success-800' : 'bg-danger-50 border-danger-200 text-danger-800'}`}>
          <div className="flex items-start gap-2">
            {notification.type === 'success'
              ? <Icons.CheckCircle2 className="w-5 h-5 text-success-600 shrink-0 mt-0.5" />
              : <Icons.AlertCircle className="w-5 h-5 text-danger-600 shrink-0 mt-0.5" />}
            <div className="flex-1">
              <p className="text-sm font-600">{notification.type === 'success' ? 'Delivery simulated' : 'Delivery failed'}</p>
              <p className="text-xs mt-0.5 opacity-90">{notification.message}</p>
            </div>
            <button onClick={() => setNotification(null)} className="btn-ghost -m-1 p-1 rounded">
              <Icons.X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Send modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Send proposal" subtitle="Choose a delivery channel — all actions are simulated" maxWidth="max-w-2xl">
        {/* Tabs */}
        <div className="flex gap-1 p-0.5 rounded-xl bg-navy-50 mb-5">
          <ChannelTab active={tab === 'email'} onClick={() => setTab('email')} icon="Mail" label="Email" />
          <ChannelTab active={tab === 'whatsapp'} onClick={() => setTab('whatsapp')} icon="MessageCircle" label="WhatsApp" />
          <ChannelTab active={tab === 'link'} onClick={() => setTab('link')} icon="Link" label="Share link" />
        </div>

        {/* Attachment preview */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-navy-50/60 border border-navy-100 mb-3">
          <div className="w-10 h-10 rounded-lg bg-danger-100 text-danger-600 flex items-center justify-center shrink-0">
            <Icons.FileText className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-600 text-navy-700 truncate">{filename}</p>
            <p className="text-[11px] text-navy-400">{formatEuro(draft.priceMin)}–{formatEuro(draft.priceMax)} · {draft.selectedTier} · {draft.timeline}</p>
          </div>
          <Badge color="bg-navy-100 text-navy-600">{versionLabel}</Badge>
        </div>

        {/* Approved visualization preview */}
        {approvedVisualizations.length > 0 && (
          <div className="p-3 rounded-xl bg-brand-50/40 border border-brand-100 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <Icons.Image className="w-4 h-4 text-brand-600" />
              <p className="text-sm font-600 text-navy-700">Attached AI visualizations ({approvedVisualizations.length})</p>
            </div>
            <div className="space-y-2">
              {approvedVisualizations.map((viz) => (
                <div key={viz.id} className="flex items-center gap-2 p-2 rounded-lg bg-white border border-navy-100">
                  <img src={viz.beforePhotoUrl} alt="Before" className="w-12 h-10 object-cover rounded shrink-0" />
                  <Icons.ArrowRight className="w-3 h-3 text-navy-300 shrink-0" />
                  <img src={viz.afterPhotoUrl} alt="After" className="w-12 h-10 object-cover rounded shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-navy-600 truncate">{viz.prompt}</p>
                    <p className="text-[9px] text-warning-600 italic">{visualizationDisclaimer()}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-navy-400 mt-2 flex items-center gap-1">
              <Icons.Info className="w-3 h-3" /> Only contractor-approved visualizations are included in the PDF and proposal.
            </p>
          </div>
        )}

        {tab === 'email' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-600 text-navy-700 block mb-1.5">Recipient</label>
              <input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="customer@email.com" className="input-field" />
              <p className="text-[10px] text-navy-400 mt-1">Customer contact data is used only for proposal addressing — it is never sent to the AI request pipeline.</p>
            </div>
            <div>
              <label className="text-xs font-600 text-navy-700 block mb-1.5">Subject</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-600 text-navy-700 block mb-1.5">Message body</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={7} className="input-field resize-y" />
            </div>
          </div>
        )}

        {tab === 'whatsapp' && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-success-50 border border-success-100">
              <Icons.MessageCircle className="w-4 h-4 text-success-600 shrink-0 mt-0.5" />
              <p className="text-xs text-success-700">A WhatsApp share link will be generated with your message pre-filled. Opening it is simulated — no real message is sent.</p>
            </div>
            <div>
              <label className="text-xs font-600 text-navy-700 block mb-1.5">Message</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={6} className="input-field resize-y" />
            </div>
            <div className="p-3 rounded-xl bg-navy-50/60 border border-navy-100 text-sm text-navy-600 break-all">
              <span className="text-[10px] uppercase font-600 text-navy-400">Preview link:</span><br />
              wa.me/?text={encodeURIComponent(`${subject}\n\n${body}`)}
            </div>
          </div>
        )}

        {tab === 'link' && (
          <div className="space-y-4">
            <div className="flex items-start gap-2 p-3 rounded-xl bg-brand-50 border border-brand-100">
              <Icons.Link className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <p className="text-xs text-brand-700">Copy a read-only share link to this proposal. The recipient can view the proposal online (simulated — no real link is active).</p>
            </div>
            <div className="p-3 rounded-xl bg-navy-50/60 border border-navy-100 flex items-center gap-2">
              <Icons.Link2 className="w-4 h-4 text-navy-400 shrink-0" />
              <span className="text-sm text-navy-600 truncate flex-1">{shareUrl}</span>
              <button onClick={handleCopyLink} className="btn-secondary text-xs shrink-0">
                {copied ? <><Icons.Check className="w-3.5 h-3.5" /> Copied</> : <><Icons.Copy className="w-3.5 h-3.5" /> Copy</>}
              </button>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 pt-5 mt-5 border-t border-navy-100">
          <p className="text-[11px] text-navy-400 flex items-center gap-1">
            <Icons.ShieldCheck className="w-3.5 h-3.5" /> Customer contact data stays separate from AI data.
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setOpen(false)} className="btn-ghost text-sm">Cancel</button>
            {tab === 'link' ? (
              <button onClick={() => { handleCopyLink(); openSendModal(); }} className="btn-primary text-sm">
                <Icons.Send className="w-4 h-4" /> Share link
              </button>
            ) : (
              <button onClick={openSendModal} className="btn-primary text-sm">
                <Icons.Send className="w-4 h-4" /> {tab === 'email' ? 'Send email' : 'Send via WhatsApp'}
              </button>
            )}
          </div>
        </div>
      </Modal>

      {/* Confirmation modal */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm simulated send"
        subtitle="Review the details before proceeding — this is a simulated delivery"
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => setConfirmOpen(false)} className="btn-ghost text-sm">Cancel</button>
            <button onClick={confirmSend} disabled={sending} className="btn-primary text-sm">
              {sending ? <Icons.Loader2 className="w-4 h-4 animate-spin" /> : <Icons.Send className="w-4 h-4" />}
              {sending ? 'Sending…' : 'Confirm & send (simulated)'}
            </button>
          </div>
        }
      >
        <div className="space-y-3">
          <ConfirmRow icon="Send" label="Channel" value={tab === 'email' ? 'Email' : tab === 'whatsapp' ? 'WhatsApp' : 'Share link'} />
          <ConfirmRow icon="User" label="Recipient" value={tab === 'email' ? recipient : tab === 'whatsapp' ? 'WhatsApp contact' : 'Clipboard'} />
          <ConfirmRow icon="FileText" label="Attachment" value={filename} />
          <ConfirmRow icon="Tag" label="Version" value={versionLabel} />
          {approvedVisualizations.length > 0 && (
            <ConfirmRow icon="Image" label="Visualizations" value={`${approvedVisualizations.length} approved AI concept(s) attached`} />
          )}
          {approvedVisualizations.length > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-brand-50 border border-brand-100">
              <Icons.Image className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <p className="text-xs text-brand-700">{approvedVisualizations.length} contractor-approved AI visualization{approvedVisualizations.length === 1 ? '' : 's'} will be included in the PDF. {visualizationDisclaimer()}</p>
            </div>
          )}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-warning-50 border border-warning-100 mt-2">
            <Icons.AlertCircle className="w-4 h-4 text-warning-600 shrink-0 mt-0.5" />
            <p className="text-xs text-warning-700">No real email or WhatsApp message will be sent. This is a simulated delivery for demonstration purposes.</p>
          </div>
        </div>
      </Modal>
    </>
  );
}

function defaultEmailBody(project: Project, draft: ProposalDraft): string {
  return [
    `Dear ${project.customerName},`,
    '',
    `Thank you for your interest in renovating your ${project.rooms ?? project.name}. Please find attached our ${draft.selectedTier} renovation proposal.`,
    '',
    `Price range: ${formatEuro(draft.priceMin)} – ${formatEuro(draft.priceMax)}`,
    `Estimated duration: ${draft.timeline}`,
    '',
    'Please review the attached PDF and let us know if you have any questions. We are happy to schedule a call to discuss any adjustments.',
    '',
    'Kind regards,',
    'The RenovAIte Team',
  ].join('\n');
}

function ChannelTab({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  const Icon = (Icons as any)[icon] as React.ComponentType<{ className?: string }>;
  return (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-600 transition ${active ? 'bg-white text-navy-900 shadow-soft' : 'text-navy-500 hover:text-navy-700'}`}>
      {Icon && <Icon className="w-4 h-4" />}{label}
    </button>
  );
}

function ConfirmRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  const Icon = (Icons as any)[icon] as React.ComponentType<{ className?: string }>;
  return (
    <div className="flex items-center gap-3 py-2 border-b border-navy-50">
      <div className="w-8 h-8 rounded-lg bg-navy-50 text-navy-500 flex items-center justify-center shrink-0">
        {Icon && <Icon className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-navy-400 font-600">{label}</p>
        <p className="text-sm text-navy-700 font-500 truncate">{value}</p>
      </div>
    </div>
  );
}

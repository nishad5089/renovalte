import * as Icons from 'lucide-react';
import type { SendRecord, SendChannel } from '../types';
import { Card, Badge } from './ui';

interface Props {
  history: SendRecord[];
}

const CHANNEL_META: Record<SendChannel, { icon: string; label: string; color: string }> = {
  email: { icon: 'Mail', label: 'Email', color: 'bg-brand-50 text-brand-600' },
  whatsapp: { icon: 'MessageCircle', label: 'WhatsApp', color: 'bg-success-50 text-success-600' },
  link: { icon: 'Link', label: 'Share link', color: 'bg-accent-50 text-accent-600' },
};

export function SendHistoryPanel({ history }: Props) {
  return (
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <div className="px-5 py-4 border-b border-navy-100 flex items-center justify-between bg-gradient-to-r from-navy-900 to-navy-800 text-white">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-success-500 to-brand-500 flex items-center justify-center shrink-0">
            <Icons.Send className="w-4 h-4" />
          </div>
          <div className="leading-none">
            <p className="font-display font-700 text-sm">Sent proposal history</p>
            <p className="text-[10px] text-navy-300 mt-1">Simulated delivery log — channel, timestamp, version, status</p>
          </div>
        </div>
        {history.length > 0 && <Badge color="bg-white/10 text-white">{history.length} sent</Badge>}
      </div>

      <div className="p-5">
        {history.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-navy-50 flex items-center justify-center mx-auto mb-3">
              <Icons.Inbox className="w-7 h-7 text-navy-300" />
            </div>
            <p className="text-sm font-600 text-navy-600">No proposals sent yet</p>
            <p className="text-xs text-navy-400 mt-1 max-w-xs mx-auto">
              When you send a proposal via email, WhatsApp, or share link, the delivery will be logged here with its channel, timestamp, version, and status.
            </p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-1 before:bottom-1 before:w-0.5 before:bg-navy-100">
            {[...history].reverse().map((rec) => {
              const meta = CHANNEL_META[rec.channel];
              const Icon = (Icons as any)[meta.icon] as React.ComponentType<{ className?: string }>;
              const isSuccess = rec.status === 'success';
              return (
                <div key={rec.id} className="relative animate-slide-up">
                  <div className={`absolute -left-4.5 top-2 w-3.5 h-3.5 rounded-full ring-2 ring-white ${isSuccess ? 'bg-success-500' : 'bg-danger-500'}`} />
                  <div className="ml-2 p-4 rounded-xl bg-white border border-navy-100">
                    {/* Top row: channel + status + timestamp */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`badge ${meta.color}`}>
                        {Icon && <Icon className="w-3.5 h-3.5" />}{meta.label}
                      </span>
                      <span className={`badge ${isSuccess ? 'bg-success-100 text-success-700' : 'bg-danger-100 text-danger-700'}`}>
                        {isSuccess ? <Icons.CheckCircle2 className="w-3.5 h-3.5" /> : <Icons.XCircle className="w-3.5 h-3.5" />}
                        {isSuccess ? 'Delivered' : 'Failed'}
                      </span>
                      <Badge color="bg-navy-100 text-navy-600"><Icons.Tag className="w-3 h-3" />{rec.versionLabel}</Badge>
                      <span className="text-[10px] text-navy-400 ml-auto">{new Date(rec.sentAt).toLocaleString('en-GB')}</span>
                    </div>

                    {/* Recipient + subject */}
                    <div className="space-y-1 text-sm">
                      <div className="flex items-start gap-2">
                        <Icons.User className="w-3.5 h-3.5 text-navy-400 shrink-0 mt-1" />
                        <span className="text-navy-600"><span className="text-navy-400">To:</span> {rec.recipient}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Icons.FileText className="w-3.5 h-3.5 text-navy-400 shrink-0 mt-1" />
                        <span className="text-navy-600"><span className="text-navy-400">Subject:</span> {rec.subject}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Icons.Paperclip className="w-3.5 h-3.5 text-navy-400 shrink-0 mt-1" />
                        <span className="text-navy-600"><span className="text-navy-400">Attachment:</span> {rec.pdfFilename}</span>
                      </div>
                    </div>

                    {/* Body preview */}
                    <div className="mt-2 p-2.5 rounded-lg bg-navy-50/60 text-xs text-navy-500 whitespace-pre-line line-clamp-3">
                      {rec.body}
                    </div>

                    {/* Simulated label */}
                    <p className="mt-2 text-[10px] text-navy-400 flex items-center gap-1">
                      <Icons.Info className="w-3 h-3" /> Simulated delivery — no real message was sent.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
}

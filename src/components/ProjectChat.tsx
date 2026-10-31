import { useEffect, useRef, useState } from "react";
import type { DemoProject } from "../data/demoProjects";
import {
  getAttachment,
  loadMessages,
  projectReply,
  saveAttachment,
  saveMessages,
  type ChatAttachment,
  type ProjectMessage,
} from "../data/projectChat";
import { lastSentProposal } from "../data/sentProposals";
import {
  projectStatuses,
  statusLabel,
  type ProjectStatus,
} from "../data/projectStatus";
import { useVoiceNote } from "../hooks/useVoiceNote";
import { WorkspaceIcon as Icon } from "./WorkspaceIcon";
import { createOffer, loadOffer, offerRequested, saveOffer, type OfferDraft } from "../data/offer";
import { OfferReview } from "./OfferReview";
export type ChatPanel = "status" | "proposal" | "draft" | null;

export function ConversationMenu({
  de,
  onPanel,
  onDetails,
  onBack,
}: {
  de: boolean;
  onPanel: (panel: ChatPanel) => void;
  onDetails: () => void;
  onBack: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", key);
    };
  }, [open]);
  function choose(fn: () => void) {
    setOpen(false);
    fn();
  }
  return (
    <div className="conversation-menu" ref={ref}>
      <button
        className="chat-icon-button"
        aria-label={de ? "Projektaktionen" : "Project actions"}
        aria-expanded={open}
        aria-controls="conversation-actions"
        onClick={() => setOpen(!open)}
      >
        <Icon name="more" />
      </button>
      {open && (
        <div id="conversation-actions" className="conversation-menu-list">
          <button onClick={() => choose(() => onPanel("status"))}>
            <Icon name="settings" size={16} />
            {de ? "Status ändern" : "Change status"}
          </button>
          <button onClick={() => choose(() => onPanel("proposal"))}>
            <Icon name="proposal" size={16} />
            {de ? "Zuletzt gesendetes Angebot" : "Latest sent proposal"}
          </button>
          <button onClick={() => choose(onDetails)}>
            <Icon name="projects" size={16} />
            {de ? "Projektdetails" : "Project details"}
          </button>
          <button onClick={() => choose(onBack)}>
            {de ? "Zur Übersicht" : "Back to overview"}
          </button>
        </div>
      )}
    </div>
  );
}
function ChatMedia({
  projectId,
  attachment,
  blob,
}: {
  projectId: string;
  attachment: ChatAttachment;
  blob?: Blob;
}) {
  const [url, setUrl] = useState(""),
    [error, setError] = useState(false);
  useEffect(() => {
    let alive = true,
      objectUrl = "";
    (async () => {
      try {
        const media = blob ?? (await getAttachment(projectId, attachment.id));
        if (!alive) return;
        if (!media) {
          setError(true);
          return;
        }
        objectUrl = URL.createObjectURL(media);
        setUrl(objectUrl);
      } catch {
        if (alive) setError(true);
      }
    })();
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [projectId, attachment.id, blob]);
  if (error)
    return (
      <p className="conversation-media-error">
        Media unavailable on this browser.
      </p>
    );
  if (!url) return <span className="conversation-media-loading">…</span>;
  return attachment.kind === "image" ? (
    <a href={url} target="_blank" rel="noreferrer">
      <img className="conversation-image" src={url} alt={attachment.name} />
    </a>
  ) : (
    <audio
      controls
      className="conversation-audio"
      src={url}
      aria-label={attachment.name}
    />
  );
}
interface Props {
  project: DemoProject;
  de: boolean;
  panel: ChatPanel;
  onClosePanel: () => void;
  onPanel: (panel: ChatPanel) => void;
  onUpdate: (status: ProjectStatus, inspected: boolean) => void;
}
export function ProjectChat({
  project,
  de,
  panel,
  onClosePanel,
  onPanel,
  onUpdate,
}: Props) {
  const [initial] = useState(() => {
    try {
      return { messages: loadMessages(project.id), error: "" };
    } catch {
      return {
        messages: [] as ProjectMessage[],
        error: "Saved chat could not be read. Existing data has been retained.",
      };
    }
  });
  const [offerState] = useState(() => {
    try { return { offer: loadOffer(project.id), error: "" }; }
    catch { return { offer: null, error: de ? "Gespeicherter Entwurf konnte nicht gelesen werden." : "Saved draft could not be read. Existing data has been retained." }; }
  });
  const [offer, setOffer] = useState<OfferDraft | null>(offerState.offer);
  function updateOffer(next: OfferDraft) {
    try { saveOffer(next); setOffer(next); setError(""); }
    catch { setError(de ? "Entwurf konnte nicht gespeichert werden." : "Draft could not be saved. Please retry."); }
  }
  const [messages, setMessages] = useState(initial.messages),
    [text, setText] = useState(""),
    [error, setError] = useState(initial.error),
    [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<{
    attachment: ChatAttachment;
    blob: Blob;
  } | null>(null);
  const [draftStatus, setDraftStatus] = useState(project.status),
    [inspected, setInspected] = useState(project.inspected),
    [statusSaved, setStatusSaved] = useState(false);
  const thread = useRef<HTMLDivElement>(null),
    imageInput = useRef<HTMLInputElement>(null),
    alive = useRef(true),
    input = useRef<HTMLTextAreaElement>(null),
    side = useRef<HTMLElement>(null);
  const proposal = lastSentProposal(project.id);
  const voice = useVoiceNote((blob) => {
    if (blob.size > 10 * 1024 * 1024) {
      setError(
        de
          ? "Sprachnotiz ist zu groß (max. 10 MB)."
          : "Voice note exceeds 10 MB.",
      );
      return;
    }
    setPending({
      blob,
      attachment: {
        id: crypto.randomUUID(),
        name: de ? "Sprachnotiz" : "Voice note",
        kind: "audio",
        type: blob.type,
      },
    });
  });
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    thread.current?.scrollTo({
      top: thread.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);
  useEffect(() => {
    if (panel) {
      side.current?.focus();
      const close = (event: KeyboardEvent) => {
        if (event.key === "Escape") onClosePanel();
      };
      document.addEventListener("keydown", close);
      return () => document.removeEventListener("keydown", close);
    }
  }, [panel, onClosePanel]);
  async function send() {
    if (busy || voice.recording || initial.error || (!text.trim() && !pending))
      return;
    setBusy(true);
    setError("");
    const content = text.trim(),
      attachment = pending;
    try {
      if (attachment)
        await saveAttachment(
          project.id,
          attachment.attachment,
          attachment.blob,
        );
      const wantsOffer = offerRequested(content);
      if (wantsOffer && offerState.error) throw Error(offerState.error);
      const context = [...messages.filter(m => m.role === "user").map(m => m.text), content].join("\n");
      const draft = wantsOffer ? (offer ? {...offer, context, reviewed: false} : createOffer(project, context)) : null;
      if (draft) saveOffer(draft);
      const next: ProjectMessage[] = [
        ...messages,
        {
          id: crypto.randomUUID(),
          role: "user",
          text: content,
          at: Date.now(),
          ...(attachment ? { attachment: attachment.attachment } : {}),
        },
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: wantsOffer
            ? (de ? "Ihr Angebotsentwurf ist bereit. Prüfen Sie im Seitenfenster Leistungen, Mengen, Preise, Adressen und Bedingungen. Dort können Sie das deutsche PDF herunterladen. Nicht bestätigte Angaben bleiben offen; dies ist keine rechtlich geprüfte Vorlage." : "Your offer draft is ready. Review the scope, quantities, prices, addresses and conditions beside the chat, then download the German PDF. Unconfirmed details remain blank; this template has not been legally reviewed.")
            : projectReply(project, content, de, attachment?.attachment),
          ...(wantsOffer ? { offerDraft: true } : {}),
          at: Date.now(),
        },
      ];
      saveMessages(project.id, next);
      if (alive.current) {
        setMessages(next);
        if (draft) { setOffer(draft); onPanel("draft"); }
        setText("");
        setPending(null);
        if (input.current) input.current.style.height = "auto";
      }
    } catch {
      if (alive.current)
        setError(
          de
            ? "Speichern fehlgeschlagen. Nachricht ist nicht gesendet. Bitte erneut versuchen."
            : "Save failed. The message was not sent. Please retry.",
        );
    } finally {
      if (alive.current) setBusy(false);
    }
  }
  const money = (cents: number) =>
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);
  const net =
      proposal?.lines.reduce(
        (sum, line) => sum + Math.round(line.quantity * line.unitCents),
        0,
      ) ?? 0,
    vat = proposal ? Math.round((net * proposal.vatPercent) / 100) : 0;
  return (
    <div className={`conversation-layout ${panel ? "has-panel" : ""} ${panel === "draft" ? "has-offer-panel" : ""}`}>
      <section
        className="conversation-main"
        aria-label={de ? "Projektchat" : "Project chat"}
      >
        <div
          className="conversation-thread"
          ref={thread}
          role="log"
          aria-live="polite"
          aria-label={de ? "Unterhaltung" : "Conversation"}
        >
          {messages.length === 0 && (
            <div className="conversation-bubble assistant">
              <p>
                {de
                  ? "Ich habe den Projektbrief vorliegen. Was möchten Sie zu diesem Vorhaben klären? Sie können schreiben, ein Foto hinzufügen oder eine Sprachnotiz aufnehmen."
                  : "I have the project brief. What would you like to clarify about this project? You can type, add a photo or record a voice note."}
              </p>
            </div>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={`conversation-bubble ${message.role}`}
            >
              {message.text && <p>{message.text}</p>}
              {message.offerDraft && offer && <button className="back-to-projects" onClick={() => onPanel("draft")}>{de ? "Angebot prüfen & PDF" : "Review offer & PDF"}</button>}
              {message.attachment && (
                <ChatMedia
                  projectId={project.id}
                  attachment={message.attachment}
                />
              )}
              <small>
                {new Date(message.at).toLocaleTimeString(
                  de ? "de-DE" : "en-GB",
                  { hour: "2-digit", minute: "2-digit" },
                )}
              </small>
            </div>
          ))}
        </div>
        <div className="conversation-composer">
          {pending && (
            <div className="conversation-pending">
              <ChatMedia
                projectId={project.id}
                attachment={pending.attachment}
                blob={pending.blob}
              />
              <span>{pending.attachment.name}</span>
              <button
                className="chat-icon-button"
                disabled={busy || voice.recording}
                aria-label={de ? "Anhang entfernen" : "Remove attachment"}
                onClick={() => setPending(null)}
              >
                <Icon name="close" size={16} />
              </button>
            </div>
          )}
          <div className="conversation-input-row">
            <input
              ref={imageInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              aria-label={de ? "Bild auswählen" : "Choose image"}
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (!file) return;
                if (
                  !["image/jpeg", "image/png", "image/webp"].includes(
                    file.type,
                  ) ||
                  !file.size ||
                  file.size > 10 * 1024 * 1024
                ) {
                  setError(
                    de
                      ? "JPG, PNG oder WebP auswählen, max. 10 MB."
                      : "Choose a non-empty JPG, PNG or WebP, up to 10 MB.",
                  );
                  return;
                }
                setError("");
                setPending({
                  blob: file,
                  attachment: {
                    id: crypto.randomUUID(),
                    name: file.name,
                    kind: "image",
                    type: file.type,
                  },
                });
              }}
            />
            <button
              className="chat-icon-button"
              disabled={busy || voice.recording}
              aria-label={de ? "Bild hinzufügen" : "Add image"}
              onClick={() => imageInput.current?.click()}
            >
              <Icon name="image" />
            </button>
            <textarea
              ref={input}
              rows={1}
              aria-label={de ? "Nachricht" : "Message"}
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                event.target.style.height = "auto";
                event.target.style.height = `${Math.min(event.target.scrollHeight, 112)}px`;
              }}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  void send();
                }
              }}
              placeholder={
                voice.recording
                  ? de
                    ? "Aufnahme läuft…"
                    : "Recording…"
                  : de
                    ? "Nachricht schreiben…"
                    : "Type a message…"
              }
            />
            <button
              className={`chat-icon-button ${voice.recording ? "is-recording" : ""}`}
              disabled={busy || !!pending}
              aria-label={
                voice.recording
                  ? de
                    ? "Aufnahme stoppen"
                    : "Stop recording"
                  : de
                    ? "Sprachnotiz aufnehmen"
                    : "Record voice note"
              }
              onClick={voice.recording ? voice.stop : () => void voice.start()}
            >
              <Icon name={voice.recording ? "stop" : "mic"} />
            </button>
            <button
              className="conversation-send"
              disabled={
                busy ||
                voice.recording ||
                (!text.trim() && !pending) ||
                !!initial.error
              }
              aria-label={de ? "Senden" : "Send"}
              onClick={() => void send()}
            >
              <Icon name="send" size={18} />
            </button>
          </div>
          {(error || voice.error) && (
            <p className="conversation-error" role="alert">
              {error ||
                (de
                  ? "Mikrofonaufnahme nicht verfügbar. Bitte verwenden Sie Texteingabe oder versuchen Sie es erneut."
                  : voice.error)}
            </p>
          )}
          <p
            className="conversation-caption"
            role={busy || voice.recording ? "status" : undefined}
          >
            {busy
              ? de
                ? "Wird lokal gespeichert…"
                : "Saving locally…"
              : voice.recording
                ? de
                  ? "Aufnahme läuft · max. 2 Minuten · Stopp zum Anhängen"
                  : "Recording · up to 2 minutes · stop to attach"
                : de
                  ? "Lokale KI-Demo · Bilder und Audio werden nicht automatisch ausgewertet"
                  : "Local AI demo · images and audio are not automatically analyzed"}
          </p>
        </div>
      </section>
      {panel && (
        <>
          <button
            className="conversation-panel-backdrop"
            aria-label={de ? "Seitenansicht schließen" : "Close side panel"}
            onClick={onClosePanel}
          />
          <aside
            className="conversation-side-panel"
            ref={side}
            tabIndex={-1}
            aria-labelledby="conversation-panel-heading"
          >
            <div className="conversation-panel-heading">
              <h2 id="conversation-panel-heading">
                {panel === "draft" ? (de ? "Angebotsentwurf" : "Offer draft") : panel === "status"
                  ? de
                    ? "Status ändern"
                    : "Change status"
                  : de
                    ? "Zuletzt gesendetes Angebot"
                    : "Latest sent proposal"}
              </h2>
              <button
                className="chat-icon-button"
                aria-label={de ? "Seitenansicht schließen" : "Close side panel"}
                onClick={onClosePanel}
              >
                <Icon name="close" size={18} />
              </button>
            </div>
            {panel === "draft" && offer ? <OfferReview offer={offer} de={de} onChange={updateOffer} /> : panel === "status" ? (
              <form
                className="conversation-status-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  onUpdate(draftStatus, inspected);
                  setStatusSaved(true);
                }}
              >
                <label htmlFor="chat-project-status">
                  {de ? "Projektstatus" : "Project status"}
                </label>
                <select
                  id="chat-project-status"
                  value={draftStatus}
                  onChange={(event) => {
                    setDraftStatus(event.target.value as ProjectStatus);
                    setStatusSaved(false);
                  }}
                >
                  {projectStatuses.map((value) => (
                    <option key={value} value={value}>
                      {statusLabel(value, de)}
                    </option>
                  ))}
                </select>
                <label className="inspection-control">
                  <input
                    type="checkbox"
                    checked={inspected}
                    onChange={(event) => {
                      setInspected(event.target.checked);
                      setStatusSaved(false);
                    }}
                  />
                  {de ? "Besichtigung abgeschlossen" : "Site visit completed"}
                </label>
                <p>
                  {de
                    ? "Besichtigung und Projektstatus sind unabhängig. Eine Statusänderung sendet kein Angebot."
                    : "Site visits and project status are independent. Changing status does not send a proposal."}
                </p>
                <button className="acknowledge-request" type="submit">
                  {de ? "Änderungen speichern" : "Save changes"}
                </button>
                {statusSaved && (
                  <p role="status">
                    {de ? "Status aktualisiert." : "Status updated."}
                  </p>
                )}
              </form>
            ) : proposal ? (
              <div className="conversation-proposal">
                <span className="proposal-demo-label">
                  {de
                    ? "Demo-Versandstand · kein echter Versand"
                    : "Demo sent snapshot · no real delivery"}
                </span>
                <p className="proposal-reference">
                  {proposal.id} · v{proposal.version}
                </p>
                <h3>{de ? proposal.titleDe : proposal.title}</h3>
                <p className="proposal-sent-date">
                  {de ? "Erfasst am" : "Recorded on"}{" "}
                  {new Date(proposal.sentAt).toLocaleDateString("de-DE")}
                </p>
                {proposal.lines.map((line) => (
                  <div className="proposal-line" key={line.name}>
                    <div>
                      <strong>{de ? line.nameDe : line.name}</strong>
                      <small>
                        {line.quantity.toLocaleString("de-DE")} {line.unit} ×{" "}
                        {money(line.unitCents)}
                      </small>
                    </div>
                    <span>
                      {money(Math.round(line.quantity * line.unitCents))}
                    </span>
                  </div>
                ))}
                <dl className="proposal-totals">
                  <div>
                    <dt>Netto</dt>
                    <dd>{money(net)}</dd>
                  </div>
                  <div>
                    <dt>USt. {proposal.vatPercent}%</dt>
                    <dd>{money(vat)}</dd>
                  </div>
                  <div>
                    <dt>{de ? "Gesamt" : "Total"}</dt>
                    <dd>{money(net + vat)}</dd>
                  </div>
                </dl>
                <p>{de ? proposal.conditionsDe : proposal.conditions}</p>
                <p className="proposal-pricing-note">
                  {de
                    ? "Illustrative Beispielpreise, keine Lieferantenangebote. Dieser Stand bleibt unabhängig vom Chat und aktuellen Projektstatus erhalten."
                    : "Illustrative demo prices, not supplier quotes. This snapshot is retained independently of the chat and current project status."}
                </p>
              </div>
            ) : (
              <div className="conversation-proposal-empty">
                <Icon name="proposal" size={30} />
                <h3>
                  {de
                    ? "Noch kein versendetes Angebot"
                    : "No sent proposal recorded"}
                </h3>
                <p>
                  {de
                    ? "Hier erscheint das zuletzt gespeicherte Versanddokument für dieses Projekt. Ein Status allein ist kein Versandnachweis."
                    : "The latest recorded sent proposal for this project will appear here. A status alone is not proof of delivery."}
                </p>
              </div>
            )}
          </aside>
        </>
      )}
    </div>
  );
}

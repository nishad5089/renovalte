import type { DemoProject } from "./demoProjects";
import { projectBriefs } from "./projectBriefs";
export interface ChatAttachment {
  id: string;
  name: string;
  kind: "image" | "audio";
  type: string;
}
export interface ProjectMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  at: number;
  attachment?: ChatAttachment;
  offerDraft?: boolean;
}
const VIEWED = "renovaite.viewed-projects.v1";
const CHAT = "renovaite.project-chats.v1";
export function viewedProjects(): string[] {
  const raw = localStorage.getItem(VIEWED);
  if (!raw) return [];
  const ids: unknown = JSON.parse(raw);
  if (!Array.isArray(ids) || !ids.every((id) => typeof id === "string"))
    throw Error("Invalid project visit history");
  return ids;
}
export function markProjectViewed(id: string) {
  localStorage.setItem(
    VIEWED,
    JSON.stringify([...new Set([...viewedProjects(), id])]),
  );
}
export function loadMessages(id: string): ProjectMessage[] {
  const data: unknown = JSON.parse(localStorage.getItem(CHAT) ?? "{}");
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw Error("Invalid chat history");
  const messages = (data as Record<string, unknown>)[id] ?? [];
  if (
    !Array.isArray(messages) ||
    !messages.every(
      (m) =>
        m &&
        typeof m.id === "string" &&
        ["user", "assistant"].includes(m.role) &&
        typeof m.text === "string",
    )
  )
    throw Error("Invalid project chat");
  return messages as ProjectMessage[];
}
export function saveMessages(id: string, messages: ProjectMessage[]) {
  const data: unknown = JSON.parse(localStorage.getItem(CHAT) ?? "{}");
  if (!data || typeof data !== "object" || Array.isArray(data))
    throw Error("Invalid chat history");
  localStorage.setItem(CHAT, JSON.stringify({ ...data, [id]: messages }));
}
function openMedia(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("renovaite-project-media", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("files");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
export async function saveAttachment(
  projectId: string,
  attachment: ChatAttachment,
  blob: Blob,
) {
  const db = await openMedia();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("files", "readwrite");
      tx.objectStore("files").put(blob, `${projectId}/${attachment.id}`);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
export async function getAttachment(
  projectId: string,
  attachmentId: string,
): Promise<Blob | undefined> {
  const db = await openMedia();
  try {
    return await new Promise((resolve, reject) => {
      const request = db
        .transaction("files")
        .objectStore("files")
        .get(`${projectId}/${attachmentId}`);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}
export function projectReply(
  project: DemoProject,
  text: string,
  de: boolean,
  attachment?: ChatAttachment,
): string {
  const brief = projectBriefs[project.id];
  const value = text.toLowerCase();
  const pick = (v: { de: string; en: string }) => (de ? v.de : v.en);
  if (attachment?.kind === "audio")
    return de
      ? "Ihre Sprachnotiz wurde lokal gespeichert. Sie können sie im Chat abspielen. Eine automatische Transkription ist noch nicht verbunden; ergänzen Sie wichtige Punkte bitte als Text."
      : "Your voice note is saved locally and can be played in the chat. Automatic transcription is not connected yet; please add key points as text.";
  if (attachment?.kind === "image")
    return de
      ? "Das Foto wurde dem Projektchat hinzugefügt. Beschreiben Sie bitte, welche Stelle oder Frage wichtig ist. Bilder werden in dieser lokalen Demo nicht automatisch analysiert."
      : "The photo was added to this project chat. Please describe the important area or question. Images are not automatically analyzed in this local demo.";
  if (/budget|preis|kosten|cost|price/.test(value))
    return `${de ? "Der angegebene Kundenbudgetrahmen beträgt" : "The recorded customer budget is"} ${new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(project.budget)}. ${de ? "Das ist kein Angebotspreis. Steuerbasis, Mengen und Einheitspreise sind noch zu bestätigen." : "This is not a quoted price. Tax basis, quantities and unit prices still need confirmation."}`;
  if (brief && /maß|menge|fläche|measure|area|quantit|dimension/.test(value))
    return `${de ? "Die Raumfläche ist mit ca." : "The approximate room area is"} ${brief.area} m² ${de ? "als Kundenangabe erfasst, nicht als Aufmaß." : "from the customer brief, not a site measurement."} ${pick(brief.questions[0])}`;
  if (brief && /termin|zeit|timeline|when|date|schedule/.test(value))
    return `${pick(brief.timing)}. ${de ? "Einen verbindlichen Beginn und die Bauzeit bitte mit dem Kunden abstimmen." : "Please agree a confirmed start and execution period with the customer."}`;
  if (brief && /material|finish|ausstattung/.test(value))
    return pick(brief.materials);
  if (brief && /sicher|safety|elektr|gas|tragend|hazard/.test(value))
    return (
      brief.checks.map(pick).join("\n") +
      (de
        ? "\nKeine Arbeitsfreigabe. Gefährliche oder regulierte Arbeiten fachlich prüfen lassen."
        : "\nThis is not authorization to work. Refer hazardous or regulated work to qualified professionals.")
    );
  if (brief && /offen|missing|fehl|next|nächst|question|frage/.test(value))
    return brief.questions.map((q, i) => `${i + 1}. ${pick(q)}`).join("\n");
  return `${de ? "Zum Projekt ist folgender Umfang hinterlegt:" : "The recorded project scope is:"}\n${de ? project.scopeDe : project.scope}\n\n${de ? "Was möchten Sie genauer klären: Materialien, Aufmaß oder Termine?" : "What would you like to clarify: materials, measurements or timing?"}`;
}

const TRACKING = "renovaite.project-tracking.v1";
export function loadProjectTracking(seed: DemoProject[]): DemoProject[] {
  const raw: unknown = JSON.parse(localStorage.getItem(TRACKING) ?? "{}");
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw Error("Invalid project tracking");
  return seed.map((project) => {
    const entry = (raw as Record<string, unknown>)[project.id];
    if (!entry || typeof entry !== "object") return project;
    const record = entry as { status?: unknown; inspected?: unknown };
    const allowed = [
      "new",
      "acknowledged",
      "proposal_sent",
      "accepted",
      "in_progress",
      "completed",
      "declined",
      "cancelled",
    ];
    return typeof record.status === "string" &&
      allowed.includes(record.status) &&
      typeof record.inspected === "boolean"
      ? {
          ...project,
          status: record.status as DemoProject["status"],
          inspected: record.inspected,
        }
      : project;
  });
}
export function saveProjectTracking(project: DemoProject) {
  const raw: unknown = JSON.parse(localStorage.getItem(TRACKING) ?? "{}");
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw Error("Invalid project tracking");
  localStorage.setItem(
    TRACKING,
    JSON.stringify({
      ...raw,
      [project.id]: { status: project.status, inspected: project.inspected },
    }),
  );
}

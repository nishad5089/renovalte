export const projectStatuses = [
  "new",
  "acknowledged",
  "proposal_sent",
  "accepted",
  "in_progress",
  "completed",
  "declined",
  "cancelled",
] as const;
export type ProjectStatus = (typeof projectStatuses)[number];
export const closedStatuses: ProjectStatus[] = [
  "completed",
  "declined",
  "cancelled",
];
export function statusLabel(status: ProjectStatus, de: boolean) {
  return {
    new: ["New request", "Neue Anfrage"],
    acknowledged: ["Acknowledged", "Bestätigt"],
    proposal_sent: ["Proposal sent", "Angebot gesendet"],
    accepted: ["Accepted", "Angenommen"],
    in_progress: ["In progress", "In Bearbeitung"],
    completed: ["Completed", "Abgeschlossen"],
    declined: ["Declined", "Abgelehnt"],
    cancelled: ["Cancelled", "Storniert"],
  }[status][de ? 1 : 0];
}

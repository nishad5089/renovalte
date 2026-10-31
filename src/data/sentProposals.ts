export interface SentProposal {
  id: string;
  projectId: string;
  version: number;
  sentAt: string;
  title: string;
  titleDe: string;
  lines: {
    name: string;
    nameDe: string;
    quantity: number;
    unit: string;
    unitCents: number;
  }[];
  vatPercent: number;
  conditions: string;
  conditionsDe: string;
  simulated: true;
}
// Immutable illustrative history, not generated from the live project budget/status.
export const sentProposals: readonly SentProposal[] = [
  Object.freeze({
    id: "ANG-2026-004",
    projectId: "REN-004",
    version: 1,
    sentAt: "2026-10-29T10:00:00+01:00",
    title: "Bedroom flooring",
    titleDe: "Schlafzimmer-Bodenarbeiten",
    lines: [
      {
        name: "Floor covering",
        nameDe: "Bodenbelag",
        quantity: 22,
        unit: "m²",
        unitCents: 4500,
      },
      {
        name: "Skirting boards",
        nameDe: "Sockelleisten",
        quantity: 44,
        unit: "m",
        unitCents: 1000,
      },
      {
        name: "Labor",
        nameDe: "Arbeitszeit",
        quantity: 40,
        unit: "h",
        unitCents: 6500,
      },
      {
        name: "Substrate preparation",
        nameDe: "Untergrundvorbereitung",
        quantity: 22,
        unit: "m²",
        unitCents: 2500,
      },
      {
        name: "Waste removal",
        nameDe: "Entsorgung",
        quantity: 1,
        unit: "psch.",
        unitCents: 22000,
      },
    ],
    vatPercent: 19,
    conditions:
      "Illustrative snapshot. Confirm quantities, materials, execution dates and payment terms before real use. No actual customer delivery or legal verification occurred.",
    conditionsDe:
      "Illustrativer Stand. Mengen, Materialien, Termine und Zahlungsbedingungen vor echter Nutzung bestätigen. Kein tatsächlicher Kundenversand und keine Rechtsprüfung.",
    simulated: true as const,
  }),
];
export function lastSentProposal(projectId: string) {
  return (
    sentProposals
      .filter((p) => p.projectId === projectId)
      .sort((a, b) => Date.parse(b.sentAt) - Date.parse(a.sentAt))[0] ?? null
  );
}

export function sentProposalGrossCents(projectId: string): number | null {
  const proposal = lastSentProposal(projectId);
  if (!proposal) return null;
  const net = proposal.lines.reduce(
    (sum, line) => sum + Math.round(line.quantity * line.unitCents), 0,
  );
  return net + Math.round(net * proposal.vatPercent / 100);
}

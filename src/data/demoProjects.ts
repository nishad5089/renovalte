import type { ProjectStatus } from "./projectStatus";

export interface DemoProject {
  id: string;
  name: string;
  nameDe: string;
  type: string;
  typeDe: string;
  city: string;
  budget: number;
  status: ProjectStatus;
  inspected: boolean;
  image: string;
  scope: string;
  scopeDe: string;
}
export const demoProjects: DemoProject[] = [
  {
    id: "REN-001",
    name: "Altbau Kitchen Modernization",
    nameDe: "Altbau-Küchenmodernisierung",
    type: "Kitchen",
    typeDe: "Küche",
    city: "Frankfurt",
    budget: 12000,
    status: "new",
    inspected: false,
    image: "/images/project-kitchen.jpg",
    scope:
      "Replace cabinets and worktop, improve lighting and retain the existing layout where possible.",
    scopeDe:
      "Schränke und Arbeitsplatte erneuern, Beleuchtung verbessern und den vorhandenen Grundriss möglichst erhalten.",
  },
  {
    id: "REN-002",
    name: "Bathroom Renovation",
    nameDe: "Badezimmerrenovierung",
    type: "Bathroom",
    typeDe: "Badezimmer",
    city: "Wiesbaden",
    budget: 9500,
    status: "acknowledged",
    inspected: true,
    image: "/images/project-bathroom.jpg",
    scope:
      "Update the family bathroom with a walk-in shower, new vanity and modern finishes.",
    scopeDe:
      "Familienbad mit bodengleicher Dusche, neuem Waschtisch und modernen Oberflächen erneuern.",
  },
  {
    id: "REN-003",
    name: "Living Room Restoration",
    nameDe: "Wohnzimmerrestaurierung",
    type: "Living Room",
    typeDe: "Wohnzimmer",
    city: "Mainz",
    budget: 4200,
    status: "in_progress",
    inspected: true,
    image: "/images/project-living.jpg",
    scope:
      "Refinish the original parquet and repaint walls while retaining the character of the building.",
    scopeDe:
      "Originalparkett aufarbeiten und Wände streichen, dabei den Charakter des Gebäudes erhalten.",
  },
  {
    id: "REN-004",
    name: "Bedroom Flooring",
    nameDe: "Schlafzimmer-Bodenbelag",
    type: "Bedroom Flooring",
    typeDe: "Schlafzimmerboden",
    city: "Darmstadt",
    budget: 5800,
    status: "proposal_sent",
    inspected: false,
    image: "/images/project-bedroom.jpg",
    scope:
      "Replace bedroom flooring and skirting boards with a warm oak finish.",
    scopeDe:
      "Bodenbeläge und Sockelleisten der Schlafzimmer mit warmer Eichenoptik erneuern.",
  },
  {
    id: "REN-005",
    name: "Kitchen Refresh",
    nameDe: "Küchenauffrischung",
    type: "Kitchen Refresh",
    typeDe: "Küchenauffrischung",
    city: "Offenbach",
    budget: 7000,
    status: "completed",
    inspected: true,
    image: "/images/project-refresh.jpg",
    scope:
      "Refresh cabinet fronts, worktop and splashback without a complete kitchen replacement.",
    scopeDe:
      "Schrankfronten, Arbeitsplatte und Spritzschutz auffrischen, ohne die gesamte Küche auszutauschen.",
  },
];

import type { Project, ProjectStatus, ProjectType } from '../types';

export const statusLabels: Record<ProjectStatus, string> = {
  new: 'New',
  summarized: 'Summarized',
  inspected: 'Inspected',
  draft: 'Draft',
  sent: 'Sent',
};

export const statusBadgeColors: Record<ProjectStatus, string> = {
  new: 'bg-brand-50 text-brand-700',
  summarized: 'bg-accent-100 text-accent-700',
  inspected: 'bg-warning-100 text-warning-600',
  draft: 'bg-navy-100 text-navy-700',
  sent: 'bg-success-100 text-success-700',
};

export const statusDotColors: Record<ProjectStatus, string> = {
  new: 'bg-brand-500',
  summarized: 'bg-accent-500',
  inspected: 'bg-warning-500',
  draft: 'bg-navy-400',
  sent: 'bg-success-500',
};

export const typeLabels: Record<ProjectType, string> = {
  kitchen: 'Kitchen',
  bathroom: 'Bathroom',
  living_room: 'Living Room',
  bedroom_flooring: 'Bedroom Flooring',
  kitchen_refresh: 'Kitchen Refresh',
};

export const typeIcons: Record<ProjectType, string> = {
  kitchen: 'CookingPot',
  bathroom: 'Bath',
  living_room: 'Sofa',
  bedroom_flooring: 'BedDouble',
  kitchen_refresh: 'Soup',
};

export function formatEuro(value: number): string {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value);
}

export function formatEuroShort(value: number): string {
  return `€${value.toLocaleString('en-IE')}`;
}

const requirementREN001 =
  'I want to renovate my 14m² kitchen. Replace old cabinets and countertop, improve lighting, retain the current layout if possible. I prefer light oak cabinets, white surfaces, and Scandinavian styling.';

const transcriptREN001 =
  'Interview recorded 2026-10-22 at the customer site in Frankfurt. Customer wants to keep existing water and electrical connections to reduce cost. Cabinet fronts in light oak, worktop in white quartz. Under-cabinet LED strips for improved task lighting. Old appliances (oven, dishwasher) to be replaced with energy-efficient models. No structural changes to walls or floor. Timeline: ideally before the Christmas holidays.';

export const projects: Project[] = [
  {
    id: 'REN-001',
    name: 'Altbau Kitchen Modernization',
    city: 'Frankfurt',
    budget: 12000,
    status: 'new',
    type: 'kitchen',
    customerName: 'Thomas Bergmann',
    customerEmail: 't.bergmann@example.de',
    address: 'Schweizer Str. 18, 60594 Frankfurt',
    createdAt: '2026-10-22',
    customerRequirement: requirementREN001,
    photos: [
      { id: 'ph1', url: 'https://images.pexels.com/photos/36777558/pexels-photo-36777558.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', caption: 'Reference: target style (Scandinavian oak)' },
      { id: 'ph2', url: 'https://images.pexels.com/photos/8031907/pexels-photo-8031907.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', caption: 'Reference: white surfaces & island lighting' },
    ],
    audioTranscript: transcriptREN001,
    aiSummary: null,
    rooms: '14m² kitchen',
    style: 'Scandinavian',
    timeline: 'Before Christmas 2026',
  },
  {
    id: 'REN-002',
    name: 'Bathroom Renovation',
    city: 'Wiesbaden',
    budget: 9500,
    status: 'summarized',
    type: 'bathroom',
    customerName: 'Lisa Hofmann',
    customerEmail: 'l.hofmann@example.de',
    address: 'Sonnenbergstr. 5, 65193 Wiesbaden',
    createdAt: '2026-10-19',
    customerRequirement:
      'Complete bathroom renovation for a 7m² family bathroom. Replace bathtub with a walk-in shower, install a double vanity, add underfloor heating. Marble-look porcelain tiles, wall-mounted toilet. Modern, clean, family-friendly.',
    photos: [
      { id: 'ph3', url: 'https://images.pexels.com/photos/35868664/pexels-photo-35868664.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', caption: 'Reference: double vanity & marble tiles' },
      { id: 'ph4', url: 'https://images.pexels.com/photos/7587289/pexels-photo-7587289.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', caption: 'Reference: walk-in shower style' },
    ],
    audioTranscript:
      'Site interview 2026-10-19. Customer wants to remove the existing tub and install a level-access walk-in shower with glass enclosure. Underfloor heating required. Existing pipework is accessible from below (basement). Wall-mounted WC preferred. Storage niches in shower area requested.',
    aiSummary:
      'AI Summary: Full bathroom renovation, ~7m². Key scope: remove bathtub, install walk-in shower (level-access, glass enclosure), double vanity, wall-mounted WC, underfloor heating. Materials: marble-look porcelain large-format tiles. Plumbing: accessible from basement — favour minimal rerouting. Note: verify load capacity for wall-mounted WC and ensure waterproofing per DIN 18534. Estimated effort aligns with €9,500 budget. Recommended next step: on-site inspection to confirm pipework.',
    rooms: '7m² family bathroom',
    style: 'Modern marble-look',
    timeline: 'Q1 2027',
  },
  {
    id: 'REN-003',
    name: 'Living Room Restoration',
    city: 'Mainz',
    budget: 4200,
    status: 'draft',
    type: 'living_room',
    customerName: 'Andreas Keller',
    customerEmail: 'a.keller@example.de',
    address: 'Augustinerstr. 41, 55131 Mainz',
    createdAt: '2026-10-16',
    customerRequirement:
      'Restore the living room in a 1905 Altbau — expose and refinish original oak parquet, strip and repaint walls (currently covered with wallpaper), repair ceiling cracks, and reinstate original wooden window reveals. Keep the historic character.',
    photos: [
      { id: 'ph5', url: 'https://images.pexels.com/photos/3935327/pexels-photo-3935327.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', caption: 'Reference: oak floor finish' },
      { id: 'ph6', url: 'https://images.pexels.com/photos/3935315/pexels-photo-3935315.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', caption: 'Reference: bright restored living room' },
    ],
    audioTranscript:
      'Customer interview 2026-10-16. Parquet suspected under a laminate overlay and foam underlay — condition unknown. Wallpaper is multi-layered; test patch needed for stripping effort. Ceiling has hairline cracks, likely lime plaster. Window reveals were originally wood but partly boxed in with MDF in the 1990s. Customer wants them exposed and sanded.',
    aiSummary: null,
    rooms: 'Living room ~22m²',
    style: 'Historic Altbau restoration',
    timeline: 'Flexible',
  },
  {
    id: 'REN-004',
    name: 'Bedroom Flooring',
    city: 'Darmstadt',
    budget: 5800,
    status: 'sent',
    type: 'bedroom_flooring',
    customerName: 'Sandra Vogel',
    customerEmail: 's.vogel@example.de',
    address: 'Rheinstr. 92, 64297 Darmstadt',
    createdAt: '2026-10-12',
    customerRequirement:
      'Replace carpet in two bedrooms (~12m² and ~10m²) with engineered oak flooring. Underfloor heating present — use heating-compatible adhesive. Include new skirting boards in white. Keep furniture in place if possible.',
    photos: [
      { id: 'ph7', url: 'https://images.pexels.com/photos/7587481/pexels-photo-7587481.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', caption: 'Reference: engineered oak bedroom floor' },
      { id: 'ph8', url: 'https://images.pexels.com/photos/775219/pexels-photo-775219.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', caption: 'Reference: bedroom atmosphere' },
    ],
    audioTranscript:
      'Phone interview 2026-10-12. Two bedrooms, carpet to be removed. Underfloor heating confirmed by customer (electric mat system). Customer will move furniture out before work. Skirting to be replaced with white MDF. Customer asked about acclimatisation period for engineered wood — advised 48–72h on site.',
    aiSummary:
      'AI Summary: Flooring replacement in two bedrooms (~22m² total). Scope: remove carpet + underlay, inspect subfloor, install engineered oak with heating-compatible adhesive (underfloor heating present — electric mat), new white MDF skirting. Acclimatisation 48–72h required. Risk: verify subfloor flatness and moisture before bonding. Budget €5,800 sufficient including materials. Proposal sent to customer on 2026-10-15.',
    rooms: 'Two bedrooms (~22m²)',
    style: 'Engineered oak',
    timeline: 'November 2026',
  },
  {
    id: 'REN-005',
    name: 'Kitchen Refresh',
    city: 'Offenbach',
    budget: 7000,
    status: 'inspected',
    type: 'kitchen_refresh',
    customerName: 'Markus Roth',
    customerEmail: 'm.roth@example.de',
    address: 'Berliner Str. 110, 63065 Offenbach',
    createdAt: '2026-10-08',
    customerRequirement:
      'Refresh rather than full renovation: replace cabinet fronts and worktop, re-tile splashback, install new pendant lighting, and paint walls. Keep existing cabinet carcasses and appliances. Budget-conscious update to modernise the look.',
    photos: [
      { id: 'ph9', url: 'https://images.pexels.com/photos/7535073/pexels-photo-7535073.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', caption: 'Reference: white cabinet refresh' },
      { id: 'ph10', url: 'https://images.pexels.com/photos/7168051/pexels-photo-7168051.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', caption: 'Reference: new worktop & splashback' },
    ],
    audioTranscript:
      'On-site inspection 2026-10-08. Carcasses in good condition (branded, ~8 years old). Door hinge holes are standard 35mm — replacement fronts will fit. Splashback tiles to be removed; plaster behind appears sound but needs priming. One electrical socket to be repositioned behind the new worktop — minor first-fix work. Pendant lighting points already wired in ceiling.',
    aiSummary:
      'AI Summary: Kitchen refresh (no carcass replacement). Scope: replacement fronts (35mm hinges compatible), new worktop, splashback re-tile + plaster prime, repaint walls, install 2 pendant lights (wiring present), reposition 1 socket. Carcasses confirmed good condition on inspection. Budget €7,000 adequate. Minor electrical first-fix required (qualified electrician). Next step: generate proposal.',
    rooms: 'Kitchen ~10m²',
    style: 'Modern refresh',
    timeline: 'December 2026',
  },
];

export function generateAISummary(project: Project): string {
  const typeLabel = typeLabels[project.type];
  const budget = formatEuro(project.budget);
  const lines = [
    `AI Summary: ${typeLabel} project "${project.name}" in ${project.city}.`,
    `Budget: ${budget}. Customer: ${project.customerName}.`,
    `Customer requirement: ${project.customerRequirement.slice(0, 140)}…`,
    `Photos reviewed: ${project.photos.length}. Audio transcript available (${project.audioTranscript.length} chars).`,
    'Recommended next step: schedule an on-site inspection to validate scope and confirm measurements before proposal generation.',
  ];
  return lines.join('\n\n');
}

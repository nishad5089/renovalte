import type { Project, PackageTier, ProposalOption, ProposalDraft, ProposalWorkStep, ProposalMaterial } from '../types';

const ESTIMATE_DISCLAIMER = 'Unverified demonstration values — illustrative estimates for prototype purposes only.';

export function estimateDisclaimer(): string {
  return ESTIMATE_DISCLAIMER;
}

/* ============================================================
 * Generate three proposal options (Basic, Standard, Premium)
 * REN-001 uses hand-crafted illustrative estimates per spec.
 * Other projects use deterministic budget-derived values.
 * ============================================================ */

export function generateProposalOptions(project: Project): ProposalOption[] {
  if (project.id === 'REN-001') {
    return [
      {
        tier: 'basic',
        label: 'Basic',
        tagline: 'Essential refresh — keep existing layout and connections',
        workScope: [
          'Replace cabinet fronts only (retain existing carcasses)',
          'New laminate worktop',
          'Repaint walls and ceiling',
          'Basic under-cabinet lighting (non-dimmable LED strip)',
        ],
        materials: [
          'Laminate cabinet fronts (oak-look finish)',
          'Laminate worktop (white)',
          'Standard LED strip (non-dimmable)',
          'Wall paint (standard white)',
        ],
        qualityLevel: 'Entry — functional materials, standard finish',
        priceMin: 6000,
        priceMax: 8000,
        durationWeeks: '1–2 weeks',
        assumptions: [
          'Existing carcasses are structurally sound and reusable',
          'No plumbing or electrical modifications required',
          'Standard 600mm module sizes apply',
        ],
        exclusions: [
          'New appliances',
          'Quartz or stone worktop',
          'Plumbing or electrical modifications',
          'Flooring changes',
          'Demolition of existing carcasses',
        ],
      },
      {
        tier: 'standard',
        label: 'Standard',
        tagline: 'Recommended — full cabinet replacement, quartz worktop',
        workScope: [
          'Replace all cabinets (fronts + carcasses)',
          'White quartz worktop',
          'Under-cabinet LED strips (dimmable)',
          'Repaint walls and ceiling',
          'Retain existing plumbing and electrical connections',
        ],
        materials: [
          'Light oak veneer cabinet fronts, soft-close hinges (Blum)',
          'White quartz worktop (Silestone / Caesarstone)',
          'Dimmable LED under-cabinet strips (24V)',
          'Brushed nickel handles',
          'Energy-efficient appliances (A++ rating)',
        ],
        qualityLevel: 'Mid-range — branded hardware, quartz surfaces, energy-efficient appliances',
        priceMin: 9000,
        priceMax: 12000,
        durationWeeks: '2–3 weeks',
        assumptions: [
          'Existing plumbing and electrical connections are sufficient for new appliances',
          'No structural wall or floor changes required',
          'Standard 600mm module sizes apply',
          'Floor can remain in place during works',
        ],
        exclusions: [
          'Structural wall removal or layout changes',
          'New flooring',
          'Premium appliance brands (Miele, Gaggenau)',
          'Custom cabinetry or non-standard sizes',
          'Splashback in natural stone',
        ],
      },
      {
        tier: 'premium',
        label: 'Premium',
        tagline: 'High-end — custom cabinetry, premium appliances, stone splashback',
        workScope: [
          'Custom solid oak cabinetry (fronts + carcasses)',
          'White quartz worktop with stone splashback',
          'Full dimmable LED lighting system (under-cabinet + recessed ceiling)',
          'Premium energy-efficient appliances (Miele)',
          'New skirting and wall preparation',
          'Retain layout; optional minor electrical upgrades',
        ],
        materials: [
          'Custom solid oak cabinet fronts, Blum Legabox soft-close',
          'Premium white quartz worktop (Caesarstone, 20mm)',
          'Natural stone splashback (matching quartz)',
          'Miele appliance package (oven, dishwasher, induction cooktop)',
          'Full dimmable LED system with smart control',
          'Brushed brass handles',
        ],
        qualityLevel: 'Premium — custom joinery, branded appliances, stone surfaces',
        priceMin: 13000,
        priceMax: 17000,
        durationWeeks: '3–5 weeks',
        assumptions: [
          'Minor electrical upgrades may be needed for premium appliances',
          'Custom cabinetry lead time ~3–4 weeks',
          'Stone splashback requires templating after worktop installation',
          'Customer is available for selection appointments',
        ],
        exclusions: [
          'Structural layout changes',
          'New flooring installation',
          'Plumbing relocation',
          'Permits or building authority fees',
        ],
      },
    ];
  }

  // Generic deterministic options derived from project budget
  const b = project.budget;
  return [
    genericOption(project, 'basic', b * 0.50, b * 0.70, '1–2 weeks'),
    genericOption(project, 'standard', b * 0.75, b * 1.00, '2–3 weeks'),
    genericOption(project, 'premium', b * 1.10, b * 1.40, '3–5 weeks'),
  ];
}

function genericOption(project: Project, tier: PackageTier, min: number, max: number, duration: string): ProposalOption {
  const labels: Record<PackageTier, { label: string; tagline: string; quality: string }> = {
    basic: { label: 'Basic', tagline: 'Essential renovation with standard materials', quality: 'Entry — standard materials, basic finish' },
    standard: { label: 'Standard', tagline: 'Recommended balance of quality and value', quality: 'Mid-range — branded materials, good finish' },
    premium: { label: 'Premium', tagline: 'High-end materials and premium finish', quality: 'Premium — premium materials, custom finish' },
  };
  const meta = labels[tier];
  return {
    tier,
    label: meta.label,
    tagline: meta.tagline,
    workScope: tierWorkScope(project, tier),
    materials: tierMaterials(project, tier),
    qualityLevel: meta.quality,
    priceMin: Math.round(min / 100) * 100,
    priceMax: Math.round(max / 100) * 100,
    durationWeeks: duration,
    assumptions: [
      'Existing utilities are sufficient unless stated otherwise',
      'No structural changes required',
      'Standard material lead times (~2–4 weeks)',
    ],
    exclusions: [
      'Structural modifications',
      'Permit fees',
      'Furniture or decoration',
    ],
  };
}

function tierWorkScope(project: Project, tier: PackageTier): string[] {
  const base = project.customerRequirement.split(/(?<=[.])\s+/).slice(0, 3).filter(Boolean);
  const scope = [...base];
  if (tier === 'premium') scope.push('Premium material upgrade and enhanced finish');
  if (tier === 'standard') scope.push('Standard branded materials with good finish');
  if (tier === 'basic') scope.push('Entry-level materials, essential scope only');
  return scope;
}

function tierMaterials(project: Project, tier: PackageTier): string[] {
  if (tier === 'premium') return ['Premium-grade materials (brand-specific)', 'Enhanced surface finishes', 'Premium hardware and fixtures'];
  if (tier === 'standard') return ['Branded mid-range materials', 'Standard surface finishes', 'Quality hardware and fixtures'];
  return ['Standard entry-level materials', 'Basic surface finishes', 'Standard hardware'];
}

/* ============================================================
 * Create an editable draft from a selected option
 * ============================================================ */

let idCounter = 0;
function uid(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

export function createDraftFromOption(project: Project, option: ProposalOption): ProposalDraft {
  const now = Date.now();
  return {
    id: uid('draft'),
    selectedTier: option.tier,
    title: `Renovation Proposal — ${project.name} (${option.label})`,
    scope: option.workScope.join('\n'),
    workSteps: defaultWorkSteps(option.tier, project),
    materials: option.materials.map((m, i) => ({
      id: uid('mat'),
      name: m,
      spec: '',
      quantity: i === 0 ? 'As required' : '',
    })),
    priceMin: option.priceMin,
    priceMax: option.priceMax,
    timeline: option.durationWeeks,
    assumptions: [...option.assumptions],
    createdAt: now,
    updatedAt: now,
  };
}

function defaultWorkSteps(tier: PackageTier, project: Project): ProposalWorkStep[] {
  const steps: ProposalWorkStep[] = [
    { id: uid('step'), title: 'Preparation & demolition', description: `Protect adjacent areas, remove existing fixtures in ${project.rooms ?? project.name}`, duration: tier === 'basic' ? '1 day' : '2–3 days' },
    { id: uid('step'), title: 'Plumbing & electrical check', description: 'Verify existing connections; minor first-fix if needed', duration: '1 day' },
    { id: uid('step'), title: 'Installation', description: 'Install new materials and fixtures per selected package', duration: tier === 'premium' ? '5–8 days' : tier === 'standard' ? '3–5 days' : '2–3 days' },
    { id: uid('step'), title: 'Finishing & cleanup', description: 'Painting, sealing, final adjustments, site cleanup', duration: '1–2 days' },
  ];
  return steps;
}

/* ============================================================
 * Simulated AI regeneration of individual sections
 * Deterministic — returns alternative phrasing based on tier.
 * ============================================================ */

export function regenerateScope(project: Project, draft: ProposalDraft): string {
  const tier = draft.selectedTier;
  const prefix = tier === 'premium' ? 'Comprehensive renovation' : tier === 'standard' ? 'Complete renovation' : 'Essential renovation';
  const lines = (draft.scope ?? '').split('\n').filter(Boolean);
  return [`${prefix} of ${project.rooms ?? project.name} in ${project.city}.`, ...lines.slice(1)].join('\n');
}

export function regenerateWorkSteps(project: Project, draft: ProposalDraft): ProposalWorkStep[] {
  const tier = draft.selectedTier;
  return [
    { id: uid('step'), title: 'Site setup & protection', description: `Secure work area, protect ${project.rooms ?? 'adjacent spaces'}, set up dust barriers`, duration: tier === 'basic' ? '0.5 day' : '1 day' },
    { id: uid('step'), title: 'Demolition & removal', description: 'Remove old materials, dispose of waste responsibly', duration: tier === 'premium' ? '2–3 days' : '1–2 days' },
    { id: uid('step'), title: 'Trades work — plumbing & electrical', description: 'Verify and adapt connections as needed for new installation', duration: tier === 'basic' ? '0.5 day' : '1–2 days' },
    { id: uid('step'), title: 'Primary installation', description: 'Install new cabinetry, surfaces, and fixtures', duration: tier === 'premium' ? '6–10 days' : tier === 'standard' ? '4–6 days' : '2–3 days' },
    { id: uid('step'), title: 'Finishing, sealing & QC', description: 'Final adjustments, sealing, quality check, deep clean', duration: '1–2 days' },
  ];
}

export function regenerateMaterials(project: Project, draft: ProposalDraft): ProposalMaterial[] {
  const tier = draft.selectedTier;
  const sets: Record<PackageTier, string[]> = {
    basic: ['Standard laminate fronts', 'Laminate worktop', 'Basic LED lighting', 'Standard paint'],
    standard: ['Branded veneer fronts (Blum hardware)', 'Quartz worktop', 'Dimmable LED strips', 'Quality paint + primer'],
    premium: ['Custom solid wood fronts (Blum Legabox)', 'Premium quartz + stone splashback', 'Smart LED system', 'Premium paint system'],
  };
  return sets[tier].map(m => ({
    id: uid('mat'),
    name: m,
    spec: tier === 'premium' ? 'Premium grade' : tier === 'standard' ? 'Mid-range branded' : 'Standard',
    quantity: 'As required',
  }));
}

export function regenerateAssumptions(project: Project, draft: ProposalDraft): string[] {
  return [
    `Existing utilities in ${project.city} property are sufficient for the selected scope`,
    'No structural changes required unless specified',
    'Material lead times ~2–4 weeks from order confirmation',
    'Customer available for on-site selections during the work period',
    draft.selectedTier === 'premium' ? 'Custom items may require longer lead times' : 'Standard items in stock at suppliers',
  ];
}

export function regeneratePrice(draft: ProposalDraft): { min: number; max: number } {
  const pmin = Number(draft.priceMin) || 0;
  const pmax = Number(draft.priceMax) || 0;
  const center = (pmin + pmax) / 2;
  const spread = pmax - pmin;
  return {
    min: Math.round((center - spread * 0.3) / 100) * 100,
    max: Math.round((center + spread * 0.3) / 100) * 100,
  };
}

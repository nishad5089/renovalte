import type { Project, ChatMessage, SuggestedPromptKey, StructuredSummary } from '../types';

/* ============================================================
 * Legacy plain-text AI summary (used by the existing right-column
 * "AI summary" panel on the project details page).
 * Privacy-masked: customer name is never included.
 * ============================================================ */

export function buildAISummary(project: Project): string {
  const lines = [
    `AI Summary: ${project.name} (${project.id}) — ${project.city}.`,
    `Budget: €${project.budget.toLocaleString('en-IE')}.`,
    `Requirement (privacy-masked): ${maskPII(project.customerRequirement, project).text}`,
    `Photos reviewed: ${project.photos.length}. Audio transcript length: ${project.audioTranscript.length} chars.`,
    'Detected scope: renovation with material replacement and layout retention where requested.',
    'Recommended next step: schedule an on-site inspection to validate scope and confirm measurements before proposal generation.',
  ];
  return lines.join('\n\n');
}

/* ============================================================
 * Privacy masking
 * Customer PII (name, email, phone, address) must NEVER appear
 * in simulated AI request content. Before any "AI" processing we
 * strip PII from the context we *pretend* to send to the model and
 * report what was masked.
 * ============================================================ */

export interface MaskResult {
  text: string;
  masked: string[];
}

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_RE = /(\+?\d[\d\s/().-]{7,}\d)/g;

/** Mask all known PII for a project out of arbitrary text. */
export function maskPII(text: string, project: Project): MaskResult {
  const masked: string[] = [];
  let out = text;

  const piiValues: string[] = [
    project.customerName,
    project.customerEmail,
    project.address,
  ].filter(Boolean) as string[];

  // Whole-string PII replacements
  for (const v of piiValues) {
    if (v && v.length > 2) {
      const re = new RegExp(escapeRegExp(v), 'gi');
      if (re.test(out)) {
        masked.push(v);
        out = out.replace(re, '[REDACTED]');
      }
    }
  }
  // Email patterns not captured by the explicit field
  out = out.replace(EMAIL_RE, (m) => {
    masked.push(m);
    return '[REDACTED-EMAIL]';
  });
  // Phone patterns
  out = out.replace(PHONE_RE, (m) => {
    masked.push(m);
    return '[REDACTED-PHONE]';
  });

  return { text: out, masked: Array.from(new Set(masked)) };
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** A debug-friendly description of what would be sent to the "AI" (after masking). */
export function buildMaskedContext(project: Project): string {
  const req = maskPII(project.customerRequirement, project);
  const transcript = maskPII(project.audioTranscript, project);
  return [
    `PROJECT: ${project.id} — ${project.name} (${project.city})`,
    `BUDGET: €${project.budget.toLocaleString('en-IE')}`,
    `TYPE: ${project.type}`,
    `STYLE: ${project.style ?? 'n/a'}`,
    `ROOMS: ${project.rooms ?? 'n/a'}`,
    `TIMELINE: ${project.timeline ?? 'n/a'}`,
    `REQUIREMENT (masked):\n${req.text}`,
    `TRANSCRIPT (masked):\n${transcript.text}`,
    `PHOTOS: ${project.photos.length} reference image(s)`,
  ].join('\n\n');
}

/* ============================================================
 * Deterministic structured summary
 * No randomness — same project in, same summary out.
 * REN-001 is hand-crafted per the spec; others use a deterministic
 * template derived from their fields.
 * ============================================================ */

export function buildStructuredSummary(project: Project): StructuredSummary {
  if (project.id === 'REN-001') {
    return {
      workScope: [
        'Replace existing kitchen cabinets (fronts + carcasses)',
        'Replace countertop with white quartz worktop',
        'Improve task lighting: under-cabinet LED strips',
        'Retain current kitchen layout (no structural changes)',
        'Replace old appliances (oven, dishwasher) with energy-efficient models',
        'Install light oak cabinet fronts with white surfaces',
      ],
      currentCondition: [
        '14m² Altbau kitchen in Frankfurt',
        'Existing water and electrical connections to be retained',
        'Old cabinets and countertop to be removed',
        'No structural changes to walls or floor planned',
      ],
      preferences: [
        'Light oak cabinets',
        'White surfaces (worktop & splashback)',
        'Scandinavian styling',
        'Layout retention preferred',
        'Energy-efficient appliances',
        'Under-cabinet LED task lighting',
      ],
      assumptions: [
        'Assumed: electrical and plumbing connections are sufficient for new appliances (not yet confirmed)',
        'Assumed: existing floor can remain in place during works',
        'Assumed: standard 600mm module sizes for new cabinets',
        'Assumed: budget of €12,000 covers materials, labour, and appliances (excl. VAT)',
      ],
      openQuestions: [
        'Missing measurements: no precise room dimensions or cabinet run lengths provided',
        'Appliance model/spec not yet selected — brand and dimensions unknown',
        'Splashback material not specified',
        'Sink and tap selection not confirmed',
        'Wall and floor finish after demolition unknown',
        'Desired delivery / start date not confirmed (timeline mentioned as "before Christmas")',
      ],
      generatedAt: Date.now(),
    };
  }

  // Deterministic template for the other dummy projects
  const scope: string[] = [];
  const condition: string[] = [];
  const prefs: string[] = [];
  const assumes: string[] = [];
  const questions: string[] = [];

  scope.push(`Renovation of ${project.rooms ?? project.name}`);
  scope.push(...project.customerRequirement.split(/(?<=[.])\s+/).slice(0, 4).filter(Boolean));

  condition.push(`${project.city} — ${project.rooms ?? project.type}`);
  condition.push(`${project.photos.length} reference photo(s) provided`);
  if (project.audioTranscript) condition.push('Audio interview transcript available');

  if (project.style) prefs.push(project.style);
  if (project.timeline) prefs.push(`Timeline: ${project.timeline}`);
  prefs.push(`Budget: €${project.budget.toLocaleString('en-IE')}`);

  assumes.push('Assumed: subfloor / substrate condition not yet verified on site');
  assumes.push('Assumed: existing utilities are sufficient unless stated otherwise');
  assumes.push('Assumed: standard material lead times apply (~2–4 weeks)');

  questions.push('Missing measurements: precise dimensions not provided');
  questions.push('Material brands and exact specifications not yet confirmed');
  questions.push('On-site inspection recommended before proposal');

  return {
    workScope: scope,
    currentCondition: condition,
    preferences: prefs,
    assumptions: assumes,
    openQuestions: questions,
    generatedAt: Date.now(),
  };
}

/* ============================================================
 * Deterministic chat responses
 * ============================================================ */

export const SUGGESTED_PROMPTS: { key: SuggestedPromptKey; label: string; icon: string }[] = [
  { key: 'summarize', label: 'Summarise requirements', icon: 'Sparkles' },
  { key: 'missing', label: 'Identify missing info', icon: 'CircleHelp' },
  { key: 'materials', label: 'Recommend materials', icon: 'Boxes' },
  { key: 'proposal', label: 'Draft proposal', icon: 'FileText' },
];

export function chatReply(promptKey: SuggestedPromptKey, project: Project): string {
  const masked = maskPII(project.customerRequirement, project);
  switch (promptKey) {
    case 'summarize':
      return `Here's a summary of the renovation requirements for ${project.id} (${project.city}):\n\n• Scope: ${project.rooms ?? project.type} renovation\n• Budget: €${project.budget.toLocaleString('en-IE')}\n• Style: ${project.style ?? 'not specified'}\n• Timeline: ${project.timeline ?? 'not specified'}\n\nKey request (privacy-masked):\n"${truncate(masked.text, 220)}"\n\nYou can generate the full structured summary in the Summary tab above.`;
    case 'missing':
      return `Potential missing information for ${project.id}:\n\n1. Precise room measurements (length × width, ceiling height)\n2. Appliance brand/model and dimensions\n3. Sink and tap selection\n4. Splashback / wall finish material\n5. Floor finish after demolition\n6. Exact start date and on-site access windows\n\nI flagged the same items under "Open questions" in the structured summary. Scheduling an on-site inspection would close most of these gaps.`;
    case 'materials':
      return materialRecommendation(project);
    case 'proposal':
      return `Draft proposal outline for ${project.id}:\n\n1. Project overview & scope\n2. Work phases (demolition → installation → finishing)\n3. Material list (see "Recommend materials" response)\n4. Timeline & milestones (${project.timeline ?? 'TBD'})\n5. Budget breakdown — total €${project.budget.toLocaleString('en-IE')}\n   • Materials ~55% / Labour ~30% / Contingency ~15%\n6. Assumptions & exclusions (listed in structured summary)\n7. Open questions for customer\n\nNote: full proposal generation will be available in the next stage. This draft is based on the current requirement data.`;
    default:
      return 'I can help summarise requirements, find missing information, recommend materials, or draft a proposal. Use the suggested prompts below.';
  }
}

function materialRecommendation(project: Project): string {
  if (project.type === 'kitchen' || project.type === 'kitchen_refresh') {
    return `Material recommendations for ${project.id} (kitchen):\n\n• Cabinets: light oak veneer fronts, soft-close hinges (Blum)\n• Worktop: white quartz (Silestone or Caesarstone)\n• Splashback: white glass or large-format porcelain tile\n• Lighting: LED under-cabinet strips (24V, dimmable)\n• Appliances: energy-efficient A+++ models (Bosch / Miele)\n• Hardware: brushed nickel handles\n\nBudget check: €${project.budget.toLocaleString('en-IE')} should cover these within the materials ~55% allocation.`;
  }
  if (project.type === 'bathroom') {
    return `Material recommendations for ${project.id} (bathroom):\n\n• Tiles: large-format marble-look porcelain (60×60cm)\n• Shower: level-access tray + 10mm glass enclosure\n• Vanity: double basin, wall-mounted, oak or lacquered finish\n• WC: wall-mounted Geberit system\n• Heating: electric underfloor mat + thermostat\n• Waterproofing: DIN 18534-compliant sealing system`;
  }
  if (project.type === 'living_room') {
    return `Material recommendations for ${project.id} (living room):\n\n• Flooring: refinish existing oak parquet (sand + oil)\n• Walls: breathable lime-based paint after wallpaper removal\n• Ceiling: lime plaster repair, mist coat + 2 topcoats\n• Window reveals: sand & oil original wood`;
  }
  if (project.type === 'bedroom_flooring') {
    return `Material recommendations for ${project.id} (bedroom flooring):\n\n• Flooring: engineered oak, 15mm, heating-compatible\n• Adhesive: flexible MS-polymer (suitable for underfloor heating)\n• Underlay: 3mm acoustic + thermal mat\n• Skirting: white MDF, pre-primed, 120mm`;
  }
  return `Material recommendations for ${project.id}:\n\n• Standard renovation materials appropriate for the project type\n• Verify on site before ordering.`;
}

function truncate(s: string, n: number): string {
  return s.length <= n ? s : s.slice(0, n) + '…';
}

/* Free-text (non-suggested) chat — deterministic keyword matching */
export function chatReplyFreeform(userText: string, project: Project): string {
  const t = userText.toLowerCase();
  if (/summar/.test(t)) return chatReply('summarize', project);
  if (/missing|gap|what.*need|incomplete/.test(t)) return chatReply('missing', project);
  if (/material|recommend/.test(t)) return chatReply('materials', project);
  if (/proposal|quote|offer|angebot/.test(t)) return chatReply('proposal', project);
  if (/budget|cost|price/.test(t)) return `The recorded budget for ${project.id} is €${project.budget.toLocaleString('en-IE')}. A rough split: materials ~55% (€${Math.round(project.budget * 0.55).toLocaleString('en-IE')}), labour ~30% (€${Math.round(project.budget * 0.30).toLocaleString('en-IE')}), contingency ~15% (€${Math.round(project.budget * 0.15).toLocaleString('en-IE')}).`;
  if (/timeline|when|date|schedule/.test(t)) return `The stated timeline for ${project.id} is "${project.timeline ?? 'not specified'}". I'd recommend confirming an exact start date and on-site access windows during the inspection.`;
  if (/privacy|gdpr|data|pii/.test(t)) return `Privacy policy: customer name, email, phone, and address are masked before any simulated AI processing. The masked context is what the model "sees" — raw PII never leaves this browser. All responses are deterministic and local.`;
  if (/hello|hi|hey|hallo/.test(t)) return `Hello! I'm the RenovAIte project assistant for ${project.id}. I can summarise requirements, identify missing information, recommend materials, or draft a proposal outline. Try one of the suggested prompts below.`;
  return `I can help with this ${project.type.replace('_', ' ')} project (${project.id}). Try asking about:\n• Summary of requirements\n• Missing information\n• Material recommendations\n• Proposal draft\n• Budget or timeline\n\nOr use one of the suggested prompt buttons below.`;
}

/* ============================================================
 * Helpers for creating chat messages
 * ============================================================ */

let counter = 0;
export function nextId(): string {
  counter += 1;
  return `m${Date.now()}_${counter}`;
}

export function userMessage(content: string): ChatMessage {
  return { id: nextId(), role: 'user', content, timestamp: Date.now() };
}

export function assistantMessage(content: string, privacyMasked = true): ChatMessage {
  return { id: nextId(), role: 'assistant', content, timestamp: Date.now(), privacyMasked };
}

export function systemMessage(content: string): ChatMessage {
  return { id: nextId(), role: 'system', content, timestamp: Date.now() };
}

/* ============================================================
 * Site Visit — diff generation & summary updates
 * Deterministic, privacy-masked. No external AI calls.
 * ============================================================ */

import type { SiteObservation, RequirementDiff, SiteVisit } from '../types';

/** Produce a deterministic diff between original requirements and site findings. */
export function buildSiteVisitDiff(project: Project, observations: SiteObservation[]): RequirementDiff[] {
  const diffs: RequirementDiff[] = [];
  const notes = observations.map(o => o.note.toLowerCase());

  // REN-001 example per spec: moisture + countertop dimensions
  if (project.id === 'REN-001') {
    diffs.push({
      field: 'Cabinet condition',
      original: 'Replace old cabinets and countertop (requirement).',
      siteFinding: 'Moisture marks found behind cabinets.',
      impact: 'discrepancy',
    });
    diffs.push({
      field: 'Countertop dimensions',
      original: 'No precise measurements provided in requirement.',
      siteFinding: 'Countertop dimensions need verification.',
      impact: 'additional',
    });
    if (notes.some(n => n.includes('moist') || n.includes('damp') || n.includes('water'))) {
      diffs.push({
        field: 'Wall condition behind cabinets',
        original: 'Not mentioned in original requirements.',
        siteFinding: 'Possible moisture ingress — needs waterproofing check.',
        impact: 'additional',
      });
    }
    if (notes.some(n => n.includes('dimension') || n.includes('measure') || n.includes('countertop'))) {
      diffs.push({
        field: 'Countertop run length',
        original: 'Assumed standard 600mm modules (AI assumption).',
        siteFinding: 'Actual dimensions differ — re-measure required before ordering.',
        impact: 'discrepancy',
      });
    }
    return diffs;
  }

  // Generic deterministic diff derived from observation categories
  const hasDamage = observations.some(o => o.category === 'damage');
  const hasMeasurement = observations.some(o => o.category === 'measurement');
  const hasCondition = observations.some(o => o.category === 'condition');

  if (hasCondition) {
    diffs.push({
      field: 'Overall condition',
      original: project.customerRequirement.slice(0, 100),
      siteFinding: observations.find(o => o.category === 'condition')?.note ?? 'Condition differs from requirement.',
      impact: 'confirmed',
    });
  }
  if (hasDamage) {
    diffs.push({
      field: 'Hidden damage',
      original: 'Not mentioned in original requirements.',
      siteFinding: observations.find(o => o.category === 'damage')?.note ?? 'Damage observed on site.',
      impact: 'additional',
    });
  }
  if (hasMeasurement) {
    diffs.push({
      field: 'Dimensions',
      original: 'Missing measurements flagged in AI summary open questions.',
      siteFinding: observations.find(o => o.category === 'measurement')?.note ?? 'Measurements taken on site.',
      impact: 'discrepancy',
    });
  }
  if (diffs.length === 0 && observations.length > 0) {
    diffs.push({
      field: 'Site observation',
      original: 'No specific requirement addressed.',
      siteFinding: observations[0].note,
      impact: 'additional',
    });
  }
  return diffs;
}

/** Update the plain-text AI summary incorporating site visit observations. */
export function updateSummaryWithObservations(project: Project, originalSummary: string, visit: SiteVisit): string {
  const obsLines = visit.observations.map(o => `  • [${o.category}] ${o.note}`);
  const diffLines = visit.diffs.map(d => `  • ${d.field}: ${d.siteFinding} (${d.impact})`);

  return [
    originalSummary,
    '',
    '--- Updated with site visit findings ---',
    '',
    `Site visit on ${new Date(visit.visitDate).toLocaleDateString('en-GB')} — ${visit.observations.length} observation(s), ${visit.photos.length} photo(s).`,
    '',
    'Site observations:',
    ...obsLines,
    '',
    'Requirement vs. site findings:',
    ...diffLines,
    '',
    'Note: discrepancies and additional findings may affect scope, materials, and budget. Confirm with customer before finalising the proposal.',
  ].join('\n');
}

/** Deterministic simulated voice transcription from a "recording". */
export function simulateTranscription(project: Project, durationSec: number): string {
  const phrases = siteVisitPhrases(project);
  const count = Math.max(1, Math.min(phrases.length, Math.round(durationSec / 8) + 1));
  return phrases.slice(0, count).join(' ');
}

function siteVisitPhrases(project: Project): string[] {
  if (project.id === 'REN-001') {
    return [
      'On-site inspection of the kitchen.',
      'Moisture marks found behind the existing cabinets, likely from an old leak.',
      'Countertop dimensions need verification — the run appears longer than standard.',
      'Existing plumbing connections are in good condition.',
      'Under-cabinet lighting wiring is present but the transformer needs replacing.',
    ];
  }
  return [
    `On-site inspection of the ${project.type.replace('_', ' ')} in ${project.city}.`,
    'Overall condition is consistent with the customer requirement.',
    'Some measurements differ from the original assumptions.',
    'No unexpected structural issues observed.',
    'Access to the work area is straightforward.',
  ];
}


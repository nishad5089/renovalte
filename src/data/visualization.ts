import type { Project, CraftsmanLang, PackageTier } from '../types';

/**
 * Preloaded example "after" image — a real renovated kitchen photo.
 * Used as the deterministic result of simulated visualization generation.
 */
export const EXAMPLE_AFTER_KITCHEN_URL =
  'https://images.pexels.com/photos/6510984/pexels-photo-6510984.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

/**
 * Default prompt suggestions per project type (craftsman mobile experience).
 */
export function defaultPrompt(project: Project, lang: CraftsmanLang): string {
  const isKitchen = project.type === 'kitchen' || project.type === 'kitchen_refresh';
  const isBathroom = project.type === 'bathroom';
  const isFlooring = project.type === 'bedroom_flooring';

  if (lang === 'de') {
    if (isKitchen) return 'Moderne weiße Küche mit Eichen-Arbeitsplatte, warme LED-Beleuchtung, mattschwarze Armaturen';
    if (isBathroom) return 'Zeitgemäßes Badezimmer mit Großformatfliesen, Walk-in-Dusche und freistehender Badewanne';
    if (isFlooring) return 'Echtholz-Eichenparkett, warme Töne, mit Fußbodenheizung';
    return 'Modernes, helles Design mit hochwertigen Materialien';
  }

  if (isKitchen) return 'Modern white kitchen with oak worktop, warm LED lighting, matte black fixtures';
  if (isBathroom) return 'Contemporary bathroom with large-format tiles, walk-in shower, freestanding bathtub';
  if (isFlooring) return 'Solid oak engineered flooring, warm tones, underfloor heating compatible';
  return 'Modern, bright design with premium materials';
}

/**
 * Deterministic "after" image selection based on project type (craftsman mobile).
 */
export function selectAfterImage(project: Project): string {
  void project;
  return EXAMPLE_AFTER_KITCHEN_URL;
}

/* ============================================================
 * Contractor proposal visualization data
 * Preloaded before/after pairs for sample projects.
 * ============================================================ */

// Before: old kitchen; After: renovated Scandinavian oak kitchen
const KITCHEN_BEFORE = 'https://images.pexels.com/photos/36035073/pexels-photo-36035073.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const KITCHEN_AFTER = 'https://images.pexels.com/photos/36777558/pexels-photo-36777558.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

// Before: old bathroom; After: modern marble walk-in shower
const BATHROOM_BEFORE = 'https://images.pexels.com/photos/5718906/pexels-photo-5718906.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const BATHROOM_AFTER = 'https://images.pexels.com/photos/6492399/pexels-photo-6492399.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

// Generic fallback (living room / bedroom)
const GENERIC_BEFORE = 'https://images.pexels.com/photos/6510984/pexels-photo-6510984.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const GENERIC_AFTER = 'https://images.pexels.com/photos/6835107/pexels-photo-6835107.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const VISUALIZATION_DISCLAIMER =
  'AI-generated concept visualization. Final appearance, materials, and feasibility may differ.';

export function visualizationDisclaimer(): string {
  return VISUALIZATION_DISCLAIMER;
}

/**
 * Preloaded before/after sample pair for a project.
 * REN-001 (Altbau Kitchen) and REN-002 (Bathroom) have matching samples.
 */
export function sampleBeforeAfter(project: Project): { before: string; after: string } {
  if (project.type === 'kitchen' || project.type === 'kitchen_refresh') {
    return { before: KITCHEN_BEFORE, after: KITCHEN_AFTER };
  }
  if (project.type === 'bathroom') {
    return { before: BATHROOM_BEFORE, after: BATHROOM_AFTER };
  }
  return { before: GENERIC_BEFORE, after: GENERIC_AFTER };
}

/**
 * Default renovation description for a contractor visualization.
 * Prefilled from the customer requirement and selected package tier.
 */
export function defaultContractorPrompt(project: Project, tier: PackageTier | null): string {
  const tierPhrase = tier
    ? `${tier.charAt(0).toUpperCase() + tier.slice(1)} package — `
    : '';
  const req = project.customerRequirement.split(/(?<=[.])\s+/).slice(0, 2).join(' ');
  return `${tierPhrase}${project.style ?? 'Modern'} ${project.rooms ?? project.name}. ${req}`.trim();
}

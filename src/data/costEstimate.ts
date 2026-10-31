import type { OfferDraft, OfferLine } from './offer.ts';
// MOCK CATALOG v1: illustrative teaching values, not researched market rates or supplier quotes.
// Quantities are explicit planning assumptions, never site measurements or billing quantities.
interface CatalogItem { description: string; quantity: string; unit: string; price: string; kind: 'material' | 'labor' }
const catalog: Record<string, CatalogItem[]> = {
  'REN-001': [
    {description:'Küchenschränke, Standardausführung',quantity:'6',unit:'Stk.',price:'350',kind:'material'},
    {description:'Arbeitsplatte, Laminat',quantity:'4',unit:'m',price:'95',kind:'material'},
    {description:'Montage- und Befestigungsmaterial',quantity:'1',unit:'psch.',price:'120',kind:'material'},
    {description:'Demontage und Küchenmontage (ohne Elektro-/Wasseranschlüsse)',quantity:'32',unit:'Std.',price:'65',kind:'labor'},
  ],
  'REN-002': [
    {description:'Dusche: Rinne, Armatur und Abtrennung (Standard)',quantity:'1',unit:'Set',price:'1400',kind:'material'},
    {description:'Waschtisch mit Unterschrank',quantity:'1',unit:'Set',price:'650',kind:'material'},
    {description:'Wand- und Bodenfliesen',quantity:'25',unit:'m²',price:'35',kind:'material'},
    {description:'Abdichtungs-, Klebe- und Fugenmaterial',quantity:'25',unit:'m²',price:'18',kind:'material'},
    {description:'Sanitär-/Fliesenarbeiten, Fachbetriebe und Umfang bestätigen',quantity:'64',unit:'Std.',price:'65',kind:'labor'},
  ],
  'REN-003': [
    {description:'Parkettöl und Schleifmittel',quantity:'24',unit:'m²',price:'12',kind:'material'},
    {description:'Wandfarbe und Grundierung',quantity:'60',unit:'m²',price:'5',kind:'material'},
    {description:'Abdeck- und Verbrauchsmaterial',quantity:'1',unit:'psch.',price:'90',kind:'material'},
    {description:'Parkettaufbereitung und Malerarbeiten',quantity:'40',unit:'Std.',price:'60',kind:'labor'},
  ],
  'REN-004': [
    {description:'Bodenbelag in Eichenoptik',quantity:'24.2',unit:'m²',price:'35',kind:'material'},
    {description:'Trittschalldämmung',quantity:'22',unit:'m²',price:'6',kind:'material'},
    {description:'Sockelleisten und Befestigung',quantity:'20',unit:'m',price:'10',kind:'material'},
    {description:'Rückbau, Vorbereitung und Verlegung',quantity:'32',unit:'Std.',price:'65',kind:'labor'},
  ],
  'REN-005': [
    {description:'Schrankfronten, Standardausführung',quantity:'6',unit:'Stk.',price:'120',kind:'material'},
    {description:'Arbeitsplatte, Laminat',quantity:'3',unit:'m',price:'95',kind:'material'},
    {description:'Spritzschutz und Montagematerial',quantity:'3',unit:'m²',price:'65',kind:'material'},
    {description:'Demontage, Anpassung und Montage',quantity:'24',unit:'Std.',price:'65',kind:'labor'},
  ],
};
export function estimateLines(projectId: string): OfferLine[] {
  return (catalog[projectId] ?? []).map(item=>({...item,id:crypto.randomUUID(),estimated:true}));
}
export function applyCostEstimate(offer: OfferDraft): OfferDraft {
  // Preserve all user edits. Apply the catalog only to an untouched/unpriced draft.
  if (offer.lines.some(l=>l.price.trim() || l.quantity.trim())) return offer;
  const lines=estimateLines(offer.projectId);
  return lines.length?{...offer,lines,reviewed:false}:offer;
}

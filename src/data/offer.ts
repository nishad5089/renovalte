import type { DemoProject } from './demoProjects';
import { estimateLines } from './costEstimate.ts';
import { projectBriefs } from './projectBriefs.ts';
export interface OfferLine { id: string; description: string; quantity: string; unit: string; price: string; kind?: 'material' | 'labor'; estimated?: boolean }
export interface OfferDraft {
  projectId: string; number: string; date: string; validUntil: string;
  business: string; customer: string; site: string; scope: string;
  timeline: string; payment: string; conditions: string; context: string;
  tax: '' | 'standard' | 'small'; lines: OfferLine[]; reviewed: boolean;
}
export const offerRequested = (text: string) => /\b(angebot|angebotsentwurf|proposal|quotation|quote|offer|pdf)\b/i.test(text);
export function createOffer(project: DemoProject, context: string): OfferDraft {
  return { projectId: project.id, number: `ANG-${project.id}-${new Date().toISOString().slice(0,10)}`, date: new Date().toLocaleDateString('sv-SE'), validUntil: '', business: '', customer: '', site: '', scope: project.scopeDe, timeline: '', payment: '', conditions: '', context,
    tax: '', reviewed: false, lines: estimateLines(project.id).length ? estimateLines(project.id) : [...projectBriefs[project.id].items.map(item => ({ id: crypto.randomUUID(), description: item.title.de, quantity: '', unit: item.unit, price: '' })), {id:crypto.randomUUID(),description:'Arbeitsleistung (Umfang konkretisieren)',quantity:'',unit:'Std.',price:''} ] };
}
// Decimal strings are converted to integer hundredths before any multiplication.
export function hundredths(raw: string): number | null {
  if (!/^\d{1,7}([.,]\d{1,2})?$/.test(raw.trim())) return null;
  const [whole, fraction = ''] = raw.trim().replace(',', '.').split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}
export function lineCents(line: OfferLine): number | null {
  const q = hundredths(line.quantity), p = hundredths(line.price);
  return q === null || p === null || q <= 0 ? null : Math.round(q * p / 100);
}
export function totals(offer: OfferDraft) {
  const values = offer.lines.map(lineCents);
  const net = values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
  const vat = offer.tax === 'standard' ? Math.round(net * 19 / 100) : 0;
  return {net, vat, gross: net + vat, complete: values.length > 0 && values.every(v => v !== null) && !!offer.tax};
}
export const euro = (cents: number) => new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(cents/100);
export function missingOfferFields(o: OfferDraft): string[] {
  const fields: [string,string][] = [[o.business,'Betrieb und vollständige Anschrift'],[o.customer,'Auftraggeber und vollständige Anschrift'],[o.site,'Baustellenanschrift'],[o.number,'Angebotsnummer'],[o.scope,'Leistungsumfang'],[o.timeline,'Ausführungszeitraum'],[o.payment,'Zahlungsbedingungen'],[o.conditions,'Annahmen, Abgrenzungen und Bedingungen']];
  const missing = fields.filter(([value])=>!value.trim()).map(([,name])=>name);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(o.date) || !Number.isFinite(Date.parse(o.date))) missing.push('Angebotsdatum');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(o.validUntil) || !Number.isFinite(Date.parse(o.validUntil)) || o.validUntil < o.date) missing.push('Gültigkeit (ab Angebotsdatum)');
  if (!o.tax) missing.push('Steuerliche Behandlung bestätigen');
  if (!o.lines.length || o.lines.some(l => !l.description.trim() || !l.unit.trim() || lineCents(l) === null)) missing.push('Alle Positionen: Beschreibung, Menge, Einheit und Nettopreis');
  return missing;
}
const key = (projectId: string) => `renovaite.offer.${projectId}.v1`;
export function loadOffer(projectId: string): OfferDraft | null {
  const raw = localStorage.getItem(key(projectId));
  if (!raw) return null;
  const o = JSON.parse(raw) as OfferDraft;
  if (!o || o.projectId !== projectId || !['number','date','validUntil','business','customer','site','scope','timeline','payment','conditions','context'].every(k=>typeof (o as unknown as Record<string,unknown>)[k]==='string') || !['','standard','small'].includes(o.tax) || typeof o.reviewed!=='boolean' || !Array.isArray(o.lines) || !o.lines.every(l=>l && ['id','description','quantity','unit','price'].every(k=>typeof (l as unknown as Record<string,unknown>)[k]==='string'))) throw Error('Invalid offer');
  return o;
}
export function saveOffer(offer: OfferDraft) { localStorage.setItem(key(offer.projectId), JSON.stringify(offer)); }
export function archiveOffer(offer: OfferDraft) {
  const k = `${key(offer.projectId)}.exports`;
  const history = JSON.parse(localStorage.getItem(k) ?? '[]');
  if (!Array.isArray(history)) throw Error('Invalid offer history');
  const snapshot = {offer: structuredClone(offer), exportedAt: new Date().toISOString(), version: history.length + 1};
  localStorage.setItem(k, JSON.stringify([...history, snapshot]));
  return snapshot.version;
}

export function costBreakdown(offer: OfferDraft) {
  return offer.lines.reduce((sum,line)=> {
    sum[line.kind === 'material' ? 'material' : line.kind === 'labor' ? 'labor' : 'other'] += lineCents(line) ?? 0;
    return sum;
  }, {material:0,labor:0,other:0});
}

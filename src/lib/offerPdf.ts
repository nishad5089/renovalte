import { jsPDF } from 'jspdf';
import { costBreakdown, euro, hundredths, lineCents, missingOfferFields, totals, type OfferDraft } from '../data/offer';
export function buildOfferPdf(offer: OfferDraft, version: number) {
  const doc = new jsPDF({unit:'mm',format:'a4'});
  doc.setProperties({title:`Angebot ${offer.number}`,subject:'Unverbindlicher Angebotsentwurf',creator:'RenovAIte'});
  let y=38;
  const safe=(s:string)=>s.replace(/[\u2010-\u2015]/g,'-').replace(/\u202f|\u00a0/g,' ');
  function page() {doc.addPage();y=38;}
  function room(h:number) {if(y+h>272)page();}
  function text(value:string,size=10,bold=false) {
    doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);doc.setTextColor(28,45,66);
    const lines=doc.splitTextToSize(safe(value||'[noch zu ergänzen]'),174) as string[];
    for(const line of lines) {room(5.3);doc.text(line,18,y);y+=5.3;}
    y+=3;
  }
  function section(title:string,value:string) {room(20);text(title,11,true);text(value);}
  const date=(v:string)=>v?new Date(`${v}T12:00:00`).toLocaleDateString('de-DE'):'[offen]';
  text('ANGEBOT',24,true);
  text(`${offer.number} | ${version===0?'Vorschau':`Version ${version}`} | Projekt ${offer.projectId}`,10);
  text(`Datum: ${date(offer.date)} | Vorgesehene Gültigkeit bis: ${date(offer.validUntil)}`);
  section('Anbieter',offer.business);section('Auftraggeber',offer.customer);section('Bauvorhaben / Leistungsort',offer.site);section('Leistungsbeschreibung',offer.scope);
  const estimated=offer.lines.some(line=>line.estimated);
  if(estimated) section('Unverbindliche Richtkalkulation', 'Demo-Preiskatalog v1: illustrative Beispielpreise, keine Markt- oder Lieferantenangebote. Mengen und Stunden sind Planungsannahmen, kein Aufmaß. Materialqualität, Verschnitt, Untergrund, Entsorgung und Fachgewerke vor Verwendung bestätigen.');
  room(24);text('Positionen (Einzelpreise netto)',12,true);
  function tableHeader() {
    doc.setFillColor(237,243,252);doc.rect(18,y-4,174,8,'F');doc.setFontSize(9);doc.setFont('helvetica','bold');
    doc.text('Pos. / Leistung',20,y+1);doc.text('Menge / Einh.',117,y+1,{align:'right'});doc.text('EP EUR',150,y+1,{align:'right'});doc.text('Gesamt EUR',190,y+1,{align:'right'});y+=10;
  }
  tableHeader();
  for(const [index,line] of offer.lines.entries()) {
    doc.setFont('helvetica','normal');doc.setFontSize(9);
    const amount=lineCents(line), price=hundredths(line.price);
    const columns = [
      {x:20,w:74,align:'left' as const,value:`${index+1}. ${line.kind==='material'?'Material: ':line.kind==='labor'?'Arbeit: ':''}${line.description||'[Leistung offen]'}${line.estimated?' (ca.)':''}`},
      {x:117,w:23,align:'right' as const,value:`${line.quantity||'offen'} ${line.unit}`},
      {x:150,w:29,align:'right' as const,value:price===null?'offen':euro(price).replace('€','').trim()},
      {x:190,w:36,align:'right' as const,value:amount===null?'offen':euro(amount).replace('€','').trim()},
    ].map(c=>({...c,lines:doc.splitTextToSize(safe(c.value),c.w) as string[]}));
    for(let i=0;i<Math.max(...columns.map(c=>c.lines.length));i++) {
      if(y+6>270){page();tableHeader();}
      doc.setFont('helvetica','normal');doc.setFontSize(9);
      for(const c of columns) if(c.lines[i])doc.text(c.lines[i],c.x,y,{align:c.align});
      y+=5;
    }
    doc.setDrawColor(223,230,240);doc.line(18,y,192,y);y+=6;
  }
  const sum=totals(offer), breakdown=costBreakdown(offer);room(55);y+=3;
  if(breakdown.material)text(`Materialkosten netto: ${euro(breakdown.material)}`);
  if(breakdown.labor)text(`Arbeitskosten netto: ${euro(breakdown.labor)}`);
  if(breakdown.other)text(`Weitere Positionen netto: ${euro(breakdown.other)}`);
  text(`Nettosumme${sum.complete?'':' (unvollständig)'}: ${euro(sum.net)}`,11,true);
  text(offer.tax==='standard'?`Umsatzsteuer 19 %: ${euro(sum.vat)}`:offer.tax==='small'?'Umsatzsteuerbefreiung für Kleinunternehmer gemäß § 19 UStG.':'Umsatzsteuer: steuerliche Behandlung noch zu bestätigen.');
  text(`Gesamtbetrag: ${sum.complete?euro(sum.gross):'[offen - Kalkulation unvollständig]'}`,13,true);
  section('Ausführungszeitraum',offer.timeline);section('Zahlungsbedingungen',offer.payment);section('Annahmen, Abgrenzungen und Bedingungen',offer.conditions);
  const missing=missingOfferFields(offer);
  section('Bearbeitungsstand',`${offer.reviewed&&!missing.length?'Fachlich vom Nutzer geprüft.':'Fachliche Prüfung durch den Anbieter ausstehend.'} Rechtlich nicht geprüfte Prototypvorlage. Keine automatische Übermittlung an den Auftraggeber.`);
  if(missing.length)section('Noch zu ergänzen / zu prüfen',missing.map(m=>`- ${m}`).join('\n'));
  section('Hinweis zum Entwurf','Unverbindlicher Entwurf - kein Angebot zur Annahme und keine Beauftragung. Vor verbindlicher Verwendung sind Vertragsbedingungen, steuerliche Behandlung, Verbraucherinformationen / Widerrufsrechte sowie erforderliche Fachqualifikationen und Genehmigungen im Einzelfall zu prüfen. VOB/B wird durch diesen Entwurf nicht vereinbart.');
  room(62);
  text('Unterschriften / Entwurfsprüfung',12,true);
  text('Die Unterschrift bestätigt nur die Durchsicht dieses unverbindlichen Entwurfs. Keine Auftragserteilung oder Vertragsannahme.',9);
  const boxY=y+2;
  doc.setDrawColor(180,195,215);doc.setLineWidth(.3);
  doc.roundedRect(18,boxY,83,32,2,2);doc.roundedRect(109,boxY,83,32,2,2);
  doc.setFont('helvetica','normal');doc.setFontSize(9);
  doc.text('Betrieb / Anbieter',22,boxY+7);doc.text('Auftraggeber',113,boxY+7);
  doc.line(22,boxY+22,97,boxY+22);doc.line(113,boxY+22,188,boxY+22);
  doc.setFontSize(8);doc.text('Ort, Datum, Unterschrift',22,boxY+28);doc.text('Ort, Datum, Unterschrift',113,boxY+28);
  y=boxY+38;
  for(let p=1;p<=doc.getNumberOfPages();p++) {
    doc.setPage(p);doc.setFont('helvetica','bold');doc.setFontSize(11);doc.setTextColor(37,86,160);doc.text('RenovAIte',18,17);
    doc.setFontSize(9);doc.setTextColor(164,81,17);doc.text('ENTWURF - NICHT ZUR BEAUFTRAGUNG',192,17,{align:'right'});
    doc.setDrawColor(220,228,239);doc.line(18,24,192,24);doc.line(18,279,192,279);
    doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(95,112,136);doc.text('Rechtlich nicht geprüfter Angebotsentwurf | Kein Versand',18,286);doc.text(`${p} / ${doc.getNumberOfPages()}`,192,286,{align:'right'});
  }
  return doc;
}
export async function downloadOffer(offer:OfferDraft,version:number) {
  const doc=buildOfferPdf(offer,version);
  doc.save(`${offer.number.replace(/[^a-zA-Z0-9_-]/g,'_')}-v${version}-Entwurf.pdf`);
}

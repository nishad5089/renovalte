import { costBreakdown, euro, lineCents, missingOfferFields, totals, type OfferDraft } from '../data/offer';
export function OfferPreview({offer,de}:{offer:OfferDraft;de:boolean}) {
  const sum=totals(offer), breakdown=costBreakdown(offer), missing=missingOfferFields(offer);
  const value=(text:string)=>text||'[noch zu ergänzen]';
  return <div className="offer-preview-wrap"><p className="proposal-pricing-note">{de?'Inhaltsvorschau · Der PDF-Download enthält Seitenumbrüche und Seitenzahlen.':'Content preview · the downloaded PDF includes page breaks and page numbers.'}</p>
    <article className="offer-paper" aria-label={de?'Angebotsvorschau':'Offer preview'} lang="de">
      <header><strong>RenovAIte</strong><span>ENTWURF</span></header><h2>ANGEBOT</h2><p>{offer.number} · {offer.date}</p><p>Vorgesehene Gültigkeit bis: {value(offer.validUntil)}</p>
      <section><h3>Anbieter</h3><p>{value(offer.business)}</p><h3>Auftraggeber</h3><p>{value(offer.customer)}</p><h3>Bauvorhaben / Leistungsort</h3><p>{value(offer.site)}</p></section>
      <section><h3>Leistungsbeschreibung</h3><p>{value(offer.scope)}</p></section>
      {offer.lines.some(l=>l.estimated)&&<p className="offer-paper-note">Unverbindliche Richtkalkulation · Demo-Preiskatalog v1. Mengen/Stunden sind Planungsannahmen, kein Aufmaß. Keine Markt- oder Lieferantenangebote.</p>}
      <div className="offer-paper-table"><table><thead><tr><th>Leistung / Material</th><th>Menge</th><th>EP netto</th><th>Gesamt</th></tr></thead><tbody>{offer.lines.map((line,i)=><tr key={line.id}><td>{i+1}. {value(line.description)}{line.estimated?' (ca.)':''}</td><td>{line.quantity||'offen'} {line.unit}</td><td>{line.price?`${line.price} €`:'offen'}</td><td>{lineCents(line)===null?'offen':euro(lineCents(line)!)}</td></tr>)}</tbody></table></div>
      <dl className="proposal-totals"><div><dt>Material netto</dt><dd>{euro(breakdown.material)}</dd></div><div><dt>Arbeitskosten netto</dt><dd>{euro(breakdown.labor)}</dd></div><div><dt>Nettosumme</dt><dd>{euro(sum.net)}</dd></div><div><dt>USt.{offer.tax==='standard'?' 19 %':''}</dt><dd>{offer.tax?euro(sum.vat):'offen'}</dd></div><div><dt>Gesamtbetrag</dt><dd>{sum.complete?euro(sum.gross):'offen'}</dd></div></dl>
      {offer.tax==='small'&&<p>Umsatzsteuerbefreiung für Kleinunternehmer gemäß § 19 UStG.</p>}
      <section><h3>Ausführungszeitraum</h3><p>{value(offer.timeline)}</p><h3>Zahlungsbedingungen</h3><p>{value(offer.payment)}</p><h3>Annahmen, Abgrenzungen und Bedingungen</h3><p>{value(offer.conditions)}</p></section>
      {missing.length>0&&<section><h3>Noch zu ergänzen / zu prüfen</h3><ul>{missing.map(m=><li key={m}>{m}</li>)}</ul></section>}
      <p className="offer-paper-note">Unverbindlicher Entwurf - keine Beauftragung. Rechtlich nicht geprüfte Prototypvorlage. Vertragsbedingungen, Steuerfall, Verbraucher-/Widerrufsrechte und erforderliche Fachqualifikationen/Genehmigungen vor verbindlicher Verwendung prüfen. Keine automatische Vereinbarung der VOB/B.</p>
      <h3>Unterschriften / Entwurfsprüfung</h3><p>Bestätigt nur die Durchsicht, keine Auftragserteilung oder Vertragsannahme.</p><div className="offer-signature-boxes">{['Betrieb / Anbieter','Auftraggeber'].map(label=><div key={label}><strong>{label}</strong><span>Ort, Datum, Unterschrift</span></div>)}</div>
    </article>
  </div>;
}

import { applyCostEstimate } from '../data/costEstimate';
import { OfferPreview } from './OfferPreview';
import { useState } from 'react';
import { archiveOffer, costBreakdown, euro, lineCents, missingOfferFields, totals, type OfferDraft } from '../data/offer';
export function OfferReview({offer, de, onChange}: {offer:OfferDraft;de:boolean;onChange:(offer:OfferDraft)=>void}) {
  const [error,setError]=useState(''), [busy,setBusy]=useState(false),[notice,setNotice]=useState('');
  const missing=missingOfferFields(offer), sum=totals(offer), breakdown=costBreakdown(offer);
  const [tab,setTab]=useState<'edit'|'preview'>('edit');
  function change(patch:Partial<OfferDraft>) {setNotice('');onChange({...offer,...patch,reviewed:false});}
  async function download() {
    setBusy(true);setError('');
    try { const {downloadOffer}=await import('../lib/offerPdf'); const version=archiveOffer(offer); await downloadOffer(offer,version);setNotice(de?'PDF heruntergeladen. Kein Versand erfolgt.':'PDF downloaded. Nothing was sent.'); }
    catch {setError(de?'PDF konnte nicht gespeichert werden. Bitte erneut versuchen.':'Could not save the PDF. Please retry.');}
    finally {setBusy(false);}
  }
  const field=(key: 'business'|'customer'|'site'|'scope'|'timeline'|'payment'|'conditions', label:string) => <label>{label}<textarea aria-label={label} rows={key==='scope'?3:2} value={offer[key]} maxLength={4000} onChange={e=>change({[key]:e.target.value})}/></label>;
  return <div className="offer-review">
    <div className="offer-tabs" role="group" aria-label={de?'Angebotsansicht':'Offer view'}><button aria-pressed={tab==='edit'} onClick={()=>setTab('edit')}>{de?'Bearbeiten':'Edit offer'}</button><button aria-pressed={tab==='preview'} onClick={()=>setTab('preview')}>{de?'PDF-Vorschau':'PDF preview'}</button></div>
    {tab==='preview'?<OfferPreview offer={offer} de={de}/>:<>
    <p>{de?'Richtkalkulation aus dem Projektbrief. Materialien und Arbeitszeit sind getrennt und jederzeit bearbeitbar.':'Planning estimate from the project brief. Materials and labor are separate and fully editable.'}</p>
    <div className="offer-estimate-summary"><span>{de?'Material netto':'Materials net'}<strong>{euro(breakdown.material)}</strong></span><span>{de?'Arbeit netto':'Labor net'}<strong>{euro(breakdown.labor)}</strong></span>{breakdown.other>0&&<span>{de?'Sonstiges netto':'Other net'}<strong>{euro(breakdown.other)}</strong></span>}</div>
    {offer.lines.some(l=>l.estimated)&&<p className="offer-estimate-note">{de?'Unverbindliche Beispielkalkulation · Demo-Preiskatalog v1. Mengen sind Planungsannahmen, kein Aufmaß; Preise sind keine Markt- oder Lieferantenangebote. Rückbau/Entsorgung, Anschlüsse und Zusatzarbeiten auf Vollständigkeit prüfen.':'Illustrative estimate · demo catalog v1. Quantities are planning assumptions, not measured; rates are not market or supplier quotes. Check demolition/disposal, connections and additional work for completeness.'}</p>}
    {!offer.lines.some(l=>l.price.trim()||l.quantity.trim())&&<button className="back-to-projects" onClick={()=>change(applyCostEstimate(offer))}>{de?'Beispielkalkulation einsetzen':'Use demo cost estimate'}</button>}
    <p className="proposal-demo-label">{de?'Prototyp · keine rechtlich geprüfte Vorlage':'Prototype · template has not been legally reviewed'}</p>
    <details><summary>{de?'Beteiligte & Eckdaten':'Parties & offer details'}</summary>
      {field('business',de?'Betrieb / Name und vollständige Anschrift':'Business / name and full address')}
      {field('customer',de?'Auftraggeber / Name und vollständige Anschrift':'Customer / name and full address')}
      {field('site',de?'Baustellenanschrift':'Site address')}
      <label>{de?'Angebotsnummer':'Offer number'}<input value={offer.number} maxLength={100} onChange={e=>change({number:e.target.value})}/></label>
      <label>{de?'Angebotsdatum':'Offer date'}<input type="date" value={offer.date} onChange={e=>change({date:e.target.value})}/></label>
      <label>{de?'Gültig bis':'Valid until'}<input type="date" min={offer.date} value={offer.validUntil} onChange={e=>change({validUntil:e.target.value})}/></label>
    </details>
    <details open><summary>{de?'Leistungen & Kalkulation':'Scope & pricing'}</summary>
      {field('scope',de?'Leistungsumfang (PDF auf Deutsch)':'Scope (German for the PDF)')}
      {offer.lines.map((line,index)=><fieldset key={line.id}><legend>Pos. {index+1} {line.estimated?'· ca.':''}</legend>
        <label>{de?'Kostenart':'Cost type'}<select aria-label={de?'Kostenart':'Cost type'} value={line.kind??'other'} onChange={e=>change({lines:offer.lines.map(l=>l.id===line.id?{...l,kind:e.target.value==='other'?undefined:e.target.value as 'material'|'labor'}:l)})}><option value="material">{de?'Material':'Material'}</option><option value="labor">{de?'Arbeitsleistung':'Labor'}</option><option value="other">{de?'Sonstiges':'Other'}</option></select></label>
        <label>{de?'Leistung / Material':'Work / material'}<textarea value={line.description} maxLength={2000} onChange={e=>change({lines:offer.lines.map(l=>l.id===line.id?{...l,description:e.target.value}:l)})}/></label>
        <div className="offer-line-inputs">{(['quantity','unit','price'] as const).map(k=><label key={k}>{k==='quantity'?(de?'Menge':'Quantity'):k==='unit'?(de?'Einheit':'Unit'):(de?'EP netto (€)':'Net unit €')}<input inputMode={k==='unit'?'text':'decimal'} maxLength={k==='unit'?20:10} value={line[k]} onChange={e=>change({lines:offer.lines.map(l=>l.id===line.id?{...l,[k]:e.target.value}:l)})}/></label>)}</div>
        <div className="offer-line-footer"><strong>{lineCents(line)===null?'—':euro(lineCents(line)!)}</strong><button onClick={()=>change({lines:offer.lines.filter(l=>l.id!==line.id)})}>{de?'Entfernen':'Remove'}</button></div>
      </fieldset>)}
      <button className="back-to-projects" onClick={()=>change({lines:[...offer.lines,{id:crypto.randomUUID(),description:'',quantity:'',unit:'Stk.',price:''}]})}>{de?'+ Position':'+ Add item'}</button>
      <label>{de?'Umsatzsteuer (Anwendbarkeit prüfen)':'VAT (confirm applicability)'}<select aria-label={de?"Umsatzsteuer (Anwendbarkeit prüfen)":"VAT (confirm applicability)"} value={offer.tax} onChange={e=>change({tax:e.target.value as OfferDraft['tax']})}><option value="">{de?'Bitte prüfen und auswählen':'Review and select'}</option><option value="standard">19 % USt. (§ 12 UStG)</option><option value="small">Kleinunternehmer (§ 19 UStG)</option></select></label>
      <dl className="proposal-totals"><div><dt>{de?'Netto (erfasste Positionen)':'Net (entered items)'}</dt><dd>{euro(sum.net)}</dd></div><div><dt>USt.{offer.tax==='standard'?' 19 %':''}</dt><dd>{offer.tax?euro(sum.vat):'offen'}</dd></div><div><dt>{de?'Gesamt':'Total'}</dt><dd>{sum.complete?euro(sum.gross):'offen'}</dd></div></dl>
    </details>
    <details><summary>{de?'Zeitraum & Bedingungen':'Timeline & conditions'}</summary>{field('timeline',de?'Ausführung / Terminvereinbarung':'Execution / scheduling')}{field('payment',de?'Zahlungsbedingungen':'Payment terms')}{field('conditions',de?'Annahmen, Ausschlüsse, Bedingungen':'Assumptions, exclusions, conditions')}</details>
    <details><summary>{de?'Chat-Kontext & Prüfung':'Chat context & review'}</summary><p>{de?'Als unbestätigter Kontext gespeichert, nicht automatisch Vertragsinhalt:':'Saved as unverified context, not automatically included as contractual terms:'}</p><p className="offer-context">{offer.context||'—'}</p><p>{de?'Vor verbindlicher Verwendung: Steuerfall (auch § 13b UStG), Verbraucher-/Widerrufsrechte, BGB-Vertragstyp, gewerbliche Pflichtangaben sowie erforderliche Fachbetriebe und Genehmigungen prüfen. VOB/B wird nicht automatisch vereinbart. Keine Rechts- oder Sicherheitsfreigabe durch KI.':'Before binding use: verify tax treatment (including § 13b UStG), consumer/withdrawal rights, BGB contract type, business disclosures, qualified trades and permits. VOB/B is not automatically agreed. AI does not provide legal or safety clearance.'}</p><p><a href="https://www.gesetze-im-internet.de/bgb/__145.html" target="_blank" rel="noreferrer">BGB § 145</a> · <a href="https://www.gesetze-im-internet.de/ustg_1980/__12.html" target="_blank" rel="noreferrer">UStG § 12</a> · <a href="https://www.gesetze-im-internet.de/ustg_1980/__19.html" target="_blank" rel="noreferrer">UStG § 19</a> · <a href="https://www.gesetze-im-internet.de/bgb/__312g.html" target="_blank" rel="noreferrer">BGB § 312g</a></p></details>
    {missing.length>0&&<details className="offer-missing" open><summary>{de?`${missing.length} Angaben noch offen`:`${missing.length} details still missing`}</summary><ul>{missing.map(m=><li key={m}>{m}</li>)}</ul></details>}
    <label className="inspection-control"><input type="checkbox" checked={offer.reviewed} onChange={e=>onChange({...offer,reviewed:e.target.checked})}/>{de?'Ich habe diesen Entwurf und seine Annahmen geprüft. Offene Angaben bleiben vor Verwendung zu klären.':'I have reviewed this draft and its assumptions. Missing details still need clarification before use.'}</label>
    {offer.reviewed&&missing.length>0&&<p role="status" className="offer-estimate-note">{de?'Prüfung vermerkt. Der Entwurf ist noch unvollständig und nicht zur Beauftragung geeignet.':'Review recorded. The draft is still incomplete and is not ready for commissioning.'}</p>}
    <p className="proposal-pricing-note">{de?'Unterschriftsfelder für Betrieb und Auftraggeber sind im PDF enthalten. Keine digitale Signatur oder Beauftragung in der App.':'The PDF includes signature fields for the business and customer. No digital signing or commissioning takes place in the app.'}</p>
    </>}
    <button className="acknowledge-request" disabled={busy} onClick={()=>void download()}>{busy?'…':de?'PDF herunterladen':'Download PDF'}</button>
    <p className="proposal-pricing-note">{de?'Alle PDFs bleiben als Entwurf gekennzeichnet, bis eine rechtlich geprüfte Vorlage integriert ist. Exportversionen werden lokal aufbewahrt.':'All PDFs remain marked as drafts until a legally reviewed template is integrated. Export versions are retained locally.'}</p>
    {error&&<p role="alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  </div>;
}

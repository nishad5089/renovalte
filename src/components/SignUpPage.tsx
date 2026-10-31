import { useRef, useState } from 'react';
import { certificateError, showsQualificationUpload, trades, tradeSources } from '../data/trades';

interface Props { de: boolean; onLogin: () => void }
export function SignUpPage({ de, onLogin }: Props) {
  const [tradeId, setTradeId] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const [document, setDocument] = useState<File | null>(null);
  const [fileError, setFileError] = useState<'type' | 'size' | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const selected = trades.find(trade => trade.id === tradeId);
  const showUpload = showsQualificationUpload(selected);

  return (
    <section className="login-page signup-page" aria-labelledby="signup-heading">
      <h1 id="signup-heading">{de ? 'Registrieren' : 'Sign up'}</h1>
      <p className="login-note">{de ? 'Erstellen Sie Ihr Handwerkerprofil.' : 'Set up your craftsman profile.'}</p>
      <form className="login-form" onChange={() => setSubmitted(false)} onSubmit={event => { event.preventDefault(); if (!fileError) setSubmitted(true); }}>
        <div className="name-fields">
          <div><label htmlFor="first-name">{de ? 'Vorname' : 'First name'}</label><input id="first-name" name="firstName" autoComplete="given-name" maxLength={100} required /></div>
          <div><label htmlFor="last-name">{de ? 'Nachname' : 'Last name'}</label><input id="last-name" name="lastName" autoComplete="family-name" maxLength={100} required /></div>
        </div>
        <label htmlFor="signup-email">{de ? 'E-Mail-Adresse' : 'Email'}</label>
        <input id="signup-email" name="email" type="email" autoComplete="email" required />
        <label htmlFor="signup-password">{de ? 'Passwort' : 'Password'}</label>
        <input id="signup-password" name="password" type="password" autoComplete="new-password" minLength={8} aria-describedby="password-help" required />
        <small id="password-help" className="field-help">{de ? 'Mindestens 8 Zeichen.' : 'At least 8 characters.'}</small>
        <label htmlFor="contact-number">{de ? 'Telefonnummer' : 'Contact number'}</label>
        <input id="contact-number" name="phone" type="tel" autoComplete="tel" pattern="\+?[0-9\(\) .\-]{6,25}" title={de ? 'Gültige Telefonnummer, z. B. +49 170 1234567' : 'Valid phone number, e.g. +49 170 1234567'} required />
        <label htmlFor="trade">{de ? 'Gewerk in Deutschland' : 'Craftsman category in Germany'}</label>
        <select id="trade" name="trade" value={tradeId} required onChange={event => { setTradeId(event.target.value); setDocument(null); setFileError(null); }} aria-describedby={selected ? 'trade-help' : undefined}>
          <option value="">{de ? 'Gewerk auswählen' : 'Select your trade'}</option>
          <optgroup label={de ? 'Zulassungspflichtige Handwerke · Anlage A' : 'Regulated trades · Annex A'}>{trades.filter(t => t.classification === 'A').map(t => <option key={t.id} value={t.id}>{de ? t.de : `${t.en} · ${t.de}`}</option>)}</optgroup>
          <optgroup label={de ? 'Zulassungsfreie / handwerksähnliche Gewerbe · Anlage B' : 'Non-licensed / craft-like trades · Annex B'}>{trades.filter(t => t.classification === 'B1' || t.classification === 'B2').map(t => <option key={t.id} value={t.id}>{de ? t.de : `${t.en} · ${t.de}`}</option>)}</optgroup>
          <option value="other">{de ? 'Anderes Gewerk / unsicher' : 'Other trade / not sure'}</option>
        </select>
        {selected && <p className="trade-help" id="trade-help">{selected.classification === 'A' ? (de ? 'Anlage A HwO: Für den selbständigen Betrieb sind die Voraussetzungen der Handwerksrolle zu prüfen. Ein Meisterbrief ist nicht der einzige mögliche Nachweis. Für Beschäftigte gelten andere Voraussetzungen.' : 'Annex A HwO: independent business operation requires checking Handwerksrolle requirements. A master craftsman certificate is not the only qualification route. Employee requirements differ.') : selected.classification === 'review' ? (de ? 'Die Anforderungen hängen von Ihren konkreten Tätigkeiten ab. Bitte mit der zuständigen Handwerkskammer klären.' : 'Requirements depend on your actual activities. Please clarify them with the responsible Handwerkskammer.') : (de ? 'Anlage B HwO: kein Meisterbrief allein aufgrund dieser Kategorie erforderlich. Registrierungs- und tätigkeitsbezogene Anforderungen dennoch prüfen.' : 'Annex B HwO: this category alone does not require a master craftsman certificate. Registration and activity-specific requirements still need checking.')}</p>}
        {showUpload && <div className="qualification-upload">
          <label htmlFor="qualification">{de ? 'Qualifikationsnachweis hochladen (falls zutreffend)' : 'Upload qualification evidence (if applicable)'}</label>
          <p className="login-note">{de ? 'Zum Beispiel Meisterbrief, Handwerksrolleneintrag, anerkannte gleichwertige Qualifikation oder Ausnahmebewilligung. Prüfung durch die zuständige Stelle erforderlich.' : 'For example: Meisterbrief, Handwerksrolle registration, recognized equivalent qualification or exemption. Verification by the responsible authority is required.'}</p>
          <input ref={fileInput} key={tradeId} id="qualification" name="qualification" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" aria-describedby="qualification-help" aria-invalid={!!fileError} onChange={event => { const file = event.target.files?.[0] ?? null; const error = file ? certificateError(file) : null; setFileError(error); setDocument(error ? null : file); if (error) event.target.value = ''; }} />
          <small id="qualification-help">PDF, JPG, PNG · {de ? 'max. 10 MB · optional' : 'up to 10 MB · optional'}</small>
          {fileError && <p className="form-error" role="alert">{fileError === 'type' ? (de ? 'Bitte PDF, JPG oder PNG auswählen.' : 'Please choose a PDF, JPG or PNG.') : (de ? 'Die Datei muss zwischen 1 Byte und 10 MB groß sein.' : 'The file must be non-empty and no larger than 10 MB.')}</p>}
          {(document || fileError) && <button className="text-button" type="button" onClick={() => { setDocument(null); setFileError(null); if (fileInput.current) fileInput.current.value = ''; }}>{de ? 'Datei entfernen' : 'Remove file'}</button>}
          {document && <p className="login-note" role="status">{document.name} · {de ? 'lokal ausgewählt, nicht hochgeladen oder geprüft' : 'selected locally, not uploaded or verified'}</p>}
        </div>}
        {selected && <p className="source-links"><a href={selected.classification === 'A' || selected.classification === 'review' ? tradeSources.A : tradeSources.B} target="_blank" rel="noreferrer">{de ? 'Handwerksordnung: Gewerkeliste' : 'Handwerksordnung: trade list'}</a>{showUpload && <> · <a href={tradeSources.qualifications} target="_blank" rel="noreferrer">{de ? 'Qualifikationswege' : 'Qualification routes'}</a></>}</p>}
        <button className="continue-button" type="submit" disabled={!!fileError}>{de ? 'Registrieren' : 'Sign up'}</button>
      </form>
      <p className="login-note">{de ? 'Vorschau — noch keine Kontoerstellung oder Dokumentenübertragung.' : 'Preview — account creation and document upload are not connected yet.'}</p>
      {submitted && <p className="login-note" role="status">{de ? 'Formular geprüft. Es wurde kein Konto erstellt. Ihre Angaben und Dokumente wurden nicht gesendet oder gespeichert.' : 'Form checked. No account was created. Your details and documents were not sent or stored.'}</p>}
      <p className="login-note">{de ? 'Bereits registriert?' : 'Already have an account?'}</p>
      <button className="back-button" type="button" onClick={onLogin}>{de ? 'Zur Anmeldung' : 'Back to log in'}</button>
    </section>
  );
}

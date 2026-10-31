import { sentProposalGrossCents } from "../data/sentProposals";
import { useRef, useState } from "react";
import type { DemoProject } from "../data/demoProjects";
import { projectBriefs, type LocalText } from "../data/projectBriefs";
import {
  projectStatuses,
  statusLabel,
  type ProjectStatus,
} from "../data/projectStatus";
import { WorkspaceIcon as Icon } from "./WorkspaceIcon";

interface Props {
  project: DemoProject;
  de: boolean;
  onBack: () => void;
  onUpdate: (status: ProjectStatus, inspected: boolean) => void;
  onChat: () => void;
}
export function ProjectDetails({
  project,
  de,
  onBack,
  onUpdate,
  onChat,
}: Props) {
  const brief = projectBriefs[project.id];
  const text = (value: LocalText) => (de ? value.de : value.en);
  const [status, setStatus] = useState(project.status);
  const [inspected, setInspected] = useState(project.inspected);
  const [saved, setSaved] = useState(false);
  const preview = useRef<HTMLDialogElement>(null);
  const [previewType, setPreviewType] = useState<"brief" | "photo">("brief");
  const sentGross = project.status === "new" ? null : sentProposalGrossCents(project.id);
  const money = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format((sentGross ?? 0) / 100);
  const missing = de ? "Nicht angegeben" : "Not provided";
  const source = de
    ? "Quelle: Kundenbrief · Beispieldaten"
    : "Source: customer brief · demo data";
  function showPreview(type: "brief" | "photo") {
    setPreviewType(type);
    preview.current?.showModal();
  }
  if (!brief)
    return (
      <div className="brief-card">
        <button className="workspace-outline" onClick={onBack}>
          {de ? "Zurück" : "Back"}
        </button>
        <p>
          {de
            ? "Keine Projektdetails hinterlegt."
            : "No project details recorded."}
        </p>
      </div>
    );
  return (
    <div className="project-brief">
      <div className="brief-toolbar">
        <button className="brief-back" onClick={onBack}>
          ← {de ? "Zur Übersicht" : "Back to overview"}
        </button>
        <button className="workspace-outline" onClick={onChat}>
          {de ? "Chat öffnen" : "Open chat"} →
        </button>
      </div>
      <section className="brief-overview">
        <img
          src={project.image}
          width="80"
          height="80"
          alt={de ? "Referenzbild des Projekts" : "Project reference image"}
        />
        <div className="brief-overview-copy">
          <p className="brief-eyebrow">
            {de ? "Bauvorhaben" : "Renovation project"}
          </p>
          <h2>{de ? project.nameDe : project.name}</h2>
          <div className="brief-overview-meta">
            <span>
              <Icon name="pin" size={13} />
              {project.city}
            </span>
            <span className={`status-pill status-${project.status}`}>
              {statusLabel(project.status, de)}
            </span>
          </div>
        </div>
        {sentGross !== null && <div className="brief-budget">
          <span>
            {de ? "Zuletzt gesendetes Angebot" : "Latest sent proposal"}
          </span>
          <strong>{money}</strong>
          <small>
            {de
              ? "Brutto · gespeicherter Versandstand"
              : "Gross · recorded sent snapshot"}
          </small>
        </div>}
      </section>
      <div className="brief-facts">
        <div>
          <span>{de ? "Fläche / Aufmaß" : "Area / measurement"}</span>
          <strong>
            ca. {new Intl.NumberFormat("de-DE").format(brief.area)} m²
          </strong>
          <small>{text(brief.areaNote)}</small>
        </div>
        <div>
          <span>{de ? "Beteiligte Gewerke" : "Relevant trades"}</span>
          <strong>{text(brief.trades)}</strong>
          <small>
            {de
              ? "Genaue Abgrenzung noch klären"
              : "Confirm precise trade boundaries"}
          </small>
        </div>
        <div>
          <span>{de ? "Ausführungszeitraum" : "Execution period"}</span>
          <strong>{text(brief.timing)}</strong>
          <small>
            {de ? "Kein verbindlicher Termin" : "No confirmed commitment"}
          </small>
        </div>
        <div>
          <span>{de ? "Besichtigung" : "Site visit"}</span>
          <strong>
            {project.inspected
              ? de
                ? "Als besichtigt markiert"
                : "Marked as visited"
              : de
                ? "Noch nicht vermerkt"
                : "Not yet recorded"}
          </strong>
          <small>
            {project.inspected
              ? de
                ? "Protokoll und Aufmaß fehlen"
                : "Visit report and measured dimensions missing"
              : de
                ? "Optional · Angebot bleibt möglich"
                : "Optional · does not block a proposal"}
          </small>
        </div>
      </div>
      <nav
        className="brief-jump-links"
        aria-label={de ? "Abschnitte der Projektakte" : "Project file sections"}
      >
        <a href="#brief-scope">{de ? "Leistungsumfang" : "Scope"}</a>
        <a href="#brief-building">
          {de ? "Objekt & Bestand" : "Building & condition"}
        </a>
        <a href="#brief-documents">{de ? "Unterlagen" : "Documents"}</a>
      </nav>
      <div className="brief-columns">
        <div className="brief-main">
          <section className="brief-card" id="brief-scope">
            <div className="brief-section-title">
              <h3>{de ? "Leistungsumfang" : "Scope of work"}</h3>
              <span className="brief-source">
                {de ? "Kundenwunsch" : "Customer request"}
              </span>
            </div>
            <p className="brief-description">
              {de ? project.scopeDe : project.scope}
            </p>
            <div className="brief-table-wrap">
              <table className="brief-scope-table">
                <thead>
                  <tr>
                    <th>Pos.</th>
                    <th>{de ? "Leistung / Bauteil" : "Work / component"}</th>
                    <th>{de ? "Menge" : "Quantity"}</th>
                    <th>{de ? "Datenstand" : "Evidence"}</th>
                  </tr>
                </thead>
                <tbody>
                  {brief.items.map((item, index) => (
                    <tr key={item.title.de}>
                      <td>{String(index + 1).padStart(2, "0")}</td>
                      <td>{text(item.title)}</td>
                      <td>
                        {item.quantity === null ? (
                          <span className="brief-missing">
                            {de ? "Offen" : "Missing"}
                          </span>
                        ) : (
                          `${item.quantity.toLocaleString("de-DE")} ${item.unit}`
                        )}
                      </td>
                      <td>{text(item.note)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="brief-inline-note">
              <Icon name="projects" size={15} />
              <span>
                {de
                  ? "Raumfläche ist keine abrechenbare Menge. Wandflächen, Bodenflächen und laufende Meter getrennt aufmessen."
                  : "Room area is not a billable quantity. Measure wall areas, floor areas and linear meters separately."}
              </span>
            </div>
            <p className="brief-footnote">
              {source} ·{" "}
              {de
                ? "Kein vollständiges Leistungsverzeichnis. Preise und Abrechnungsmengen noch offen."
                : "Not a complete bill of quantities. Unit prices and measured quantities remain open."}
            </p>
          </section>
          <section className="brief-card" id="brief-building">
            <h3>{de ? "Objekt & Bestand" : "Building & existing condition"}</h3>
            <dl className="brief-data-grid">
              <div>
                <dt>{de ? "Objektart" : "Building type"}</dt>
                <dd>
                  {de
                    ? "Bestandsgebäude · Renovierung"
                    : "Existing building · renovation"}
                </dd>
              </div>
              <div>
                <dt>{de ? "Baujahr" : "Year of construction"}</dt>
                <dd className="brief-missing">{missing}</dd>
              </div>
              <div>
                <dt>{de ? "Ausführungsort" : "Work location"}</dt>
                <dd>
                  {project.city}
                  <small>
                    {de
                      ? "Genaue Baustellenadresse fehlt"
                      : "Exact site address missing"}
                  </small>
                </dd>
              </div>
              <div>
                <dt>{de ? "Etage / Zugang" : "Floor / access"}</dt>
                <dd className="brief-missing">{missing}</dd>
              </div>
            </dl>
            <h4>{de ? "Bestandszustand" : "Existing condition"}</h4>
            <p>{text(brief.condition)}</p>
            <h4>
              {de
                ? "Material- und Ausstattungswünsche"
                : "Material and finish preferences"}
            </h4>
            <p>{text(brief.materials)}</p>
            <p className="brief-footnote">
              {source} ·{" "}
              {de
                ? "Vor Ausführung fachlich prüfen."
                : "Requires professional review before execution."}
            </p>
          </section>
        </div>
        <aside
          className="brief-sidebar"
          aria-label={de ? "Projektorganisation" : "Project administration"}
        >
          <section className="brief-card">
            <h3>{de ? "Projektstand" : "Project status"}</h3>
            <span className={`status-pill status-${project.status}`}>
              {statusLabel(project.status, de)}
            </span>
            {project.status === "new" && (
              <button
                className="acknowledge-request"
                onClick={() => {
                  onUpdate("acknowledged", project.inspected);
                  setStatus("acknowledged");
                  setInspected(project.inspected);
                  setSaved(true);
                }}
              >
                {de ? "Anfrage bestätigen" : "Acknowledge request"}
              </button>
            )}
            <details className="brief-status-editor">
              <summary>{de ? "Status aktualisieren" : "Update status"}</summary>
              <form
                className="project-status-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  onUpdate(status, inspected);
                  setSaved(true);
                }}
              >
                <label htmlFor="project-status">
                  {de ? "Projektstatus" : "Project status"}
                </label>
                <select
                  id="project-status"
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value as ProjectStatus);
                    setSaved(false);
                  }}
                >
                  {projectStatuses.map((value) => (
                    <option key={value} value={value}>
                      {statusLabel(value, de)}
                    </option>
                  ))}
                </select>
                <label className="inspection-control">
                  <input
                    type="checkbox"
                    checked={inspected}
                    onChange={(event) => {
                      setInspected(event.target.checked);
                      setSaved(false);
                    }}
                  />
                  {de ? "Besichtigung abgeschlossen" : "Site visit completed"}
                </label>
                <p>
                  {de
                    ? "Besichtigung und Projektstatus sind unabhängig."
                    : "Site visits and project status are independent."}
                </p>
                <button className="workspace-outline" type="submit">
                  {de ? "Änderungen speichern" : "Save changes"}
                </button>
              </form>
            </details>
            {saved && (
              <p className="brief-footnote" role="status">
                {de
                  ? "Für diese Demo-Sitzung aktualisiert."
                  : "Updated for this demo session."}
              </p>
            )}
          </section>
          <section className="brief-card" id="brief-documents">
            <h3>{de ? "Unterlagen & Herkunft" : "Documents & sources"}</h3>
            <button
              className="brief-document"
              onClick={() => showPreview("brief")}
            >
              <Icon name="proposal" size={20} />
              <span>
                <strong>{de ? "Kundenbrief" : "Customer brief"}</strong>
                <small>
                  {de ? "Demo-Datensatz · einsehbar" : "Demo record · viewable"}
                </small>
              </span>
              <Icon name="chevron" size={14} />
            </button>
            <button
              className="brief-document"
              onClick={() => showPreview("photo")}
            >
              <img src={project.image} alt="" />
              <span>
                <strong>{de ? "Referenzbild" : "Reference photo"}</strong>
                <small>
                  {de
                    ? "Beispielbild · kein Aufmaß"
                    : "Illustrative image · not a survey"}
                </small>
              </span>
              <Icon name="chevron" size={14} />
            </button>
            <div className="brief-missing-docs">
              <span>{de ? "Noch nicht hinterlegt" : "Not yet recorded"}</span>
              <ul>
                <li>
                  {de ? "Grundriss / Aufmaß" : "Floor plan / measured survey"}
                </li>
                <li>{de ? "Besichtigungsprotokoll" : "Site visit report"}</li>
                <li>
                  {de
                    ? "Produkt- und Materialauswahl"
                    : "Product and material selections"}
                </li>
              </ul>
            </div>
          </section>
          <section className="brief-card">
            <h3>{de ? "Baustellenorganisation" : "Site organization"}</h3>
            <dl className="brief-data-grid brief-single-column">
              <div>
                <dt>{de ? "Ansprechpartner" : "Contact person"}</dt>
                <dd className="brief-missing">{missing}</dd>
              </div>
              <div>
                <dt>{de ? "Zugang / Schlüssel" : "Access / keys"}</dt>
                <dd className="brief-missing">{missing}</dd>
              </div>
              <div>
                <dt>
                  {de ? "Arbeitszeiten / Nutzung" : "Working hours / occupancy"}
                </dt>
                <dd>
                  {de ? "Mit dem Kunden abstimmen" : "Agree with the customer"}
                </dd>
              </div>
              <div>
                <dt>
                  {de ? "Schutz / Entsorgung" : "Protection / waste removal"}
                </dt>
                <dd>
                  {de
                    ? "Umfang und Zuständigkeit klären"
                    : "Confirm scope and responsibility"}
                </dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
      <dialog
        ref={preview}
        className="brief-preview-dialog"
        aria-labelledby="brief-preview-heading"
      >
        <div className="brief-dialog-heading">
          <h2 id="brief-preview-heading">
            {previewType === "brief"
              ? de
                ? "Kundenbrief · Beispiel"
                : "Customer brief · example"
              : de
                ? "Referenzbild"
                : "Reference photo"}
          </h2>
          <button
            className="workspace-outline"
            onClick={() => preview.current?.close()}
          >
            {de ? "Schließen" : "Close"}
          </button>
        </div>
        {previewType === "photo" ? (
          <>
            <img src={project.image} alt={de ? project.nameDe : project.name} />
            <p>
              {de
                ? "Illustratives Referenzbild, kein bestätigtes Baustellenfoto."
                : "Illustrative reference image, not a verified site photo."}
            </p>
          </>
        ) : (
          <>
            <h3>
              {de ? project.nameDe : project.name} · {project.id}
            </h3>
            <p>{de ? project.scopeDe : project.scope}</p>
            <p>{text(brief.materials)}</p>
            <p>
              {de
                ? "Raumfläche laut Demo-Kundenangabe: ca."
                : "Approximate room area in demo customer brief:"}{" "}
              {brief.area} m²
            </p>
            <p className="brief-footnote">
              {de
                ? "Dieser Datensatz ist ein Beispiel. Er wurde nicht von BauAI importiert, vor Ort aufgemessen oder automatisch aus einem Foto ermittelt."
                : "This is a demo record. It was not imported from BauAI, measured on site or automatically inferred from a photo."}
            </p>
          </>
        )}
      </dialog>
    </div>
  );
}

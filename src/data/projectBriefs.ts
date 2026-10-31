export interface LocalText {
  de: string;
  en: string;
}
export interface ScopeItem {
  title: LocalText;
  quantity: number | null;
  unit: "Stk." | "m²" | "m" | "psch.";
  note: LocalText;
}
export interface ProjectBrief {
  area: number;
  areaNote: LocalText;
  trades: LocalText;
  timing: LocalText;
  condition: LocalText;
  materials: LocalText;
  items: ScopeItem[];
  questions: LocalText[];
  checks: LocalText[];
}
const t = (de: string, en: string): LocalText => ({ de, en });
const pending = t("Vor Ort aufmessen", "Measure on site");
const planned = t(
  "Kundenwunsch · nicht technisch geprüft",
  "Customer request · not technically verified",
);
const unit = (de: string, en: string): ScopeItem => ({
  title: t(de, en),
  quantity: 1,
  unit: "Stk.",
  note: planned,
});
const surface = (de: string, en: string): ScopeItem => ({
  title: t(de, en),
  quantity: null,
  unit: "m²",
  note: pending,
});
// Illustrative fixtures only. The original brief, not AI inference, is the source for these demo values.
// Area figures are customer estimates and must not be used as measured/billable quantities.
export const projectBriefs: Record<string, ProjectBrief> = {
  "REN-001": {
    area: 14,
    areaNote: t(
      "Kundenangabe, ca. · kein Aufmaß",
      "Approximate customer estimate · not a site measurement",
    ),
    trades: t(
      "Tischler · Elektro nach Prüfung",
      "Joinery · electrical review as needed",
    ),
    timing: t("Wunschtermin noch abzustimmen", "Preferred dates to be agreed"),
    condition: t(
      "Bestehende Küche; Grundriss möglichst erhalten. Anschlüsse und Untergrund nicht dokumentiert.",
      "Existing kitchen; retain the layout where possible. Services and substrate condition are undocumented.",
    ),
    materials: t(
      "Helle Holzoptik und weiße Oberflächen gewünscht. Ausführung und Produkte offen.",
      "Light wood and white surfaces preferred. Specifications and products are undecided.",
    ),
    items: [
      {
        title: t("Küchenmöbel erneuern", "Replace kitchen cabinetry"),
        quantity: null,
        unit: "Stk.",
        note: t(
          "Anzahl und Abmessungen fehlen",
          "Count and dimensions missing",
        ),
      },
      {
        title: t("Arbeitsplatte ersetzen", "Replace worktop"),
        quantity: null,
        unit: "m",
        note: pending,
      },
      {
        title: t(
          "Beleuchtung prüfen und abstimmen",
          "Review and agree lighting",
        ),
        quantity: null,
        unit: "Stk.",
        note: t(
          "Umfang fachlich klären",
          "Confirm scope with a qualified trade",
        ),
      },
    ],
    questions: [
      t(
        "Schrankanzahl und Arbeitsplattenlänge aufnehmen.",
        "Record cabinet count and worktop length.",
      ),
      t(
        "Elektro- und Wasseranschlüsse prüfen lassen.",
        "Arrange a qualified check of electrical and water connections.",
      ),
      t(
        "Materialauswahl und Ausführungstermin bestätigen.",
        "Confirm materials and execution dates.",
      ),
    ],
    checks: [
      t(
        "Änderungen an festen Elektroanschlüssen durch einen qualifizierten Fachbetrieb klären.",
        "Refer changes to fixed electrical connections to a qualified specialist.",
      ),
    ],
  },
  "REN-002": {
    area: 7,
    areaNote: t(
      "Kundenangabe, ca. · kein Aufmaß",
      "Approximate customer estimate · not a site measurement",
    ),
    trades: t(
      "Sanitär · Fliesen nach Abstimmung",
      "Plumbing · tiling subject to agreement",
    ),
    timing: t(
      "Beginn und Bauzeit noch offen",
      "Start date and duration not yet agreed",
    ),
    condition: t(
      "Bestehendes Familienbad soll modernisiert werden. Leitungszustand, Gefälle und Abdichtungsaufbau sind nicht dokumentiert.",
      "Existing family bathroom to be modernized. Pipe condition, drainage falls and waterproofing build-up are undocumented.",
    ),
    materials: t(
      "Moderne Oberflächen und neuer Waschtisch gewünscht. Fliesenformat, Armaturen und Fabrikate noch offen.",
      "Modern finishes and a new vanity requested. Tile format, fittings and product choices remain open.",
    ),
    items: [
      unit("Bodengleiche Dusche vorsehen", "Provide a walk-in shower"),
      unit("Waschtisch erneuern", "Replace vanity"),
      surface(
        "Wand- und Bodenoberflächen abstimmen",
        "Agree wall and floor finishes",
      ),
    ],
    questions: [
      t(
        "Wand- und Bodenflächen getrennt aufmessen; Öffnungen berücksichtigen.",
        "Measure wall and floor areas separately, accounting for openings.",
      ),
      t(
        "Entwässerungshöhe, Gefälle und vorhandenen Aufbau vor Ort prüfen.",
        "Check drainage height, falls and existing floor build-up on site.",
      ),
      t(
        "Nutzung des Bads während der Arbeiten und Materialauswahl klären.",
        "Agree bathroom access during work and material selections.",
      ),
    ],
    checks: [
      t(
        "Abdichtungs- und Entwässerungskonzept vor Ausführung fachlich prüfen lassen.",
        "Have the waterproofing and drainage approach professionally reviewed before execution.",
      ),
      t(
        "Arbeiten an Wasser- und ggf. Elektroanschlüssen mit den zuständigen Fachbetrieben abstimmen.",
        "Coordinate water and any electrical connection work with qualified specialists.",
      ),
    ],
  },
  "REN-003": {
    area: 24,
    areaNote: t(
      "Kundenangabe, ca. · kein Aufmaß",
      "Approximate customer estimate · not a site measurement",
    ),
    trades: t("Parkettleger · Maler", "Parquet laying · painting"),
    timing: t(
      "Ausführungszeitraum noch abzustimmen",
      "Execution period to be agreed",
    ),
    condition: t(
      "Originalparkett soll erhalten bleiben. Restnutzschicht, Feuchte und Zustand der Wandflächen sind offen.",
      "Original parquet is to be retained. Remaining wear layer, moisture and wall condition are unconfirmed.",
    ),
    materials: t(
      "Vorhandenes Parkett aufarbeiten. Oberflächenbehandlung und Wandfarbton abstimmen.",
      "Refinish existing parquet. Agree the surface treatment and wall color.",
    ),
    items: [
      surface("Originalparkett aufarbeiten", "Refinish original parquet"),
      surface("Wände vorbereiten und streichen", "Prepare and paint walls"),
    ],
    questions: [
      t(
        "Parkettfläche und verbleibende Nutzschicht prüfen.",
        "Check parquet area and remaining wear layer.",
      ),
      t(
        "Wandflächen, Untergrund und Oberflächenfinish aufnehmen.",
        "Record wall areas, substrate and finish requirements.",
      ),
    ],
    checks: [
      t(
        "Bei unbekannten Altbeschichtungen oder Klebstoffen vor Bearbeitung fachlichen Prüfbedarf klären.",
        "For unknown old coatings or adhesives, establish whether specialist assessment is needed before work.",
      ),
    ],
  },
  "REN-004": {
    area: 22,
    areaNote: t(
      "Kundenangabe für zwei Räume, ca.",
      "Approximate customer estimate for two rooms",
    ),
    trades: t(
      "Bodenarbeiten · Gewerk je nach Belag prüfen",
      "Flooring · confirm trade requirements for the selected finish",
    ),
    timing: t(
      "Termine mit dem Kunden abstimmen",
      "Agree dates with the customer",
    ),
    condition: t(
      "Bestehender Bodenbelag und Sockelleisten sollen ersetzt werden. Untergrund und Aufbauhöhen noch zu prüfen.",
      "Existing flooring and skirting to be replaced. Substrate and build-up heights require checking.",
    ),
    materials: t(
      "Warme Eichenoptik gewünscht. Belagsart, Verlegeweise und Sockelleisten bestätigen.",
      "Warm oak finish preferred. Confirm floor type, installation method and skirting.",
    ),
    items: [
      surface("Bodenbelag ersetzen", "Replace floor covering"),
      {
        title: t("Sockelleisten erneuern", "Replace skirting boards"),
        quantity: null,
        unit: "m",
        note: pending,
      },
    ],
    questions: [
      t(
        "Beide Räume getrennt aufmessen, Türen und Anschlüsse berücksichtigen.",
        "Measure each room separately, including doors and junctions.",
      ),
      t(
        "Untergrund, Aufbauhöhe und Materialfreigaben prüfen.",
        "Check substrate, build-up height and product suitability.",
      ),
    ],
    checks: [
      t(
        "Eignung des gewählten Belags und des Untergrunds vor Verlegung fachlich bestätigen.",
        "Have the chosen floor finish and substrate suitability professionally confirmed before installation.",
      ),
    ],
  },
  "REN-005": {
    area: 9,
    areaNote: t(
      "Kundenangabe, ca. · kein Aufmaß",
      "Approximate customer estimate · not a site measurement",
    ),
    trades: t("Tischler · Oberflächenarbeiten", "Joinery · surface finishing"),
    timing: t(
      "Ausführung laut Projektstatus abgeschlossen; Nachweise prüfen",
      "Project marked completed; review supporting records",
    ),
    condition: t(
      "Küche soll ohne vollständigen Austausch aufgefrischt werden. Bestandsmaße und Ausführungsnachweise fehlen in der Demo-Akte.",
      "Kitchen refresh without full replacement. Existing dimensions and execution records are missing from the demo file.",
    ),
    materials: t(
      "Fronten, Arbeitsplatte und Spritzschutz abstimmen; Materialangaben nicht hinterlegt.",
      "Agree fronts, worktop and splashback; material specifications are not recorded.",
    ),
    items: [
      {
        title: t("Schrankfronten auffrischen", "Refresh cabinet fronts"),
        quantity: null,
        unit: "Stk.",
        note: t("Anzahl nicht hinterlegt", "Count not recorded"),
      },
      {
        title: t("Arbeitsplatte ersetzen", "Replace worktop"),
        quantity: null,
        unit: "m",
        note: pending,
      },
      surface("Spritzschutz erneuern", "Renew splashback"),
    ],
    questions: [
      t(
        "Ausführungsunterlagen und Abnahmeprotokoll ergänzen.",
        "Add execution documents and the acceptance record.",
      ),
      t(
        "Materialien und tatsächliche Mengen dokumentieren.",
        "Document materials and actual quantities.",
      ),
    ],
    checks: [
      t(
        "Der Status „abgeschlossen“ ersetzt keinen Ausführungs- oder Abnahmenachweis.",
        "A completed status does not replace execution or acceptance documentation.",
      ),
    ],
  },
};

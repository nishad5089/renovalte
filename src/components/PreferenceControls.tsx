interface Props {
  de: boolean;
  mobile: boolean;
  onMobileChange: (mobile: boolean) => void;
  onLanguageChange: (language: "en" | "de") => void;
}
export function PreferenceControls({
  de,
  mobile,
  onMobileChange,
  onLanguageChange,
}: Props) {
  return (
    <div className="preference-controls">
      <div>
        <p>{de ? "Ansicht" : "Display"}</p>
        <div
          className="toggle-group"
          role="group"
          aria-label={de ? "Ansicht" : "Preview mode"}
        >
          <button
            type="button"
            aria-pressed={!mobile}
            onClick={() => onMobileChange(false)}
          >
            Desktop
          </button>
          <button
            type="button"
            aria-pressed={mobile}
            onClick={() => onMobileChange(true)}
          >
            {de ? "Mobil" : "Mobile"}
          </button>
        </div>
      </div>
      <div>
        <p>{de ? "Sprache" : "Language"}</p>
        <div
          className="toggle-group"
          role="group"
          aria-label={de ? "Sprache" : "Language"}
        >
          <button
            type="button"
            aria-label="English"
            aria-pressed={!de}
            onClick={() => onLanguageChange("en")}
          >
            EN
          </button>
          <button
            type="button"
            aria-label="Deutsch"
            aria-pressed={de}
            onClick={() => onLanguageChange("de")}
          >
            DE
          </button>
        </div>
      </div>
    </div>
  );
}

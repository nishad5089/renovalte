import { useEffect, useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { Workspace } from "./components/Workspace";
import { BrandLogo } from "./components/BrandLogo";
import { PreferenceControls } from "./components/PreferenceControls";

export default function App() {
  const [screen, setScreen] = useState<"landing" | "login" | "workspace">(
    "landing",
  );
  const [mobile, setMobile] = useState(false);
  const [language, setLanguage] = useState<"en" | "de">("en");
  const de = language === "de";

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <>
      {screen !== "workspace" && (
        <header className="public-header">
          <div className="public-brand">
            <BrandLogo />
            <strong>RenovAIte</strong>
          </div>
          <details className="public-settings">
            <summary>{de ? "Einstellungen" : "Settings"}</summary>
            <PreferenceControls
              de={de}
              mobile={mobile}
              onMobileChange={setMobile}
              onLanguageChange={setLanguage}
            />
          </details>
        </header>
      )}
      <main
        className={`${mobile ? "mobile-preview" : ""} ${screen === "workspace" ? "workspace-main" : ""}`}
      >
        {screen === "workspace" ? (
          <Workspace
            de={de}
            mobile={mobile}
            onLogout={() => setScreen("login")}
            onMobileChange={setMobile}
            onLanguageChange={setLanguage}
          />
        ) : screen === "login" ? (
          <LoginPage
            de={de}
            onBack={() => setScreen("landing")}
            onLogin={() => setScreen("workspace")}
          />
        ) : (
          <>
            <h1>RenovAIte</h1>
            <p className="tagline">
              {de
                ? "KI-Begleiter für die Sanierung von Bestandsgebäuden in Deutschland – entwickelt für Handwerker."
                : "AI companion for renovating Germany’s existing buildings—built for craftsmen."}
            </p>
            <button
              className="continue-button"
              onClick={() => setScreen("login")}
            >
              {de ? "Weiter" : "Continue"}
            </button>
          </>
        )}
      </main>
    </>
  );
}

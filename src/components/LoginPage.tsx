import { useState } from "react";
import { SignUpPage } from "./SignUpPage";

interface Props {
  de: boolean;
  onBack: () => void;
  onLogin: () => void;
}

export function LoginPage({ de, onBack, onLogin }: Props) {
  const [signup, setSignup] = useState(false);

  if (signup) return <SignUpPage de={de} onLogin={() => setSignup(false)} />;

  return (
    <section className="login-page" aria-labelledby="login-heading">
      <h1 id="login-heading">{de ? "Anmelden" : "Log in"}</h1>
      <form
        className="login-form"
        onSubmit={(event) => {
          event.preventDefault();
          onLogin();
        }}
      >
        <label htmlFor="username">{de ? "Benutzername" : "Username"}</label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
        />
        <label htmlFor="password">{de ? "Passwort" : "Password"}</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        <button className="continue-button" type="submit">
          {de ? "Anmelden" : "Log in"}
        </button>
      </form>
      <p className="login-note">
        {de
          ? "Demo-Anmeldung — beliebigen Benutzernamen und ein Passwort eingeben. Keine echte Authentifizierung."
          : "Demo sign-in — enter any username and password. No real authentication."}
      </p>
      <p className="login-note">
        {de ? "Noch kein Konto?" : "Don’t have an account?"}{" "}
        <button
          className="text-button"
          type="button"
          onClick={() => {
            setSignup(true);
          }}
        >
          {de ? "Registrieren" : "Sign up"}
        </button>
      </p>
      <button className="back-button" type="button" onClick={onBack}>
        {de ? "Zurück" : "Back"}
      </button>
    </section>
  );
}

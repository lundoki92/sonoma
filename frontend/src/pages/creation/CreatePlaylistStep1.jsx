import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Champ } from "../../components/Champ.jsx";
import Button from "../../components/common/Button.jsx";
import ExplanationText from "../../components/common/ExplanationText.jsx";
import { STREAMING_SERVICES } from "./services.js";
import { readWizardState, saveWizardState } from "./wizardState.js";
import "./CreatePlaylistStep1.css";

// Convert an ISO date into the local value expected by a datetime-local input.
function toDateTimeLocal(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const pad = (number) => String(number).padStart(2, "0");

  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

export default function CreatePlaylistStep1() {
  const navigate = useNavigate();
  const location = useLocation();

  // En revenant de l'étape 2, le nom, la date, le service et les morceaux
  // déjà choisis reviennent via le state du routeur ou, si on est passé par
  // le bouton retour du header, via le stockage de session.
  const [storedState] = useState(() => readWizardState());
  const routeWizard = location.state?.wizard;
  const wizard = routeWizard ?? storedState?.wizard ?? null;
  const wizardTracks = routeWizard
    ? (location.state?.tracks ?? [])
    : (storedState?.tracks ?? []);

  const [name, setName] = useState(wizard?.name ?? "");
  const [dateTime, setDateTime] = useState(
    wizard?.date_time ? toDateTimeLocal(wizard.date_time) : "",
  );
  const [streamingService, setStreamingService] = useState(
    wizard?.streaming_service ?? "spotify",
  );
  const [error, setError] = useState("");

  // The main action only becomes available once both required fields are set.
  const isIncomplete = !name.trim() || !dateTime;

  function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Donne un nom à ta soirée.");
      return;
    }

    if (!dateTime) {
      setError("Choisis la date de ta soirée.");
      return;
    }

    const wizard = {
      name: name.trim(),
      date_time: new Date(dateTime).toISOString(),
      streaming_service: streamingService,
    };

    // Rien n'est écrit en base : on garde le formulaire pour l'étape 2.
    saveWizardState({ wizard, tracks: wizardTracks });

    navigate("/createplaylist/setup", {
      replace: true,
      state: { wizard, tracks: wizardTracks },
    });
  }

  return (
    <form className="creation-form" onSubmit={handleSubmit}>
      <div className="creation-intro">
        <ExplanationText
          hasAppTitle={false}
          title="Créer ma soirée"
          text="Donne-lui un nom, choisis la date et le service de streaming à utiliser."
        />
      </div>

      <Champ
        id="playlist-name"
        label="Nom de ma soirée"
        type="text"
        placeholder="Anniversaire de Léa"
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={100}
        required
      />

      <Champ
        id="playlist-date"
        label="Date de la soirée"
        type="datetime-local"
        value={dateTime}
        onChange={(event) => setDateTime(event.target.value)}
        required
      />

      <fieldset className="creation-field">
        <legend>Service de streaming</legend>

        <div className="service-grid">
          {STREAMING_SERVICES.map((service) => {
            const checked = streamingService === service.value;

            return (
              <label
                key={service.value}
                className={[
                  "service-card",
                  checked ? "is-selected" : "",
                  service.available ? "" : "is-disabled",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <input
                  type="radio"
                  name="streaming_service"
                  value={service.value}
                  checked={checked}
                  onChange={() => setStreamingService(service.value)}
                  disabled={!service.available}
                />

                {!service.available && (
                  <span className="service-badge">Bientôt</span>
                )}

                <i className={service.icon} aria-hidden="true"></i>
                <span className="service-name">{service.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {error && (
        <p className="app-error" role="alert">
          {error}
        </p>
      )}

      <Button type="submit" disabled={isIncomplete} text="Continuer" />
    </form>
  );
}

import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router";
import { Champ } from "../../components/Champ.jsx";
import Button from "../../components/common/Button.jsx";
import ExplanationText from "../../components/common/ExplanationText.jsx";
import { STREAMING_SERVICES } from "./services.js";
import { readPlaylistDraft, savePlaylistDraft } from "./draft.js";
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
  const { id } = useParams();

  // The same screen handles creation (/createplaylist) and edition
  // (/playlist/:id/edit).
  const isEdit = Boolean(id);

  // When the user comes back from step 2, the form data and the already
  // chosen tracks are restored from the router state or, if the header
  // back button was used, from the temporary session draft.
  const [storedDraft] = useState(() => (isEdit ? null : readPlaylistDraft()));
  const routeDraft = location.state?.draft;
  const draft = routeDraft ?? storedDraft?.draft;
  const draftTracks = routeDraft
    ? (location.state?.tracks ?? [])
    : (storedDraft?.tracks ?? []);

  const [name, setName] = useState(draft?.name ?? "");
  const [dateTime, setDateTime] = useState(
    draft?.date_time ? toDateTimeLocal(draft.date_time) : "",
  );
  const [streamingService, setStreamingService] = useState(
    draft?.streaming_service ?? "spotify",
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPlaylist, setLoadingPlaylist] = useState(isEdit);

  // In edition mode, prefill the form with the existing playlist.
  useEffect(() => {
    if (!isEdit) return;

    let cancelled = false;

    async function loadPlaylist() {
      try {
        const response = await fetch(`/api/playlists/${id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Impossible de charger la soirée");
        }

        if (cancelled) return;

        setName(data.name ?? "");
        setDateTime(data.date_time ? toDateTimeLocal(data.date_time) : "");
        setStreamingService(data.streaming_service ?? "spotify");
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoadingPlaylist(false);
      }
    }

    loadPlaylist();

    return () => {
      cancelled = true;
    };
  }, [id, isEdit]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Donne un nom à ta soirée.");
      return;
    }

    if (!dateTime) {
      setError("Choisis la date de ta soirée.");
      return;
    }

    const draftData = {
      name: name.trim(),
      date_time: new Date(dateTime).toISOString(),
      streaming_service: streamingService,
    };

    // Creation: nothing is written to the database yet. The playlist and
    // its tracks are created when step 2 is validated.
    if (!isEdit) {
      savePlaylistDraft({ draft: draftData, tracks: draftTracks });

      navigate("/createplaylist/setup", {
        replace: true,
        state: { draft: draftData, tracks: draftTracks },
      });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/playlists/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(draftData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Impossible d'enregistrer ta soirée",
        );
      }

      navigate(`/playlist/${data.id}/setup`);
    } catch (err) {
      console.error("Error saving playlist:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loadingPlaylist) {
    return <p className="creation-status">Chargement de la soirée…</p>;
  }

  return (
    <form className="creation-form" onSubmit={handleSubmit}>
      <div className="creation-intro">
        <ExplanationText
          hasAppTitle={false}
          title={isEdit ? "Modifier ma soirée" : "Créer ma soirée"}
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
        <p className="creation-error" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading}
        text={
          loading
            ? "Enregistrement…"
            : isEdit
              ? "Enregistrer et continuer"
              : "Continuer"
        }
      />
    </form>
  );
}

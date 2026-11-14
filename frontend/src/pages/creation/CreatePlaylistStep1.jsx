import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Champ } from "../../components/Champ.jsx";
import Button from "../../components/common/Button.jsx";
import ExplanationText from "../../components/common/ExplanationText.jsx";
import { STREAMING_SERVICES } from "./services.js";
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
  const { id } = useParams();

  // The same screen handles creation (/createplaylist) and edition
  // (/playlist/:id/edit).
  const isEdit = Boolean(id);

  const [name, setName] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [streamingService, setStreamingService] = useState("spotify");
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

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        isEdit ? `/api/playlists/${id}` : "/api/playlists",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            date_time: new Date(dateTime).toISOString(),
            streaming_service: streamingService,
          }),
        },
      );

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
              : "Créer ma soirée"
        }
      />
    </form>
  );
}

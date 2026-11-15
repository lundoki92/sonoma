import { useState } from "react";
import { useNavigate } from "react-router";
import ExplanationText from "../components/common/ExplanationText";
import Button from "../components/common/Button";
import { Champ } from "../components/Champ.jsx";
import "./Auth.css";
import "./CreatePlaylist.css";


function CreatePlaylist() {

  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [playlist, setPlaylist] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setPlaylist(null);

    try {
      const response = await fetch("/api/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          date_time: new Date(dateTime).toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Impossible de créer la soirée");
      }

      setPlaylist(data);
      setName("");
      setDateTime("");
      navigate(`/playlist/${data.id}`);
    } catch (err) {
      console.error("Error creating playlist:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="creation-layout">
      {/* Même header que le parcours de création, sans compteur d'étape. */}
      <header className="creation-header">
        <div className="creation-header-row">
          <p className="creation-title">Création de soirée</p>

          <button
            type="button"
            className="creation-home"
            onClick={() => navigate("/")}
            aria-label="Tableau de bord"
            title="Tableau de bord"
          >
            <i className="fa-solid fa-house" aria-hidden="true"></i>
          </button>
        </div>
      </header>

      <main className="creation-content">
        <div className="creation-intro">
          <ExplanationText
            hasAppTitle={false}
            title="Créer ma soirée"
            text="Donne-lui un nom et choisis quand elle commence."
          />
        </div>

        <form className="creation-form" onSubmit={handleSubmit}>
          <Champ
            id="playlist-name"
            label="Nom de ma soirée"
            type="text"
            placeholder="After work du vendredi"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={100}
            required
          />

          <Champ
            id="playlist-date"
            label="Date de ma soirée"
            type="datetime-local"
            value={dateTime}
            onChange={(event) => setDateTime(event.target.value)}
            required
          />

          {error && (
            <p className="app-error" role="alert">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            text={loading ? "Création..." : "Créer la soirée"}
          />
        </form>

        {playlist && (
          <div className="succes">
            <h2>Soirée créée !</h2>
            <p>Nom : {playlist.name}</p>
            <p>Identifiant : {playlist.id}</p>
            <p>Statut : {playlist.status}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default CreatePlaylist;

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { Champ } from "../components/Champ.jsx";
import Button from "../components/common/Button.jsx";
import { getInvitation, joinInvitation } from "../api/invites.js";
import { ApiError } from "../api/http.js";
import "./guest.css";

function GuestJoinPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  // La soirée est récupérée avant de demander un pseudo : l'invité doit
  // savoir où il met les pieds.
  const [playlist, setPlaylist] = useState(null);
  // The invite link only works once the host has started the party.
  const [closedReason, setClosedReason] = useState("");
  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkPlaylist() {
      try {
        const data = await getInvitation(code);

        if (!cancelled) setPlaylist(data);
      } catch (err) {
        // Le lien mène à une soirée introuvable ou fermée : on le dit, avec
        // le message du serveur plutôt qu'un texte inventé ici.
        if (!cancelled) {
          setClosedReason(
            err instanceof ApiError && err.status === 404
              ? "Ce lien d'invitation ne correspond à aucune soirée."
              : err.message,
          );
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    checkPlaylist();

    return () => {
      cancelled = true;
    };
  }, [code]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const guest = await joinInvitation(code, name.trim());

      // The header reads the pseudo from here until the guest session
      // endpoint exists.
      localStorage.setItem("guest_name", guest.guest_name);

      navigate(`/join/${code}/party/propose`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="guest-screen">
      <main className="guest-screen-inner">
        {checking ? (
          <>
            <h1>Rejoindre la soirée</h1>
            <p className="app-status">Chargement de la soirée…</p>
          </>
        ) : closedReason ? (
          <>
            <h1>Rejoindre la soirée</h1>
            <p className="app-error" role="alert">
              {closedReason}
            </p>
          </>
        ) : (
          <>
            <p className="guest-screen-eyebrow">
              <i className="fa-solid fa-user" aria-hidden="true"></i>
              {playlist.host_name ? ` La soirée de ${playlist.host_name}` : "La soirée"}
            </p>

            <h1>{playlist.name}</h1>

            <div className="app-meta-row">
              <span className="app-chip">
                <i className="fa-solid fa-calendar" aria-hidden="true"></i>
                {new Date(playlist.date_time).toLocaleString("fr-FR", {
                  dateStyle: "long",
                  timeStyle: "short",
                })}
              </span>
            </div>

            <form className="guest-form" onSubmit={handleSubmit}>
              <Champ
                id="guest-name"
                label="Ton pseudo"
                type="text"
                placeholder="Pour que les autres te reconnaissent"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={50}
                required
              />

              <Button
                type="submit"
                disabled={loading}
                text={loading ? "Rejoindre…" : `Rejoindre ${playlist.name}`}
              />
            </form>
          </>
        )}

        {error && (
          <p className="app-error" role="alert">
            {error}
          </p>
        )}
      </main>
    </div>
  );
}

export default GuestJoinPage;

import { useNavigate, useOutletContext } from "react-router";
import Button from "../../components/common/Button.jsx";
import InviteCard from "../../components/common/InviteCard.jsx";
import "./PlaylistInvite.css";

// Status label shown as a pill next to the party date.
const STATUS_LABELS = {
  preparing: { icon: "fa-hourglass-half", label: "En préparation" },
  active: { icon: "fa-circle-play", label: "En cours" },
  finished: { icon: "fa-flag-checkered", label: "Terminée" },
};

export default function PlaylistInvite() {
  const { playlist, basePath } = useOutletContext();
  const navigate = useNavigate();

  // The layout loads the playlist, so a direct page refresh still works.
  if (!playlist) {
    return <p className="invite-status">Chargement de la soirée…</p>;
  }

  const inviteLink = `${window.location.origin}/join/${playlist.invite_code}`;
  const status = STATUS_LABELS[playlist.status] ?? null;

  return (
    <section className="invite-step">
      <header className="invite-intro">
        <h2 className="invite-title">Inviter des amis</h2>

        <p className="invite-text">
          Partage ce lien : tes invités rejoignent la playlist de{" "}
          {playlist.name} sans créer de compte.
        </p>
      </header>

      <div className="invite-meta">
        <span className="app-chip">
          <i className="fa-solid fa-calendar" aria-hidden="true"></i>
          {new Date(playlist.date_time).toLocaleString("fr-FR", {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </span>

        {status && (
          <span className="app-chip">
            <i className={`fa-solid ${status.icon}`} aria-hidden="true"></i>
            {status.label}
          </span>
        )}
      </div>

      <InviteCard inviteLink={inviteLink} />

      <p className="invite-hint">
        Le lien reste valable jusqu&apos;à la fin de la soirée.
      </p>

      <Button
        type="button"
        onClick={() => navigate(`${basePath}/propose`)}
        text="Retour à la soirée"
      />
    </section>
  );
}

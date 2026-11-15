import { useEffect, useRef, useState } from "react";
import "./InviteCard.css";

// Le lien d'invitation et son bouton copier. Partagé par la modale du header
// et, quand elle sera branchée, par la dernière étape du wizard.
export default function InviteCard({ inviteLink }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const copyTimer = useRef(null);

  // La modale peut se fermer pendant le compte à rebours du « Lien copié ! » :
  // on annule le minuteur plutôt que de réveiller un composant démonté.
  useEffect(
    () => () => clearTimeout(copyTimer.current),
    [],
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteLink);

      setCopied(true);
      setError("");
      clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Impossible de copier le lien.");
    }
  }

  return (
    <div className="invite-card-block">
      <section className="share-card">
        <p className="share-label">Lien d&apos;invitation</p>

        <a className="share-link" href={inviteLink}>
          {inviteLink}
        </a>

        <button
          type="button"
          className={`share-copy${copied ? " is-copied" : ""}`}
          onClick={handleCopy}
        >
          <i
            className={`fa-solid ${copied ? "fa-check" : "fa-copy"}`}
            aria-hidden="true"
          ></i>
          {copied ? "Lien copié !" : "Copier le lien"}
        </button>
      </section>

      {error && (
        <p className="app-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

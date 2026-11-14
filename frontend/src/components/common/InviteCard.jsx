import { useRef, useState } from "react";
import "./InviteCard.css";

// Invitation link and its copy button, shared by the last creation step and
// the party app. The QR code will replace the placeholder later on.
export default function InviteCard({ inviteLink }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const copyTimer = useRef(null);

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

      <p className="invite-qr-hint">
        Le QR code de la soirée arrive bientôt.
      </p>
    </div>
  );
}

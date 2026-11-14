import { useEffect } from "react";
import InviteCard from "../../components/common/InviteCard.jsx";
import "./InviteModal.css";

// The invite link belongs to the party: showing it in a modal keeps the host
// on the current tab instead of navigating to a separate page.
export default function InviteModal({ playlist, onClose }) {
  // Close on Escape and prevent the page behind from scrolling.
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  if (!playlist) return null;

  const inviteLink = `${window.location.origin}/join/${playlist.invite_code}`;

  return (
    <div
      className="invite-modal-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="invite-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="invite-modal-close"
          onClick={onClose}
          aria-label="Fermer"
          title="Fermer"
        >
          <i className="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>

        <header className="invite-modal-header">
          <h2 className="invite-modal-title" id="invite-modal-title">
            Inviter des amis
          </h2>

          <p className="invite-modal-text">
            Partage ce lien : tes invités rejoignent la playlist de{" "}
            {playlist.name} sans créer de compte.
          </p>
        </header>

        <InviteCard inviteLink={inviteLink} />
      </div>
    </div>
  );
}

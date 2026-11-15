import { useEffect, useRef } from "react";
import InviteCard from "../../components/common/InviteCard.jsx";
import "./InviteModal.css";

const FOCUSABLE =
  'button, a[href], input, [tabindex]:not([tabindex="-1"])';

// Le lien d'invitation appartient à la soirée : une modale garde l'hôte sur
// l'onglet où il était, au lieu de l'envoyer sur une page à part.
export default function InviteModal({ playlist, onClose }) {
  const dialogRef = useRef(null);

  // Escape ferme, la page derrière ne défile pas, et le clavier reste dans la
  // modale : sinon on peut tabuler dans un écran devenu inactif.
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;

    dialog?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialog) return;

      const focusable = [...dialog.querySelectorAll(FOCUSABLE)];

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;

      // Le focus revient sur le bouton du header qui a ouvert la modale.
      if (previousFocus && typeof previousFocus.focus === "function") {
        previousFocus.focus();
      }
    };
  }, [onClose]);

  if (!playlist) return null;

  const inviteLink = `${window.location.origin}/join/${playlist.invite_code}`;

  return (
    <div
      className="invite-modal-backdrop"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        className="invite-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-modal-title"
        tabIndex={-1}
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
            {`Partage ce lien : tes invités rejoignent la soirée « ${playlist.name} » sans créer de compte.`}
          </p>
        </header>

        <InviteCard inviteLink={inviteLink} />
      </div>
    </div>
  );
}

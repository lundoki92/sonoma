import { useNavigate } from "react-router";

export default function CreationHeader({ step, totalSteps = 3, backTo }) {
  const navigate = useNavigate();

  // Step 1 has no useful "back": in creation it would lead to the dashboard
  // (already the home button), in edition it would lead back to step 2.
  const showBack = step > 1;

  function handleBack() {
    if (backTo) {
      navigate(backTo);
      return;
    }

    navigate(-1);
  }

  return (
    <header className="creation-header">
      <div className="creation-header-row">
        {showBack && (
          <button
            type="button"
            className="creation-back"
            onClick={handleBack}
            aria-label="Retour"
          >
            <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
          </button>
        )}

        <p className="creation-step">
          Étape {step} sur {totalSteps}
        </p>

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

      <div
        className="creation-progress"
        role="progressbar"
        aria-label={`Étape ${step} sur ${totalSteps}`}
        aria-valuenow={step}
        aria-valuemin={1}
        aria-valuemax={totalSteps}
      >
        {Array.from({ length: totalSteps }, (_, index) => (
          <span key={index} className={index < step ? "is-done" : ""} />
        ))}
      </div>
    </header>
  );
}

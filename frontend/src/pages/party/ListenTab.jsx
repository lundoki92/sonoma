import ExplanationText from "../../components/common/ExplanationText.jsx";

// Écran « En écoute » : la file des morceaux validés par le vote. Le vote
// n'étant pas encore branché, cet écran reste volontairement en attente.
export default function ListenTab() {
  return (
    <div className="screen-column">
      <div className="screen-intro">
        <ExplanationText
          hasAppTitle={false}
          title="En écoute"
          text="Ici, la file des morceaux validés par les votes, dans l'ordre de passage."
        />
      </div>

      <p className="app-status">La file s'affichera dès que le vote sera branché.</p>
    </div>
  );
}

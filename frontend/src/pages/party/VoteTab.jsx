import { useOutletContext } from "react-router";
import ExplanationText from "../../components/common/ExplanationText.jsx";

// Écran de vote : la mécanique existe côté API mais l'écran n'est pas encore
// branché. On le dit à l'hôte plutôt que de lui montrer une fausse liste.
export default function VoteTab() {
  const { playlist } = useOutletContext();

  return (
    <div className="party-placeholder">
      <ExplanationText
        hasAppTitle={false}
        title="Le grand vote"
        text="Les morceaux proposés par tout le monde s'afficheront ici, avec leurs votes en direct."
      />

      <p className="app-status">
        {playlist.status === "preparing"
          ? "Le vote ouvre quand tu auras démarré cette soirée."
          : "Le comptage des votes reste à brancher sur cet écran."}
      </p>
    </div>
  );
}

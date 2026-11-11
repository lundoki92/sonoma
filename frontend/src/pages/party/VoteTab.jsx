import { useOutletContext } from "react-router";

export default function VoteTab() {
  const { role } = useOutletContext();

  return (
    <section>
      <h2>Le grand vote</h2>
      <p>
        {role === "guest"
          ? "Tu pourras bientôt voter pour les morceaux de la soirée."
          : "Le pool de vote de la soirée s'affichera ici."}
      </p>
      <p>Le vote sera branché quand la soirée pourra être démarrée.</p>
    </section>
  );
}

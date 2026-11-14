import { useOutletContext } from "react-router";
import "../../styles/screen.css";

export default function VoteTab() {
  const { role } = useOutletContext();

  return (
    <section className="screen-intro">
      <h2>Le grand vote</h2>

      <p>
        {role === "guest"
          ? "Tu pourras bientôt voter pour les morceaux de la soirée."
          : "Le pool de vote de la soirée s'affichera ici."}
      </p>

      <p className="screen-status">
        Le vote arrive bientôt : tes morceaux et ceux de tes invités sont déjà
        enregistrés et prêts à être votés.
      </p>
    </section>
  );
}

import { useOutletContext } from "react-router";
import "../../styles/screen.css";

export default function ListenTab() {
  const { role } = useOutletContext();

  return (
    <section className="screen-intro">
      <h2>En écoute</h2>

      <p>Les morceaux validés par les votes s'afficheront ici en direct.</p>

      <p className="screen-status">
        {role === "guest"
          ? "Le lecteur sera visible sans les contrôles réservés à l'hôte."
          : "Le lecteur de la soirée sera contrôlé depuis cet écran."}
      </p>
    </section>
  );
}

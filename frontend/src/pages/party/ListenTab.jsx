import { useOutletContext } from "react-router";

export default function ListenTab() {
  const { role } = useOutletContext();

  return (
    <section>
      <h2>En écoute</h2>
      <p>Les morceaux validés par les votes s'afficheront ici en direct.</p>
      <p>
        {role === "guest"
          ? "Le lecteur sera visible sans les contrôles réservés à l'hôte."
          : "Le lecteur de la soirée sera contrôlé depuis cet écran."}
      </p>
    </section>
  );
}

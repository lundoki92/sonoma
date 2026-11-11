import { useOutletContext } from "react-router";

export default function ProposeTab() {
  const { role } = useOutletContext();

  return (
    <section>
      <h2>Proposer un morceau</h2>
      <p>
        {role === "guest"
          ? "Tu es invité à cette soirée : tu pourras bientôt proposer un morceau."
          : "Ajoute un morceau à la soirée pour le soumettre au vote."}
      </p>
      <p>La recherche musicale sera branchée dans une prochaine étape.</p>
    </section>
  );
}

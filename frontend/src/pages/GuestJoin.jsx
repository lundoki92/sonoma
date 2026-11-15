import { useState } from "react";
import { useParams, useNavigate } from "react-router";
import ExplanationText from "../components/common/ExplanationText";
import Button from "../components/common/Button";
import { Champ } from "../components/Champ.jsx";
import "./Auth.css";

function GuestJoinPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/invite/${code}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guest_name: name.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Impossible de rejoindre la soirée");

      // Le pseudo sert d'identité visuelle pendant toute la soirée.
      localStorage.setItem("guest_name", name.trim());

      navigate(`/join/${code}/playlist`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="carte-form">
      <div className="auth-card">
        <ExplanationText
          title="Rejoindre la soirée"
          text="Choisissez le pseudo que verront les autres invités."
        />

        <form onSubmit={handleSubmit}>
          <Champ
            id="guest-name"
            label="Ton pseudo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            required
          />

          <Button
            type="submit"
            disabled={loading}
            text={loading ? "..." : "Rejoindre"}
          />
        </form>

        {error && (
          <p className="alerte" role="alert">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}

export default GuestJoinPage;

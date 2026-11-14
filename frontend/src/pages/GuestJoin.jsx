import { useState } from "react";
import { useParams, useNavigate } from "react-router";

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
      if (!response.ok) throw new Error(data.error || "Failed to join");

      // The header reads the pseudo from here until the guest session
      // endpoint exists.
      localStorage.setItem("guest_name", data.guest_name);

      navigate(`/join/${code}/playlist`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <main>
      <h1>Rejoindre la soirée</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="guest-name">Ton pseudo</label>
        <input
          id="guest-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={50}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "..." : "Rejoindre"}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
    </main>
  );
}

export default GuestJoinPage;
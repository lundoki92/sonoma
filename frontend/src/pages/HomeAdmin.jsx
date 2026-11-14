import "./HomeAdmin.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Header from "../components/common/Header";
import ExplanationText from "../components/common/ExplanationText";
import Button from "../components/common/Button";
import DashboardPlaylistsContainer from "../components/HomeAdmin/DashboardPlaylistsContainer";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [playlists, setPlaylists] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlaylists() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/api/playlists");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || data.error || "Impossible de charger les soirées",
          );
        }

        setPlaylists(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadPlaylists();
  }, []);

  return (
    <div className="host-dashboard">
      <Header variant="greeting" userPseudo={user?.username} />

      <ExplanationText
        hasAppTitle={true}
        title="Tes invités choisissent. Toi, tu fais danser."
        text="Connectez votre service de streaming et invitez vos amis à proposer et voter."
      />

      <Button
        className="dashboard-create-button"
        text="Créer une nouvelle soirée"
        onClick={() => navigate("/createplaylist")}
      />

      {loading && <p className="app-status">Chargement…</p>}

      {error && <p className="app-status" role="alert">{error}</p>}

      {!loading && !error && (
        <DashboardPlaylistsContainer playlists={playlists} />
      )}
    </div>
  );
}
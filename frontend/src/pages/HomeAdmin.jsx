import "./HomeAdmin.css";
import Header from "../components/common/Header";
import ExplanationText from "../components/common/ExplanationText";
import Button from "../components/common/Button";
import DashboardPlaylistsContainer from "../components/HomeAdmin/DashboardPlaylistsContainer";
import { useAuth } from "../context/AuthContext.jsx";

export default function Home() {
  // Le pseudo vient de la session, pas d'une valeur en dur
  const { user } = useAuth();
  
  const [userPseudo, setUserPseudo] = useState("Prénom Nom");
    const playlists = [
    {
      id: 1,
      name: "Anniversaire de Zoé",
      date_time: "2026-11-15T20:00:00",
      status: "active",
    },
    {
      id: 2,
      name: "Soirée entre amis",
      date_time: "2026-10-30T21:00:00",
      status: "finished",
    },
    {
      id: 3,
      name: "Soirée de rentrée",
      date_time: "2026-09-12T19:30:00",
      status: "finished",
    },
  ];

  return (
    <>
      <div className="host-dashboard">
        {/* HEADER FIXE */}
        <Header variant="greeting" userPseudo={user?.username} />

        <ExplanationText
          hasAppTitle={true}
          title="Tes invités choisissent. Toi, tu fais danser."
          text="Connectez votre service de streaming et invitez vos amis à proposer et voter."
        />

        <Button
            text="Créer une nouvelle soirée"
        />
        <DashboardPlaylistsContainer playlists={playlists}/>
      </div>
    </>
  );
}

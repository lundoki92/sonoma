import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import CreatePlaylist from './pages/CreatePlaylist.jsx'
import HomeAdmin from './pages/HomeAdmin.jsx'
import PartyLayout from './pages/PartyLayout.jsx'
import PlaylistPage from './pages/Playlist.jsx'
import VoteTab from './pages/VoteTab.jsx'
import PlaylistTab from './pages/PlaylistTab.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Page d'accueil / Admin */}
        <Route path="/" element={<HomeAdmin />} />
        
        {/* Page de création de soirée */}
        <Route path="/createplaylist" element={<CreatePlaylist />} />
        
        {/* Expérience en soirée : Header + BottomNav permanents */}
        <Route path="/playlist/:id" element={<PartyLayout />}>
          {/* Par défaut ou sur /propose, on affiche le travail de ta camarade (Playlist.jsx) */}
          <Route index element={<PlaylistPage />} />
          <Route path="propose" element={<PlaylistPage />} />
          
          {/* Les onglets de vote et de playlist active */}
          <Route path="vote" element={<VoteTab />} />
          <Route path="playlist" element={<PlaylistTab />} />
        </Route>

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import CreatePlaylist from './pages/CreatePlaylist.jsx'
import HomeAdmin from './pages/HomeAdmin.jsx'
import PartyLayout from './pages/PartyLayout.jsx'
import PlaylistPage from './pages/Playlist.jsx'
import EmptyPage from './pages/EmptyPage.jsx'

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
          {/* Seul "Proposer" reste fonctionnel */}
          <Route index element={<PlaylistPage />} />
          <Route path="propose" element={<PlaylistPage />} />
          <Route path="vote" element={<EmptyPage />} />
          <Route path="playlist" element={<EmptyPage />} />
        </Route>

        {/* Redirection par défaut */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
import './App.css'
import { Routes, Route, Navigate } from 'react-router'
import CreatePlaylist from './pages/CreatePlaylist.jsx'
import HomeAdmin from './pages/HomeAdmin.jsx'
import PartyLayout from './pages/PartyLayout.jsx'
import PlaylistPage from './pages/Playlist.jsx'
import EmptyPage from './pages/EmptyPage.jsx'
import { Login } from './pages/Login.jsx'
import { Register } from './pages/Register.jsx'
import { ProtectedRoutes } from './components/ProtectedRoutes.jsx'

export default function App() {
  return (
    
      <Routes>
        
        <Route path="/register" element={<Register />} /> 
        <Route path="/login" element={<Login />} />

        {/* Page d'accueil / Admin */}
        <Route path="/" element={<ProtectedRoutes><HomeAdmin /> </ProtectedRoutes>} />
        
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
    
  )
}
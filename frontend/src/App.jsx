import './App.css'
import { Routes, Route } from 'react-router'
import CreatePlaylist from './pages/CreatePlaylist.jsx'
import HomeAdmin from './pages/HomeAdmin.jsx'
import PartyLayout from './pages/PartyLayout.jsx'
import PlaylistPage from './pages/Playlist.jsx'
import EmptyPage from './pages/EmptyPage.jsx'
import { Login } from './pages/Login.jsx'
import { Register } from './pages/Register.jsx'
import { ProtectedRoutes } from './components/ProtectedRoutes.jsx'
import GuestPlaylistPage from './pages/GuestPlaylist.jsx'
import GuestJoinPage from './pages/GuestJoin.jsx'

export default function App() {
  return (
    
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/join/:code" element={<GuestJoinPage />} /> 
        <Route path="/join/:code/playlist" element={<GuestPlaylistPage />} />


        <Route path="/createplaylist" element={<ProtectedRoutes><CreatePlaylist /></ProtectedRoutes>} />
        <Route path="/" element={<ProtectedRoutes><HomeAdmin /></ProtectedRoutes>} />
        <Route path="/playlist/:id" element={<ProtectedRoutes><PlaylistPage /></ProtectedRoutes>} />
        {/* <Route path="propose" element={<PlaylistPage />} />
        <Route path="vote" element={<EmptyPage />} />
        <Route path="playlist" element={<EmptyPage />} /> */}
      </Routes>
    
  )
}
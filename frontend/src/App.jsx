import './App.css'
import { Routes, Route } from 'react-router'
import HomeAdmin from './pages/HomeAdmin.jsx'
import PartyLayout from './pages/PartyLayout.jsx'
import PlaylistPage from './pages/Playlist.jsx'
import EmptyPage from './pages/EmptyPage.jsx'
import { Login } from './pages/Login.jsx'
import { Register } from './pages/Register.jsx'
import { ProtectedRoutes } from './components/ProtectedRoutes.jsx'
import GuestPlaylistPage from './pages/GuestPlaylist.jsx'
import GuestJoinPage from './pages/GuestJoin.jsx'
import CreatePlaylistLayout from './pages/creation/CreatePlaylistLayout.jsx'
import CreatePlaylistStep1 from './pages/creation/CreatePlaylistStep1.jsx'
import PlaylistSetup from './pages/creation/PlaylistSetup.jsx'
import PlaylistLaunch from './pages/creation/PlaylistLaunch.jsx'

export default function App() {
  return (
    
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/join/:code" element={<GuestJoinPage />} /> 
        <Route path="/join/:code/playlist" element={<GuestPlaylistPage />} />


        {/* Creation of a party, step 1: name, date and streaming service */}
        <Route
          path="/createplaylist"
          element={<ProtectedRoutes><CreatePlaylistLayout step={1} backTo="/" /></ProtectedRoutes>}
        >
          <Route index element={<CreatePlaylistStep1 />} />
        </Route>

        {/* Step 2: the tracks stay in memory until the last step */}
        <Route
          path="/createplaylist/setup"
          element={<ProtectedRoutes><CreatePlaylistLayout step={2} backTo="/createplaylist" /></ProtectedRoutes>}
        >
          <Route index element={<PlaylistSetup />} />
        </Route>

        {/* Step 3: the party is created here, then opened */}
        <Route
          path="/createplaylist/launch"
          element={<ProtectedRoutes><CreatePlaylistLayout step={3} backTo="/createplaylist/setup" /></ProtectedRoutes>}
        >
          <Route index element={<PlaylistLaunch />} />
        </Route>

        <Route path="/" element={<ProtectedRoutes><HomeAdmin /></ProtectedRoutes>} />
        <Route path="/playlist/:id" element={<ProtectedRoutes><PlaylistPage /></ProtectedRoutes>} />
        {/* <Route path="propose" element={<PlaylistPage />} />
        <Route path="vote" element={<EmptyPage />} />
        <Route path="playlist" element={<EmptyPage />} /> */}
      </Routes>
    
  )
}
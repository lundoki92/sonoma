import './App.css'
import {BrowserRouter, Routes, Route} from 'react-router'
import CreatePlaylist from './pages/CreatePlaylist.jsx'
import PlaylistPage from './pages/Playlist.jsx'

export default function App (){

    return(
        <>
        <BrowserRouter>
        <Routes>
            <Route path="/createplaylist" element={<CreatePlaylist/>}/>
            <Route path="/playlist/:id" element={<PlaylistPage/>}/>
            
        </Routes>
        </BrowserRouter>
        </>
    )
}
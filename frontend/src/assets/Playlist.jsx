import {useState, useEffect} from 'react'

export default function Playlist () {
const [music, setMusic] = useState([])

const api = "http://localhost:3000"

useEffect(() => {
    

    async function chargerPlaylist() {
        try {
            const response= await fetch(`${api}/playlist`)
            const data = await response.json()
            setMusic(data)
        } catch(err) {
            console.error(err)
        }
    }chargerPlaylist()
}, [])

return(
    <>
    {music.map((el)=> 
    <section>
    <h1 key={el.id}>{el.name}</h1> 
    <p>{el.streaming_service}</p>
    </section>
    )}
    </>
)

}

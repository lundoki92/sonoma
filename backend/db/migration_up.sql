-- 1. Table users (Hosts)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    -- TODO : hash password before saving it in db
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table songs (centralized catalogue of songs)
CREATE TABLE IF NOT EXISTS songs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    duration INT NOT NULL,
    spotify_link VARCHAR(512),
    youtube_link VARCHAR(512),
    apple_link VARCHAR(512)
);

-- 3. Table playlists (main session)
CREATE TABLE IF NOT EXISTS playlists (
    id SERIAL PRIMARY KEY,
    host_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    streaming_provider VARCHAR(50) NOT NULL,
    streaming_playlist_id VARCHAR(255),
    invite_code VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'collecting',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table playlist_guests (guest management and to prevent cheating)
CREATE TABLE IF NOT EXISTS playlist_guests (
    id SERIAL PRIMARY KEY,
    playlist_id INT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    guest_token VARCHAR(255) NOT NULL,
    guest_name VARCHAR(255) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table waiting_list (waiting list for song proposal)
CREATE TABLE IF NOT EXISTS waiting_list (
    id SERIAL PRIMARY KEY,
    playlist_id INT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    song_id INT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    guest_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Table voting_sessions (manages voting sessions)
CREATE TABLE IF NOT EXISTS voting_sessions (
    id SERIAL PRIMARY KEY,
    playlist_id INT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    round_number INT NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. Table voting_pool (active voting pool for one voting session)
CREATE TABLE IF NOT EXISTS voting_pool (
    id SERIAL PRIMARY KEY,
    voting_session_id INT NOT NULL REFERENCES voting_sessions(id) ON DELETE CASCADE,
    song_id INT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    vote_count INT DEFAULT 0
);

-- 8. Table votes (votes for one voting session)
CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    voting_session_id INT NOT NULL REFERENCES voting_sessions(id) ON DELETE CASCADE,
    song_id INT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    voter_token VARCHAR(255) NOT NULL -- token if guest, id if host
);

-- 9. Table playlist_final_songs (final playlist
CREATE TABLE IF NOT EXISTS playlist_final_songs (
    id SERIAL PRIMARY KEY,
    playlist_id INT NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    song_id INT NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    added_by_type VARCHAR(50) NOT NULL, -- 'host' or 'vote'
    position INT NOT NULL
);
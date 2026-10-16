-- Données de test

-- Après le remplacement de "password" par "password_hash"
-- Les mots de passe devront être hachés côté serveur
-- avant insertion dans la table users.

-- seed.sql : Données de test pour l'application de playlist collaborative

-- 1. Insertion des utilisateurs (Hôtes)
INSERT INTO users (username, email, password_hash, created_at) VALUES
('jenn_dev', 'jennifer@example.com', 'mon_password', NOW() - INTERVAL '3 days'),
('thomas_music', 'thomas@example.com', 'mon_password', NOW() - INTERVAL '2 days');

-- 2. Insertion des chansons dans le catalogue centralisé
INSERT INTO songs (title, artist, duration, spotify_link, youtube_link, apple_link) VALUES
('Bohemian Rhapsody', 'Queen', 354, 'spotify:track:q1', 'https://youtube.com/watch?v=1', 'apple:song:1'),
('Get Lucky', 'Daft Punk', 248, 'spotify:track:q2', 'https://youtube.com/watch?v=2', 'apple:song:2'),
('Blinding Lights', 'The Weeknd', 200, 'spotify:track:q3', 'https://youtube.com/watch?v=3', 'apple:song:3'),
('Starlight', 'Muse', 240, 'spotify:track:q4', 'https://youtube.com/watch?v=4', 'apple:song:4'),
('One More Time', 'Daft Punk', 320, 'spotify:track:q5', 'https://youtube.com/watch?v=5', 'apple:song:5'),
('Smells Like Teen Spirit', 'Nirvana', 301, 'spotify:track:q6', 'https://youtube.com/watch?v=6', 'apple:song:6'),
('Around the World', 'Daft Punk', 429, 'spotify:track:q7', 'https://youtube.com/watch?v=7', 'apple:song:7'),
('Viva La Vida', 'Coldplay', 242, 'spotify:track:q8', 'https://youtube.com/watch?v=8', 'apple:song:8'),
('Hotel California', 'Eagles', 391, 'spotify:track:q9', 'https://youtube.com/watch?v=9', 'apple:song:9'),
('Daft Punk Is Playing at My House', 'LCD Soundsystem', 316, 'spotify:track:q10', 'https://youtube.com/watch?v=10', 'apple:song:10'),
('Supermassive Black Hole', 'Muse', 209, 'spotify:track:q11', 'https://youtube.com/watch?v=11', 'apple:song:11'),
('Titanium', 'David Guetta ft. Sia', 245, 'spotify:track:q12', 'https://youtube.com/watch?v=12', 'apple:song:12');

-- 3. Insertion des playlists
INSERT INTO playlists (host_id, title, streaming_provider, streaming_playlist_id, invite_code, status, created_at) VALUES
(1, 'Soirée Chill & Geek', 'spotify', 'spotify_pl_abc123', 'INVITE123', 'voting', NOW() - INTERVAL '1 day'),
(2, 'Warmup Rock & Electro', 'youtube_music', 'yt_pl_xyz789', 'INVITE456', 'collecting', NOW() - INTERVAL '5 hours');

-- 4. Insertion des invités (playlist id 1)
INSERT INTO playlist_guests (playlist_id, guest_token, name, joined_at) VALUES
(1, 'token-guest-alpha-111', 'Lucas', NOW() - INTERVAL '20 hours'),
(1, 'token-guest-beta-222', 'Sarah', NOW() - INTERVAL '19 hours'),
(1, 'token-guest-gamma-333', 'Alex', NOW() - INTERVAL '18 hours');

-- 5. Insertion dans la liste d'attente (playlist id 1)
INSERT INTO waiting_list (playlist_id, song_id, guest_name, created_at) VALUES
(1, 5, 'Lucas', NOW() - INTERVAL '15 hours'),
(1, 6, 'Sarah', NOW() - INTERVAL '14 hours'),
(1, 7, 'Alex', NOW() - INTERVAL '13 hours'),
(1, 8, 'Lucas', NOW() - INTERVAL '12 hours');

-- 6. Insertion des sessions de vote (playlist id 1)
INSERT INTO voting_sessions (playlist_id, round_number, status, created_at) VALUES
(1, 1, 'closed', NOW() - INTERVAL '10 hours'),
(1, 2, 'active', NOW() - INTERVAL '1 hour');

-- 7. Pool de vote pour la session active (voting_session_id = 2)
INSERT INTO voting_pool (voting_session_id, song_id, vote_count) VALUES
(2, 9, 5),
(2, 10, 3),
(2, 11, 8),
(2, 12, 2);

-- 8. Votes enregistrés pour la session active (voting_session_id = 2)
INSERT INTO votes (voting_session_id, song_id, voter_token) VALUES
(2, 11, 'token-guest-alpha-111'),
(2, 11, 'token-guest-beta-222'),
(2, 9, 'token-guest-gamma-333');

-- 9. Playlist finale (chansons validées pour la playlist id 1)
INSERT INTO playlist_final_songs (playlist_id, song_id, added_by_type, position) VALUES
(1, 1, 'host', 1),
(1, 2, 'host', 2),
(1, 3, 'host', 3),
(1, 4, 'host', 4),
(1, 11, 'vote', 5);

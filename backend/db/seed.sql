-- Données de test

-- Après le remplacement de "password" par "password_hash"
-- Les mots de passe devront être hachés côté serveur
-- avant insertion dans la table users.

-- Seed users
INSERT INTO users (username, email, password)
VALUES
('jenn', 'jenn@example.com]', 'mon_password'),
('androu', 'andrea@example.com', 'mon_password'),
('nas', 'nastassja@example.com', 'mon_password'),
('jeremy', 'jeremy@example.com=', 'mon_password');

-- Seed playlists
INSERT INTO playlists (name, date_time, host_id, streaming_service)
VALUES
('Stray Kids Everywhere All Around The World', '2026-10-01 21:30:00+02', 1, 'Spotify'),
('Road Trip Anthems', '2026-10-02 10:00:00+02', 4, 'Deezer'),
('Indie Discoveries', '2026-10-03 18:45:00+02', 2, 'Spotify'),
('Chill Sunday', '2026-10-04 14:00:00+02', 3, 'YouTube Music');

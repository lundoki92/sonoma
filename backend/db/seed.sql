-- Active: 1791800790239@@localhost@5433@sonoma_db
-- Données de test

-- Après le remplacement de "password" par "password_hash"
-- Les mots de passe devront être hachés côté serveur
-- avant insertion dans la table users.

-- Seed users
INSERT INTO users (username, email, password_hash)
VALUES
('jenn', 'jenn@example.com', 'dev-only-no-password'),
('androu', 'andrea@example.com', 'dev-only-no-password'),
('nas', 'nastassja@example.com', 'dev-only-no-password'),
('jeremy', 'jeremy@example.com', 'dev-only-no-password')
RETURNING id, username, email;

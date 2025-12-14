-- Migration pour ajouter le rôle AGENT au type ENUM role dans la table Users
-- Date: 2025-12-13

-- Modifier la colonne role pour inclure AGENT
ALTER TABLE users MODIFY COLUMN role ENUM('SUPERADMIN', 'ADMIN', 'USER', 'AGENT') NOT NULL DEFAULT 'USER';

-- Afficher un message de confirmation
SELECT 'Migration terminée : Rôle AGENT ajouté avec succès!' AS status;

-- SI Relevés - Database Initialization Script
-- This script creates the initial database schema

USE si_releves;

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Create QUARTIER table
CREATE TABLE IF NOT EXISTS quartiers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_quartier VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create CLIENT table
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom_raison_sociale VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create ADRESSE table
CREATE TABLE IF NOT EXISTS adresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    quartier_id INT NOT NULL,
    rue_details TEXT NOT NULL,
    ville VARCHAR(100) DEFAULT 'Rabat',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (quartier_id) REFERENCES quartiers(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create AGENT table
CREATE TABLE IF NOT EXISTS agents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    tel_pro VARCHAR(20),
    tel_perso VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create AFFECTATION (Agent-Quartier) junction table
CREATE TABLE IF NOT EXISTS affectations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agent_id INT NOT NULL,
    quartier_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
    FOREIGN KEY (quartier_id) REFERENCES quartiers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_affectation (agent_id, quartier_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create COMPTEUR table
CREATE TABLE IF NOT EXISTS compteurs (
    id_compteur CHAR(9) PRIMARY KEY,
    adresse_id INT NOT NULL,
    type_fluide ENUM('EAU', 'ELEC') NOT NULL,
    index_initial INT DEFAULT 0,
    date_creation DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (adresse_id) REFERENCES adresses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create RELEVE table
CREATE TABLE IF NOT EXISTS releves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    compteur_id CHAR(9) NOT NULL,
    agent_id INT NOT NULL,
    nouvel_index INT NOT NULL,
    date_heure DATETIME NOT NULL,
    consommation INT,
    statut_facturation BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (compteur_id) REFERENCES compteurs(id_compteur) ON DELETE CASCADE,
    FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create UTILISATEUR_BO table
CREATE TABLE IF NOT EXISTS utilisateurs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mot_de_passe VARCHAR(255) NOT NULL,
    role ENUM('USER', 'SUPERADMIN') NOT NULL DEFAULT 'USER',
    force_password_change BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default superadmin (password: Admin@123)
INSERT INTO utilisateurs (nom, prenom, email, mot_de_passe, role) VALUES
('ADMIN', 'System', 'admin@ree.ma', '$2a$10$rKj.XqYqvvHqYx5hZqQ5qOqYQqYqYqYqYqYqYqYqYqYqYqYqY', 'SUPERADMIN');

-- Create indexes for performance
CREATE INDEX idx_adresse_client ON adresses(client_id);
CREATE INDEX idx_adresse_quartier ON adresses(quartier_id);
CREATE INDEX idx_compteur_adresse ON compteurs(adresse_id);
CREATE INDEX idx_releve_compteur ON releves(compteur_id);
CREATE INDEX idx_releve_agent ON releves(agent_id);
CREATE INDEX idx_releve_date ON releves(date_heure);

-- Insert sample quartiers
INSERT INTO quartiers (nom_quartier) VALUES
('Agdal'),
('Hassan'),
('Hay Riad'),
('Ocean'),
('Souissi'),
('Yacoub El Mansour');

COMMIT;

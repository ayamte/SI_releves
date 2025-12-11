// Mock data pour le développement

export const quartiers = [
    { id: 1, nom_quartier: 'Agdal' },
    { id: 2, nom_quartier: 'Hassan' },
    { id: 3, nom_quartier: 'Hay Riad' },
    { id: 4, nom_quartier: 'Ocean' },
    { id: 5, nom_quartier: 'Souissi' },
    { id: 6, nom_quartier: 'Yacoub El Mansour' },
];

export const clients = [
    { id: 1, nom_raison_sociale: 'Mohammed ALAMI' },
    { id: 2, nom_raison_sociale: 'Fatima BENNANI' },
    { id: 3, nom_raison_sociale: 'Société XYZ SARL' },
    { id: 4, nom_raison_sociale: 'Ahmed TAZI' },
    { id: 5, nom_raison_sociale: 'Immeuble Les Jardins' },
];

export const adresses = [
    { id: 1, client_id: 1, quartier_id: 1, rue_details: '12 Rue des Roses', ville: 'Rabat' },
    { id: 2, client_id: 2, quartier_id: 2, rue_details: '45 Avenue Hassan II', ville: 'Rabat' },
    { id: 3, client_id: 3, quartier_id: 3, rue_details: '78 Boulevard Annakhil', ville: 'Rabat' },
    { id: 4, client_id: 4, quartier_id: 4, rue_details: '23 Rue de la Plage', ville: 'Rabat' },
    { id: 5, client_id: 5, quartier_id: 5, rue_details: '56 Avenue Mehdi Ben Barka', ville: 'Rabat' },
];

export const agents = [
    {
        id: 1,
        nom: 'IDRISSI',
        prenom: 'Youssef',
        tel_pro: '0661234567',
        tel_perso: '0523456789',
        quartier_id: 1
    },
    {
        id: 2,
        nom: 'KARIMI',
        prenom: 'Sara',
        tel_pro: '0662345678',
        tel_perso: '0524567890',
        quartier_id: 2
    },
    {
        id: 3,
        nom: 'BENJELLOUN',
        prenom: 'Karim',
        tel_pro: '0663456789',
        tel_perso: '0525678901',
        quartier_id: 3
    },
];

export const compteurs = [
    {
        id_compteur: '000000001',
        adresse_id: 1,
        type_fluide: 'EAU',
        index_initial: 0,
        index_actuel: 245,
        date_creation: '2024-01-15',
        date_derniere_releve: '2024-12-10'
    },
    {
        id_compteur: '000000002',
        adresse_id: 1,
        type_fluide: 'ELEC',
        index_initial: 0,
        index_actuel: 1587,
        date_creation: '2024-01-15',
        date_derniere_releve: '2024-12-10'
    },
    {
        id_compteur: '000000003',
        adresse_id: 2,
        type_fluide: 'EAU',
        index_initial: 0,
        index_actuel: 198,
        date_creation: '2024-02-01',
        date_derniere_releve: '2024-12-09'
    },
    {
        id_compteur: '000000004',
        adresse_id: 2,
        type_fluide: 'ELEC',
        index_initial: 0,
        index_actuel: 2341,
        date_creation: '2024-02-01',
        date_derniere_releve: '2024-12-09'
    },
];

export const releves = [
    {
        id: 1,
        compteur_id: '000000001',
        agent_id: 1,
        ancien_index: 230,
        nouvel_index: 245,
        consommation: 15,
        date_heure: '2024-12-10T09:30:00',
        statut_facturation: false
    },
    {
        id: 2,
        compteur_id: '000000002',
        agent_id: 1,
        ancien_index: 1520,
        nouvel_index: 1587,
        consommation: 67,
        date_heure: '2024-12-10T09:35:00',
        statut_facturation: false
    },
    {
        id: 3,
        compteur_id: '000000003',
        agent_id: 2,
        ancien_index: 185,
        nouvel_index: 198,
        consommation: 13,
        date_heure: '2024-12-09T14:20:00',
        statut_facturation: true
    },
    {
        id: 4,
        compteur_id: '000000004',
        agent_id: 2,
        ancien_index: 2275,
        nouvel_index: 2341,
        consommation: 66,
        date_heure: '2024-12-09T14:25:00',
        statut_facturation: true
    },
];

export const utilisateurs = [
    {
        id: 1,
        nom: 'ADMIN',
        prenom: 'System',
        email: 'admin@ree.ma',
        role: 'SUPERADMIN',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
    },
    {
        id: 2,
        nom: 'BENNANI',
        prenom: 'Ahmed',
        email: 'user@ree.ma',
        role: 'USER',
        created_at: '2024-01-05',
        updated_at: '2024-06-15'
    },
    {
        id: 3,
        nom: 'ALAOUI',
        prenom: 'Fatima',
        email: 'falaoui@ree.ma',
        role: 'USER',
        created_at: '2024-02-10',
        updated_at: '2024-02-10'
    },
];

// Helpers to get related data
export const getQuartierById = (id) => quartiers.find(q => q.id === id);
export const getClientById = (id) => clients.find(c => c.id === id);
export const getAdresseById = (id) => adresses.find(a => a.id === id);
export const getAgentById = (id) => agents.find(a => a.id === id);
export const getCompteurById = (id) => compteurs.find(c => c.id_compteur === id);

import api from './axios';

/**
 * API service pour la gestion des relevés
 */

// Récupérer tous les relevés
export const getAllReleves = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.compteur_id) params.append('compteur_id', filters.compteur_id);
        if (filters.agent_id) params.append('agent_id', filters.agent_id);
        if (filters.anomalie !== undefined) params.append('anomalie', filters.anomalie);
        if (filters.date_debut) params.append('date_debut', filters.date_debut);
        if (filters.date_fin) params.append('date_fin', filters.date_fin);

        const { data } = await api.get(`/releves?${params.toString()}`);
        return data;
    } catch (error) {
        console.error('Erreur getAllReleves:', error);
        throw error;
    }
};

// Récupérer un relevé par son ID
export const getReleveById = async (id) => {
    try {
        const { data } = await api.get(`/releves/${id}`);
        return data;
    } catch (error) {
        console.error('Erreur getReleveById:', error);
        throw error;
    }
};

// Créer un nouveau relevé (SUPERADMIN et AGENT)
export const createReleve = async (releveData) => {
    try {
        const { data } = await api.post('/releves', releveData);
        return data;
    } catch (error) {
        console.error('Erreur createReleve:', error);
        throw error;
    }
};

// Mettre à jour un relevé (SUPERADMIN uniquement)
export const updateReleve = async (id, releveData) => {
    try {
        const { data } = await api.put(`/releves/${id}`, releveData);
        return data;
    } catch (error) {
        console.error('Erreur updateReleve:', error);
        throw error;
    }
};

// Supprimer un relevé (SUPERADMIN uniquement)
export const deleteReleve = async (id) => {
    try {
        const { data } = await api.delete(`/releves/${id}`);
        return data;
    } catch (error) {
        console.error('Erreur deleteReleve:', error);
        throw error;
    }
};

// Récupérer les statistiques des relevés
export const getRelevesStats = async () => {
    try {
        const { data } = await api.get('/releves/stats');
        return data;
    } catch (error) {
        console.error('Erreur getRelevesStats:', error);
        throw error;
    }
};

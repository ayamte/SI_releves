import api from './axios';

/**
 * API service pour la gestion des compteurs
 */

// Récupérer tous les compteurs
export const getAllCompteurs = async (filters = {}) => {
    try {
        const params = new URLSearchParams();
        if (filters.type_fluide) params.append('type_fluide', filters.type_fluide);
        if (filters.quartier) params.append('quartier', filters.quartier);
        if (filters.active !== undefined) params.append('active', filters.active);

        const { data } = await api.get(`/compteurs?${params.toString()}`);
        return data;
    } catch (error) {
        console.error('Erreur getAllCompteurs:', error);
        throw error;
    }
};

// Récupérer un compteur par son ID
export const getCompteurById = async (id) => {
    try {
        const { data } = await api.get(`/compteurs/${id}`);
        return data;
    } catch (error) {
        console.error('Erreur getCompteurById:', error);
        throw error;
    }
};

// Créer un nouveau compteur (SUPERADMIN uniquement)
export const createCompteur = async (compteurData) => {
    try {
        const { data } = await api.post('/compteurs', compteurData);
        return data;
    } catch (error) {
        console.error('Erreur createCompteur:', error);
        throw error;
    }
};

// Mettre à jour un compteur (SUPERADMIN uniquement)
export const updateCompteur = async (id, compteurData) => {
    try {
        const { data } = await api.put(`/compteurs/${id}`, compteurData);
        return data;
    } catch (error) {
        console.error('Erreur updateCompteur:', error);
        throw error;
    }
};

// Supprimer un compteur (SUPERADMIN uniquement)
export const deleteCompteur = async (id) => {
    try {
        const { data } = await api.delete(`/compteurs/${id}`);
        return data;
    } catch (error) {
        console.error('Erreur deleteCompteur:', error);
        throw error;
    }
};

// Récupérer les statistiques des compteurs
export const getCompteursStats = async () => {
    try {
        const { data } = await api.get('/compteurs/stats');
        return data;
    } catch (error) {
        console.error('Erreur getCompteursStats:', error);
        throw error;
    }
};

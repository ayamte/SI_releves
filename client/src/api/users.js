import api from './axios';

// Récupérer tous les utilisateurs
export const getAllUsers = async () => {
    const response = await api.get('/users');
    return response.data;
};

// Récupérer un utilisateur par ID
export const getUserById = async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
};

// Créer un nouvel utilisateur
export const createUser = async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
};

// Mettre à jour un utilisateur
export const updateUser = async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
};

// Supprimer un utilisateur
export const deleteUser = async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
};

// Réinitialiser le mot de passe d'un utilisateur
export const resetUserPassword = async (id) => {
    const response = await api.post(`/users/${id}/reset-password`);
    return response.data;
};

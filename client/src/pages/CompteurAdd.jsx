import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { createCompteur } from '../api/compteurs';
import { getAllUsers } from '../api/users';
import { Gauge } from 'lucide-react';

export const CompteurAdd = () => {
    const navigate = useNavigate();
    const [userId, setUserId] = useState('');
    const [users, setUsers] = useState([]);
    const [typeFluide, setTypeFluide] = useState('EAU');
    const [adresse, setAdresse] = useState('');
    const [quartier, setQuartier] = useState('');
    const [ville, setVille] = useState('Rabat');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [dateInstallation, setDateInstallation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await getAllUsers();
            // Filtrer seulement les utilisateurs avec role USER
            const filteredUsers = data.filter(user => user.role === 'USER' && user.active);
            setUsers(filteredUsers);
        } catch (err) {
            console.error('Erreur récupération utilisateurs:', err);
            setError('Erreur lors du chargement des utilisateurs');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const compteurData = {
                user_id: parseInt(userId),
                type_fluide: typeFluide,
                adresse,
                quartier: quartier || null,
                ville,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                date_installation: dateInstallation || null
            };

            await createCompteur(compteurData);
            alert('Compteur créé avec succès !');
            navigate('/admin/compteurs');
        } catch (err) {
            console.error('Erreur création compteur:', err);
            setError(err.response?.data?.message || 'Erreur lors de la création du compteur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Gauge className="text-primary-600" size={36} />
                        Ajouter un Compteur
                    </h1>
                    <p className="text-gray-600 mt-1">Créer un nouveau compteur d'eau ou d'électricité</p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        {/* Utilisateur sélection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Client (Utilisateur) <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                required
                            >
                                <option value="">-- Sélectionner un utilisateur --</option>
                                {users.map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.nom} {user.prenom} - {user.email}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                L'ID du compteur sera généré automatiquement (COMP-2025-XXX)
                            </p>
                        </div>

                        {/* Type de fluide */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type de Compteur <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-4">
                                <label className={`flex items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors flex-1
                                    ${typeFluide === 'EAU' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                                >
                                    <input
                                        type="radio"
                                        value="EAU"
                                        checked={typeFluide === 'EAU'}
                                        onChange={(e) => setTypeFluide(e.target.value)}
                                        className="text-blue-600"
                                    />
                                    <span className="font-medium">Eau</span>
                                </label>
                                <label className={`flex items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors flex-1
                                    ${typeFluide === 'ELEC' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300 hover:border-gray-400'}`}
                                >
                                    <input
                                        type="radio"
                                        value="ELEC"
                                        checked={typeFluide === 'ELEC'}
                                        onChange={(e) => setTypeFluide(e.target.value)}
                                        className="text-yellow-600"
                                    />
                                    <span className="font-medium">Électricité</span>
                                </label>
                            </div>
                        </div>

                        {/* Adresse */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Adresse Complète <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={adresse}
                                onChange={(e) => setAdresse(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="15 Avenue Mohammed V, Agdal"
                                rows="2"
                                required
                            />
                        </div>

                        {/* Quartier et Ville */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Quartier
                                </label>
                                <input
                                    type="text"
                                    value={quartier}
                                    onChange={(e) => setQuartier(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="Agdal"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ville
                                </label>
                                <input
                                    type="text"
                                    value={ville}
                                    onChange={(e) => setVille(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="Rabat"
                                />
                            </div>
                        </div>

                        {/* Coordonnées GPS (optionnelles) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Coordonnées GPS (optionnel)
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="number"
                                    step="0.000001"
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="Latitude (ex: 34.020882)"
                                />
                                <input
                                    type="number"
                                    step="0.000001"
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="Longitude (ex: -6.841650)"
                                />
                            </div>
                        </div>

                        {/* Date d'installation */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date d'Installation (optionnel)
                            </label>
                            <input
                                type="date"
                                value={dateInstallation}
                                onChange={(e) => setDateInstallation(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? 'Création...' : 'Enregistrer'}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => navigate('/admin/compteurs')}
                                disabled={loading}
                            >
                                Annuler
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </MainLayout>
    );
};

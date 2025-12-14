import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { createReleve } from '../api/releves';
import { getAllCompteurs } from '../api/compteurs';
import { ClipboardCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ReleveAdd = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [compteurId, setCompteurId] = useState('');
    const [compteurs, setCompteurs] = useState([]);
    const [indexActuel, setIndexActuel] = useState('');
    const [indexPrecedent, setIndexPrecedent] = useState('');
    const [dateHeure, setDateHeure] = useState('');
    const [anomalie, setAnomalie] = useState(false);
    const [commentaire, setCommentaire] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCompteurs();
        // Set default date/time to now
        const now = new Date();
        const formatted = now.toISOString().slice(0, 16);
        setDateHeure(formatted);
    }, []);

    const fetchCompteurs = async () => {
        try {
            const data = await getAllCompteurs({ active: true });
            setCompteurs(data);
        } catch (err) {
            console.error('Erreur récupération compteurs:', err);
            setError('Erreur lors du chargement des compteurs');
        }
    };

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude.toString());
                    setLongitude(position.coords.longitude.toString());
                },
                (error) => {
                    console.error('Erreur géolocalisation:', error);
                    alert('Impossible d\'obtenir la position GPS');
                }
            );
        } else {
            alert('La géolocalisation n\'est pas supportée par ce navigateur');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const releveData = {
                compteur_id: compteurId,
                agent_id: user.id,
                index_actuel: parseFloat(indexActuel),
                index_precedent: indexPrecedent ? parseFloat(indexPrecedent) : null,
                date_heure: dateHeure,
                anomalie,
                commentaire: commentaire || null,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null
            };

            await createReleve(releveData);
            alert('Relevé créé avec succès !');
            navigate('/admin/releves');
        } catch (err) {
            console.error('Erreur création relevé:', err);
            setError(err.response?.data?.message || 'Erreur lors de la création du relevé');
        } finally {
            setLoading(false);
        }
    };

    const selectedCompteur = compteurs.find(c => c.id_compteur === compteurId);

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <ClipboardCheck className="text-primary-600" size={36} />
                        Ajouter un Relevé
                    </h1>
                    <p className="text-gray-600 mt-1">Enregistrer un nouveau relevé de compteur</p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        {/* Compteur sélection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Compteur <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={compteurId}
                                onChange={(e) => setCompteurId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                required
                            >
                                <option value="">-- Sélectionner un compteur --</option>
                                {compteurs.map((compteur) => (
                                    <option key={compteur.id_compteur} value={compteur.id_compteur}>
                                        {compteur.id_compteur} - {compteur.type_fluide} - {compteur.adresse}
                                    </option>
                                ))}
                            </select>

                            {selectedCompteur && (
                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-800">
                                        <strong>Utilisateur:</strong> {selectedCompteur.user?.nom} {selectedCompteur.user?.prenom}
                                        <br />
                                        <strong>Type:</strong> {selectedCompteur.type_fluide === 'EAU' ? '💧 Eau' : '⚡ Électricité'}
                                        <br />
                                        <strong>Adresse:</strong> {selectedCompteur.adresse}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Index */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                Indices
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Index Actuel <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={indexActuel}
                                        onChange={(e) => setIndexActuel(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="12345.67"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Index Précédent (optionnel)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={indexPrecedent}
                                        onChange={(e) => setIndexPrecedent(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="12000.00"
                                    />
                                </div>
                            </div>

                            {indexActuel && indexPrecedent && (
                                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <p className="text-sm text-green-800">
                                        <strong>Consommation calculée:</strong>{' '}
                                        {(parseFloat(indexActuel) - parseFloat(indexPrecedent)).toFixed(2)}{' '}
                                        {selectedCompteur?.type_fluide === 'EAU' ? 'm³' : 'kWh'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Date et heure */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date et Heure du Relevé <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="datetime-local"
                                value={dateHeure}
                                onChange={(e) => setDateHeure(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                required
                            />
                        </div>

                        {/* Anomalie */}
                        <div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={anomalie}
                                    onChange={(e) => setAnomalie(e.target.checked)}
                                    className="w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Anomalie détectée
                                </span>
                            </label>
                        </div>

                        {/* Commentaire */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Commentaire {anomalie && <span className="text-red-500">*</span>}
                            </label>
                            <textarea
                                value={commentaire}
                                onChange={(e) => setCommentaire(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="Notes ou observations sur le relevé..."
                                rows="3"
                                required={anomalie}
                            />
                        </div>

                        {/* Coordonnées GPS */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Position GPS (optionnel)
                            </label>
                            <div className="space-y-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="number"
                                        step="0.000001"
                                        value={latitude}
                                        onChange={(e) => setLatitude(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="Latitude"
                                    />
                                    <input
                                        type="number"
                                        step="0.000001"
                                        value={longitude}
                                        onChange={(e) => setLongitude(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="Longitude"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleGetLocation}
                                    className="w-full"
                                >
                                    Obtenir ma position actuelle
                                </Button>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-4">
                            <Button type="submit" variant="primary" disabled={loading}>
                                {loading ? 'Création...' : 'Enregistrer'}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => navigate('/admin/releves')}
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

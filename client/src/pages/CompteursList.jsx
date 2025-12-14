import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { Button } from '../components/UI/Button';
import { getAllCompteurs, deleteCompteur } from '../api/compteurs';
import { Gauge, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const CompteursList = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'SUPERADMIN';
    const [compteurs, setCompteurs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchCompteurs();
    }, []);

    const fetchCompteurs = async () => {
        try {
            setLoading(true);
            const data = await getAllCompteurs();
            setCompteurs(data);
        } catch (err) {
            console.error('Erreur chargement compteurs:', err);
            setError('Erreur lors du chargement des compteurs');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id_compteur, adresse) => {
        if (!confirm(`Supprimer le compteur ${id_compteur} ?\n\nAdresse: ${adresse}\n\nCette action désactivera le compteur.`)) {
            return;
        }

        try {
            await deleteCompteur(id_compteur);
            alert('Compteur supprimé avec succès');
            fetchCompteurs(); // Recharger la liste
        } catch (err) {
            console.error('Erreur suppression compteur:', err);
            alert(err.response?.data?.message || 'Erreur lors de la suppression du compteur');
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-600">Chargement des compteurs...</p>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                    <p className="text-red-800">{error}</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <Gauge className="text-primary-600" size={36} />
                            Compteurs
                        </h1>
                        <p className="text-gray-600 mt-1">{compteurs.length} compteurs enregistrés</p>
                    </div>
                    {isAdmin && (
                        <Link to="/admin/compteurs/add">
                            <Button variant="primary">
                                <Plus size={20} className="mr-2" />
                                Ajouter un compteur
                            </Button>
                        </Link>
                    )}
                </div>

                {compteurs.length === 0 ? (
                    <Card>
                        <div className="text-center py-12">
                            <Gauge className="mx-auto text-gray-400" size={64} />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">Aucun compteur</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Commencez par ajouter votre premier compteur
                            </p>
                            {isAdmin && (
                                <div className="mt-6">
                                    <Link to="/admin/compteurs/nouveau">
                                        <Button variant="primary">
                                            <Plus size={20} className="mr-2" />
                                            Ajouter un compteur
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {compteurs.map(compteur => {
                            return (
                                <Card key={compteur.id_compteur} className="hover:shadow-lg transition-shadow relative">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-lg ${compteur.type_fluide === 'EAU' ? 'bg-blue-100' : 'bg-yellow-100'}`}>
                                                <Gauge className={compteur.type_fluide === 'EAU' ? 'text-blue-600' : 'text-yellow-600'} size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">ID Compteur</p>
                                                <p className="text-lg font-bold font-mono text-gray-800">
                                                    {compteur.id_compteur}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={compteur.type_fluide === 'EAU' ? 'primary' : 'warning'}>
                                            {compteur.type_fluide === 'EAU' ? '💧 Eau' : '⚡ Élec'}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2 text-sm mb-4">
                                        <div>
                                            <p className="text-gray-500">Adresse</p>
                                            <p className="text-gray-800 font-medium">
                                                {compteur.adresse}
                                            </p>
                                        </div>
                                        {compteur.quartier && (
                                            <div>
                                                <p className="text-gray-500">Quartier</p>
                                                <p className="text-gray-800">{compteur.quartier}</p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-gray-500">Ville</p>
                                            <p className="text-gray-800">{compteur.ville}</p>
                                        </div>
                                        {compteur.date_installation && (
                                            <div>
                                                <p className="text-gray-500">Date d'installation</p>
                                                <p className="text-gray-800">
                                                    {new Date(compteur.date_installation).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {isAdmin && (
                                        <div className="pt-4 border-t border-gray-200">
                                            <button
                                                onClick={() => handleDelete(compteur.id_compteur, compteur.adresse)}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
                                                Supprimer
                                            </button>
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

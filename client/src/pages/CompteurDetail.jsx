import { useParams, useNavigate, Link } from 'react-router-dom';
import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { Button } from '../components/UI/Button';
import { compteurs, releves, getAdresseById, getClientById } from '../data/mockData';
import { ArrowLeft, Gauge, MapPin, User, Calendar, TrendingUp } from 'lucide-react';

export const CompteurDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const compteur = compteurs.find(c => c.id_compteur === id);

    if (!compteur) {
        return (
            <MainLayout>
                <Card>
                    <p className="text-red-600">Compteur non trouvé</p>
                </Card>
            </MainLayout>
        );
    }

    const adresse = getAdresseById(compteur.adresse_id);
    const client = getClientById(adresse?.client_id);
    const compteurReleves = releves.filter(r => r.compteur_id === compteur.id_compteur).slice(0, 10);

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/compteurs')}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Détail du Compteur</h1>
                        <p className="text-gray-600 mt-1 font-mono">{compteur.id_compteur}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Informations générales */}
                    <Card title="Informations Générales">
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="bg-primary-50 p-2 rounded-lg">
                                    <Gauge className="text-primary-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Identifiant</p>
                                    <p className="text-lg font-bold font-mono text-gray-800">{compteur.id_compteur}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-secondary-50 p-2 rounded-lg">
                                    <TrendingUp className="text-secondary-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Type</p>
                                    <Badge variant={compteur.type_fluide === 'EAU' ? 'eau' : 'elec'}>
                                        {compteur.type_fluide}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-primary-50 p-2 rounded-lg">
                                    <MapPin className="text-primary-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Adresse</p>
                                    <p className="text-lg font-medium text-gray-800">
                                        {adresse?.rue_details}, {adresse?.ville}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="bg-secondary-50 p-2 rounded-lg">
                                    <User className="text-secondary-600" size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Client</p>
                                    <p className="text-lg font-medium text-gray-800">{client?.nom_raison_sociale}</p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Index */}
                    <Card title="Index">
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-600 mb-2">Index Actuel</p>
                                <p className="text-4xl font-bold text-gray-800">{compteur.index_actuel}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar size={16} className="text-gray-600" />
                                    <p className="text-sm text-gray-600">Dernière Relevé</p>
                                </div>
                                <p className="text-lg font-semibold text-gray-800">
                                    {new Date(compteur.date_derniere_releve).toLocaleDateString('fr-FR', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Historique des relevés */}
                <Card
                    title="Historique des Relevés (10 derniers)"
                    actions={
                        <Link to={`/releves?compteur=${compteur.id_compteur}`}>
                            <Button variant="outline" size="sm">
                                Plus de détails →
                            </Button>
                        </Link>
                    }
                >
                    {compteurReleves.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left border-b-2 border-gray-200">
                                        <th className="pb-3 text-sm font-semibold text-gray-700">Date</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-700">Ancien Index</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-700">Nouvel Index</th>
                                        <th className="pb-3 text-sm font-semibold text-gray-700 text-right">Consommation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {compteurReleves.map(releve => (
                                        <tr key={releve.id} className="border-b border-gray-100">
                                            <td className="py-3 text-sm text-gray-600">
                                                {new Date(releve.date_heure).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="py-3 text-sm text-gray-800">{releve.ancien_index}</td>
                                            <td className="py-3 text-sm text-gray-800 font-semibold">{releve.nouvel_index}</td>
                                            <td className="py-3 text-sm text-gray-800 font-bold text-right">
                                                {releve.consommation} {compteur.type_fluide === 'EAU' ? 'm³' : 'kWh'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">Aucun relevé disponible</p>
                    )}
                </Card>
            </div>
        </MainLayout>
    );
};

import { Link } from 'react-router-dom';
import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { Button } from '../components/UI/Button';
import { compteurs, adresses, getAdresseById } from '../data/mockData';
import { Gauge, Plus } from 'lucide-react';

export const CompteursList = () => {
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
                    <Link to="/compteurs/nouveau">
                        <Button variant="primary">
                            <Plus size={20} className="mr-2" />
                            Ajouter un compteur
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {compteurs.map(compteur => {
                        const adresse = getAdresseById(compteur.adresse_id);
                        return (
                            <Card key={compteur.id_compteur} className="hover:shadow-lg transition-shadow">
                                <Link to={`/compteurs/${compteur.id_compteur}`} className="block">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-lg ${compteur.type_fluide === 'EAU' ? 'bg-blue-100' : 'bg-yellow-100'
                                                }`}>
                                                <Gauge className={
                                                    compteur.type_fluide === 'EAU' ? 'text-blue-600' : 'text-yellow-600'
                                                } size={24} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">ID Compteur</p>
                                                <p className="text-lg font-bold font-mono text-gray-800">
                                                    {compteur.id_compteur}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant={compteur.type_fluide === 'EAU' ? 'eau' : 'elec'}>
                                            {compteur.type_fluide}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <p className="text-gray-500">Adresse</p>
                                            <p className="text-gray-800 font-medium truncate">
                                                {adresse?.rue_details}
                                            </p>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-gray-100">
                                            <div>
                                                <p className="text-gray-500">Index actuel</p>
                                                <p className="text-gray-800 font-bold">{compteur.index_actuel}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-gray-500">Dernière relevé</p>
                                                <p className="text-gray-800 font-medium">
                                                    {new Date(compteur.date_derniere_releve).toLocaleDateString('fr-FR')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </MainLayout>
    );
};

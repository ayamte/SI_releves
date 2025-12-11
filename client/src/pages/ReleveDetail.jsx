import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { Button } from '../components/UI/Button';
import { releves, getAgentById, getCompteurById, getAdresseById, getClientById } from '../data/mockData';
import { ArrowLeft, Calendar, User, MapPin, Gauge } from 'lucide-react';

export const ReleveDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const releve = releves.find(r => r.id === parseInt(id));

    if (!releve) {
        return (
            <MainLayout>
                <Card>
                    <p className="text-red-600">Relevé non trouvé</p>
                </Card>
            </MainLayout>
        );
    }

    const agent = getAgentById(releve.agent_id);
    const compteur = getCompteurById(releve.compteur_id);
    const adresse = getAdresseById(compteur?.adresse_id);
    const client = getClientById(adresse?.client_id);

    const InfoRow = ({ icon: Icon, label, value, badge }) => (
        <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
            <div className="bg-primary-50 p-2 rounded-lg">
                <Icon className="text-primary-600" size={20} />
            </div>
            <div className="flex-1">
                <p className="text-sm text-gray-600">{label}</p>
                <p className="text-lg font-semibold text-gray-800 mt-1">
                    {value}
                    {badge && <span className="ml-2">{badge}</span>}
                </p>
            </div>
        </div>
    );

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/releves')}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Détail du Relevé</h1>
                        <p className="text-gray-600 mt-1">Relevé #{releve.id}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Informations générales */}
                    <Card title="Informations Générales">
                        <InfoRow
                            icon={Calendar}
                            label="Date et heure du relevé"
                            value={new Date(releve.date_heure).toLocaleString('fr-FR', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        />
                        <InfoRow
                            icon={User}
                            label="Agent ayant effectué le relevé"
                            value={`${agent?.prenom} ${agent?.nom}`}
                        />
                        <InfoRow
                            icon={MapPin}
                            label="Adresse"
                            value={`${adresse?.rue_details}, ${adresse?.ville}`}
                        />
                    </Card>

                    {/* Informations client et compteur */}
                    <Card title="Client & Compteur">
                        <InfoRow
                            icon={User}
                            label="Client"
                            value={client?.nom_raison_sociale}
                        />
                        <InfoRow
                            icon={Gauge}
                            label="Identifiant Compteur"
                            value={compteur?.id_compteur}
                            badge={<Badge variant={compteur?.type_fluide === 'EAU' ? 'eau' : 'elec'}>
                                {compteur?.type_fluide}
                            </Badge>}
                        />
                    </Card>
                </div>

                {/* Consommation */}
                <Card title="Détails de Consommation">
                    <div className="grid grid-cols-3 gap-6">
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <p className="text-sm text-gray-600 mb-2">Ancien Index</p>
                            <p className="text-3xl font-bold text-gray-800">{releve.ancien_index}</p>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <p className="text-sm text-gray-600 mb-2">Nouvel Index</p>
                            <p className="text-3xl font-bold text-gray-800">{releve.nouvel_index}</p>
                        </div>
                        <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-6 rounded-lg text-white">
                            <p className="text-sm text-primary-100 mb-2">Consommation Calculée</p>
                            <p className="text-3xl font-bold">{releve.consommation}</p>
                            <p className="text-sm text-primary-200 mt-1">
                                {compteur?.type_fluide === 'EAU' ? 'm³' : 'kWh'}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
};

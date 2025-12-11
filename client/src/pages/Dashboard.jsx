import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/UI/Card';
import { TrendingUp, Users, Gauge, Activity } from 'lucide-react';
import { releves, compteurs, agents, quartiers, adresses } from '../data/mockData';

export const Dashboard = () => {
    // Calculate KPIs
    const totalCompteurs = compteurs.length;
    const compteursReleves = new Set(releves.map(r => r.compteur_id)).size;
    const tauxCouverture = ((compteursReleves / totalCompteurs) * 100).toFixed(1);

    const relevesParJourParAgent = (releves.length / agents.length).toFixed(1);

    const consumptionEau = releves
        .filter(r => compteurs.find(c => c.id_compteur === r.compteur_id)?.type_fluide === 'EAU')
        .reduce((sum, r) => sum + r.consommation, 0);

    const consumptionElec = releves
        .filter(r => compteurs.find(c => c.id_compteur === r.compteur_id)?.type_fluide === 'ELEC')
        .reduce((sum, r) => sum + r.consommation, 0);

    const avgConsumptionEau = (consumptionEau / compteursReleves).toFixed(1);
    const avgConsumptionElec = (consumptionElec / compteursReleves).toFixed(1);

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Tableau de Bord</h1>
                    <p className="text-gray-600 mt-1">Vue d'ensemble des relevés et performances</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-primary-100 text-sm font-medium">Taux de Couverture</p>
                                <p className="text-4xl font-bold mt-2">{tauxCouverture}%</p>
                                <p className="text-primary-200 text-xs mt-1">
                                    {compteursReleves}/{totalCompteurs} compteurs
                                </p>
                            </div>
                            <TrendingUp size={48} className="text-primary-200" />
                        </div>
                        <div className="mt-4 bg-white/20 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-white h-full rounded-full transition-all"
                                style={{ width: `${tauxCouverture}%` }}
                            ></div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-secondary-500 to-secondary-700 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-secondary-100 text-sm font-medium">Relevés/Agent/Jour</p>
                                <p className="text-4xl font-bold mt-2">{relevesParJourParAgent}</p>
                                <p className="text-secondary-200 text-xs mt-1">
                                    Moyenne actuelle
                                </p>
                            </div>
                            <Users size={48} className="text-secondary-200" />
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-500 to-blue-700 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Eau (m³)</p>
                                <p className="text-4xl font-bold mt-2">{avgConsumptionEau}</p>
                                <p className="text-blue-200 text-xs mt-1">
                                    Consommation moyenne
                                </p>
                            </div>
                            <Gauge size={48} className="text-blue-200" />
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-yellow-500 to-yellow-700 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-sm font-medium">Électricité (kWh)</p>
                                <p className="text-4xl font-bold mt-2">{avgConsumptionElec}</p>
                                <p className="text-yellow-200 text-xs mt-1">
                                    Consommation moyenne
                                </p>
                            </div>
                            <Activity size={48} className="text-yellow-200" />
                        </div>
                    </Card>
                </div>

                {/* Taux de couverture par quartier */}
                <Card title="Taux de Couverture par Quartier">
                    <div className="space-y-4">
                        {quartiers.map(quartier => {
                            const compteursQuartier = compteurs.filter(c => {
                                const adresse = adresses.find(a => a.id === c.adresse_id);
                                return adresse?.quartier_id === quartier.id;
                            });
                            const relevesQuartier = releves.filter(r =>
                                compteursQuartier.some(c => c.id_compteur === r.compteur_id)
                            );
                            const taux = compteursQuartier.length > 0
                                ? ((new Set(relevesQuartier.map(r => r.compteur_id)).size / compteursQuartier.length) * 100).toFixed(1)
                                : 0;

                            return (
                                <div key={quartier.id}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium text-gray-700">{quartier.nom_quartier}</span>
                                        <span className="text-gray-600">{taux}%</span>
                                    </div>
                                    <div className="bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-primary-600 h-full rounded-full transition-all"
                                            style={{ width: `${taux}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Derniers relevés */}
                <Card title="Derniers Relevés"
                    actions={
                        <a href="/releves" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                            Voir tout →
                        </a>
                    }
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-gray-200">
                                    <th className="pb-3 text-sm font-semibold text-gray-700">Date</th>
                                    <th className="pb-3 text-sm font-semibold text-gray-700">Agent</th>
                                    <th className="pb-3 text-sm font-semibold text-gray-700">Compteur</th>
                                    <th className="pb-3 text-sm font-semibold text-gray-700">Type</th>
                                    <th className="pb-3 text-sm font-semibold text-gray-700 text-right">Consommation</th>
                                </tr>
                            </thead>
                            <tbody>
                                {releves.slice(0, 5).map(releve => {
                                    const agent = agents.find(a => a.id === releve.agent_id);
                                    const compteur = compteurs.find(c => c.id_compteur === releve.compteur_id);
                                    return (
                                        <tr key={releve.id} className="border-b border-gray-100">
                                            <td className="py-3 text-sm text-gray-600">
                                                {new Date(releve.date_heure).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="py-3 text-sm text-gray-800">{agent?.prenom} {agent?.nom}</td>
                                            <td className="py-3 text-sm font-mono text-gray-600">{releve.compteur_id}</td>
                                            <td className="py-3">
                                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${compteur?.type_fluide === 'EAU'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {compteur?.type_fluide}
                                                </span>
                                            </td>
                                            <td className="py-3 text-sm font-semibold text-gray-800 text-right">
                                                {releve.consommation} {compteur?.type_fluide === 'EAU' ? 'm³' : 'kWh'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
};

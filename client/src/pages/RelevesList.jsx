import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { releves, agents, compteurs, adresses, getAgentById, getCompteurById, getAdresseById } from '../data/mockData';
import { Filter } from 'lucide-react';

export const RelevesList = () => {
    const [filterType, setFilterType] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');

    // Get enriched releves data
    const enrichedReleves = releves.map(releve => ({
        ...releve,
        agent: getAgentById(releve.agent_id),
        compteur: getCompteurById(releve.compteur_id),
        adresse: getAdresseById(getCompteurById(releve.compteur_id)?.adresse_id)
    }));

    // Filter
    let filteredReleves = enrichedReleves;
    if (filterType) {
        filteredReleves = filteredReleves.filter(r => r.compteur?.type_fluide === filterType);
    }

    // Sort
    const sortedReleves = [...filteredReleves].sort((a, b) => {
        if (sortBy === 'date') {
            const compare = new Date(b.date_heure) - new Date(a.date_heure);
            return sortOrder === 'desc' ? compare : -compare;
        }
        return 0;
    });

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Liste des Relevés</h1>
                    <p className="text-gray-600 mt-1">{sortedReleves.length} relevés au total</p>
                </div>

                {/* Filters */}
                <Card>
                    <div className="flex gap-4 items-center">
                        <Filter className="text-gray-400" size={20} />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        >
                            <option value="">Tous les types</option>
                            <option value="EAU">Eau</option>
                            <option value="ELEC">Électricité</option>
                        </select>

                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        >
                            <option value="desc">Plus récent d'abord</option>
                            <option value="asc">Plus ancien d'abord</option>
                        </select>
                    </div>
                </Card>

                {/* Releves Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b-2 border-gray-200">
                                    <th className="pb-3 text-sm font-semibold text-gray-700">Date</th>
                                    <th className="pb-3 text-sm font-semibold text-gray-700">Agent</th>
                                    <th className="pb-3 text-sm font-semibold text-gray-700">Adresse</th>
                                    <th className="pb-3 text-sm font-semibold text-gray-700">Type</th>
                                    <th className="pb-3 text-sm font-semibold text-gray-700 text-right">Consommation</th>
                                    <th className="pb-3 text-sm font-semibold text-gray-700"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedReleves.map(releve => (
                                    <tr key={releve.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 text-sm text-gray-600">
                                            {new Date(releve.date_heure).toLocaleString('fr-FR', {
                                                day: '2-digit',
                                                month: '2-digit',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="py-4 text-sm text-gray-800">
                                            {releve.agent?.prenom} {releve.agent?.nom}
                                        </td>
                                        <td className="py-4 text-sm text-gray-600">
                                            {releve.adresse?.rue_details.substring(0, 30)}...
                                        </td>
                                        <td className="py-4">
                                            <Badge variant={releve.compteur?.type_fluide === 'EAU' ? 'eau' : 'elec'}>
                                                {releve.compteur?.type_fluide}
                                            </Badge>
                                        </td>
                                        <td className="py-4 text-sm font-semibold text-gray-800 text-right">
                                            {releve.consommation} {releve.compteur?.type_fluide === 'EAU' ? 'm³' : 'kWh'}
                                        </td>
                                        <td className="py-4 text-right">
                                            <Link
                                                to={`/releves/${releve.id}`}
                                                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                                            >
                                                Détails →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
};

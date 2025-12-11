import { Link } from 'react-router-dom';
import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/UI/Card';
import { agents, quartiers } from '../data/mockData';
import { Users as UsersIcon, Phone, MapPin } from 'lucide-react';

export const AgentsList = () => {
    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <UsersIcon className="text-primary-600" size={36} />
                        Agents de Terrain
                    </h1>
                    <p className="text-gray-600 mt-1">{agents.length} agents actifs</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {agents.map(agent => {
                        const quartier = quartiers.find(q => q.id === agent.quartier_id);
                        return (
                            <Card key={agent.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                                <Link to={`/agents/${agent.id}`} className="block">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white p-4 rounded-full">
                                            <UsersIcon size={24} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-800">
                                                {agent.prenom} {agent.nom}
                                            </h3>
                                            <div className="mt-3 space-y-2">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone size={16} />
                                                    <span>{agent.tel_pro}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <MapPin size={16} />
                                                    <span>{quartier?.nom_quartier || 'Non affecté'}</span>
                                                </div>
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

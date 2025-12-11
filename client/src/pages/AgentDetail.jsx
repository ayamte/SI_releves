import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { agents, quartiers, releves } from '../data/mockData';
import { ArrowLeft, User, Phone, MapPin, BarChart3 } from 'lucide-react';

export const AgentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const agent = agents.find(a => a.id === parseInt(id));
    const [selectedQuartier, setSelectedQuartier] = useState(agent?.quartier_id || '');

    if (!agent) {
        return (
            <MainLayout>
                <Card>
                    <p className="text-red-600">Agent non trouvé</p>
                </Card>
            </MainLayout>
        );
    }

    const agentReleves = releves.filter(r => r.agent_id === agent.id);
    const relevesParJour = (agentReleves.length / 30).toFixed(1); // Mock: last 30 days

    const handleSave = () => {
        // Mock save
        alert(`Quartier mis à jour vers: ${quartiers.find(q => q.id === parseInt(selectedQuartier))?.nom_quartier}`);
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/agents')}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Détail de l'Agent
                        </h1>
                        <p className="text-gray-600 mt-1">{agent.prenom} {agent.nom}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Informations personnelles */}
                    <Card title="Informations Personnelles">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <User className="inline mr-2" size={16} />
                                    Nom
                                </label>
                                <input
                                    type="text"
                                    value={agent.nom}
                                    disabled
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <User className="inline mr-2" size={16} />
                                    Prénom
                                </label>
                                <input
                                    type="text"
                                    value={agent.prenom}
                                    disabled
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Phone className="inline mr-2" size={16} />
                                    Téléphone Professionnel
                                </label>
                                <input
                                    type="text"
                                    value={agent.tel_pro}
                                    disabled
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                    </Card>

                    {/* Affectation */}
                    <Card title="Affectation">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MapPin className="inline mr-2" size={16} />
                                    Quartier Assigné
                                </label>
                                <select
                                    value={selectedQuartier}
                                    onChange={(e) => setSelectedQuartier(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                >
                                    <option value="">Sélectionner un quartier</option>
                                    {quartiers.map(q => (
                                        <option key={q.id} value={q.id}>{q.nom_quartier}</option>
                                    ))}
                                </select>
                            </div>
                            <Button onClick={handleSave} variant="primary" className="w-full">
                                Enregistrer les modifications
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Performances */}
                <Card title="Performances">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-6 rounded-lg text-white">
                            <div className="flex items-center gap-3 mb-2">
                                <BarChart3 size={24} />
                                <p className="text-sm text-primary-100">Relevés par jour</p>
                            </div>
                            <p className="text-4xl font-bold">{relevesParJour}</p>
                            <p className="text-sm text-primary-200 mt-1">Moyenne sur 30 jours</p>
                        </div>
                        <div className="bg-gradient-to-br from-secondary-500 to-secondary-700 p-6 rounded-lg text-white">
                            <div className="flex items-center gap-3 mb-2">
                                <BarChart3 size={24} />
                                <p className="text-sm text-secondary-100">Total relevés</p>
                            </div>
                            <p className="text-4xl font-bold">{agentReleves.length}</p>
                            <p className="text-sm text-secondary-200 mt-1">Depuis le début</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-500 to-green-700 p-6 rounded-lg text-white">
                            <div className="flex items-center gap-3 mb-2">
                                <BarChart3 size={24} />
                                <p className="text-sm text-green-100">Performance</p>
                            </div>
                            <p className="text-4xl font-bold">Excellent</p>
                            <p className="text-sm text-green-200 mt-1">Ci-dessus de la moyenne</p>
                        </div>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
};

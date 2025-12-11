import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { adresses, compteurs, quartiers } from '../data/mockData';
import { Search, X } from 'lucide-react';

export const CompteurAdd = () => {
    const navigate = useNavigate();
    const [selectedAdresse, setSelectedAdresse] = useState(null);
    const [typeFluide, setTypeFluide] = useState('EAU');
    const [showModal, setShowModal] = useState(false);
    const [searchQuartier, setSearchQuartier] = useState('');
    const [searchAdresse, setSearchAdresse] = useState('');

    // Filtrer les adresses qui n'ont pas encore 2 compteurs
    const availableAdresses = adresses.filter(adresse => {
        const compteursAdresse = compteurs.filter(c => c.adresse_id === adresse.id);
        return compteursAdresse.length < 2;
    });

    // Filtrer les adresses disponibles selon les critères
    const filteredAdresses = availableAdresses.filter(adresse => {
        const quartier = quartiers.find(q => q.id === adresse.quartier_id);
        const matchQuartier = !searchQuartier || adresse.quartier_id === parseInt(searchQuartier);
        const matchAdresse = !searchAdresse || adresse.rue_details.toLowerCase().includes(searchAdresse.toLowerCase());
        return matchQuartier && matchAdresse;
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!selectedAdresse) {
            alert('Veuillez sélectionner une adresse');
            return;
        }
        // Mock save
        const newId = `00000000${compteurs.length + 1}`.slice(-9);
        alert(`Compteur créé avec succès!\nID: ${newId}\nType: ${typeFluide}`);
        navigate('/compteurs');
    };

    return (
        <MainLayout>
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Ajouter un Compteur</h1>
                    <p className="text-gray-600 mt-1">Créer un nouveau compteur d'eau ou d'électricité</p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Sélection adresse */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Adresse <span className="text-red-500">*</span>
                            </label>
                            {selectedAdresse ? (
                                <div className="flex items-center gap-2 p-4 bg-primary-50 border border-primary-200 rounded-lg">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">{selectedAdresse.rue_details}</p>
                                        <p className="text-sm text-gray-600">{selectedAdresse.ville}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSelectedAdresse(null)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            ) : (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowModal(true)}
                                    className="w-full"
                                >
                                    <Search size={16} className="mr-2" />
                                    Sélectionner une adresse
                                </Button>
                            )}
                        </div>

                        {/* Type de fluide */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Type de Compteur <span className="text-red-500">*</span>
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors flex-1
                  ${typeFluide === 'EAU' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}"
                                >
                                    <input
                                        type="radio"
                                        value="EAU"
                                        checked={typeFluide === 'EAU'}
                                        onChange={(e) => setTypeFluide(e.target.value)}
                                        className="text-blue-600"
                                    />
                                    <span className="font-medium">💧 Eau</span>
                                </label>
                                <label className="flex items-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors flex-1
                  ${typeFluide === 'ELEC' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300 hover:border-gray-400'}"
                                >
                                    <input
                                        type="radio"
                                        value="ELEC"
                                        checked={typeFluide === 'ELEC'}
                                        onChange={(e) => setTypeFluide(e.target.value)}
                                        className="text-yellow-600"
                                    />
                                    <span className="font-medium">⚡ Électricité</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" variant="primary">
                                Enregistrer
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => navigate('/compteurs')}>
                                Annuler
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>

            {/* Modal de sélection d'adresse */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-bold text-gray-800">Sélectionner une Adresse</h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Adresses disponibles sans compteur complet
                            </p>
                        </div>

                        <div className="p-6 border-b border-gray-200 space-y-4">
                            <select
                                value={searchQuartier}
                                onChange={(e) => setSearchQuartier(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="">Tous les quartiers</option>
                                {quartiers.map(q => (
                                    <option key={q.id} value={q.id}>{q.nom_quartier}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={searchAdresse}
                                onChange={(e) => setSearchAdresse(e.target.value)}
                                placeholder="Rechercher une adresse..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>

                        <div className="p-6 overflow-y-auto max-h-96">
                            <div className="space-y-2">
                                {filteredAdresses.map(adresse => {
                                    const quartier = quartiers.find(q => q.id === adresse.quartier_id);
                                    return (
                                        <button
                                            key={adresse.id}
                                            onClick={() => {
                                                setSelectedAdresse(adresse);
                                                setShowModal(false);
                                            }}
                                            className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                                        >
                                            <p className="font-medium text-gray-800">{adresse.rue_details}</p>
                                            <p className="text-sm text-gray-600">{quartier?.nom_quartier} - {adresse.ville}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200">
                            <Button variant="ghost" onClick={() => setShowModal(false)} className="w-full">
                                Fermer
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

import { useState } from 'react';
import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { FileText, Download } from 'lucide-react';
import { generateRapportMensuel } from '../utils/rapports/rapportMensuel';
import { generateRapportConsommation } from '../utils/rapports/rapportConsommation';
import { releves, compteurs, agents, quartiers, adresses } from '../data/mockData';

export const Rapports = () => {
    const [loading, setLoading] = useState(false);

    const handleExportRapportMensuel = async () => {
        try {
            setLoading(true);
            const filename = generateRapportMensuel(releves, agents, compteurs, quartiers, adresses);
            alert(`✅ Rapport généré avec succès!\n\nFichier: ${filename}`);
        } catch (error) {
            console.error('Erreur génération PDF:', error);
            alert('❌ Erreur lors de la génération du rapport.\nVérifiez la console pour plus de détails.');
        } finally {
            setLoading(false);
        }
    };

    const handleExportRapportConsommation = async () => {
        try {
            setLoading(true);
            const filename = await generateRapportConsommation(releves, compteurs);
            alert(`✅ Rapport généré avec succès!\n\nFichier: ${filename}`);
        } catch (error) {
            console.error('Erreur génération PDF:', error);
            alert('❌ Erreur lors de la génération du rapport.\nVérifiez la console pour plus de détails.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <FileText className="text-primary-600" size={36} />
                        Rapports et Statistiques
                    </h1>
                    <p className="text-gray-600 mt-1">Générez et exportez des rapports en PDF</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Rapport mensuel des relevés */}
                    <Card>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="bg-primary-100 p-3 rounded-full">
                                    <FileText className="text-primary-600" size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-800">
                                        Rapport Mensuel des Relevés
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Pour aider à mieux répartir les agents
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                                <p className="font-medium text-gray-700">Contenu du rapport :</p>
                                <ul className="list-disc list-inside text-gray-600 space-y-1">
                                    <li>Répartition des agents par quartier</li>
                                    <li>Nombre moyen de relevés par agent par jour par quartier</li>
                                    <li>Nombre de relevés par quartier</li>
                                </ul>
                            </div>

                            <Button
                                variant="primary"
                                className="w-full"
                                onClick={handleExportRapportMensuel}
                                disabled={loading}
                            >
                                <Download size={18} className="mr-2" />
                                {loading ? 'Génération...' : 'Exporter en PDF'}
                            </Button>
                        </div>
                    </Card>

                    {/* Évolution de la consommation */}
                    <Card>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="bg-secondary-100 p-3 rounded-full">
                                    <FileText className="text-secondary-600" size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-800">
                                        Évolution de la Consommation Moyenne
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Pour étudier les tendances de consommation
                                    </p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                                <p className="font-medium text-gray-700">Contenu du rapport :</p>
                                <ul className="list-disc list-inside text-gray-600 space-y-1">
                                    <li>Consommation par type (Eau m³, Électricité kWh)</li>
                                    <li>Évolution mensuelle avec graphique tendanciel</li>
                                    <li>Comparaison année N vs année N-1</li>
                                </ul>
                            </div>

                            <Button
                                variant="secondary"
                                className="w-full"
                                onClick={handleExportRapportConsommation}
                                disabled={loading}
                            >
                                <Download size={18} className="mr-2" />
                                {loading ? 'Génération...' : 'Exporter en PDF'}
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Aperçu des statistiques */}
                <Card title="Aperçu des Statistiques Actuelles">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-lg text-white">
                            <p className="text-blue-100 text-sm mb-2">Consommation Eau Totale</p>
                            <p className="text-4xl font-bold">1,245 m³</p>
                            <p className="text-blue-200 text-sm mt-2">Ce mois</p>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 p-6 rounded-lg text-white">
                            <p className="text-yellow-100 text-sm mb-2">Consommation Élec Totale</p>
                            <p className="text-4xl font-bold">8,567 kWh</p>
                            <p className="text-yellow-200 text-sm mt-2">Ce mois</p>
                        </div>
                        <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-6 rounded-lg text-white">
                            <p className="text-primary-100 text-sm mb-2">Total Relevés</p>
                            <p className="text-4xl font-bold">487</p>
                            <p className="text-primary-200 text-sm mt-2">Ce mois</p>
                        </div>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
};

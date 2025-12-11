import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { utilisateurs } from '../data/mockData';
import { ArrowLeft, Mail, RefreshCw } from 'lucide-react';

export const UserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = utilisateurs.find(u => u.id === parseInt(id));

    const [nom, setNom] = useState(user?.nom || '');
    const [prenom, setPrenom] = useState(user?.prenom || '');
    const [role, setRole] = useState(user?.role || 'USER');

    if (!user) {
        return (
            <MainLayout>
                <Card>
                    <p className="text-red-600">Utilisateur non trouvé</p>
                </Card>
            </MainLayout>
        );
    }

    const handleSave = (e) => {
        e.preventDefault();
        alert(`Utilisateur mis à jour:\nNom: ${nom.toUpperCase()}\nPrénom: ${prenom}\nRôle: ${role}`);
        navigate('/admin/users');
    };

    const handleResetPassword = () => {
        const confirmed = confirm(
            `Réinitialiser le mot de passe de ${prenom} ${nom}?\n\nUn nouveau mot de passe sera généré et envoyé par email.`
        );
        if (confirmed) {
            alert(`Mot de passe réinitialisé!\nEmail envoyé à: ${user.email}`);
        }
    };

    // Auto-format nom en MAJUSCULES
    const handleNomChange = (e) => {
        setNom(e.target.value.toUpperCase());
    };

    // Auto-format prénom (1ère majuscule)
    const handlePrenomChange = (e) => {
        const value = e.target.value;
        if (value.length > 0) {
            setPrenom(value.charAt(0).toUpperCase() + value.slice(1).toLowerCase());
        } else {
            setPrenom(value);
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate('/admin/users')}>
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Modifier l'Utilisateur</h1>
                        <p className="text-gray-600 mt-1">{user.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Formulaire de modification */}
                    <Card title="Informations">
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nom (MAJUSCULES)
                                </label>
                                <input
                                    type="text"
                                    value={nom}
                                    onChange={handleNomChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none uppercase"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Prénom (1ère majuscule)
                                </label>
                                <input
                                    type="text"
                                    value={prenom}
                                    onChange={handlePrenomChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rôle
                                </label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                >
                                    <option value="USER">Utilisateur</option>
                                    <option value="SUPERADMIN">Superadmin</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" variant="primary">
                                    Enregistrer
                                </Button>
                                <Button type="button" variant="ghost" onClick={() => navigate('/admin/users')}>
                                    Annuler
                                </Button>
                            </div>
                        </form>
                    </Card>

                    {/* Actions */}
                    <div className="space-y-6">
                        <Card title="Actions">
                            <div className="space-y-4">
                                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                                    <div className="flex items-start gap-3 mb-3">
                                        <RefreshCw className="text-yellow-600 flex-shrink-0 mt-1" size={20} />
                                        <div>
                                            <h4 className="font-semibold text-yellow-800">Réinitialiser le mot de passe</h4>
                                            <p className="text-sm text-yellow-700 mt-1">
                                                Génère un nouveau mot de passe aléatoire et l'envoie par email
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={handleResetPassword}
                                        className="w-full border-yellow-600 text-yellow-700 hover:bg-yellow-50"
                                    >
                                        <RefreshCw size={16} className="mr-2" />
                                        Réinitialiser
                                    </Button>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                                    <div className="flex items-start gap-3">
                                        <Mail className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                                        <div>
                                            <h4 className="font-semibold text-blue-800">Email de contact</h4>
                                            <p className="text-sm text-blue-700 mt-1">{user.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card title="Informations Système">
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Date de création</span>
                                    <span className="font-medium text-gray-800">
                                        {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Dernière modification</span>
                                    <span className="font-medium text-gray-800">
                                        {new Date(user.updated_at).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Rôle actuel</span>
                                    <Badge variant={user.role === 'SUPERADMIN' ? 'danger' : 'primary'}>
                                        {user.role}
                                    </Badge>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { UserPlus } from 'lucide-react';

export const UserAdd = () => {
    const navigate = useNavigate();
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('USER');

    const handleSubmit = (e) => {
        e.preventDefault();

        const newUser = {
            nom: nom.toUpperCase(),
            prenom: prenom.charAt(0).toUpperCase() + prenom.slice(1).toLowerCase(),
            email,
            role
        };

        alert(
            `Utilisateur créé avec succès!\n\n` +
            `Nom: ${newUser.nom}\n` +
            `Prénom: ${newUser.prenom}\n` +
            `Email: ${newUser.email}\n` +
            `Rôle: ${newUser.role}\n\n` +
            `Un mot de passe aléatoire a été généré et envoyé par email.`
        );

        navigate('/admin/users');
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
            <div className="max-w-2xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <UserPlus className="text-primary-600" size={36} />
                        Ajouter un Utilisateur
                    </h1>
                    <p className="text-gray-600 mt-1">
                        Créer un nouveau compte utilisateur pour le backoffice
                    </p>
                </div>

                <Card>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <p className="text-sm text-blue-800">
                                ℹ️ Un mot de passe sera généré automatiquement et envoyé par email à l'utilisateur.
                                Il devra le changer lors de sa première connexion.
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nom (sera converti en MAJUSCULES) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={nom}
                                onChange={handleNomChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none uppercase"
                                placeholder="BENNANI"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Exemples: BENNANI, AIT MOHAMED, ES-SERGHINI
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Prénom (1ère lettre en majuscule) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={prenom}
                                onChange={handlePrenomChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="Ahmed"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Exemples: Ahmed, Fatima Ezzahra, Mohamed-Amine
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                                placeholder="utilisateur@ree.ma"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Rôle <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            >
                                <option value="USER">Utilisateur</option>
                                <option value="SUPERADMIN">Superadmin</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                <strong>Utilisateur:</strong> Accès aux relevés, agents, compteurs et rapports<br />
                                <strong>Superadmin:</strong> Gestion complète des utilisateurs
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" variant="primary">
                                Créer l'utilisateur
                            </Button>
                            <Button type="button" variant="ghost" onClick={() => navigate('/admin/users')}>
                                Annuler
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </MainLayout>
    );
};

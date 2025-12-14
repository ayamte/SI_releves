import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Badge } from '../components/UI/Badge';
import { getUserById, updateUser, resetUserPassword, deleteUser } from '../api/users';
import { ArrowLeft, Mail, RefreshCw, Trash2 } from 'lucide-react';

export const UserDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [role, setRole] = useState('USER');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUser();
    }, [id]);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const data = await getUserById(id);
            setUser(data);
            setNom(data.nom);
            setPrenom(data.prenom);
            setRole(data.role);
        } catch (err) {
            console.error('Erreur chargement utilisateur:', err);
            setError(err.response?.data?.message || 'Utilisateur non trouvé');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            await updateUser(id, { nom, prenom, role });
            alert('Utilisateur mis à jour avec succès!');
            navigate('/admin/users');
        } catch (err) {
            console.error('Erreur mise à jour utilisateur:', err);
            setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
        } finally {
            setSaving(false);
        }
    };

    const handleResetPassword = async () => {
        const confirmed = confirm(
            `Réinitialiser le mot de passe de ${prenom} ${nom}?\n\nUn nouveau mot de passe sera généré et envoyé par email.`
        );

        if (confirmed) {
            try {
                const response = await resetUserPassword(id);

                if (response.tempPassword) {
                    alert(
                        `Mot de passe réinitialisé!\n\n` +
                        `⚠️  MODE DÉVELOPPEMENT\n` +
                        `Mot de passe temporaire: ${response.tempPassword}\n\n` +
                        `En production, ce mot de passe sera envoyé par email à: ${user.email}`
                    );
                } else {
                    alert(response.message || `Mot de passe réinitialisé!\nEmail envoyé à: ${user.email}`);
                }
            } catch (err) {
                console.error('Erreur réinitialisation mot de passe:', err);
                alert(err.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe');
            }
        }
    };

    const handleDelete = async () => {
        const confirmed = confirm(
            `⚠️  ATTENTION ⚠️\n\nÊtes-vous sûr de vouloir supprimer l'utilisateur ${prenom} ${nom} (${user.email}) ?\n\nCette action est irréversible!`
        );

        if (confirmed) {
            try {
                await deleteUser(id);
                alert('Utilisateur supprimé avec succès!');
                navigate('/admin/users');
            } catch (err) {
                console.error('Erreur suppression utilisateur:', err);
                alert(err.response?.data?.message || 'Erreur lors de la suppression');
            }
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-gray-600">Chargement...</div>
                </div>
            </MainLayout>
        );
    }

    if (error || !user) {
        return (
            <MainLayout>
                <Card>
                    <p className="text-red-600">{error || 'Utilisateur non trouvé'}</p>
                    <Button variant="ghost" onClick={() => navigate('/admin/users')} className="mt-4">
                        ← Retour à la liste
                    </Button>
                </Card>
            </MainLayout>
        );
    }

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
                                    <option value="AGENT">Agent</option>
                                    <option value="SUPERADMIN">Superadmin</option>
                                </select>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <Button type="submit" variant="primary" disabled={saving}>
                                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                                </Button>
                                <Button type="button" variant="ghost" onClick={() => navigate('/admin/users')} disabled={saving}>
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

                                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                    <div className="flex items-start gap-3 mb-3">
                                        <Trash2 className="text-red-600 flex-shrink-0 mt-1" size={20} />
                                        <div>
                                            <h4 className="font-semibold text-red-800">Supprimer l'utilisateur</h4>
                                            <p className="text-sm text-red-700 mt-1">
                                                Action irréversible. Toutes les données liées seront supprimées.
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={handleDelete}
                                        className="w-full border-red-600 text-red-700 hover:bg-red-50"
                                    >
                                        <Trash2 size={16} className="mr-2" />
                                        Supprimer
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <Card title="Informations Système">
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Date de création</span>
                                    <span className="font-medium text-gray-800">
                                        {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Dernière modification</span>
                                    <span className="font-medium text-gray-800">
                                        {new Date(user.updatedAt).toLocaleDateString('fr-FR')}
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

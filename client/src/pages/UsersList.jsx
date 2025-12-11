import { Link } from 'react-router-dom';
import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/UI/Card';
import { Badge } from '../components/UI/Badge';
import { Button } from '../components/UI/Button';
import { utilisateurs } from '../data/mockData';
import { UserCog, Plus, Calendar } from 'lucide-react';

export const UsersList = () => {
    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <UserCog className="text-primary-600" size={36} />
                            Gestion des Utilisateurs
                        </h1>
                        <p className="text-gray-600 mt-1">{utilisateurs.length} utilisateurs enregistrés</p>
                    </div>
                    <Link to="/admin/users/nouveau">
                        <Button variant="primary">
                            <Plus size={20} className="mr-2" />
                            Ajouter un utilisateur
                        </Button>
                    </Link>
                </div>

                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b-2 border-gray-200">
                                    <th className="pb-3 text-sm font-semibold text-gray-700">Nom & Prénom</th>
                                    <th className="pb-3 text-sm font-semibold text-gray-700">Email</th>
                                    <th className="pb-3 text-sm font-semibold text-gray-700">Rôle</th>
                                    <th className="pb-3 text-sm font-semibold text-gray-700">Date d'ajout</th>
                                    <th className="pb-3 text-sm font-semibold text-gray-700">Dernière modification</th>
                                    <th className="pb-3 text-sm font-semibold text-gray-700"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {utilisateurs.map(user => (
                                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 text-sm font-medium text-gray-800">
                                            {user.prenom} {user.nom}
                                        </td>
                                        <td className="py-4 text-sm text-gray-600">
                                            {user.email}
                                        </td>
                                        <td className="py-4">
                                            <Badge variant={user.role === 'SUPERADMIN' ? 'danger' : 'primary'}>
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="py-4 text-sm text-gray-600">
                                            {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="py-4 text-sm text-gray-600">
                                            {new Date(user.updated_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="py-4 text-right">
                                            <Link
                                                to={`/admin/users/${user.id}`}
                                                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                                            >
                                                Modifier →
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

import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    FileText,
    Users,
    Gauge,
    BarChart3,
    UserCog,
    LogOut,
    ClipboardCheck
} from 'lucide-react';

export const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const userMenuItems = [
        { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/releves', icon: ClipboardCheck, label: 'Relevés' },
        { path: '/agents', icon: Users, label: 'Agents' },
        { path: '/compteurs', icon: Gauge, label: 'Compteurs' },
        { path: '/rapports', icon: BarChart3, label: 'Rapports' },
    ];

    const superadminMenuItems = [
        { path: '/admin/users', icon: UserCog, label: 'Utilisateurs' },
        { path: '/admin/compteurs', icon: Gauge, label: 'Gestion Compteurs' },
        { path: '/admin/releves', icon: ClipboardCheck, label: 'Gestion Relevés' },
    ];

    const menuItems = user?.role === 'SUPERADMIN' ? superadminMenuItems : userMenuItems;

    return (
        <div className="w-64 bg-gradient-to-b from-primary-700 to-primary-900 text-white min-h-screen flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-primary-600">
                <h1 className="text-2xl font-bold">SI Relevés</h1>
                <p className="text-sm text-primary-200 mt-1">Rabat Energie & Eau</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(item.path)
                                            ? 'bg-white text-primary-700 font-semibold'
                                            : 'text-primary-100 hover:bg-primary-600'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span>{item.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Info */}
            <div className="p-4 border-t border-primary-600">
                <div className="mb-3">
                    <p className="text-sm font-semibold">{user?.prenom} {user?.nom}</p>
                    <p className="text-xs text-primary-200">{user?.role}</p>
                </div>
                <Link
                    to="/change-password"
                    className="block px-4 py-2 text-sm text-center bg-primary-600 hover:bg-primary-500 rounded-lg mb-2 transition-colors"
                >
                    Changer mot de passe
                </Link>
                <button
                    onClick={logout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                    <LogOut size={18} />
                    <span>Déconnexion</span>
                </button>
            </div>
        </div>
    );
};

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for existing session
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (email, password) => {
        // Mock authentication
        const mockUsers = [
            {
                id: 1,
                email: 'admin@ree.ma',
                password: 'Admin123',
                nom: 'ADMIN',
                prenom: 'System',
                role: 'SUPERADMIN'
            },
            {
                id: 2,
                email: 'user@ree.ma',
                password: 'User123',
                nom: 'BENNANI',
                prenom: 'Ahmed',
                role: 'USER'
            }
        ];

        const foundUser = mockUsers.find(
            u => u.email === email && u.password === password
        );

        if (foundUser) {
            const { password, ...userWithoutPassword } = foundUser;
            setUser(userWithoutPassword);
            localStorage.setItem('user', JSON.stringify(userWithoutPassword));
            return { success: true, user: userWithoutPassword };
        }

        return { success: false, message: 'Email ou mot de passe incorrect' };
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const changePassword = (oldPassword, newPassword) => {
        // Mock password change
        return { success: true };
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, changePassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

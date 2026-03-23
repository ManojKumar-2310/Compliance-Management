import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const Dashboard = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 gap-8">
                <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200 animate-pulse" />
                    <div className="relative">
                        <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin direction-reverse" />
                        </div>
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <p className="text-slate-900 dark:text-white font-black tracking-[0.2em] uppercase text-sm">System Synchronizing</p>
                    <p className="text-slate-400 font-medium text-xs">Mapping organizational intelligence...</p>
                </div>
            </div>
        );
    }

    // Role-Based Redirection Map
    const roleRoutes = {
        'Admin': '/admin/dashboard',
        'Compliance Officer': '/admin/dashboard', // Shared for now
        'Auditor': '/auditor/dashboard',
        'Employee': '/employee/dashboard'
    };

    if (user?.role && roleRoutes[user.role]) {
        return <Navigate to={roleRoutes[user.role]} replace />;
    }

    // Auth Fallback
    return <Navigate to="/" replace />;
};

export default Dashboard;

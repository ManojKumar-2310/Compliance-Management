import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, ShieldCheck, AlertTriangle, BarChart3, LogOut, CheckSquare, BookOpen, ChevronRight, Hexagon, Shield } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    // Role-specific dashboard path
    const getDashboardPath = () => {
        if (user?.role === 'Admin') return '/admin/dashboard';
        if (user?.role === 'Auditor') return '/auditor/mission-control';
        if (user?.role === 'Employee') return '/employee/dashboard';
        return '/dashboard';
    };

    // Role-based menu items
    const getMenuItems = () => {
        const commonItems = [
            { name: 'Command Center', path: getDashboardPath(), icon: LayoutDashboard },
        ];

        if (user?.role === 'Admin' || user?.role === 'Compliance Officer') {
            return [
                ...commonItems,
                { name: 'Personnel Grid', path: '/users', icon: Users },
                { name: 'Protocol Registry', path: '/regulations', icon: BookOpen },
                { name: 'Directives', path: '/tasks', icon: CheckSquare },
                { name: 'Reports', path: '/reports', icon: BarChart3 },
            ];
        }

        if (user?.role === 'Auditor') {
            return [
                { name: 'Command Center', path: '/auditor/mission-control', icon: LayoutDashboard },
                { name: 'Verification Queue', path: '/auditor/verification-queue', icon: ShieldCheck },
                { name: 'Reports', path: '/reports', icon: BarChart3 },
            ];
        }

        if (user?.role === 'Employee') {
            return [
                ...commonItems,
                { name: 'My Directives', path: '/employee-tasks', icon: CheckSquare },
                { name: 'Protocol Registry', path: '/regulations', icon: BookOpen },
                { name: 'Reports', path: '/reports', icon: BarChart3 },
            ];
        }


        return commonItems;
    };

    const menuItems = getMenuItems();

    // Determine if a path is active
    const isActivePath = (path) => {
        if (path === getDashboardPath()) {
            return location.pathname === path || location.pathname.includes('dashboard');
        }
        return location.pathname === path;
    };

    return (
        <aside className="fixed top-0 left-0 h-screen w-[280px] z-50 transition-all duration-300">
            {/* Ultra Glass Background */}
            <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-2xl border-r border-white/10 shadow-[20px_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
                {/* Ambient Glows */}
                <div className="absolute top-0 left-0 w-full h-96 bg-indigo-500/10 blur-[80px] rounded-full -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 right-0 w-full h-96 bg-blue-500/10 blur-[80px] rounded-full translate-x-1/2 translate-y-1/2" />

                <div className="flex flex-col h-full relative z-10">
                    {/* Brand Section */}
                    <div className="px-8 py-10">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-40 animate-pulse" />
                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center relative shadow-lg shadow-indigo-500/20">
                                    <Shield size={20} className="text-white" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white tracking-tight leading-none">
                                    NEXUS <span className="text-indigo-400">CORE</span>
                                </h1>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Compliance OS v2.0</p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 overflow-y-auto no-scrollbar space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActivePath(item.path);

                            return (
                                <Link
                                    key={item.name}
                                    to={item.path}
                                    className="group relative block"
                                >
                                    <div className={clsx(
                                        "relative flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 overflow-hidden",
                                        active ? "bg-white/10 shadow-lg shadow-black/10" : "hover:bg-white/5"
                                    )}>
                                        {/* Active Indicator Line */}
                                        {active && (
                                            <motion.div
                                                layoutId="activeIndicator"
                                                className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-500 rounded-r-full shadow-[0_0_10px_#6366f1]"
                                            />
                                        )}

                                        {/* Icon Container */}
                                        <div className={clsx(
                                            "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
                                            active
                                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                                                : "bg-slate-800/50 text-slate-400 group-hover:text-indigo-300 group-hover:bg-slate-800"
                                        )}>
                                            <Icon size={18} strokeWidth={active ? 2.5 : 2} />
                                        </div>

                                        {/* Label */}
                                        <span className={clsx(
                                            "font-bold text-sm tracking-wide transition-colors",
                                            active ? "text-white" : "text-slate-400 group-hover:text-white"
                                        )}>
                                            {item.name}
                                        </span>

                                        {/* Active Glow Effect */}
                                        {active && (
                                            <div className="absolute right-4 w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_#818cf8] animate-pulse" />
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile Section */}
                    <div className="p-4 mt-auto">
                        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md rounded-[1.5rem] p-5 border border-white/5 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500 opacity-50" />

                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold border-2 border-slate-600 group-hover:border-indigo-500 transition-colors">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-bold text-white text-sm truncate">{user?.name}</p>
                                    <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.1em] truncate">
                                        {user?.role === 'Admin' ? 'Compliance Officer' : user?.role}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-rose-500/20 hover:border-rose-500/40"
                            >
                                <LogOut size={14} />
                                Disconnect
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;

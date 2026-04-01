import { useState } from 'react';
import { Users, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AnalyticsDashboard from '../../components/admin/AnalyticsDashboard';
import UserManagement from '../../components/admin/UserManagement';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('analytics');

    const tabs = [
        { id: 'analytics', label: 'Analytics', icon: TrendingUp },
        { id: 'users', label: 'User Management', icon: Users },
    ];

    return (
        <div className="min-h-screen bg-[#020617] p-8 text-slate-100">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
            >
                <h1 className="text-5xl font-black tracking-tighter mb-2 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent uppercase">
                    Compliance Officer Command Center
                </h1>
                <p className="text-slate-400 font-medium tracking-wide">Orchestrate compliance operations and monitor network performance</p>
            </motion.div>

            {/* Tabs */}
            <div className="mb-10 inline-flex p-1 bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2rem]">
                <div className="flex gap-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center gap-3 py-4 px-8 transition-all rounded-[1.5rem] relative group
                                ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20'
                                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                                }
                            `}
                        >
                            <tab.icon size={20} className={activeTab === tab.id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                            <span className="font-black uppercase text-[10px] tracking-[0.2em]">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                >
                    {activeTab === 'analytics' && <AnalyticsDashboard />}
                    {activeTab === 'users' && <UserManagement />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;

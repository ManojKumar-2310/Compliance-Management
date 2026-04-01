import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Clock, XCircle, FileCheck, ShieldCheck, Activity, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Legend } from 'recharts';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: {
        y: 0,
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
};

const MissionControl = () => {
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        approvalRate: 0
    });
    const [loading, setLoading] = useState(true);
    const [distribution, setDistribution] = useState([0, 0, 0, 0, 0, 0, 0]);

    const fetchStats = useCallback(async () => {
        try {
            const { data } = await api.get('/tasks');
            const allTasks = data || [];
            
            const pending = allTasks.filter(t => t.status === 'Submitted').length;
            const approved = allTasks.filter(t => t.status === 'Approved').length;
            const rejected = allTasks.filter(t => t.status === 'Rejected').length;
            
            const totalReviewed = approved + rejected;
            const approvalRate = totalReviewed > 0 
                ? Math.round((approved / totalReviewed) * 100) 
                : 0;

            // Calculate real distribution (Mon-Sun)
            const weeklyData = [0, 0, 0, 0, 0, 0, 0];
            allTasks.forEach(task => {
                const date = task.completedAt || task.updatedAt;
                if (date && (task.status === 'Approved' || task.status === 'Rejected')) {
                    const day = new Date(date).getDay();
                    const adjustedDay = day === 0 ? 6 : day - 1;
                    weeklyData[adjustedDay] += 1;
                }
            });
            // Scale data for visualization (e.g., max height 100%)
            const maxVal = Math.max(...weeklyData, 1);
            const scaledDistribution = weeklyData.map(v => (v / maxVal) * 100);
            setDistribution(scaledDistribution);

            setStats({
                pending,
                approved,
                rejected,
                approvalRate
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Failed to load mission data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 gap-8">
                <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-1000 animate-pulse" />
                    <div className="relative">
                        <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-slate-900 dark:text-white font-black tracking-widest uppercase text-sm">Syncing Mission Control</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
            >
                <div>
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                            <Activity className="text-white" size={28} />
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                            Mission <span className="text-indigo-600">Control</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl">
                        Strategic overview of compliance operations and audit performance.
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 pr-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                        <Activity className="text-indigo-600" size={18} />
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Network Status</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tighter">Secure Link Active</p>
                    </div>
                </div>
            </motion.div>

            {/* Stats */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
            >
                {[
                    { label: 'Awaiting Review', value: stats.pending, icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
                    { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
                    { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-500/10' },
                    { label: 'Quality Score', value: `${stats.approvalRate}%`, icon: FileCheck, color: 'text-white', bg: 'bg-indigo-600', premium: true }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        variants={itemVariants}
                        className={clsx(
                            "relative overflow-hidden group p-8 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2",
                            stat.premium
                                ? "bg-indigo-600 text-white shadow-[0_20px_40px_rgba(79,70,229,0.3)]"
                                : "bg-white dark:bg-slate-900/50 border border-white/10 dark:border-slate-800 shadow-xl"
                        )}
                    >
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className={clsx(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                                    stat.premium ? "bg-white/20" : stat.bg
                                )}>
                                    <stat.icon size={24} className={stat.premium ? "text-white" : stat.color} />
                                </div>
                                <span className={clsx(
                                    "text-[10px] font-black uppercase tracking-[0.2em]",
                                    stat.premium ? "text-indigo-100" : "text-slate-400"
                                )}>
                                    {stat.label}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <p className={clsx(
                                    "text-5xl font-black tracking-tighter leading-none",
                                    stat.premium ? "text-white" : "text-slate-900 dark:text-white"
                                )}>
                                    {stat.value}
                                </p>
                                <div className={clsx(
                                    "h-1 w-12 rounded-full",
                                    stat.premium ? "bg-white/30" : "bg-indigo-500/20"
                                )} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
            
            {/* Audit Verification Analysis */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-slate-900/50 p-10 rounded-[3rem] border border-white/10 dark:border-slate-800 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="text-indigo-500" size={24} />
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Audit Verification Analysis</h3>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">Real-time status distribution of all compliance directives.</p>
                    </div>
                </div>

                <div className="h-[400px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={[
                                { name: 'Approved', value: stats.approved, color: '#10b981' },
                                { name: 'Rejected', value: stats.rejected, color: '#ef4444' },
                                { name: 'Awaiting', value: stats.pending, color: '#6366f1' }
                            ]}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                            barSize={60}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 900 }}
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 900 }}
                            />
                            <Tooltip
                                contentStyle={{ 
                                    backgroundColor: '#0f172a', 
                                    border: '1px solid #1e293b', 
                                    borderRadius: '1rem',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                }}
                                itemStyle={{ color: '#f8fafc', fontWeight: 800, textTransform: 'uppercase', fontSize: '10px' }}
                                cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                            />
                            <Bar dataKey="value" radius={[15, 15, 5, 5]}>
                                {[
                                    { color: '#10b981' },
                                    { color: '#ef4444' },
                                    { color: '#6366f1' }
                                ].map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {[
                        { label: 'Validated', count: stats.approved, color: 'bg-emerald-500' },
                        { label: 'Neutralized', count: stats.rejected, color: 'bg-rose-500' },
                        { label: 'In Queue', count: stats.pending, color: 'bg-indigo-500' }
                    ].map((item, idx) => (
                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={clsx("w-3 h-3 rounded-full shadow-lg shadow-black/20", item.color)} />
                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{item.label}</span>
                            </div>
                            <span className="text-xl font-black text-slate-900 dark:text-white">{item.count}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default MissionControl;

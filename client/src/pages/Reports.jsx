import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { FileText, Printer, TrendingUp, ShieldCheck, AlertCircle, Calendar, Download, PieChart as PieChartIcon, CheckCircle, Clock } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import clsx from 'clsx';
import toast from 'react-hot-toast';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const Reports = () => {
    const [stats, setStats] = useState(null);
    const [detailedStats, setDetailedStats] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            const [dashboardRes, detailedRes] = await Promise.all([
                api.get('/reports/dashboard'),
                api.get('/reports/detailed')
            ]);
            setStats(dashboardRes.data);
            setDetailedStats(detailedRes.data);
        } catch (error) {
            console.error('Error fetching intelligence:', error);
            // toast.error('Failed to load report data'); // Suppress error for now
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 gap-8">
            <div className="relative">
                <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin direction-reverse" />
                </div>
            </div>
            <p className="text-slate-900 dark:text-white font-black tracking-[0.2em] uppercase text-sm animate-pulse">Generating Intelligence Report...</p>
        </div>
    );

    const pieData = [
        { name: 'Pending', value: stats?.counts.tasks.pending || 0, color: '#6366f1' },
        { name: 'Overdue', value: stats?.counts.tasks.overdue || 0, color: '#f43f5e' },
        { name: 'Completed', value: stats?.counts.tasks.completed || 0, color: '#10b981' },
    ];

    const complianceData = [
        { name: 'Jan', score: 82 },
        { name: 'Feb', score: 85 },
        { name: 'Mar', score: 84 },
        { name: 'Apr', score: 88 },
        { name: 'May', score: 92 },
        { name: 'Jun', score: Math.round(stats?.compliancePercentage || 0) },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-10 transition-colors duration-300">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12"
            >
                <div>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                        Protocol <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Intelligence</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-300 font-medium mt-2 text-lg">Post-Audit organizational intelligence and compliance mapping.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handlePrint}
                        className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl font-bold border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                    >
                        <Printer size={18} />
                        Print PDF
                    </button>
                    <button
                        onClick={() => window.open(`${api.defaults.baseURL}/reports/export`, '_blank')}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                    >
                        <Download size={18} />
                        Export CSV
                    </button>
                </div>
            </motion.header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
                {[
                    { label: 'System Integrity', value: `${stats?.compliancePercentage || 0}%`, icon: TrendingUp, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
                    { label: 'Active Protocols', value: stats?.counts.regulations.active || 0, icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
                    { label: 'Critical Alerts', value: stats?.counts.tasks.overdue || 0, icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20' },
                    { label: 'Audits Executed', value: stats?.counts.audits.total || 0, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        variants={itemVariants}
                        className={clsx(
                            "relative overflow-hidden p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
                            "border-slate-100 dark:border-slate-800"
                        )}
                    >
                        <div className={`absolute top-0 right-0 p-8 opacity-10 ${stat.color}`}>
                            <stat.icon size={64} />
                        </div>
                        <div className="relative z-10">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <p className="text-4xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{stat.value}</p>
                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                            <PieChartIcon size={22} />
                        </div>
                        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">Task Distribution</h3>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-slate-600 dark:text-slate-300 font-bold ml-2 text-sm">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                            <TrendingUp size={22} />
                        </div>
                        <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm">Compliance Velocity</h3>
                    </div>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={complianceData}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                    }}
                                    itemStyle={{ color: '#fff' }}
                                    labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#6366f1"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <motion.div
                    variants={itemVariants}
                    className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="relative z-10">
                        <h4 className="text-2xl font-black mb-4 uppercase tracking-tight">Executive Summary</h4>
                        <p className="text-indigo-100 leading-relaxed font-medium text-lg max-w-3xl">
                            Based on the current telemetry, the organization's compliance posture is ranked as <span className="text-white underline decoration-wavy decoration-emerald-400 font-bold">Excellent</span>.
                            With a health score of <span className="text-white font-bold">{stats?.compliancePercentage || 0}%</span>, we recommend focusing on the {stats?.counts.tasks.overdue || 0} critical delays identified to maintain operational integrity.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-6">
                            <div className="p-5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                                <p className="text-3xl font-black">{stats?.counts.risks.high || 0}</p>
                                <p className="text-[10px] uppercase font-black text-indigo-200 tracking-widest mt-1">Active Risks</p>
                            </div>
                            <div className="p-5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10">
                                <p className="text-3xl font-black">{stats?.counts.audits.open || 0}</p>
                                <p className="text-[10px] uppercase font-black text-indigo-200 tracking-widest mt-1">Pending Audits</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800"
                >
                    <h4 className="text-xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">Regulation Health</h4>
                    <div className="space-y-6">
                        {detailedStats.slice(0, 4).map((reg) => (
                            <div key={reg._id} className="group">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                                    <span className="group-hover:text-indigo-500 transition-colors">{reg.title}</span>
                                    <span className={reg.stats.health > 80 ? "text-emerald-500" : "text-amber-500"}>{reg.stats.health}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${reg.stats.health}%` }}
                                        transition={{ duration: 1, delay: 0.2 }}
                                        className={`h-full rounded-full ${reg.stats.health > 80 ? "bg-emerald-500" : "bg-amber-500"}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <div className="mt-12">
                <h4 className="text-xl font-black text-slate-900 dark:text-white mb-8 px-4 flex items-center gap-3 uppercase tracking-tight">
                    <ShieldCheck className="text-indigo-500" />
                    Audit Insights & Remarks
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {detailedStats.map((reg) => (
                        <motion.div
                            key={reg._id}
                            variants={itemVariants}
                            className="p-8 rounded-[2rem] bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800/80 transition-all hover:shadow-lg group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <p className="text-[10px] uppercase font-black tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full">{reg.category}</p>
                                <div className={`w-2 h-2 rounded-full ${reg.stats.health > 80 ? "bg-emerald-500" : "bg-amber-500"}`} />
                            </div>
                            <h5 className="font-bold text-slate-900 dark:text-white mb-3 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{reg.title}</h5>
                            <div className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-700">
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">
                                    "{reg.latestRemarks}"
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Reports;

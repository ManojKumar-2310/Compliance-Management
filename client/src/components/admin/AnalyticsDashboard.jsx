import { BarChart3, Users, FileText, TrendingUp, AlertCircle, CheckCircle2, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../../api/axios';
import { format } from 'date-fns';

const AnalyticsDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeTasks: 0,
        completedTasks: 0,
        totalRegulations: 0,
        complianceScore: 0
    });
    const [trendData, setTrendData] = useState([]);
    const [departmentData, setDepartmentData] = useState([]);
    const [activityLog, setActivityLog] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [overviewRes, trendRes, departmentRes, activityRes] = await Promise.all([
                    api.get('/analytics/overview'),
                    api.get('/analytics/trend?days=30'),
                    api.get('/analytics/department-stats'),
                    api.get('/analytics/activity')
                ]);

                setStats(overviewRes.data.data || {
                    totalUsers: 0,
                    activeTasks: 0,
                    completedTasks: 0,
                    totalRegulations: 0,
                    complianceScore: 0
                });
                setTrendData(trendRes.data.data || []);
                setDepartmentData(departmentRes.data.data || []);
                setActivityLog(activityRes.data.data || []);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, []);

    const statCards = [
        {
            title: 'Total Users',
            value: stats.totalUsers,
            icon: Users,
            color: 'bg-blue-500',
            gradient: 'from-blue-500 to-blue-600',
            trend: '+12%',
            trendUp: true
        },
        {
            title: 'Active Tasks',
            value: stats.activeTasks,
            icon: FileText,
            color: 'bg-indigo-500',
            gradient: 'from-indigo-500 to-indigo-600',
            trend: '+5%',
            trendUp: true
        },
        {
            title: 'Completed Tasks',
            value: stats.completedTasks,
            icon: CheckCircle2,
            color: 'bg-green-500',
            gradient: 'from-green-500 to-emerald-600',
            trend: '+18%',
            trendUp: true
        },
        {
            title: 'Compliance Score',
            value: `${stats.complianceScore || 0}%`,
            icon: TrendingUp,
            color: 'bg-indigo-500',
            gradient: 'from-indigo-500 to-purple-600',
            trend: '+8%',
            trendUp: true
        }
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                        <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-muted rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-2"
                    >
                        <div className="p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-xl shadow-inner`}>
                                    <stat.icon className="text-white" size={28} />
                                </div>
                                <motion.span
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${stat.trendUp ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                        }`}>
                                    {stat.trend}
                                </motion.span>
                            </div>
                            <p className="text-[10px] text-slate-400 mb-2 font-black uppercase tracking-[0.2em]">{stat.title}</p>
                            <p className="text-4xl font-black text-white tracking-tighter">{stat.value}</p>
                        </div>
                        <div className={`h-1.5 bg-gradient-to-r ${stat.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Compliance Trend Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <TrendingUp className="text-indigo-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-widest text-white">Compliance Trend</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">30 Day Overview</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#94a3b8"
                                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                                    tickFormatter={(str) => format(new Date(str), 'MMM d')}
                                />
                                <YAxis stroke="#94a3b8" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff' }}
                                    itemStyle={{ color: '#818cf8' }}
                                    labelStyle={{ color: '#94a3b8', marginBottom: '0.5rem' }}
                                    labelFormatter={(label) => format(new Date(label), 'MMM d, yyyy')}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#818cf8"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorScore)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Department Performance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8"
                >
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                            <BarChart3 className="text-blue-400" size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-widest text-white">Department Performance</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Task Completion Rates</p>
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={departmentData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                                <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 10, fill: '#94a3b8' }} hide />
                                <YAxis
                                    dataKey="department"
                                    type="category"
                                    stroke="#94a3b8"
                                    width={100}
                                    tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#334155', opacity: 0.2 }}
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '1rem', color: '#fff' }}
                                />
                                <Bar dataKey="completionRate" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                                    {departmentData.map((entry, index) => (
                                        <cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'][index % 5]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>

            {/* Recent Activity */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-8"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                        <Activity className="text-purple-400" size={24} />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-widest text-white">Live Intelligence Feed</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activityLog.length === 0 ? (
                        <div className="col-span-full text-center py-8 text-slate-500 font-medium">No recent activity detected.</div>
                    ) : (
                        activityLog.map((log, idx) => (
                            <motion.div
                                key={log._id || idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.1 * idx }}
                                className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 flex items-start gap-3 hover:bg-slate-800/60 transition-colors"
                            >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 
                                    ${log.action.includes('CREATE') ? 'bg-emerald-500/20 text-emerald-400' :
                                        log.action.includes('DELETE') ? 'bg-rose-500/20 text-rose-400' :
                                            log.action.includes('UPDATE') ? 'bg-blue-500/20 text-blue-400' :
                                                'bg-slate-700 text-slate-400'}`}
                                >
                                    <FileText size={14} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-200 truncate">{log.details || log.action}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">{log.user?.name || 'System'}</span>
                                        <span className="text-[10px] text-slate-500">•</span>
                                        <span className="text-[10px] text-slate-500">{format(new Date(log.createdAt), 'h:mm a')}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default AnalyticsDashboard;

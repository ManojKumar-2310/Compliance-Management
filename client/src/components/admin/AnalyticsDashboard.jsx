import { BarChart3, Users, FileText, TrendingUp, AlertCircle, CheckCircle2, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
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
    const [activityLog, setActivityLog] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOverview = async () => {
            try {
                const { data } = await api.get('/analytics/overview');
                if (data?.data) {
                    setStats(data.data);
                }
            } catch (error) {
                console.error('Error fetching overview stats:', error);
                toast.error('Failed to load overview statistics');
            }
        };

        const fetchTrend = async () => {
            try {
                const { data } = await api.get('/analytics/trend?days=30');
                if (data?.data) {
                    setTrendData(data.data);
                }
            } catch (error) {
                console.error('Error fetching trend data:', error);
                toast.error('Failed to load trend data');
            }
        };

        const fetchActivity = async () => {
            try {
                const { data } = await api.get('/analytics/activity');
                if (data?.data) {
                    setActivityLog(data.data);
                }
            } catch (error) {
                console.error('Error fetching activity log:', error);
                toast.error('Failed to load activity log');
            }
        };

        const fetchAllData = async () => {
            setLoading(true);
            await Promise.all([fetchOverview(), fetchTrend(), fetchActivity()]);
            setLoading(false);
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
            title: 'Active Operations',
            value: stats.activeTasks,
            icon: FileText,
            color: 'bg-indigo-500',
            gradient: 'from-indigo-500 to-indigo-600',
            trend: '+5%',
            trendUp: true
        },
        {
            title: 'Completed Operations',
            value: stats.completedTasks,
            icon: CheckCircle2,
            color: 'bg-green-500',
            gradient: 'from-green-500 to-emerald-600',
            trend: '+18%',
            trendUp: true
        }
    ];

    if (loading) {
        return (
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 animate-pulse">
                            <div className="h-4 bg-slate-800 rounded w-1/2 mb-4"></div>
                            <div className="h-10 bg-slate-800 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
                <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 h-[500px] animate-pulse">
                    <div className="h-6 bg-slate-800 rounded w-1/4 mb-4"></div>
                </div>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#0f172a] border border-slate-800 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
                    <p className="text-xl font-black text-white">{payload[0].value}% <span className="text-[10px] text-emerald-400">Score</span></p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            {/* Main Analytics Graph */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-slate-800 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Activity className="text-blue-400" size={24} />
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Security Compliance Trend</h3>
                        </div>
                        <p className="text-slate-400 font-medium tracking-tight">Real-time optimization matrix monitoring network performance</p>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Average Score</p>
                            <p className="text-2xl font-black text-white">{stats.complianceScore}%</p>
                        </div>
                        <div className="h-10 w-px bg-slate-800" />
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Growth Rate</p>
                            <p className="text-2xl font-black text-emerald-400">+12.4%</p>
                        </div>
                    </div>
                </div>

                <div className="h-[400px] w-full relative z-10">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.5} />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                                tickFormatter={(val) => format(new Date(val), 'MMM dd')}
                                dy={15}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }}
                                domain={[0, 100]}
                                tickFormatter={(val) => `${val}%`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="score"
                                stroke="#3b82f6"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorScore)"
                                animationDuration={2000}
                                animationBegin={500}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
};

export default AnalyticsDashboard;

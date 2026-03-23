import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, FileText, TrendingUp, LayoutGrid, List as ListIcon, Activity } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import KanbanBoard from '../../components/tasks/KanbanBoard';
import clsx from 'clsx';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
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

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        complianceScore: 0
    });
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('kanban');

    useEffect(() => {
        fetchMyTasks();
    }, []);

    const fetchMyTasks = async () => {
        try {
            const { data } = await api.get('/tasks');
            const myTasks = data || [];
            setTasks(myTasks);

            const total = myTasks.length;
            const pending = myTasks.filter(t => t.status === 'Pending').length;
            const inProgress = myTasks.filter(t => t.status === 'In Progress').length;
            const completed = myTasks.filter(t => ['Approved', 'Completed', 'Submitted'].includes(t.status)).length;
            const complianceScore = total > 0 ? Math.round((completed / total) * 100) : 0;

            setStats({ total, pending, inProgress, completed, complianceScore });
        } catch (error) {
            console.error('Error fetching tasks:', error);
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            await api.put(`/tasks/${taskId}`, { status: newStatus });
            toast.success(`Task status updated to ${newStatus}`);
            fetchMyTasks();
        } catch (error) {
            console.error('Error updating task:', error);
            toast.error('Failed to update task status');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 gap-8">
                <div className="relative group">
                    <div className="absolute -inset-8 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-blue-500/30 rounded-full blur-3xl animate-pulse-glow" />
                    <div className="relative">
                        <div className="w-24 h-24 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin shadow-2xl" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-purple-500/10 border-b-purple-500 rounded-full animate-spin direction-reverse" />
                        </div>
                    </div>
                </div>
                <div className="text-center space-y-3">
                    <p className="text-slate-900 dark:text-white font-black tracking-[0.4em] uppercase text-xs animate-pulse">Initializing Command Center</p>
                    <div className="flex gap-1 justify-center">
                        {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: `${i * 0.1}s` }} />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-12 relative overflow-hidden"
        >
            {/* Ambient Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full translate-y-1/3 -translate-x-1/4" />

            {/* Header Section */}
            <header className="relative z-10 mb-16 flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <span className="h-0.5 w-12 bg-indigo-600 rounded-full" />
                        <span className="text-xs font-black uppercase tracking-[0.4em] text-indigo-600 dark:text-indigo-400">Personnel Operations</span>
                    </div>
                    <h1 className="text-6xl lg:text-8xl font-black tracking-tighter mb-4 text-slate-900 dark:text-white leading-[0.9]">
                        Mission <span className="text-gradient-mission">Intelligence</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed max-w-2xl border-l-2 border-slate-200 dark:border-slate-800 pl-6">
                        Real-time protocol synchronization and compliance telemetry. Welcome back, <span className="text-slate-900 dark:text-white font-bold">{user?.name}</span>.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex items-center gap-6 glass-panel dark:bg-slate-900/40 p-4 px-8 rounded-[2rem] border border-white/20 dark:border-slate-800 shadow-2xl relative group overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30 group-hover:rotate-12 transition-transform">
                            <Activity size={28} />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900 animate-pulse" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Status: Operational</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{user?.designation || 'Specialist'}</p>
                    </div>
                </motion.div>
            </header>

            {/* Stats Visualization */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-20"
            >
                {[
                    { label: 'Assigned Protocols', value: stats.total, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-500/5' },
                    { label: 'Awaiting Action', value: stats.pending, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/5' },
                    { label: 'Live Executions', value: stats.inProgress, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/5' },
                    { label: 'Verified Complete', value: stats.completed, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
                    { label: 'Operational Efficiency', value: `${stats.complianceScore}%`, icon: Activity, color: 'text-white', bg: 'bg-indigo-600', premium: true }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        variants={itemVariants}
                        className={clsx(
                            "relative overflow-hidden group p-10 rounded-[3rem] transition-all duration-700 hover:-translate-y-3",
                            stat.premium
                                ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40 border border-white/20"
                                : "mission-card"
                        )}
                    >
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className={clsx(
                                    "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 group-hover:scale-110 mission-stat-glow",
                                    stat.premium ? "bg-white/20" : stat.bg
                                )}>
                                    <stat.icon size={28} className={stat.premium ? "text-white" : stat.color} />
                                </div>
                                <span className={clsx(
                                    "text-[10px] font-black uppercase tracking-[0.3em]",
                                    stat.premium ? "text-indigo-100" : "text-slate-400"
                                )}>
                                    {stat.label.split(' ')[0]}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <p className={clsx(
                                    "text-6xl font-black tracking-tighter leading-none mb-2",
                                    stat.premium ? "text-white" : "text-slate-900 dark:text-white"
                                )}>
                                    {stat.value}
                                </p>
                                <p className={clsx(
                                    "text-[11px] font-bold uppercase tracking-widest",
                                    stat.premium ? "text-indigo-200" : "text-slate-400"
                                )}>
                                    {stat.label}
                                </p>
                                <div className={clsx(
                                    "h-1 w-12 rounded-full transition-all duration-1000 group-hover:w-full",
                                    stat.premium ? "bg-white/40" : "bg-indigo-500/20"
                                )} />
                            </div>
                        </div>
                        {/* Interactive Background Elements */}
                        {!stat.premium && (
                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-500/10 transition-colors" />
                        )}
                    </motion.div>
                ))}
            </motion.div>

            {/* Action Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-2 h-10 bg-indigo-600 rounded-full" />
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none mb-1">Mission Log</h2>
                        <p className="text-xs font-heavy text-slate-400 uppercase tracking-[0.2em]">Active Workflow Stream</p>
                    </div>
                </div>

                <div className="flex gap-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl rounded-[1.5rem] p-2 border border-white/20 dark:border-slate-800 shadow-xl">
                    <button
                        onClick={() => setViewMode('kanban')}
                        className={clsx(
                            "flex items-center gap-3 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500",
                            viewMode === 'kanban'
                                ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40"
                                : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                    >
                        <LayoutGrid size={16} /> Dashboard
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={clsx(
                            "flex items-center gap-3 px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-500",
                            viewMode === 'list'
                                ? "bg-indigo-600 text-white shadow-2xl shadow-indigo-500/40"
                                : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                    >
                        <ListIcon size={16} /> Registry
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="relative z-10"
            >
                {viewMode === 'kanban' ? (
                    <div className="glass-panel dark:bg-slate-900/60 rounded-[4rem] p-12 border border-white/20 dark:border-slate-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-600/50 to-transparent" />
                        <KanbanBoard tasks={tasks} onTaskUpdate={fetchMyTasks} />
                    </div>
                ) : (
                    <div className="grid gap-8">
                        <AnimatePresence mode="popLayout">
                            {tasks.map((task, idx) => (
                                <motion.div
                                    key={task._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6, delay: idx * 0.05 }}
                                    className="group relative"
                                >
                                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-[3.5rem] blur opacity-0 group-hover:opacity-10 transition duration-1000 group-hover:duration-200" />
                                    <div className="relative p-10 rounded-[3rem] bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/20 dark:border-slate-800/50 shadow-2xl transition-all duration-700 hover:-translate-y-2">
                                        <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-10">
                                            <div className="flex-1 space-y-6">
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <span className={clsx(
                                                        "px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-lg",
                                                        task.priority === 'High'
                                                            ? "bg-rose-500 text-white shadow-rose-500/20"
                                                            : "bg-indigo-600 text-white shadow-indigo-500/20"
                                                    )}>
                                                        {task.priority} Priority
                                                    </span>
                                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter decoration-indigo-500/30 decoration-4 underline-offset-8">
                                                        {task.title}
                                                    </h3>
                                                </div>
                                                <p className="text-slate-500 dark:text-slate-400 font-medium text-xl leading-relaxed max-w-4xl">{task.description}</p>

                                                <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={14} className="text-indigo-500" />
                                                        Deadline: <span className="text-slate-900 dark:text-white font-black">{new Date(task.dueDate).toLocaleDateString()}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Activity size={14} className="text-blue-500" />
                                                        Ref: <span className="text-slate-900 dark:text-white">{task._id.slice(-8).toUpperCase()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 xl:min-w-[300px] justify-end">
                                                {task.status === 'Pending' && (
                                                    <button
                                                        onClick={() => handleStatusChange(task._id, 'In Progress')}
                                                        className="group/btn relative px-10 py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-indigo-500/40 transition-all hover:-translate-y-2 active:scale-95 overflow-hidden"
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 font-black" />
                                                        <span className="relative z-10 flex items-center gap-3">
                                                            Initialize Protocol <Activity size={18} className="animate-pulse" />
                                                        </span>
                                                    </button>
                                                )}
                                                {task.status === 'In Progress' && (
                                                    <button
                                                        onClick={() => handleStatusChange(task._id, 'Submitted')}
                                                        className="px-10 py-6 bg-emerald-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-emerald-500/40 transition-all hover:-translate-y-2 active:scale-95 flex items-center gap-3"
                                                    >
                                                        Transmit Evidence <FileText size={18} />
                                                    </button>
                                                )}
                                                {task.status === 'Submitted' && (
                                                    <div className="px-10 py-6 bg-slate-100 dark:bg-slate-800/80 text-slate-400 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                                                        <div className="flex gap-1.5">
                                                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                                                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                        </div>
                                                        Syncing Data
                                                    </div>
                                                )}
                                                {task.status === 'Approved' && (
                                                    <div className="px-10 py-6 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-3 shadow-lg shadow-emerald-500/10">
                                                        <CheckCircle size={18} /> Verified
                                                    </div>
                                                )}
                                                {task.status === 'Rejected' && (
                                                    <div className="px-10 py-6 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] border border-rose-100 dark:border-rose-500/20 flex items-center gap-3">
                                                        <Activity size={18} /> Revision Required
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};


export default EmployeeDashboard;


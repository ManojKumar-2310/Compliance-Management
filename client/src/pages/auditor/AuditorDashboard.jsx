import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Clock, XCircle, AlertTriangle, FileCheck, ShieldCheck, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

const AuditorDashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({
        pending: 0,
        approved: 0,
        rejected: 0,
        approvalRate: 0
    });
    const [loading, setLoading] = useState(true);
    const [remarks, setRemarks] = useState({});

    const fetchAuditQueue = useCallback(async () => {
        try {
            const { data } = await api.get('/tasks?status=Submitted');
            const queue = data || [];
            setTasks(queue);

            // Mock stats for a global feel (can be replaced with real endpoints)
            setStats(prev => ({
                ...prev,
                pending: queue.length,
                approved: 124, // Mock
                rejected: 12,  // Mock
                approvalRate: 91
            }));
        } catch (error) {
            console.error('Error fetching audit queue:', error);
            toast.error('Failed to load audit queue');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAuditQueue();
    }, [fetchAuditQueue]);

    const handleReview = async (taskId, status) => {
        try {
            const note = remarks[taskId] || '';
            await api.put(`/tasks/${taskId}`, {
                status: status,
                auditFeedback: { remarks: note }
            });
            toast.success(`Protocol ${status.toLowerCase()} successfully`);
            setRemarks(prev => {
                const updated = { ...prev };
                delete updated[taskId];
                return updated;
            });
            fetchAuditQueue();
        } catch (error) {
            console.error('Error reviewing task:', error);
            toast.error('Verification protocol failed');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 gap-8">
                <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-1000 animate-pulse" />
                    <div className="relative">
                        <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin direction-reverse" />
                        </div>
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <p className="text-slate-900 dark:text-white font-black tracking-[0.2em] uppercase text-sm">Synchronizing Registry</p>
                    <p className="text-slate-400 font-medium text-xs">Accessing immutable audit logs...</p>
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
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
            >
                <div>
                    <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none">
                            <ShieldCheck className="text-white" size={28} />
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                            Audit <span className="text-gradient">Control</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl leading-relaxed">
                        Precision verification gateway for organizational regulatory standards.
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
                                ? "bg-indigo-600 text-white shadow-[0_20px_40px_rgba(79,70,229,0.3)] dark:shadow-none"
                                : "glass-panel dark:bg-slate-900/50 border border-white/10 dark:border-slate-800 shadow-xl"
                        )}
                    >
                        {!stat.premium && (
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors duration-500" />
                        )}

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-6">
                                <div className={clsx(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 shadow-inner",
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
                                    "h-1 w-12 rounded-full transition-all duration-700 group-hover:w-20",
                                    stat.premium ? "bg-white/30" : "bg-indigo-500/20"
                                )} />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Task Queue */}
            <div className="relative">
                {/* Decorative background element */}
                <div className="absolute -left-20 top-20 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="glass-panel dark:bg-slate-900/50 rounded-[3rem] p-10 border border-white/10 dark:border-slate-800 shadow-2xl relative z-10 overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4 tracking-tight">
                                Verification Queue
                                {tasks.length > 0 && (
                                    <span className="bg-indigo-600 text-white text-[10px] px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                                        {tasks.length} Action Required
                                    </span>
                                )}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Pending protocol confirmations and evidence review.</p>
                        </div>

                        <div className="flex gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                            <button className="px-4 py-2 bg-white dark:bg-slate-700 shadow-sm rounded-lg text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">All Nodes</button>
                            <button className="px-4 py-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-xs font-black uppercase tracking-widest text-slate-400 transition-all">Critical Only</button>
                        </div>
                    </div>

                    <AnimatePresence mode="popLayout">
                        {tasks.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-24 bg-slate-50/50 dark:bg-slate-800/30 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800"
                            >
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                                    <ShieldCheck size={40} className="text-emerald-500" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">Protocols Synchronized</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">All submissions have been successfully processed.</p>
                            </motion.div>
                        ) : (
                            <div className="grid gap-6">
                                {tasks.map((task) => (
                                    <motion.div
                                        key={task._id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                        className="p-8 rounded-[2.5rem] glass-card-hover border border-slate-100 dark:border-slate-800/50 bg-white/50 dark:bg-slate-800/20 group relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="flex flex-col xl:flex-row justify-between items-start gap-10">
                                            <div className="flex-1 space-y-6">
                                                <div>
                                                    <div className="flex items-center gap-4 mb-3">
                                                        <h3 className="font-black text-2xl text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors tracking-tight">
                                                            {task.title}
                                                        </h3>
                                                        <div className={clsx(
                                                            "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm",
                                                            task.priority === 'High'
                                                                ? "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                                                                : "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                                                        )}>
                                                            {task.priority} Priority
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">{task.description}</p>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-8">
                                                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-black">
                                                            {task.assignedTo?.name?.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Assignee</p>
                                                            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tighter">{task.assignedTo?.name}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                                                            <Clock size={16} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Submission Date</p>
                                                            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tighter">{new Date(task.dueDate).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>

                                                    {task.evidence && (
                                                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100">
                                                            Extract Evidence <ChevronRight size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="w-full xl:w-[400px] space-y-6">
                                                <div className="relative group/text">
                                                    <textarea
                                                        placeholder="Verification remarks / Audit notes..."
                                                        className="w-full p-6 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-[2rem] text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 min-h-[120px] resize-none"
                                                        value={remarks[task._id] || ''}
                                                        onChange={(e) => setRemarks({ ...remarks, [task._id]: e.target.value })}
                                                    />
                                                    <div className="absolute bottom-4 right-4 text-[10px] font-black text-slate-300 group-focus-within/text:text-indigo-400 uppercase tracking-widest">Secured Input</div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <button
                                                        onClick={() => handleReview(task._id, 'Approved')}
                                                        className="flex-1 bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-500 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl shadow-indigo-200 dark:shadow-none transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                                                    >
                                                        <CheckCircle size={14} />
                                                        Verify Protocol
                                                    </button>
                                                    <button
                                                        onClick={() => handleReview(task._id, 'Rejected')}
                                                        className="px-8 bg-slate-50 dark:bg-slate-800 text-slate-400 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default AuditorDashboard;



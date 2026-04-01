import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, Clock, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const VerificationQueue = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [remarks, setRemarks] = useState({});

    const [showReport, setShowReport] = useState(false);
    const [activeReport, setActiveReport] = useState(null);
    const { user: auditor } = api.defaults.headers.common['Authorization'] ? { user: { name: 'Auditor' } } : { user: null }; // Fallback handle

    const fetchAuditQueue = useCallback(async () => {
        try {
            const { data } = await api.get('/tasks?status=Submitted');
            setTasks(data || []);
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
            const task = tasks.find(t => t._id === taskId);
            const note = remarks[taskId] || '';
            
            await api.put(`/tasks/${taskId}`, {
                status: status,
                auditFeedback: { remarks: note }
            });
            
            // Prepare the report data before clearing the queue
            setActiveReport({
                employee: task.assignedTo?.name || 'Unknown Personnel',
                department: task.assignedTo?.department || 'N/A',
                taskTitle: task.title,
                taskDescription: task.description,
                status: status,
                remarks: note || 'No additional remarks provided.',
                auditor: 'Auditor', // Since we don't have user name directly here easily without useAuth hook, we use generic or can pull from state
                timestamp: new Date().toLocaleString()
            });
            setShowReport(true);

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
                <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <p className="text-slate-900 dark:text-white font-black tracking-widest uppercase text-sm">Accessing Audit Queue</p>
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
                            <ShieldCheck className="text-white" size={28} />
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                            Verification <span className="text-indigo-600">Queue</span>
                        </h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl leading-relaxed">
                        Pending protocol confirmations and evidence review.
                    </p>
                </div>

                <div className="flex gap-2 p-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <button className="px-4 py-2 bg-white dark:bg-slate-700 shadow-sm rounded-lg text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">All Nodes</button>
                    <button className="px-4 py-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-xs font-black uppercase tracking-widest text-slate-400 transition-all">Critical Only</button>
                </div>
            </motion.div>

            {/* Task Queue Content */}
            <div className="relative">
                <div className="glass-panel dark:bg-slate-900/50 rounded-[3rem] p-10 border border-white/10 dark:border-slate-800 shadow-2xl relative z-10 overflow-hidden">
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
                                        className="p-8 rounded-[2.5rem] glass-card-hover border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-800/20 group relative overflow-hidden"
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
                                                        className="flex-1 bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-500 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                                                    >
                                                        <CheckCircle size={14} />
                                                        Verify Protocol
                                                    </button>
                                                    <button
                                                        onClick={() => handleReview(task._id, 'Rejected')}
                                                        className="px-8 bg-slate-50 dark:bg-slate-800 text-slate-400 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95"
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

            {/* Verification Report Modal */}
            <AnimatePresence>
                {showReport && activeReport && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden relative"
                        >
                            {/* Decorative Header */}
                            <div className="bg-indigo-600 p-8 text-white relative">
                                <div className="absolute top-0 right-0 p-8 opacity-20">
                                    <ShieldCheck size={120} />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-indigo-200">Official Protocol Document</p>
                                    <h2 className="text-3xl font-black uppercase tracking-tight">Audit Verification <span className="text-indigo-200 text-badge ml-2 px-3 py-1 bg-white/20 rounded-full text-sm align-middle">CERTIFIED</span></h2>
                                </div>
                            </div>

                            <div className="p-10 space-y-10">
                                {/* Report Grid */}
                                <div className="grid grid-cols-2 gap-10">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Personnel Identifier</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-black text-xs">
                                                {activeReport.employee.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{activeReport.employee}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{activeReport.department}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Audit Timestamp</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{activeReport.timestamp}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Compliance Directive</p>
                                    <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 mb-2 tracking-tight uppercase">{activeReport.taskTitle}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{activeReport.taskDescription}</p>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Verification Outcome</p>
                                    <div className="flex items-start gap-4">
                                        <div className={clsx(
                                            "px-4 py-2 rounded-xl border font-black uppercase text-xs tracking-widest",
                                            activeReport.status === 'Approved' 
                                                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                                                : "bg-rose-500/10 border-rose-500/20 text-rose-500"
                                        )}>
                                            {activeReport.status}
                                        </div>
                                        <div className="flex-1 p-5 bg-slate-900/5 dark:bg-slate-950/40 rounded-2xl border-l-4 border-indigo-500">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Auditor Remarks</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 italic tracking-tight">"{activeReport.remarks}"</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <div className="text-center">
                                        <div className="w-32 h-1 bg-slate-200 dark:bg-slate-800 mb-2 mx-auto" />
                                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Digital Identity Signature</p>
                                    </div>
                                    <button
                                        onClick={() => setShowReport(false)}
                                        className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-all shadow-xl active:scale-95"
                                    >
                                        Acknowledge and Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VerificationQueue;

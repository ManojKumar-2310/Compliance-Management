import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import { Check, Clock, FileText, ShieldAlert, AlertTriangle, Play, UploadCloud, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import useAuth from '../hooks/useAuth';
import RecordEvidenceModal from '../components/RecordEvidenceModal';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const EmployeeTasks = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showEvidenceModal, setShowEvidenceModal] = useState(false);
    const [evidenceTarget, setEvidenceTarget] = useState({ id: '', title: '' });

    const fetchData = async () => {
        try {
            const { data } = await api.get('/tasks');
            setTasks(data);
        } catch (error) {
            console.error('Error fetching employee tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/tasks/${id}`, { status });
            fetchData();
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleEvidenceSuccess = async (doc) => {
        try {
            if (doc.relatedEntity === 'Task' && doc.relatedId) {
                await api.put(`/tasks/${doc.relatedId}`, {
                    evidence: doc._id,
                    status: 'In Progress'
                });
            }
            fetchData();
        } catch (error) {
            console.error('Error linking evidence:', error);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 gap-8">
            <div className="relative">
                <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin direction-reverse" />
                </div>
            </div>
            <p className="text-slate-900 dark:text-white font-black tracking-[0.2em] uppercase text-sm animate-pulse">Syncing Mission Data...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-10 transition-colors duration-300">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
            >
                <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase mb-2">
                    Mission <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">Control</span>
                </h2>
                <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6" />
                <p className="text-slate-500 dark:text-slate-400 font-medium text-lg max-w-2xl leading-relaxed">
                    Execute assigned compliance protocols. Upload evidence to validate operational integrity and maintain audit readiness.
                </p>
            </motion.header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                <AnimatePresence>
                    {tasks.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="col-span-full flex flex-col items-center justify-center p-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] bg-slate-50/50 dark:bg-slate-900/50 text-center"
                        >
                            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-6 text-emerald-500">
                                <CheckCircle2 size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">All Systems Operational</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md">No pending tasks in your queue. You are fully compliant.</p>
                        </motion.div>
                    ) : (
                        tasks.map(task => (
                            <motion.div
                                key={task._id}
                                variants={itemVariants}
                                layout
                                className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col h-full overflow-hidden"
                            >
                                {/* Priority Indicator Stripe */}
                                <div className={clsx(
                                    "absolute top-0 left-0 w-full h-2",
                                    task.priority === 'High' ? 'bg-rose-500' :
                                        task.priority === 'Medium' ? 'bg-amber-500' :
                                            'bg-blue-500'
                                )} />

                                <div className="flex justify-between items-start mb-6">
                                    <span className={clsx(
                                        'px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border',
                                        task.priority === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800' :
                                            task.priority === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800' :
                                                'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                                    )}>
                                        {task.priority} Priority
                                    </span>
                                    {task.status === 'Approved' && (
                                        <div className="bg-emerald-500 text-white p-1.5 rounded-full shadow-lg shadow-emerald-500/30">
                                            <Check size={16} strokeWidth={4} />
                                        </div>
                                    )}
                                </div>

                                <div className="mb-6">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight uppercase tracking-tight">
                                        {task.title}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium line-clamp-3">
                                        {task.description}
                                    </p>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 space-y-4 mb-8 border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                            <ShieldAlert size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Protocol</p>
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{task.regulationId?.title || 'General Compliance'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg text-rose-600 dark:text-rose-400">
                                            <Clock size={14} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Deadline</p>
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto space-y-3">
                                    {['Pending', 'Rejected', 'Overdue'].includes(task.status) && (
                                        <button
                                            onClick={() => handleStatusUpdate(task._id, 'In Progress')}
                                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 hover:scale-[1.02] flex items-center justify-center gap-2 group/btn"
                                        >
                                            <Play size={18} fill="currentColor" className="group-hover/btn:translate-x-1 transition-transform" />
                                            Initialize Protocol
                                        </button>
                                    )}

                                    <button
                                        onClick={() => {
                                            setEvidenceTarget({ id: task._id, title: task.title });
                                            setShowEvidenceModal(true);
                                        }}
                                        className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 group/btn"
                                    >
                                        <UploadCloud size={18} className="group-hover/btn:-translate-y-1 transition-transform" />
                                        Upload Evidence
                                    </button>

                                    {task.status !== 'Completed' && task.status !== 'Approved' && (
                                        <button
                                            onClick={() => handleStatusUpdate(task._id, 'Submitted')}
                                            className="w-full py-4 bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800 rounded-2xl font-bold hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all flex items-center justify-center gap-2"
                                        >
                                            <Check size={18} />
                                            Submit for Verification
                                        </button>
                                    )}

                                    {task.status === 'Approved' && (
                                        <div className="w-full py-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-2xl font-black text-center border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-2 uppercase tracking-wide text-sm">
                                            <CheckCircle2 size={18} /> Verified
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </motion.div>

            <RecordEvidenceModal
                isOpen={showEvidenceModal}
                onClose={() => setShowEvidenceModal(false)}
                onSuccess={handleEvidenceSuccess}
                initialEntity="Task"
                initialId={evidenceTarget.id}
                predefinedTitle={evidenceTarget.title}
            />
        </div>
    );
};

export default EmployeeTasks;

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import { Plus, Check, Clock, ShieldAlert, FileText, User, Calendar, AlertTriangle, ArrowRight, LayoutGrid, List, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
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

const Tasks = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [regulations, setRegulations] = useState([]);
    const [users, setUsers] = useState([]);
    const [showEvidenceModal, setShowEvidenceModal] = useState(false);
    const [evidenceTarget, setEvidenceTarget] = useState({ id: '', title: '' });
    const [editingTask, setEditingTask] = useState(null);

    const [formData, setFormData] = useState({
        title: '', description: '', regulationId: '', assignedTo: '', dueDate: '', priority: 'Medium'
    });

    const fetchData = async () => {
        try {
            const [tasksRes, regsRes, usersRes] = await Promise.all([
                api.get('/tasks'),
                api.get('/regulations'),
                (user.role === 'Admin' || user.role === 'Compliance Officer') ? api.get('/users') : Promise.resolve({ data: [] })
            ]);
            setTasks(tasksRes.data);
            setRegulations(regsRes.data);
            if (usersRes.data) setUsers(usersRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTask) {
                await api.put(`/tasks/${editingTask._id}`, formData);
            } else {
                await api.post('/tasks', formData);
            }
            setShowModal(false);
            setEditingTask(null);
            setFormData({ title: '', description: '', regulationId: '', assignedTo: '', dueDate: '', priority: 'Medium' });
            fetchData();
        } catch (error) {
            alert('Error saving task');
        }
    }

    const handleOpenEdit = (task) => {
        setEditingTask(task);
        setFormData({
            title: task.title,
            description: task.description,
            regulationId: task.regulationId?._id || '',
            assignedTo: task.assignedTo?._id || '',
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
            priority: task.priority
        });
        setShowModal(true);
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
            console.error('Error linking integrity evidence:', error);
        }
    };

    const handleDelete = async (taskId) => {
        if (!window.confirm('Are you sure you want to decommission this directive? This action is irreversible.')) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting task:', error);
            alert('Security protocol failure: Could not delete directive');
        }
    };

    const canCreate = ['Compliance Officer', 'Admin'].includes(user?.role);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 gap-8">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-blue-500/20 border-b-blue-500 rounded-full animate-spin direction-reverse" />
                </div>
            </div>
            <p className="text-slate-900 dark:text-white font-black tracking-[0.3em] uppercase text-xs animate-pulse">Initializing Directives...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-10 transition-colors duration-300">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16"
            >
                <div className="max-w-3xl">
                    <h2 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9] mb-4">
                        Mission <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Directives</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed border-l-4 border-indigo-500 pl-6">
                        {user.role === 'Compliance Officer' ? 'Define and monitor regulatory adherence protocols.' :
                            user.role === 'Admin' ? 'Strategic delegation of operational responsibilities.' :
                                'Oversee operational delegation and task assignment.'}
                    </p>
                </div>
                {canCreate && (
                    <button
                        onClick={() => {
                            setEditingTask(null);
                            setFormData({ title: '', description: '', regulationId: '', assignedTo: '', dueDate: '', priority: 'Medium' });
                            setShowModal(true);
                        }}
                        className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black shadow-2xl shadow-slate-900/20 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95 group"
                    >
                        <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                        <span className="uppercase tracking-widest text-xs hidden sm:inline">Initialize Directive</span>
                    </button>
                )}
            </motion.header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {tasks.filter(t => {
                    if (user.role === 'Compliance Officer' || user.role === 'Admin') return true;
                    return t.assignedTo?._id === user._id;
                }).length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="col-span-full text-center py-32 bg-slate-50/50 dark:bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-inner"
                    >
                        <div className="w-24 h-24 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl">
                            <ShieldAlert size={48} className="text-indigo-500" />
                        </div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter">No Active Directives</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Your mission log is currently clear. Initialize a new directive to proceed.</p>
                    </motion.div>
                ) : tasks.filter(t => {
                    if (user.role === 'Compliance Officer' || user.role === 'Admin') return true;
                    return t.assignedTo?._id === user._id;
                }).map(task => (
                    <motion.div
                        key={task._id}
                        variants={itemVariants}
                        layout
                        className="group relative bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl dark:hover:shadow-indigo-500/10 border border-slate-100 dark:border-slate-800 transition-all duration-500 flex flex-col h-full overflow-hidden"
                    >
                        <div className={clsx(
                            "absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none",
                            task.priority === 'High' ? 'bg-rose-500/20' :
                                task.priority === 'Medium' ? 'bg-indigo-500/20' :
                                    'bg-blue-500/20'
                        )} />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <span className={clsx(
                                    'px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-sm border',
                                    task.priority === 'High' ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800' :
                                        task.priority === 'Medium' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800' :
                                            'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                                )}>
                                    {task.priority} Priority
                                </span>
                                <span className={clsx(
                                    'text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border',
                                    task.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' :
                                        task.status === 'Overdue' ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800' :
                                            'bg-slate-50 text-slate-400 border-slate-100 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'
                                )}>
                                    {task.status}
                                </span>
                                {(user.role === 'Admin' || user.role === 'Compliance Officer') && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(task._id);
                                        }}
                                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                        title="Delete Directive"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight leading-none">
                                {task.title}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 flex-1 font-medium leading-relaxed line-clamp-3">
                                {task.description}
                            </p>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] p-6 space-y-4 mb-8 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm">
                                        <ShieldAlert size={14} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Protocol</p>
                                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{task.regulationId?.title || 'General'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm">
                                        <User size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Agent</p>
                                        <p className={clsx("text-xs font-bold", !task.assignedTo ? "text-rose-500" : "text-slate-700 dark:text-slate-300")}>
                                            {task.assignedTo?.name || 'Unassigned'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm">
                                        <Calendar size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Target Date</p>
                                        <p className={clsx('text-xs font-bold', task.status === 'Overdue' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300')}>
                                            {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {(user.role === 'Admin' || user.role === 'Compliance Officer') && (
                                <button
                                    onClick={() => handleOpenEdit(task)}
                                    className="w-full py-4 bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-500 text-white rounded-[1.25rem] font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 group/btn"
                                >
                                    {task.assignedTo ? 'Modify Parameters' : 'Deploy Agent'}
                                    <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    >
                        <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 30 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 30 }}
                            className="bg-white dark:bg-slate-900 rounded-[3rem] max-w-lg w-full p-10 relative shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter uppercase relative z-10">
                                {editingTask ? 'Modify Directive' : 'Initialize Directive'}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-8 relative z-10 border-l-2 border-indigo-500 pl-4">Define operational parameters for mission execution.</p>

                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Directive Title</label>
                                    <input required className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[1.5rem] transition-all text-sm font-black text-slate-900 dark:text-white" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Scope</label>
                                    <textarea rows={2} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[1.5rem] transition-all text-sm font-medium resize-none text-slate-900 dark:text-white" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Link</label>
                                        <select required className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[1.5rem] transition-all text-sm font-bold appearance-none text-slate-900 dark:text-white cursor-pointer" value={formData.regulationId} onChange={e => setFormData({ ...formData, regulationId: e.target.value })}>
                                            <option value="">Select Reference</option>
                                            {regulations.map(r => <option key={r._id} value={r._id}>{r.title}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Agent</label>
                                        <select required className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[1.5rem] transition-all text-sm font-bold appearance-none text-slate-900 dark:text-white cursor-pointer" value={formData.assignedTo} onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}>
                                            <option value="">Select Agent</option>
                                            {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Date</label>
                                        <input required type="date" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[1.5rem] transition-all text-sm font-bold text-slate-900 dark:text-white" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Urgency Level</label>
                                        <select className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[1.5rem] transition-all text-sm font-bold appearance-none text-slate-900 dark:text-white cursor-pointer" value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                                            <option value="Low">Low Priority</option>
                                            <option value="Medium">Medium Priority</option>
                                            <option value="High">Critical Priority</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl font-bold text-slate-500 dark:text-slate-400 transition-colors uppercase text-xs tracking-wider">Cancel</button>
                                    <button type="submit" className="px-10 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all font-black uppercase text-xs tracking-wider flex items-center gap-2">
                                        <Plus size={16} />
                                        Confirm
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
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

export default Tasks;

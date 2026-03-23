import { useState, useEffect } from 'react';
import api from '../api/axios';
import { ClipboardCheck, Calendar, Search, AlertCircle, Plus, X, User, Activity, Edit2, ShieldCheck, ArrowRight, LayoutGrid, List } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const Audits = () => {
    const { user: currentUser } = useAuth();
    const [audits, setAudits] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        auditor: '',
        date: '',
        scope: '',
        status: 'Scheduled'
    });

    const fetchData = async () => {
        try {
            const [auditsRes, usersRes] = await Promise.all([
                api.get('/audits'),
                api.get('/users')
            ]);
            setAudits(auditsRes.data);
            setUsers(usersRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
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
            if (editingId) {
                await api.put(`/audits/${editingId}`, formData);
            } else {
                await api.post('/audits', formData);
            }
            setShowModal(false);
            setEditingId(null);
            setFormData({ title: '', auditor: '', date: '', scope: '', status: 'Scheduled' });
            fetchData();
        } catch (error) {
            console.error('Error saving audit:', error);
            alert('Error saving audit');
        }
    };

    const handleEdit = (audit) => {
        setEditingId(audit._id);
        setFormData({
            title: audit.title,
            auditor: audit.auditor?._id || audit.auditor,
            date: audit.date.split('T')[0],
            scope: audit.scope,
            status: audit.status
        });
        setShowModal(true);
    };

    const canManage = ['Admin', 'Compliance Officer', 'Auditor'].includes(currentUser?.role);
    const isAuditor = currentUser?.role === 'Auditor';

    const filteredAudits = audits.filter(audit =>
        audit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        audit.scope.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 gap-8">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-slate-200 dark:border-slate-800 rounded-full" />
                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                <div className="absolute inset-4 border-4 border-blue-500 rounded-full border-b-transparent animate-spin direction-reverse duration-700" />
            </div>
            <p className="text-slate-900 dark:text-white font-black tracking-[0.3em] uppercase text-xs animate-pulse">Syncing Registry...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-10 transition-colors duration-300">
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-16"
            >
                <div className="max-w-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="h-px w-8 bg-indigo-500" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Internal Controls</span>
                    </div>
                    <h2 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9] mb-4">
                        Audit <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-600">Registry</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">
                        Master schedule and historical archive of compliance verifications.
                        {isAuditor && <span className="text-indigo-500 font-bold ml-1">Access verification queue for pending approvals.</span>}
                    </p>
                </div>

                <div className="flex flex-col items-end gap-4 w-full xl:w-auto">
                    {isAuditor && (
                        <Link
                            to="/auditor/dashboard"
                            className="group flex items-center gap-3 px-6 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-300 rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all mb-2"
                        >
                            <ShieldCheck size={16} />
                            Go to Verification Queue
                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    )}

                    <div className="flex gap-4 w-full sm:w-auto">
                        <div className="relative group flex-1 sm:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search registry..."
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-bold text-slate-900 dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {canManage && (
                            <button
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({ title: '', auditor: '', date: '', scope: '', status: 'Scheduled' });
                                    setShowModal(true);
                                }}
                                className="px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95 whitespace-nowrap"
                            >
                                <Plus size={20} />
                                <span className="uppercase tracking-widest text-xs hidden sm:inline">Schedule Audit</span>
                            </button>
                        )}
                    </div>
                </div>
            </motion.header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8"
            >
                <AnimatePresence>
                    {filteredAudits.map((audit) => (
                        <motion.div
                            key={audit._id}
                            variants={itemVariants}
                            layout
                            className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 hover:shadow-2xl dark:hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                {canManage && (
                                    <button onClick={() => handleEdit(audit)} className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm transform hover:scale-110">
                                        <Edit2 size={16} />
                                    </button>
                                )}
                            </div>

                            <div className={clsx(
                                "absolute top-0 left-0 w-full h-1.5",
                                audit.status === 'Completed' ? 'bg-emerald-500' :
                                    audit.status === 'In Progress' ? 'bg-indigo-500' :
                                        audit.status === 'Cancelled' ? 'bg-rose-500' : 'bg-slate-300'
                            )} />

                            <div className="mb-8">
                                <div className="flex justify-between items-start mb-4">
                                    <span className={clsx(
                                        'px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border',
                                        audit.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' :
                                            audit.status === 'In Progress' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800' :
                                                audit.status === 'Cancelled' ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800' :
                                                    'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                    )}>
                                        {audit.status}
                                    </span>
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight leading-none">
                                    {audit.title}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium italic leading-relaxed line-clamp-2">
                                    "{audit.scope}"
                                </p>
                            </div>

                            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-[1.5rem] border border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lead Auditor</p>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">{audit.auditor?.name || 'Unassigned'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm">
                                        <Calendar size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scheduled For</p>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">{new Date(audit.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                                <span className={clsx(
                                    "font-black flex items-center gap-2",
                                    audit.findings?.length > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                                )}>
                                    <AlertCircle size={14} />
                                    {audit.findings?.length || 0} ISSUES
                                </span>
                                <Link to="/documents" className="font-bold text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors flex items-center gap-1">
                                    EVIDENCE <ArrowRight size={12} />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredAudits.length === 0 && (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center text-center opacity-50">
                        <Search size={64} className="text-slate-300 dark:text-slate-700 mb-6" />
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Registry Empty</h3>
                        <p className="text-slate-500 max-w-md">No records match your search criteria. Adjust filters or schedule a new audit.</p>
                    </div>
                )}
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
                            initial={{ scale: 0.95, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 40 }}
                            className="bg-white dark:bg-slate-900 rounded-[3rem] max-w-2xl w-full p-10 relative shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                            <div className="flex justify-between items-start mb-10 relative z-10">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-1">
                                        {editingId ? 'Modify Strategy' : 'Initialize Audit'}
                                    </h3>
                                    <p className="text-slate-500 text-sm font-medium">Define parameters for compliance verification.</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Audit Title</label>
                                    <input required type="text" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[1.5rem] transition-all text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400" placeholder="e.g. Q3 Financial Review" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Auditor</label>
                                        <div className="relative">
                                            <select
                                                required
                                                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[1.5rem] transition-all text-sm font-bold appearance-none cursor-pointer text-slate-900 dark:text-white"
                                                value={formData.auditor}
                                                onChange={e => setFormData({ ...formData, auditor: e.target.value })}
                                            >
                                                <option value="">
                                                    {users.filter(u => ['Admin', 'Auditor', 'Compliance Officer'].includes(u.role)).length > 0
                                                        ? 'Select Personnel'
                                                        : 'No Qualified Personnel Found (Assign Roles in Users tab)'}
                                                </option>
                                                {users.filter(u => ['Admin', 'Auditor', 'Compliance Officer'].includes(u.role)).map(u => (
                                                    <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                <User size={16} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Date</label>
                                        <input required type="date" className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[1.5rem] transition-all text-sm font-bold text-slate-900 dark:text-white" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Scope & Objectives</label>
                                    <textarea rows={3} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[1.5rem] transition-all text-sm font-medium resize-none text-slate-900 dark:text-white placeholder:text-slate-400" placeholder="Define the boundaries of this audit..." value={formData.scope} onChange={e => setFormData({ ...formData, scope: e.target.value })} />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Status</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {['Scheduled', 'In Progress', 'Completed', 'Cancelled'].map((status) => (
                                            <button
                                                key={status}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, status })}
                                                className={clsx(
                                                    "py-3 rounded-xl text-[10px] uppercase font-black tracking-wider transition-all border-2",
                                                    formData.status === status
                                                        ? "border-indigo-500 bg-indigo-500 text-white shadow-lg shadow-indigo-500/30"
                                                        : "border-transparent bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                                                )}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-8 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl font-bold text-slate-500 transition-colors uppercase text-xs tracking-wider">Cancel</button>
                                    <button type="submit" className="px-10 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all font-black uppercase text-xs tracking-wider flex items-center gap-2">
                                        <ClipboardCheck size={16} />
                                        Commit Plan
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Audits;

import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Plus, Edit2, Trash2, Search, BookOpen, ShieldCheck, Filter, FileText, Globe, Clock, ChevronRight, CheckCircle2, AlertCircle, X, Shield, Activity } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
};

const Regulations = () => {
    const { user } = useAuth();
    const [regulations, setRegulations] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [formData, setFormData] = useState({
        title: '', description: '', category: '', effectiveDate: '', currentVersion: '1.0', status: 'Draft'
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('All');

    const fetchRegulations = async () => {
        try {
            const { data } = await api.get('/regulations');
            setRegulations(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load regulations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRegulations();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/regulations/${editingId}`, formData);
                toast.success('Protocol updated successfully');
            } else {
                await api.post('/regulations', formData);
                toast.success('New standard established');
            }
            setShowModal(false);
            setEditingId(null);
            setFormData({ title: '', description: '', category: '', effectiveDate: '', currentVersion: '1.0', status: 'Draft' });
            fetchRegulations();
        } catch (error) {
            console.error(error);
            toast.error('Operation failed');
        }
    };

    const handleEdit = (reg) => {
        setEditingId(reg._id);
        setFormData({
            title: reg.title,
            description: reg.description,
            category: reg.category,
            effectiveDate: reg.effectiveDate.split('T')[0],
            currentVersion: reg.currentVersion,
            status: reg.status
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this regulation?')) {
            try {
                await api.delete(`/regulations/${id}`);
                toast.success('Regulation removed');
                fetchRegulations();
            } catch (error) {
                console.error(error);
                toast.error('Delete failed');
            }
        }
    }

    const canEdit = ['Admin', 'Compliance Officer'].includes(user?.role);

    const categories = ['All', ...new Set(regulations.map(r => r.category))];

    const filteredRegulations = regulations.filter(reg => {
        const matchesSearch = reg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reg.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'All' || reg.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 gap-8">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-slate-200 dark:border-slate-800 rounded-full" />
                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                <div className="absolute inset-4 border-4 border-blue-500 rounded-full border-b-transparent animate-spin direction-reverse duration-700" />
            </div>
            <p className="text-slate-900 dark:text-white font-black tracking-[0.3em] uppercase text-xs animate-pulse">Loading Registry...</p>
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
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Compliance Standards</span>
                    </div>
                    <h2 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9] mb-4">
                        Regulatory <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Registry</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">
                        Centralized repository for compliance standards and operational protocols.
                    </p>
                </div>

                <div className="flex flex-col items-end gap-4 w-full xl:w-auto">
                    <div className="flex gap-4 w-full sm:w-auto">
                        <div className="relative group flex-1 sm:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search parameters..."
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-bold text-slate-900 dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {canEdit && (
                            <button
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({ title: '', description: '', category: '', effectiveDate: '', currentVersion: '1.0', status: 'Draft' });
                                    setShowModal(true);
                                }}
                                className="px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95 whitespace-nowrap"
                            >
                                <Plus size={20} />
                                <span className="uppercase tracking-widest text-xs hidden sm:inline">Append Standard</span>
                            </button>
                        )}
                    </div>

                    <div className="flex gap-2 w-full overflow-x-auto pb-2 sm:pb-0 no-scrollbar justify-end">
                        {categories.slice(0, 5).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={clsx(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                                    filterCategory === cat
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105"
                                        : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 gap-6"
            >
                <div className="hidden md:grid grid-cols-12 gap-6 px-8 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 select-none">
                    <div className="col-span-5 pl-4">Standard Identification</div>
                    <div className="col-span-2">Classification</div>
                    <div className="col-span-2">Version Control</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                <AnimatePresence>
                    {filteredRegulations.length > 0 ? (
                        filteredRegulations.map((reg) => (
                            <motion.div
                                key={reg._id}
                                variants={itemVariants}
                                layout
                                className="group relative bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 hover:shadow-xl dark:hover:shadow-indigo-500/10 transition-all duration-300 grid grid-cols-1 md:grid-cols-12 gap-6 items-center overflow-hidden"
                            >
                                <div className={clsx(
                                    "absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-500",
                                    reg.status === 'Active' ? 'bg-emerald-500' :
                                        reg.status === 'Draft' ? 'bg-indigo-500' : 'bg-rose-500'
                                )} />

                                <div className={clsx(
                                    "absolute right-0 top-0 w-32 h-32 blur-[60px] rounded-full transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none",
                                    reg.status === 'Active' ? 'bg-emerald-500/10' :
                                        reg.status === 'Draft' ? 'bg-indigo-500/10' : 'bg-rose-500/10'
                                )} />

                                <div className="col-span-1 md:col-span-5 pl-4 relative z-10">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={clsx(
                                            "p-2 rounded-lg",
                                            reg.status === 'Active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                                                reg.status === 'Draft' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' :
                                                    'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                                        )}>
                                            <Shield size={16} />
                                        </div>
                                        <h3 className="font-black text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                                            {reg.title}
                                        </h3>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium line-clamp-2 leading-relaxed pl-11">
                                        {reg.description}
                                    </p>
                                </div>

                                <div className="col-span-1 md:col-span-2 relative z-10">
                                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl w-fit">
                                        <Filter size={14} className="text-slate-400" />
                                        <span className="font-bold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wide">{reg.category}</span>
                                    </div>
                                </div>

                                <div className="col-span-1 md:col-span-2 relative z-10">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest w-12">Rev</span>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">v{reg.currentVersion}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest w-12">Date</span>
                                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{new Date(reg.effectiveDate).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-1 md:col-span-2 relative z-10">
                                    <span className={clsx(
                                        'px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border inline-flex items-center gap-2 shadow-sm',
                                        reg.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' :
                                            reg.status === 'Draft' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20' :
                                                'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                                    )}>
                                        {reg.status === 'Active' ? <CheckCircle2 size={10} /> : reg.status === 'Draft' ? <Activity size={10} /> : <AlertCircle size={10} />}
                                        {reg.status}
                                    </span>
                                </div>

                                <div className="col-span-1 md:col-span-1 flex justify-end gap-2 relative z-10">
                                    {canEdit && (
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                            <button
                                                onClick={() => handleEdit(reg)}
                                                className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-500 rounded-xl text-slate-400 transition-all shadow-sm"
                                                title="Edit Protocol"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            {user.role === 'Admin' && (
                                                <button
                                                    onClick={() => handleDelete(reg._id)}
                                                    className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-rose-600 hover:text-white dark:hover:bg-rose-500 rounded-xl text-slate-400 transition-all shadow-sm"
                                                    title="Revoke Protocol"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-32 flex flex-col items-center justify-center opacity-50"
                        >
                            <BookOpen size={64} className="text-slate-300 dark:text-slate-700 mb-6" />
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Registry Empty</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md">No standards match your search parameters.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 content-center"
                    >
                        <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/90 backdrop-blur-md" onClick={() => setShowModal(false)} />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 40 }}
                            className="bg-white dark:bg-slate-900 rounded-[3rem] max-w-2xl w-full p-10 relative shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

                            <div className="flex justify-between items-start mb-10 relative z-10">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-1">
                                        {editingId ? 'Modify Standard' : 'Establish New Standard'}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Define parameters for compliance protocol.</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Standard Title</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[1.5rem] transition-all text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                                        placeholder="e.g. ISO-27001 Data Handling"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Comprehensive Description</label>
                                    <textarea
                                        required
                                        rows={3}
                                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[1.5rem] transition-all text-sm font-medium resize-none text-slate-900 dark:text-white placeholder:text-slate-400"
                                        placeholder="Define the scope and requirements..."
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                                        <div className="relative">
                                            <input
                                                required
                                                type="text"
                                                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[1.5rem] transition-all text-sm font-bold text-slate-900 dark:text-white"
                                                placeholder="Security"
                                                value={formData.category}
                                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                list="category-suggestions"
                                            />
                                            <Filter className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                            <datalist id="category-suggestions">
                                                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c} />)}
                                            </datalist>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Version ID</label>
                                        <input
                                            required
                                            type="text"
                                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[1.5rem] transition-all text-sm font-bold text-slate-900 dark:text-white"
                                            value={formData.currentVersion}
                                            onChange={e => setFormData({ ...formData, currentVersion: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Effective Date</label>
                                        <div className="relative">
                                            <input
                                                required
                                                type="date"
                                                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[1.5rem] transition-all text-sm font-bold text-slate-900 dark:text-white"
                                                value={formData.effectiveDate}
                                                onChange={e => setFormData({ ...formData, effectiveDate: e.target.value })}
                                            />
                                            <Clock className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Lifecycle Status</label>
                                        <div className="relative">
                                            <select
                                                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[1.5rem] transition-all text-sm font-bold cursor-pointer text-slate-900 dark:text-white appearance-none"
                                                value={formData.status}
                                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                                            >
                                                <option value="Draft">Draft</option>
                                                <option value="Active">Active</option>
                                                <option value="Obsolete">Obsolete</option>
                                            </select>
                                            <Activity className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-8 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl font-bold text-slate-500 dark:text-slate-400 transition-colors uppercase text-xs tracking-wider"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-10 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all font-black uppercase text-xs tracking-wider flex items-center gap-2"
                                    >
                                        <ShieldCheck size={16} />
                                        Commit Changes
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

export default Regulations;

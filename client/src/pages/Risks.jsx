import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { ShieldAlert, AlertTriangle, X, Search, TrendingUp, Filter, ShieldCheck } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const Risks = () => {
    const { user: currentUser } = useAuth();
    const [risks, setRisks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        severity: 'Medium',
        status: 'Identified',
        mitigationPlan: ''
    });

    const fetchRisks = async () => {
        try {
            const { data } = await api.get('/risks');
            setRisks(data);
        } catch (error) {
            console.error('Error fetching risks:', error);
            toast.error('Failed to orbit risk data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRisks();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/risks/${editingId}`, formData);
                toast.success('Risk assessment updated');
            } else {
                await api.post('/risks', formData);
                toast.success('New vulnerability documented');
            }
            setShowModal(false);
            setEditingId(null);
            setFormData({ title: '', description: '', category: '', severity: 'Medium', status: 'Identified', mitigationPlan: '' });
            fetchRisks();
        } catch (error) {
            console.error('Error saving risk:', error);
            toast.error('Protocol failure: Could not commit assessment');
        }
    };

    const handleEdit = (risk) => {
        setEditingId(risk._id);
        setFormData({
            title: risk.title,
            description: risk.description,
            category: risk.category,
            severity: risk.severity,
            status: risk.status,
            mitigationPlan: risk.mitigationPlan || ''
        });
        setShowModal(true);
    };

    const canManage = ['Admin', 'Compliance Officer'].includes(currentUser?.role);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-500/10 border-b-blue-500 rounded-full animate-spin direction-reverse" />
                </div>
            </div>
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] animate-pulse">Scanning Risk Perimeters</p>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen p-6 lg:p-12 space-y-16 relative overflow-hidden"
        >
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-rose-500/5 blur-[120px] rounded-full -translate-y-1/2" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 blur-[100px] rounded-full translate-y-1/2" />

            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "circOut" }}
                className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <span className="h-0.5 w-12 bg-rose-600 rounded-full" />
                        <span className="text-xs font-black uppercase tracking-[0.4em] text-rose-600 dark:text-rose-400">Threat Intelligence</span>
                    </div>
                    <h1 className="text-6xl lg:text-7xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.9]">
                        Risk <span className="text-gradient-mission">Sensors</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg border-l-2 border-slate-200 dark:border-slate-800 pl-6 max-w-2xl">
                        Proactive identification and mitigation of compliance vulnerabilities using real-time telemetry.
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ title: '', description: '', category: '', severity: 'Medium', status: 'Identified', mitigationPlan: '' });
                        setShowModal(true);
                    }}
                    className="group relative px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all hover:-translate-y-2 active:scale-95 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-indigo-600 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                    <span className="relative z-10 flex items-center gap-3">
                        <ShieldAlert size={18} className="group-hover:rotate-12 transition-transform" />
                        Launch Assessment
                    </span>
                </button>
            </motion.header>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-10 relative z-10"
            >
                {risks.map((risk) => (
                    <motion.div
                        key={risk._id}
                        variants={itemVariants}
                        className="group relative"
                    >
                        <div className={clsx(
                            "absolute -inset-1 rounded-[3.5rem] blur opacity-0 group-hover:opacity-20 transition duration-1000",
                            risk.severity === 'Critical' ? "bg-rose-500" : "bg-indigo-500"
                        )} />

                        <div className="relative mission-card h-full flex flex-col p-10 group-hover:-translate-y-3 transition-all duration-700">
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-10">
                                <div className="space-y-4">
                                    <div className={clsx(
                                        "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] w-fit shadow-lg",
                                        risk.severity === 'Critical' ? "bg-rose-500 text-white shadow-rose-500/20" :
                                            risk.severity === 'High' ? "bg-orange-500 text-white shadow-orange-500/20" :
                                                risk.severity === 'Medium' ? "bg-indigo-600 text-white shadow-indigo-500/20" :
                                                    "bg-slate-400 text-white shadow-slate-400/20"
                                    )}>
                                        {risk.severity} Severity
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                                        {risk.title}
                                    </h3>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className={clsx(
                                        "px-4 py-2 border-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-xl transition-all duration-500",
                                        risk.status === 'Mitigated' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" :
                                            risk.status === 'Identified' ? "bg-amber-500/10 border-amber-500/30 text-amber-500" :
                                                "bg-indigo-500/10 border-indigo-500/30 text-indigo-500"
                                    )}>
                                        {risk.status}
                                    </div>
                                    {canManage && (
                                        <button onClick={() => handleEdit(risk)} className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700 transition-all shadow-sm">
                                            <TrendingUp size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed mb-10 flex-grow border-l-2 border-slate-100 dark:border-slate-800 pl-6">
                                {risk.description}
                            </p>

                            {/* Card Footer Visualization */}
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-5 rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <Filter size={14} className="text-indigo-500" /> Category
                                        </div>
                                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{risk.category}</span>
                                    </div>
                                    <div className="p-5 rounded-[2rem] bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <Search size={14} className="text-blue-500" /> Origin
                                        </div>
                                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{risk.identifiedBy?.name}</span>
                                    </div>
                                </div>

                                <div className="relative p-8 rounded-[2.5rem] bg-slate-950 overflow-hidden group/mitigation">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 blur-[50px] rounded-full group-hover/mitigation:bg-indigo-500/30 transition-colors" />
                                    <span className="relative z-10 text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-3 flex items-center gap-3">
                                        <ShieldCheck size={14} className="animate-pulse" /> Strategic Roadmap
                                    </span>
                                    <p className="relative z-10 text-xs text-slate-400 font-heavy tracking-wide leading-relaxed italic">
                                        {risk.mitigationPlan || 'Awaiting mitigation protocols... Deployment sequence pending.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {risks.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-32 glass-panel dark:bg-slate-900/40 rounded-[4rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-8"
                >
                    <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                        <AlertTriangle size={48} className="animate-pulse" />
                    </div>
                    <div className="space-y-3">
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Horizon Clear</h3>
                        <p className="text-slate-500 font-medium italic max-w-md mx-auto">No active vulnerabilities detected in the current sector. System integrity maintained at 100%.</p>
                    </div>
                </motion.div>
            )}

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 dark:bg-black/90 backdrop-blur-2xl"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="bg-white dark:bg-slate-950 rounded-[4rem] max-w-2xl w-full p-12 relative shadow-[0_100px_100px_-50px_rgba(0,0,0,0.5)] border border-white/20 dark:border-slate-800"
                        >
                            <div className="flex justify-between items-start mb-12">
                                <div className="space-y-2">
                                    <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                                        {editingId ? 'Intelligence Update' : 'Scan Vulnerability'}
                                    </h3>
                                    <p className="text-slate-400 text-sm font-medium italic border-l-2 border-indigo-500 pl-4">Documenting sector anomalies for perimeter security.</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full text-slate-400 transition-colors"><X size={28} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Anomaly Designation</label>
                                        <input required type="text" placeholder="e.g. Protocol Breach" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 rounded-[2rem] transition-all text-sm font-black dark:text-white shadow-inner" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Sector Category</label>
                                        <input required type="text" placeholder="e.g. Cybersecurity" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 rounded-[2rem] transition-all text-sm font-black dark:text-white shadow-inner" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Technical Context</label>
                                    <textarea rows={3} placeholder="Provide high-density details..." className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 rounded-[2rem] transition-all text-sm font-medium resize-none dark:text-white shadow-inner" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Threat Magnitude</label>
                                        <select className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 rounded-[2rem] transition-all text-sm font-black cursor-pointer appearance-none dark:text-white shadow-inner" value={formData.severity} onChange={e => setFormData({ ...formData, severity: e.target.value })}>
                                            <option value="Low">Low - Trace Signal</option>
                                            <option value="Medium">Medium - System Variance</option>
                                            <option value="High">High - Critical Alert</option>
                                            <option value="Critical">Critical - Immediate Lockdown</option>
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Deployment Phase</label>
                                        <select className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 rounded-[2rem] transition-all text-sm font-black cursor-pointer appearance-none dark:text-white shadow-inner" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                            <option value="Identified">Phase: Active Scan</option>
                                            <option value="Mitigating">Phase: Execution</option>
                                            <option value="Mitigated">Phase: Neutralized</option>
                                            <option value="Acceptable">Phase: Standby</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] ml-2 flex items-center gap-2">
                                        <ShieldCheck size={14} /> Neutralization Strategy
                                    </label>
                                    <textarea rows={2} placeholder="Step-by-step mitigation roadmap..." className="w-full px-8 py-5 bg-slate-950 text-indigo-100 border-2 border-indigo-900/50 focus:border-indigo-500 rounded-[2rem] transition-all text-xs font-heavy resize-none shadow-2xl" value={formData.mitigationPlan} onChange={e => setFormData({ ...formData, mitigationPlan: e.target.value })} />
                                </div>

                                <div className="flex justify-end gap-6 mt-12">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-10 py-5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-[1.5rem] font-bold text-slate-400 transition-colors uppercase text-[10px] tracking-[0.2em]">Abort Mission</button>
                                    <button type="submit" className="group relative px-12 py-5 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-indigo-500/40 transition-all hover:-translate-y-2 active:scale-95 overflow-hidden">
                                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                        <span className="relative z-10 flex items-center gap-2">
                                            {editingId ? 'Update Intelligence' : 'Commit Intelligence'} <TrendingUp size={16} />
                                        </span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};


export default Risks;

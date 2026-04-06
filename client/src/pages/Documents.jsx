import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Download, Trash2, Shield, Calendar, HardDrive, FileText, Plus, UploadCloud, Search, ShieldCheck, Database, FileCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import useAuth from '../hooks/useAuth';
import RecordEvidenceModal from '../components/RecordEvidenceModal';
import { toast } from 'react-hot-toast';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

const Documents = () => {
    const { user } = useAuth();
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [regulations, setRegulations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');

    const fetchData = async () => {
        try {
            const [docsRes, regsRes] = await Promise.all([
                api.get('/documents'),
                api.get('/regulations')
            ]);
            setDocuments(docsRes.data);
            setRegulations(regsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to retrieve vault data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to permanently delete this evidence file?')) {
            try {
                // Assuming deletion endpoint exists or using generic resource delete
                // await api.delete(`/documents/${id}`); 
                // toast.success('Document removed from vault');
                // fetchData();
                alert("Delete functionality to be implemented in backend");
            } catch (error) {
                console.error('Error deleting document:', error);
            }
        }
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.originalName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'All' || 
            (filterType === 'Regulation' && doc.relatedEntity === 'Regulation') ||
            (filterType === 'Task' && doc.relatedEntity === 'Task');
        return matchesSearch && matchesType;
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 gap-8">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-slate-200 dark:border-slate-800 rounded-full" />
                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                <div className="absolute inset-4 border-4 border-blue-500 rounded-full border-b-transparent animate-spin direction-reverse duration-700" />
            </div>
            <p className="text-slate-900 dark:text-white font-black tracking-[0.3em] uppercase text-xs animate-pulse">Decrypting Evidence Vault...</p>
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
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Secure Archives</span>
                    </div>
                    <h2 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9] mb-4">
                        Evidence <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-600">Vault</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">
                        Centralized repository for immutable compliance evidence and regulatory documentation.
                    </p>
                </div>

                <div className="flex flex-col items-end gap-4 w-full xl:w-auto">
                    <div className="flex gap-4 w-full sm:w-auto">
                         <div className="relative group flex-1 sm:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search archives..." 
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-bold text-slate-900 dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95 whitespace-nowrap"
                        >
                            <UploadCloud size={20} />
                            <span className="uppercase tracking-widest text-xs hidden sm:inline">Upload Evidence</span>
                        </button>
                    </div>

                     <div className="flex gap-2 w-full sm:w-auto">
                        {['All', 'Regulation', 'Task'].map(type => (
                            <button
                                key={type}
                                onClick={() => setFilterType(type)}
                                className={clsx(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border",
                                    filterType === type
                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105"
                                        : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500"
                                )}
                            >
                                {type === 'All' ? 'All Files' : type === 'Regulation' ? 'Regulatory Docs' : 'Task Evidence'}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.header>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6"
            >
                <AnimatePresence>
                    {filteredDocuments.map((doc) => (
                        <motion.div 
                            key={doc._id} 
                            variants={itemVariants}
                            layout
                            className="group relative bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 hover:shadow-2xl dark:hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden flex flex-col h-full"
                        >
                            <div className={clsx(
                                "absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none",
                                doc.relatedEntity === 'Regulation' ? 'bg-indigo-500/20' : 'bg-emerald-500/20'
                            )} />

                            <div className="flex justify-between items-start mb-6 z-10">
                                <div className={clsx(
                                    "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border flex items-center gap-1.5",
                                    doc.relatedEntity === 'Regulation' 
                                        ? "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800" 
                                        : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                                )}>
                                    {doc.relatedEntity === 'Regulation' ? <Database size={10} /> : <FileCheck size={10} />}
                                    {doc.relatedEntity}
                                </div>
                                
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <a
                                        href={`${import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'}/${doc.path}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:scale-110 transition-transform"
                                        title="Download"
                                    >
                                        <Download size={14} />
                                    </a>
                                    {user.role === 'Admin' && (
                                        <button 
                                            onClick={() => handleDelete(doc._id)} 
                                            className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg hover:scale-110 transition-transform"
                                            title="Delete"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-6 z-10">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 shadow-inner group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                                    <FileText size={32} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white truncate uppercase tracking-tight" title={doc.originalName}>
                                        {doc.originalName}
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 truncate flex items-center gap-1">
                                        <Shield size={10} /> {doc.uploadedBy?.name || 'System'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 z-10 space-y-3 mt-auto">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <HardDrive size={10} /> Size
                                    </span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{formatSize(doc.size)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <Calendar size={10} /> Date
                                    </span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{new Date(doc.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="pt-2 border-t border-slate-200 dark:border-slate-700/50">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Linked Context</p>
                                    <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">
                                        {doc.relatedEntity === 'Regulation' ?
                                            regulations.find(r => r._id === doc.relatedId)?.title || 'General Regulation' :
                                            'Task Verification Evidence'
                                        }
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                
                {filteredDocuments.length === 0 && (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center text-center opacity-50">
                        <UploadCloud size={64} className="text-slate-300 dark:text-slate-700 mb-6" />
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Vault Empty</h3>
                        <p className="text-slate-500 max-w-md">No documents match your search. Upload evidence to maintain compliance.</p>
                    </div>
                )}
            </motion.div>

            <RecordEvidenceModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={fetchData}
                initialEntity="Regulation"
            />
        </div>
    );
};

export default Documents;

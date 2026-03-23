import { useState, useRef, useEffect } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, ShieldCheck, FileCheck, Cpu, Zap, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import clsx from 'clsx';

const RecordEvidenceModal = ({
    isOpen,
    onClose,
    onSuccess,
    initialEntity = 'Risk',
    initialId = ''
}) => {
    const fileInputRef = useRef(null);
    const [uploadData, setUploadData] = useState({
        file: null,
        relatedEntity: initialEntity,
        relatedId: initialId
    });
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [entities, setEntities] = useState([]);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setUploadData({
                file: null,
                relatedEntity: initialEntity,
                relatedId: initialId
            });
        }
    }, [isOpen, initialEntity, initialId]);

    useEffect(() => {
        if (isOpen) {
            fetchEntities(uploadData.relatedEntity);
            setIsSuccess(false);
            setError('');
        }
    }, [isOpen, uploadData.relatedEntity]);

    const fetchEntities = async (type) => {
        try {
            let endpoint = '';
            if (type === 'Regulation') endpoint = '/regulations';
            else if (type === 'Risk') endpoint = '/risks';
            else if (type === 'Task') endpoint = '/tasks';

            if (endpoint) {
                const { data } = await api.get(endpoint);
                setEntities(data);
            } else {
                setEntities([]);
            }
        } catch (err) {
            console.error('Error fetching entities:', err);
        }
    };

    const validateAndSetFile = (selectedFile) => {
        if (selectedFile) {
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError('Registry Overflow: File exceeds 10MB limit');
                setUploadData({ ...uploadData, file: null });
            } else {
                setError('');
                setUploadData({ ...uploadData, file: selectedFile });
            }
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadData.file) return setError('Selection Required: No protocol evidence detected');
        if (!uploadData.relatedId && uploadData.relatedEntity !== 'General') return setError('Linkage Required: Specify target record');

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', uploadData.file);
        formData.append('relatedEntity', uploadData.relatedEntity);
        if (uploadData.relatedId) formData.append('relatedId', uploadData.relatedId);

        try {
            const { data } = await api.post('/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setIsSuccess(true);
            setTimeout(() => {
                onSuccess?.(data);
                onClose();
                setUploadData({ file: null, relatedEntity: initialEntity, relatedId: initialId });
            }, 2000);
        } catch (err) {
            console.error('Upload failed:', err);
            setError(err.response?.data?.message || 'Transmission Interrupted: Check network link');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/90 backdrop-blur-2xl"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(79,70,229,0.2)] overflow-hidden relative group"
                >
                    {/* Console Header */}
                    <div className="p-10 border-b border-white/5 relative bg-slate-900/50">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-600 to-transparent" />
                        <div className="flex justify-between items-start relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2.5rem bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                                    <ShieldCheck size={32} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-black text-white tracking-tight uppercase">Evidence Vault</h3>
                                    <p className="text-slate-400 font-medium text-sm flex items-center gap-2">
                                        <Lock size={12} className="text-indigo-400" /> Secure Protocol Upload Gateway v2.0
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-rose-500/20 hover:text-rose-500 flex items-center justify-center text-slate-400 transition-all active:scale-95 shadow-inner"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="p-10">
                        {isSuccess ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-16 space-y-8 text-center"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-emerald-500 rounded-full blur-3xl opacity-20 animate-pulse" />
                                    <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 relative shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                                        <CheckCircle2 size={48} />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-3xl font-black text-white uppercase tracking-tighter">Transmission Successful</h4>
                                    <p className="text-slate-400 font-medium mt-2">Protocol evidence has been logged and encrypted.</p>
                                </div>
                                <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 1.5 }}
                                        className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,1)]"
                                    />
                                </div>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleUpload} className="space-y-8">
                                {/* Zone Control */}
                                <div
                                    onDragEnter={() => setDragActive(true)}
                                    onDragLeave={() => setDragActive(false)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setDragActive(false);
                                        validateAndSetFile(e.dataTransfer.files[0]);
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={clsx(
                                        "relative group/drop rounded-[2.5rem] border-2 border-dashed transition-all duration-700 cursor-pointer overflow-hidden p-12 min-h-[300px] flex flex-col items-center justify-center text-center gap-6",
                                        dragActive ? "border-indigo-500 bg-indigo-500/10 scale-[1.02]" :
                                            uploadData.file ? "border-emerald-500/50 bg-emerald-500/5 shadow-2xl" :
                                                "border-white/10 bg-slate-800/20 hover:border-indigo-500/50 hover:bg-slate-800/40"
                                    )}
                                >
                                    <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => validateAndSetFile(e.target.files[0])} accept=".pdf,.doc,.docx,image/*" />

                                    <div className="relative z-10 space-y-4">
                                        {uploadData.file ? (
                                            <>
                                                <div className="w-20 h-20 rounded-2.5rem bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 mx-auto group-hover/drop:scale-110 transition-transform duration-500 shadow-xl shadow-emerald-500/10">
                                                    <FileCheck size={40} />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xl font-black text-white tracking-tight">{uploadData.file.name}</p>
                                                    <p className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.2em]">Verified Locally • Ready for Uplink</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="w-20 h-20 rounded-2.5rem bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto group-hover/drop:scale-110 transition-transform duration-500 shadow-xl shadow-indigo-500/10">
                                                    <UploadCloud size={40} />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xl font-black text-white tracking-tight uppercase">Initialize Link</p>
                                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Drag & Drop Encrypted Protocols (Max 10MB)</p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Scanline Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent h-1 w-full animate-scanline pointer-events-none" />
                                </div>

                                {error && (
                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-xs font-black uppercase tracking-widest shadow-lg">
                                        <AlertCircle size={18} />
                                        {error}
                                    </motion.div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Registry Domain</label>
                                        <div className="relative group/select">
                                            <select
                                                className="w-full appearance-none px-6 py-5 bg-slate-800/40 border border-white/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-black text-white uppercase tracking-tighter"
                                                value={uploadData.relatedEntity}
                                                onChange={e => setUploadData({ ...uploadData, relatedEntity: e.target.value, relatedId: '' })}
                                                disabled={!!initialEntity && initialEntity !== 'General'}
                                            >
                                                <option value="Risk">Risk Intelligence</option>
                                                <option value="Regulation">Regulatory Core</option>
                                                <option value="Task">Verification Protocol</option>
                                                <option value="Audit">Audit Sentinel</option>
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400 transition-transform group-hover/select:translate-y-1">
                                                <Zap size={14} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Node Linkage</label>
                                        <div className="relative group/select">
                                            <select
                                                className="w-full appearance-none px-6 py-5 bg-slate-800/40 border border-white/5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-black text-white uppercase tracking-tighter disabled:opacity-50"
                                                value={uploadData.relatedId}
                                                onChange={e => setUploadData({ ...uploadData, relatedId: e.target.value })}
                                                disabled={!!initialId}
                                            >
                                                <option value="">Pending Selection...</option>
                                                {entities.map(e => (
                                                    <option key={e._id} value={e._id}>{e.title || e.originalName || e._id}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400 transition-transform group-hover/select:translate-y-1">
                                                <Cpu size={14} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="px-8 py-5 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 border border-white/5"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || !uploadData.file}
                                        className={clsx(
                                            "flex-1 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3",
                                            loading || !uploadData.file
                                                ? "bg-slate-800 text-slate-600 cursor-not-allowed border border-white/5"
                                                : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20"
                                        )}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Transmitting...
                                            </>
                                        ) : (
                                            <>
                                                <Zap size={16} className="fill-current" />
                                                Verify & Upload Securely
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default RecordEvidenceModal;

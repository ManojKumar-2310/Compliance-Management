import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Loader2, KeyRound, Mail, Lock, ArrowRight, Globe } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import ThemeToggle from '../components/ThemeToggle';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    // Auto-redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            toast.success('Identity verified. Initiating session...');
            setTimeout(() => navigate('/dashboard'), 500);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Authentication failed';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 dark:bg-black transition-colors duration-500 overflow-hidden relative">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-blue-600/10 rounded-full blur-[150px] animate-pulse-slow" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[80%] h-[80%] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse-slow" />
            </div>

            {/* Content Container */}
            <div className="w-full h-screen flex items-center justify-center relative z-10 px-6">
                <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-20 items-center">

                    {/* Left: Branding & Info */}
                    <div className="hidden lg:block relative">
                        <div className="absolute -left-20 -top-20 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" />

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-slate-200/20 dark:border-white/10 backdrop-blur-md mb-8">
                                <Globe size={16} className="text-blue-500" />
                                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Secure Global Access</span>
                            </div>

                            <h1 className="text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-[0.9]">
                                NEXUS <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">GRAVITY</span>
                            </h1>

                            <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium max-w-lg mb-12">
                                The central nervous system for enterprise compliance.
                                Orchestrate audits, manage risks, and enforce standards with absolute precision.
                            </p>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 backdrop-blur-xl">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 text-blue-500">
                                        <Shield size={24} />
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">Zero Trust</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Biometric-ready security core.</p>
                                </div>
                                <div className="p-6 rounded-[2rem] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 backdrop-blur-xl">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-500">
                                        <KeyRound size={24} />
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-1">Single Sign-On</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Unified identity management.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Login Card */}
                    <div className="relative">
                        <ThemeToggle className="absolute -top-16 right-0" />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl p-8 md:p-12 rounded-[3rem] shadow-2xl border border-white/20 dark:border-white/5 relative overflow-hidden"
                        >
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                            <div className="mb-10 text-center lg:text-left">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Welcome Back</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Enter your credentials to access the nexus.</p>
                            </div>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl mb-8 flex items-center gap-3 text-sm font-bold"
                                >
                                    <Shield size={18} />
                                    {error}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Identity</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                        <input
                                            type="text" // Allow email or username
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-black/50 border-2 border-slate-100 dark:border-white/10 p-5 pl-14 rounded-[1.5rem] focus:bg-white dark:focus:bg-black focus:border-blue-500 text-slate-900 dark:text-white font-bold transition-all outline-none placeholder:text-slate-400 group-hover:border-slate-200 dark:group-hover:border-white/20"
                                            placeholder="user@nexus.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Passcode</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-black/50 border-2 border-slate-100 dark:border-white/10 p-5 pl-14 rounded-[1.5rem] focus:bg-white dark:focus:bg-black focus:border-blue-500 text-slate-900 dark:text-white font-bold transition-all outline-none placeholder:text-slate-400 group-hover:border-slate-200 dark:group-hover:border-white/20"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            Authenticating...
                                        </>
                                    ) : (
                                        <>
                                            Enter Nexus
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div className="mt-8 text-center bg-slate-50 dark:bg-white/5 rounded-2xl p-4">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Demo Access</p>
                                <div className="flex flex-wrap justify-center gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                                    <span title="Administrator">admin@compliance.pro</span>
                                    <span className="opacity-30">|</span>
                                    <span title="Employee">employee@compliance.pro</span>
                                    <span className="opacity-30">|</span>
                                    <span title="Auditor">auditor@compliance.pro</span>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-2">Pass: admin123 / user123</p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

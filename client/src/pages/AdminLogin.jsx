import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Loader2, ArrowLeft, Mail, Lock as LockIcon, AlertTriangle } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import ThemeToggle from '../components/ThemeToggle';

const AdminLogin = () => {
    console.log('AdminLogin Component Mounting...');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    // Auto-redirect if already logged in
    useEffect(() => {
        if (user && user.role === 'Admin') {
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await login(email, password);

            // Verify admin role
            if (user.role !== 'Admin') {
                setError('Access denied. This portal is for administrators only.');
                toast.error('Access denied. Please use the correct portal for your role.');
                setLoading(false);
                return;
            }

            toast.success('Welcome back, Compliance Officer!');
            setTimeout(() => navigate('/dashboard'), 500);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Login failed';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-background text-foreground transition-all duration-500">
            {/* Left Branding Section - Ultra Professional Indigo */}
            <div className="hidden lg:flex lg:w-1/2 bg-[#0a0c14] dark:bg-slate-950 items-center justify-center relative overflow-hidden p-12 lg:p-24 border-r border-white/5">
                <div className="absolute inset-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px]" />
                </div>

                <div className="relative z-10 max-w-lg">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="w-24 h-24 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] flex items-center justify-center shadow-2xl mb-12 border border-white/10"
                    >
                        <ShieldCheck className="text-indigo-500" size={48} />
                    </motion.div>

                    <h1 className="text-6xl font-black text-white mb-8 tracking-tighter leading-none">
                        ENTERPRISE <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-blue-400">MANAGEMENT</span>
                    </h1>

                    <p className="text-slate-400 text-xl leading-relaxed mb-12 font-medium">
                        Sophisticated regulatory oversight, automated task orchestration, and high-fidelity analytics.
                    </p>

                    <div className="space-y-6">
                        {[
                            { title: 'Global Oversight', desc: 'Real-time monitoring across all departments.' },
                            { title: 'Protocol Integrity', desc: 'Immutable versioning for regulatory standards.' },
                            { title: 'Advanced Telemetry', desc: 'Predictive analytics and risk forecasting.' }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + (i * 0.1) }}
                                className="flex gap-4 items-start"
                            >
                                <div className="mt-1 w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-sm uppercase tracking-widest">{item.title}</h4>
                                    <p className="text-slate-500 text-sm mt-0.5">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 relative overflow-hidden">
                {/* Decorative BG for Form Side */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/50 dark:bg-indigo-950/10 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />

                <div className="absolute top-8 right-8 z-50">
                    <ThemeToggle />
                </div>

                <div className="w-full max-w-md animate-fade-in">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-bold transition-all mb-12 group"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="uppercase text-[10px] tracking-[0.2em]">Exit to Network</span>
                    </Link>

                    <div className="mb-12">
                        <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 uppercase">
                            Compliance Officer <span className="text-gradient">Portal</span>
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                            Identify yourself to access core system functions.
                        </p>
                    </div>

                    {error && (
                        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400 p-5 rounded-[1.5rem] mb-8 flex items-center gap-4 animate-shake">
                            <AlertTriangle size={24} />
                            <span className="text-xs font-black uppercase tracking-widest">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Universal Identity</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    readOnly
                                    onFocus={(e) => e.target.removeAttribute('readonly')}
                                    autoComplete="new-password"
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 pl-14 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 text-slate-900 dark:text-white font-bold transition-all outline-none"
                                    placeholder="officer@compliance.pro"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Security Key</label>
                            <div className="relative group">
                                <LockIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    readOnly
                                    onFocus={(e) => e.target.removeAttribute('readonly')}
                                    autoComplete="new-password"
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 pl-14 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 text-slate-900 dark:text-white font-bold transition-all outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-indigo-600 hover:bg-slate-900 dark:hover:bg-indigo-500 text-white w-full py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-indigo-200 dark:shadow-none transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Validating...
                                </>
                            ) : (
                                'Initiate Session'
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center mb-6">
                            Cross-Network Portals
                        </p>
                        <div className="flex gap-4">
                            <Link to="/employee-login" className="flex-1 text-center py-4 px-6 rounded-[1.25rem] border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                                Employee
                            </Link>
                            <Link to="/auditor-login" className="flex-1 text-center py-4 px-6 rounded-[1.25rem] border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                                Auditor
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;

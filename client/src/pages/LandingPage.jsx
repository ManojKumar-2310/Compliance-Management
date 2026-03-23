import { Link } from 'react-router-dom';
import { Shield, Users, FileCheck, ChevronRight, ArrowRight, Lock, Activity, Globe, CheckCircle2, ShieldCheck, BarChart3, Search } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import ThemeToggle from '../components/ThemeToggle';
import clsx from 'clsx';
import { useRef } from 'react';

const LandingPage = () => {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    const portals = [
        {
            role: 'Admin',
            path: '/admin-login',
            desc: 'Orchestrate compliance protocols and oversee risk matrices.',
            icon: Shield,
            color: 'indigo',
            gradient: 'from-indigo-600 to-blue-600'
        },
        {
            role: 'Employee',
            path: '/employee-login',
            desc: 'Execute assigned directives and submit evidence.',
            icon: Users,
            color: 'emerald',
            gradient: 'from-emerald-600 to-teal-500'
        },
        {
            role: 'Auditor',
            path: '/auditor-login',
            desc: 'Verify adherence and validate immutable logs.',
            icon: FileCheck,
            color: 'purple',
            gradient: 'from-purple-600 to-fuchsia-600'
        }
    ];

    const features = [
        { icon: Globe, title: 'Global Standards', desc: 'Unified framework for cross-border regulatory compliance.' },
        { icon: Lock, title: 'Zero Trust Security', desc: 'Enterprise-grade encryption with role-based access control.' },
        { icon: Activity, title: 'Real-time Telemetry', desc: 'Live dashboards monitoring organizational health pulse.' },
        { icon: Search, title: 'Deep Audit Trails', desc: 'Immutable logging for every action within the nexus.' },
    ];

    return (
        <div ref={containerRef} className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-500 overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
            {/* Navigation */}
            <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-slate-200 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Shield className="text-white" size={20} />
                        </div>
                        <span className="text-xl font-black tracking-tighter">NEXUS <span className="text-indigo-600">CORE</span></span>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="hidden md:flex items-center gap-6 text-sm font-bold text-slate-500 dark:text-slate-400">
                            <a href="#features" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Capabilities</a>
                            <a href="#portals" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Portals</a>
                            <a href="#security" className="hover:text-indigo-600 dark:hover:text-white transition-colors">Security</a>
                        </div>
                        <div className="h-6 w-px bg-slate-200 dark:bg-white/10 hidden md:block" />
                        <ThemeToggle />
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-500/20 rounded-[100%] blur-[120px] -z-10 animate-pulse-glow" />

                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-8">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">System Operational v2.4</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-8 leading-[0.9]">
                            COMPLIANCE <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600">EVOLVED</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto font-medium leading-relaxed mb-12">
                            The central nervous system for modern enterprise governance.
                            Automate regulations, synchronize teams, and visualize risk in real-time.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a href="#portals" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-500/30 transition-all hover:-translate-y-1 active:scale-95 flex items-center gap-2">
                                Initialize Session <ArrowRight size={16} />
                            </a>
                            <a href="#features" className="px-8 py-4 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2">
                                Explore Architecture
                            </a>
                        </div>
                    </motion.div>
                </div>

                {/* Floating UI Elements */}
                <motion.div style={{ y }} className="absolute md:top-1/4 -right-20 -z-10 opacity-50 dark:opacity-30 hidden lg:block">
                    <div className="bg-slate-900 p-6 rounded-3xl border border-white/10 shadow-2xl w-80 transform rotate-12">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500"><CheckCircle2 size={24} /></div>
                            <div>
                                <div className="h-2 w-24 bg-slate-700 rounded full mb-2" />
                                <div className="h-1.5 w-16 bg-slate-800 rounded-full" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-2 w-full bg-slate-800 rounded-full" />
                            <div className="h-2 w-5/6 bg-slate-800 rounded-full" />
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Portals Section */}
            <section id="portals" className="py-24 relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-16 text-center">
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">Select Access Node</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Identify your role to enter the secure environment.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {portals.map((portal, idx) => (
                            <Link to={portal.path} key={portal.role} className="group">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    viewport={{ once: true }}
                                    className="h-full relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 transition-all duration-500 hover:shadow-2xl hover:border-indigo-500/30 dark:hover:border-indigo-500/30 group-hover:-translate-y-2"
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${portal.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

                                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${portal.gradient} flex items-center justify-center mb-8 shadow-lg shadow-${portal.color}-500/20 group-hover:scale-110 transition-transform duration-500`}>
                                        <portal.icon className="text-white" size={32} />
                                    </div>

                                    <h3 className="text-2xl font-black mb-3 text-slate-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-indigo-600 dark:group-hover:from-white dark:group-hover:to-indigo-400 transition-colors">
                                        {portal.role}
                                    </h3>

                                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">
                                        {portal.desc}
                                    </p>

                                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white group-hover:gap-4 transition-all">
                                        Enter Portal <ArrowRight size={14} />
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-24 bg-slate-100 dark:bg-white/5 border-y border-slate-200 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                className="text-center md:text-left"
                            >
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white mb-6">
                                    <feature.icon size={24} />
                                </div>
                                <h4 className="text-lg font-black uppercase tracking-tight mb-2">{feature.title}</h4>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-200 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        © 2026 Nexus Core Compliance.
                    </p>
                    <div className="flex gap-6">
                        <a href="#" className="text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors"><ShieldCheck size={20} /></a>
                        <a href="#" className="text-slate-400 hover:text-indigo-600 dark:hover:text-white transition-colors"><BarChart3 size={20} /></a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

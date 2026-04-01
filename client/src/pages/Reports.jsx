import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { FileText, Printer, ShieldCheck, CheckCircle, Search, User, BookOpen, Layers } from 'lucide-react';
import clsx from 'clsx';
import useAuth from '../hooks/useAuth';

const Reports = ({ embedded = false }) => {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(user?.role === 'Employee' ? user.name : '');
    const [showReport, setShowReport] = useState(false);
    const [activeReport, setActiveReport] = useState(null);

    const handleViewDetails = (report) => {
        setActiveReport({
            employee: report.assignedTo?.name || 'Unknown',
            timestamp: report.completedAt ? new Date(report.completedAt).toLocaleString() : new Date(report.updatedAt).toLocaleString(),
            taskTitle: report.title,
            taskDescription: report.description || 'No description provided.',
            status: report.status,
            remarks: report.auditFeedback?.remarks || 'No remarks provided.'
        });
        setShowReport(true);
    };

    const fetchReports = async () => {

        try {
            const { data } = await api.get('/reports/verified');
            setReports(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching verified reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handlePrint = () => {
        window.print();
    };


    const handleExport = async () => {
        try {
            const response = await api.get('/reports/export', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `compliance-report-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const filteredReports = Array.isArray(reports) ? reports.filter(item => {
        const search = searchTerm.toLowerCase();
        return (item?.assignedTo?.name || '').toLowerCase().includes(search) ||
               (item?.title || '').toLowerCase().includes(search) ||
               (item?.regulationId?.title || '').toLowerCase().includes(search);
    }) : [];

    if (loading) return (
        <div className={clsx("flex flex-col items-center justify-center gap-8", !embedded && "min-h-screen bg-slate-50 dark:bg-slate-950")}>
            <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-slate-900 dark:text-white font-black tracking-widest uppercase text-xs animate-pulse">Compiling Verification Data...</p>
        </div>
    );

    return (
        <div className={clsx("transition-colors duration-300", !embedded && "min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-10")}>
            {/* Header */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12"
            >
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <ShieldCheck className="text-indigo-500" size={24} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Audit Intelligence</span>
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                        Compliance <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Reports</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-3 text-lg tracking-tight">Verified Protocol Directive Manifest.</p>
                </div>
                
                <div className="flex gap-4">
                    <button
                        onClick={handlePrint}
                        className="px-6 py-3 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                    >
                        <Printer size={16} className="text-indigo-500" />
                        Download PDF
                    </button>
                </div>
            </motion.header>

            {/* Verification Registry */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900/50 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden"
            >
                {/* Search & Statistics */}
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" size={18} />
                        <input 
                            type="text"
                            placeholder="Filter by Employee, Directive or Protocol..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Verified</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{filteredReports.length}</p>
                        </div>
                        <div className="w-px h-10 bg-slate-100 dark:bg-slate-800" />
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Status</p>
                            <div className="flex items-center gap-2 text-emerald-500">
                                <span className="text-2xl font-black uppercase">Secure</span>
                                <CheckCircle size={20} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Report Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <th className="px-10 py-6">
                                    <div className="flex items-center gap-2">
                                        <User size={14} className="text-indigo-500" />
                                        Employee Name
                                    </div>
                                </th>
                                <th className="px-10 py-6">
                                    <div className="flex items-center gap-2">
                                        <BookOpen size={14} className="text-indigo-500" />
                                        Protocol Registry
                                    </div>
                                </th>
                                <th className="px-10 py-6">
                                    <div className="flex items-center gap-2">
                                        <Layers size={14} className="text-indigo-500" />
                                        Directives
                                    </div>
                                </th>
                                <th className="px-10 py-6 text-right">Verification Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredReports.map((report) => (
                                <tr 
                                    key={report._id} 
                                    onClick={() => handleViewDetails(report)}
                                    className="group hover:bg-slate-50 dark:hover:bg-indigo-500/5 transition-all duration-300 cursor-pointer"
                                >
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 flex items-center justify-center text-indigo-500 font-black text-sm border border-indigo-500/10 group-hover:scale-110 transition-transform">
                                                {report.assignedTo?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-900 dark:text-white tracking-tight">{report.assignedTo?.name}</p>
                                                <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-0.5">Verified Personnel</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl inline-block border border-slate-200 dark:border-slate-700">
                                            <p className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">
                                                {report.regulationId?.title || 'System Protocol'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="max-w-md">
                                            <p className="font-bold text-slate-900 dark:text-white mb-1">{report.title}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                                                {report.description || 'No additional directive description provided.'}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <p className="text-sm font-black text-slate-900 dark:text-white">
                                            {report.completedAt ? new Date(report.completedAt).toLocaleDateString() : new Date(report.updatedAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-[10px] uppercase font-black text-emerald-500 tracking-widest mt-1 group-hover:animate-pulse">Verified</p>
                                    </td>
                                </tr>
                            ))}
                            {filteredReports.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-10 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <Layers size={64} className="text-slate-400" />
                                            <p className="font-black uppercase tracking-[0.4em] text-sm text-slate-400">No verified directives found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Verification Report Modal */}
            <AnimatePresence>
                {showReport && activeReport && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden relative"
                        >
                            {/* Decorative Header */}
                            <div className="bg-indigo-600 p-8 text-white relative">
                                <div className="absolute top-0 right-0 p-8 opacity-20">
                                    <ShieldCheck size={120} />
                                </div>
                                <div className="relative z-10">
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-indigo-200">Official Protocol Document</p>
                                    <h2 className="text-3xl font-black uppercase tracking-tight">Audit Verification <span className="text-indigo-200 text-badge ml-2 px-3 py-1 bg-white/20 rounded-full text-sm align-middle">CERTIFIED</span></h2>
                                </div>
                            </div>

                            <div className="p-10 space-y-10">
                                {/* Report Grid */}
                                <div className="grid grid-cols-2 gap-10">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Personnel Identifier</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 font-black text-xs">
                                                {activeReport.employee.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{activeReport.employee}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Verified Personnel</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Audit Timestamp</p>
                                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{activeReport.timestamp}</p>
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Compliance Directive</p>
                                    <p className="text-lg font-black text-indigo-600 dark:text-indigo-400 mb-2 tracking-tight uppercase">{activeReport.taskTitle}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{activeReport.taskDescription}</p>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Verification Outcome</p>
                                    <div className="flex items-start gap-4">
                                        <div className="px-4 py-2 rounded-xl border font-black uppercase text-xs tracking-widest bg-emerald-500/10 border-emerald-500/20 text-emerald-500">
                                            {activeReport.status}
                                        </div>
                                        <div className="flex-1 p-5 bg-slate-900/5 dark:bg-slate-950/40 rounded-2xl border-l-4 border-indigo-500">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">Auditor Remarks</p>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 italic tracking-tight">"{activeReport.remarks}"</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-end pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <div className="text-center">
                                        <div className="w-32 h-1 bg-slate-200 dark:bg-slate-800 mb-2 mx-auto" />
                                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">Digital Identity Signature</p>
                                    </div>
                                    <button
                                        onClick={() => setShowReport(false)}
                                        className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-10 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] hover:scale-105 transition-all shadow-xl active:scale-95"
                                    >
                                        Acknowledge and Close
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <footer className="mt-16 text-center pb-10">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.5em]">Nexus Core Intelligence Framework - Secure Protocol Registry v2.0</p>
            </footer>
        </div>
    );
};

export default Reports;


import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { UserPlus, Edit2, Trash2, ShieldCheck, Mail, Briefcase, CheckCircle, XCircle, Clock, Eye, AlertCircle, Calendar, Plus, Lock, LayoutGrid, X, Search, User } from 'lucide-react';
import clsx from 'clsx';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-hot-toast';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
};

// PROJECT_GROUPS removed

const Users = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showTasksModal, setShowTasksModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const roles = ['All', 'Employee', 'Auditor', 'Compliance Officer'];
    const [departments, setDepartments] = useState([]);
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Employee',
        department: '',
        designation: '',
        isActive: true
    });

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const { data } = await api.get('/departments');
            setDepartments(data || []);
        } catch (error) {
            console.error('Error fetching departments:', error);
            setDepartments([
                { name: 'Healthcare / Medical' },
                { name: 'Education' },
                { name: 'Banking' },
                { name: 'Finance' },
                { name: 'Insurance' },
                { name: 'Information Technology (IT)' },
                { name: 'Software Companies' },
                { name: 'Manufacturing' },
                { name: 'Pharmaceutical' },
                { name: 'Construction' }
            ]);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchDepartments();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                const dataToSend = { ...formData };
                if (!dataToSend.password) delete dataToSend.password;

                await api.put(`/users/${editingId}`, dataToSend);
                toast.success('User updated successfully');
            } else {
                await api.post('/users', formData);
                toast.success('User created successfully');
            }
            setShowModal(false);
            setEditingId(null);
            resetForm();
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
            toast.error(error.response?.data?.message || 'Error saving user');
        }
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', password: '', role: 'Employee', department: '', designation: '', isActive: true });
        setShowPassword(false);
    };

    const handleEdit = (user) => {
        setEditingId(user._id);
        setFormData({
            name: user.name,
            email: user.email,
            password: '',
            role: user.role,
            department: user.department || '',
            designation: user.designation || '',
            isActive: user.isActive
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (id === currentUser._id) {
            toast.error("You cannot delete your own account.");
            return;
        }
        if (window.confirm('Are you sure you want to remove this user from the system?')) {
            try {
                await api.delete(`/users/${id}`);
                toast.success('User deleted');
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user');
            }
        }
    };

    const isAdmin = currentUser?.role === 'Admin';

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.designation?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' ||
            (roleFilter === 'Compliance Officer' ? (u.role === 'Compliance Officer' || u.role === 'Admin') : u.role === roleFilter);
        return matchesSearch && matchesRole;
    });

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 gap-8">
            <div className="relative">
                <div className="w-20 h-20 border-4 border-slate-200 dark:border-slate-800 rounded-full" />
                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                <div className="absolute inset-4 border-4 border-blue-500 rounded-full border-b-transparent animate-spin direction-reverse duration-700" />
            </div>
            <p className="text-slate-900 dark:text-white font-black tracking-[0.3em] uppercase text-xs animate-pulse">Syncing Personnel Database...</p>
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
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Identity Access Management</span>
                    </div>
                    <h2 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9] mb-4">
                        Personnel <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-600">Grid</span>
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed">
                        Authorized personnel directory and access control matrix.
                    </p>
                </div>

                <div className="flex flex-col items-end gap-4 w-full xl:w-auto">
                    <div className="flex gap-4 w-full sm:w-auto">
                        <div className="relative group flex-1 sm:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search personnel..."
                                className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-bold text-slate-900 dark:text-white"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {isAdmin && (
                            <button
                                onClick={() => {
                                    setEditingId(null);
                                    resetForm();
                                    setShowModal(true);
                                }}
                                className="px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95 whitespace-nowrap"
                            >
                                <UserPlus size={20} />
                                <span className="uppercase tracking-widest text-xs hidden sm:inline">Onboard User</span>
                            </button>
                        )}
                    </div>

                    <div className="flex gap-2 flex-wrap">
                        {roles.map(role => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={clsx(
                                    'px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border transition-all',
                                    roleFilter === role
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30'
                                        : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:text-indigo-500'
                                )}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.header>

            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                <AnimatePresence mode="popLayout">
                    {filteredUsers.map((u) => (
                        <motion.div
                            key={u._id}
                            variants={itemVariants}
                            layout
                            className="group relative bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 hover:shadow-2xl dark:hover:shadow-indigo-500/10 transition-all duration-300 overflow-hidden flex flex-col"
                        >
                            <div className={clsx(
                                "absolute top-0 right-0 w-24 h-24 blur-[50px] rounded-full transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none",
                                u.role === 'Admin' ? 'bg-red-500/20' :
                                    u.role === 'Compliance Officer' ? 'bg-indigo-500/20' :
                                        'bg-blue-500/20'
                            )} />

                            <div className="flex justify-between items-start mb-6 z-10">
                                <span className={clsx(
                                    'px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border flex items-center gap-1.5',
                                    u.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800' :
                                        'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800'
                                )}>
                                    {u.isActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                    {u.isActive ? 'Active' : 'Revoked'}
                                </span>
                                {isAdmin && (
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setSelectedUser(u); setShowTasksModal(true); }} className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:scale-110 transition-transform"><Briefcase size={14} /></button>
                                        <button onClick={() => handleEdit(u)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg hover:scale-110 transition-transform"><Edit2 size={14} /></button>
                                        <button onClick={() => handleDelete(u._id)} className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg hover:scale-110 transition-transform"><Trash2 size={14} /></button>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-4 mb-6 z-10">
                                <div className={clsx(
                                    "w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold uppercase shadow-inner",
                                    u.role === 'Admin' ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400" :
                                        u.role === 'Compliance Officer' ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400" :
                                            "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                )}>
                                    {u.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{u.name}</h3>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Designation</h5>
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                        <Briefcase size={16} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{u.designation || 'Staff'}</span>
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 z-10 space-y-3 mt-auto">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Role</span>
                                    <span className={clsx(
                                        "text-xs font-bold",
                                        u.role === 'Admin' ? "text-red-500" :
                                            u.role === 'Compliance Officer' ? "text-indigo-500" :
                                                "text-blue-500"
                                    )}>{u.role}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Unit</span>
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{u.department || 'General'}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {showTasksModal && selectedUser && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/90 backdrop-blur-md" onClick={() => setShowTasksModal(false)} />
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-white dark:bg-slate-950 rounded-[2.5rem] max-w-4xl w-full max-h-[85vh] overflow-hidden relative shadow-2xl border border-white/20 dark:border-slate-800 flex flex-col"
                    >
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Operational Assignments</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">Task roster for <span className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedUser.name}</span></p>
                            </div>
                            <button onClick={() => setShowTasksModal(false)} className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all border border-slate-100 dark:border-slate-800">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-black/20">
                            {selectedUser.assignedMissions?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {selectedUser.assignedMissions.map((m, idx) => (
                                        <div key={idx} className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className={clsx(
                                                    'px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest',
                                                    m.threatLevel === 'High' ? 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400' :
                                                        m.threatLevel === 'Medium' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' :
                                                            'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                                )}>
                                                    {m.threatLevel} Priority
                                                </span>
                                                <span className="text-[10px] font-bold uppercase text-slate-400">{m.missionStatus}</span>
                                            </div>
                                            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2 leading-none">
                                                {m.missionObjective}
                                            </h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-4 border-l-2 border-slate-100 dark:border-slate-800 pl-3">
                                                {m.tacticalIntelligence}
                                            </p>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <Calendar size={12} /> Target: {new Date(m.deadline).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
                                    <AlertCircle size={48} className="text-slate-300 dark:text-slate-700" />
                                    <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">No Active Directives</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
                    >
                        <div className="absolute inset-0 bg-slate-900/60 dark:bg-black/90 backdrop-blur-md" onClick={() => setShowModal(false)} />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 40 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 40 }}
                            className="bg-white dark:bg-slate-900 rounded-[3rem] max-w-2xl w-full p-10 relative shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />

                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-1">
                                        {editingId ? 'Modify Credentials' : 'Onboard Personnel'}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Define parameters for system access.</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[1.5rem] transition-all text-sm font-bold text-slate-900 dark:text-white"
                                            placeholder="e.g. Sarah Connor"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Identity</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            readOnly
                                            onFocus={(e) => e.target.removeAttribute('readonly')}
                                            autoComplete="new-password"
                                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[1.5rem] transition-all text-sm font-bold text-slate-900 dark:text-white"
                                            placeholder="sarah@resistance.net"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{editingId ? 'Reset Password' : 'Secure Key'}</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required={!editingId}
                                            readOnly
                                            onFocus={(e) => e.target.removeAttribute('readonly')}
                                            autoComplete="new-password"
                                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[1.5rem] transition-all text-sm font-bold text-slate-900 dark:text-white"
                                            placeholder={editingId ? "Leave blank to keep current" : "••••••••"}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Role</label>
                                        <div className="relative">
                                            <select
                                                name="role"
                                                value={formData.role}
                                                onChange={handleChange}
                                                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[1.5rem] transition-all text-sm font-bold text-slate-900 dark:text-white appearance-none cursor-pointer"
                                            >
                                                {roles.filter(r => r !== 'All').map(role => (
                                                    <option key={role} value={role}>{role}</option>
                                                ))}
                                            </select>
                                            <LayoutGrid className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit</label>
                                        <div className="relative">
                                            <select
                                                name="department"
                                                value={formData.department}
                                                onChange={handleChange}
                                                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[1.5rem] transition-all text-sm font-bold text-slate-900 dark:text-white appearance-none cursor-pointer"
                                            >
                                                <option value="" disabled>Select Unit</option>
                                                {departments.map((dept, idx) => (
                                                    <option key={idx} value={dept.name}>{dept.name}</option>
                                                ))}
                                                <option value="Other">Other / Remote</option>
                                            </select>
                                            <Briefcase className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 items-end">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation</label>
                                        <input
                                            type="text"
                                            name="designation"
                                            value={formData.designation}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500 rounded-[1.5rem] transition-all text-sm font-bold text-slate-900 dark:text-white"
                                            placeholder="e.g. Senior Analyst"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 items-end">
                                    <label className={clsx(
                                        "flex items-center gap-3 cursor-pointer p-4 rounded-[1.5rem] border-2 transition-all h-[58px]",
                                        formData.isActive ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 dark:border-emerald-500/50" : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                    )}>
                                        <div className={clsx(
                                            "w-6 h-6 rounded-lg flex items-center justify-center transition-colors",
                                            formData.isActive ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-700"
                                        )}>
                                            {formData.isActive && <CheckCircle size={14} />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <span className={clsx(
                                            "text-xs font-black uppercase tracking-wider",
                                            formData.isActive ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400"
                                        )}>Authorized Access</span>
                                    </label>
                                </div>

                                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-8 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl font-bold text-slate-500 transition-colors uppercase text-xs tracking-wider"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-10 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 active:scale-95 transition-all font-black uppercase text-xs tracking-wider"
                                    >
                                        {editingId ? 'Update Credentials' : 'Authorize Identity'}
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

export default Users;

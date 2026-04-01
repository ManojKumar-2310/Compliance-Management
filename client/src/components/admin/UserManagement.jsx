import { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Trash2, Search, Activity, ShieldCheck, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import api from '../../api/axios';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const filtered = users.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredUsers(filtered);
    }, [searchTerm, users]);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data || []);
            setFilteredUsers(data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            await api.delete(`/users/${userId}`);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        }
    };

    const toggleStatus = async (user) => {
        try {
            await api.patch(`/users/${user._id}`, {
                isActive: !user.isActive
            });
            toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
            fetchUsers();
        } catch (error) {
            console.error('Error toggling user status:', error);
            toast.error('Failed to update user status');
        }
    };

    const getRoleBadgeColor = (role) => {
        const colors = {
            Admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            Employee: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            Manager: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            Auditor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            'Compliance Officer': 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        };
        return colors[role] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-4 lg:p-8">
            {/* Header and Onboarding */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-5xl font-black tracking-tighter mb-2 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent uppercase">
                        Personnel Registry
                    </h1>
                    <p className="text-slate-400 font-medium tracking-wide">Manage global authority levels and professional identities</p>
                </motion.div>

                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                        setSelectedUser(null);
                        setShowModal(true);
                    }}
                    className="bg-indigo-600 hover:bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3"
                >
                    <Plus size={20} />
                    Onboard Personnel
                </motion.button>
            </div>

            {/* Stats HUD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { label: 'Total Personnel', value: users.length, icon: Users, color: 'blue' },
                    { label: 'Active Specialists', value: users.filter(u => u.isActive).length, icon: Activity, color: 'emerald' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-800 shadow-2xl group hover:border-slate-700 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-500/10 flex items-center justify-center text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-black text-white tabular-nums">{stat.value}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Tactical Search */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-900/40 backdrop-blur-xl p-2 rounded-[2rem] border border-slate-800 shadow-2xl"
            >
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Interrogate registry by name, identity, or unit..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-800/50 pl-14 pr-6 py-5 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 text-slate-100 font-bold placeholder:text-slate-600 transition-all"
                        />
                    </div>
                </div>
            </motion.div>

            {/* Users Table */}
            <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="text-left p-4 font-semibold">Name</th>
                                <th className="text-left p-4 font-semibold">Email</th>
                                <th className="text-left p-4 font-semibold">Role</th>
                                <th className="text-left p-4 font-semibold">Department</th>
                                <th className="text-left p-4 font-semibold">Designation</th>
                                <th className="text-left p-4 font-semibold">Status</th>
                                <th className="text-left p-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center p-8 text-muted-foreground">
                                        <Users size={48} className="mx-auto mb-2 opacity-50" />
                                        <p>No users found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <motion.tr
                                        key={user._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="border-b border-border hover:bg-muted/30 transition-colors"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-medium">{user.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-muted-foreground">{user.email}</td>
                                        <td className="p-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-solid ${getRoleBadgeColor(user.role)}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4">{user.department || '-'}</td>
                                        <td className="p-4 font-medium text-slate-600 dark:text-slate-400">{user.designation || '-'}</td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => toggleStatus(user)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${user.isActive
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}
                                            >
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </button>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-blue-600"
                                                    title="Edit user"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-red-600"
                                                    title="Delete user"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stats Block Removed from bottom */}
            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                            onClick={() => setShowModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-slate-900 rounded-[2.5rem] max-w-lg w-full p-8 relative shadow-2xl border border-slate-800"
                        >
                            <h3 className="text-2xl font-black text-white mb-6 tracking-tighter uppercase">
                                {selectedUser ? 'Modify Identity' : 'Onboard Personnel'}
                            </h3>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    const formData = new FormData(e.target);
                                    const userData = Object.fromEntries(formData.entries());
                                    if (selectedUser) {
                                        await api.put(`/users/${selectedUser._id}`, userData);
                                        toast.success('Identity synchronized across network');
                                    } else {
                                        await api.post('/users', userData);
                                        toast.success('Personnel successfully onboarded');
                                    }
                                    setShowModal(false);
                                    fetchUsers();
                                } catch (error) {
                                    toast.error('Insecure connection or validation failure');
                                }
                            }} className="space-y-5 text-left">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
                                    <input required name="name" type="text" defaultValue={selectedUser?.name} className="w-full px-5 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm font-bold text-white" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Universal Identity (Email)</label>
                                    <input required name="email" type="text" defaultValue={selectedUser?.email} className="w-full px-5 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm font-bold text-white" />
                                </div>
                                {!selectedUser && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Security Key (Password)</label>
                                        <input required name="password" type="password" className="w-full px-5 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm font-bold text-white" />
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Authority Level</label>
                                        <select name="role" defaultValue={selectedUser?.role || 'Employee'} className="w-full px-5 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm font-bold cursor-pointer text-white">
                                            <option value="Employee">Employee</option>
                                            <option value="Auditor">Auditor</option>
                                            <option value="Manager">Manager</option>
                                            <option value="Compliance Officer">Compliance Officer</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Business Unit</label>
                                        <input name="department" type="text" defaultValue={selectedUser?.department} className="w-full px-5 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm font-bold text-white" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation</label>
                                    <input name="designation" type="text" defaultValue={selectedUser?.designation} className="w-full px-5 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 transition-all text-sm font-bold text-white" />
                                </div>
                                <div className="flex justify-end gap-3 mt-8">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 hover:bg-slate-800 rounded-xl font-bold text-slate-500 transition-colors uppercase text-[10px] tracking-widest">Abort</button>
                                    <button type="submit" className="px-10 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 shadow-xl shadow-blue-500/20 active:scale-95 transition-all font-black uppercase text-[10px] tracking-[0.2em]">Synchronize</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UserManagement;

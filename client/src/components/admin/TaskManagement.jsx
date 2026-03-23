import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ROLES = [
    "Software Developer", "Network Engineer", "IT Support Engineer", "Cyber Security Analyst",
    "Loan Processing Officer", "KYC Executive", "Finance Executive", "Compliance Executive",
    "Fire Officer", "Safety Inspector", "Emergency Response Staff", "Safety Documentation Officer",
    "Machine Operator", "Production Staff", "Quality Inspector", "Maintenance Technician",
    "Admin Officer", "Lab Technician", "Student Records Officer", "Academic Coordinator",
    "Cloud Architect", "Frontend Developer", "Backend Engineer", "DevOps Engineer",
    "Risk Analyst", "Internal Auditor", "Tax Consultant", "Legal Advisor",
    "Operations Manager", "Supply Chain Coordinator", "Logistics Specialist", "Inventory Controller",
    "HR Manager", "Recruitment Specialist", "Training Coordinator", "Payroll Executive",
    "Marketing Manager", "SEO Specialist", "Content Writer", "Social Media Manager"
];

const NAMES = [
    "Arjun R", "Priya S", "Karthik M", "Divya P", "Rahul T",
    "Sneha V", "Manoj K", "Sanjay L", "Meena R", "Ajith B",
    "Harini K", "Praveen D", "Lavanya G", "Rohit N", "Keerthi S",
    "Naveen P", "Surya V", "Akila T", "Dinesh R", "Swetha M",
    "Vikram C", "Ananya J", "Rohan B", "Ishani W", "Kunal P",
    "Tanvi L", "Aditya G", "Radhika K", "Siddharth S", "Zoya F",
    "Varun M", "Isha D", "Abhishek N", "Maya R", "Rishi V",
    "Aavya H", "Pranav S", "Tara T", "Kabir K", "Myra G"
];

const TaskManagement = () => {
    const [missions, setMissions] = useState([]);
    const [filteredMissions, setFilteredMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMission, setEditingMission] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [threatFilter, setThreatFilter] = useState('All');
    const [regulations, setRegulations] = useState([]);

    const [formData, setFormData] = useState({
        missionObjective: '',
        tacticalIntelligence: '',
        protocol: '',
        assignedSpecialist: { name: '', role: '' },
        threatLevel: 'Medium',
        missionStatus: 'Pending',
        deadline: ''
    });

    // Generate dynamic specialists
    const specialists = NAMES.map((name, i) => ({
        name,
        role: ROLES[i % ROLES.length]
    }));

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        let filtered = [...missions];

        if (searchTerm) {
            filtered = filtered.filter(m =>
                m.missionObjective?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.assignedSpecialist?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter !== 'All') {
            filtered = filtered.filter(m => m.missionStatus === statusFilter);
        }

        if (threatFilter !== 'All') {
            filtered = filtered.filter(m => m.threatLevel === threatFilter);
        }

        setFilteredMissions(filtered);
    }, [missions, searchTerm, statusFilter, threatFilter]);

    const fetchData = async () => {
        try {
            const [missionsRes, regsRes] = await Promise.all([
                api.get('/mission'),
                api.get('/regulations')
            ]);
            setMissions(missionsRes.data.data || missionsRes.data || []);
            setRegulations(regsRes.data.data || regsRes.data || []);
        } catch (error) {
            console.error('Error fetching mission data:', error);
            toast.error('Failed to load mission protocols');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingMission) {
                await api.patch(`/mission/${editingMission._id}`, formData);
                toast.success('Strategy updated successfully!');
            } else {
                await api.post('/mission', formData);
                toast.success('Strategic Mission Authorized for Launch!');
            }
            setShowModal(false);
            resetForm();
            fetchData();
        } catch (error) {
            console.error('Action failed:', error);
            toast.error(error.response?.data?.message || 'Authorization failed');
        }
    };

    const handleEdit = (mission) => {
        setEditingMission(mission);
        setFormData({
            missionObjective: mission.missionObjective || '',
            tacticalIntelligence: mission.tacticalIntelligence || '',
            protocol: mission.protocol || '',
            assignedSpecialist: mission.assignedSpecialist || { name: '', role: '' },
            threatLevel: mission.threatLevel || 'Medium',
            missionStatus: mission.missionStatus || 'Pending',
            deadline: mission.deadline ? mission.deadline.split('T')[0] : ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Terminate mission protocol? All data will be expunged.')) return;

        try {
            await api.delete(`/mission/${id}`);
            toast.success('Mission expunged from registry.');
            fetchData();
        } catch (error) {
            console.error('Deletion failed:', error);
            toast.error('Failed to terminate mission');
        }
    };

    const resetForm = () => {
        setFormData({
            missionObjective: '',
            tacticalIntelligence: '',
            protocol: '',
            assignedSpecialist: { name: '', role: '' },
            threatLevel: 'Medium',
            missionStatus: 'Pending',
            deadline: ''
        });
        setEditingMission(null);
    };

    const getThreatColor = (level) => {
        switch (level) {
            case 'High': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
            case 'Medium': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
            case 'Low': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'In Progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'Submitted': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Mission Interface Controls */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col xl:flex-row gap-6 items-stretch xl:items-center justify-between bg-slate-900/40 backdrop-blur-xl p-4 rounded-[2.5rem] border border-slate-800 shadow-2xl"
            >
                <div className="flex-1 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Scan missions by objective or specialist..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800/50 pl-14 pr-6 py-4 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 text-slate-100 font-bold placeholder:text-slate-600 transition-all"
                    />
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                    <div className="flex bg-slate-950/50 p-1 rounded-2xl border border-slate-800/50">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-transparent text-[10px] font-black uppercase tracking-widest px-4 py-2 border-none focus:ring-0 text-slate-400 cursor-pointer hover:text-white transition-colors"
                        >
                            <option value="All">All Status</option>
                            <option value="Pending">Pending Authorization</option>
                            <option value="In Progress">Field Operations</option>
                            <option value="Submitted">Intelligence Uploaded</option>
                            <option value="Completed">Target Neutralized</option>
                        </select>
                        <div className="w-px bg-slate-800 my-2"></div>
                        <select
                            value={threatFilter}
                            onChange={(e) => setThreatFilter(e.target.value)}
                            className="bg-transparent text-[10px] font-black uppercase tracking-widest px-4 py-2 border-none focus:ring-0 text-slate-400 cursor-pointer hover:text-white transition-colors"
                        >
                            <option value="All">All Threat Levels</option>
                            <option value="High">High Threat</option>
                            <option value="Medium">Medium Priority</option>
                            <option value="Low">Low Risk</option>
                        </select>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            resetForm();
                            setShowModal(true);
                        }}
                        className="bg-blue-600 hover:bg-slate-900 text-white px-8 py-4 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all flex items-center gap-3"
                    >
                        <Plus size={20} />
                        Strategic Launch
                    </motion.button>
                </div>
            </motion.div>

            {/* Tactical Intelligence Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Active Protocols', val: missions.length, color: 'from-blue-500 to-indigo-600' },
                    { label: 'Pending Auth', val: missions.filter(t => t.missionStatus === 'Pending').length, color: 'from-indigo-500 to-purple-600' },
                    { label: 'Field Ops', val: missions.filter(t => t.missionStatus === 'In Progress').length, color: 'from-blue-400 to-cyan-500' },
                    { label: 'Neutralized', val: missions.filter(t => t.missionStatus === 'Completed').length, color: 'from-emerald-400 to-teal-500' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-colors group"
                    >
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2 group-hover:text-slate-300 transition-colors">{stat.label}</p>
                        <p className={`text-4xl font-black bg-gradient-to-br ${stat.color} bg-clip-text text-transparent tracking-tighter`}>{stat.val}</p>
                    </motion.div>
                ))}
            </div>

            {/* Strategic Mission Registry */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-950/50 border-b border-slate-800">
                            <tr>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Objective</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Assigned Specialist</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Threat</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Deadline</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Override</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredMissions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center text-slate-500">
                                        <AlertTriangle size={48} className="mx-auto mb-4 opacity-20" />
                                        <p className="font-black uppercase tracking-[0.2em] text-[10px]">No Strategic Data Found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredMissions.map((mission, idx) => (
                                    <motion.tr
                                        key={mission._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + idx * 0.05 }}
                                        className="group hover:bg-slate-800/30 transition-all cursor-default"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="max-w-xs">
                                                <p className="font-black text-sm text-slate-100 uppercase tracking-tight group-hover:text-blue-400 transition-colors">{mission.missionObjective}</p>
                                                <p className="text-[11px] text-slate-500 mt-2 font-medium line-clamp-1 italic leading-relaxed">
                                                    "{mission.tacticalIntelligence}"
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-blue-400 font-black text-xs shadow-lg group-hover:scale-110 transition-transform">
                                                    {mission.assignedSpecialist?.name?.charAt(0) || '?'}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-slate-300 uppercase tracking-wide">{mission.assignedSpecialist?.name}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold">{mission.assignedSpecialist?.role}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-solid ${getThreatColor(mission.threatLevel)}`}>
                                                {mission.threatLevel}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-solid flex items-center gap-2 ${getStatusColor(mission.missionStatus)}`}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                                                    {mission.missionStatus}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-slate-200">{mission.deadline ? new Date(mission.deadline).toLocaleDateString() : 'UNDEFINED'}</span>
                                                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter mt-1">Zero Hour</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(59, 130, 246, 0.1)' }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleEdit(mission)}
                                                    className="p-3 rounded-xl text-blue-400 border border-transparent hover:border-blue-500/30 transition-all"
                                                >
                                                    <Edit2 size={18} />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleDelete(mission._id)}
                                                    className="p-3 rounded-xl text-rose-500 border border-transparent hover:border-rose-500/30 transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </motion.button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Launch Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl"
                            onClick={() => {
                                setShowModal(false);
                                resetForm();
                            }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 max-w-3xl w-full relative shadow-3xl overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

                            <h2 className="text-3xl font-black mb-8 text-white uppercase tracking-tighter">
                                {editingMission ? 'Tactical Re-Alignment' : 'Strategic Mission Launch'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Mission Objective</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.missionObjective}
                                        onChange={(e) => setFormData({ ...formData, missionObjective: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 text-slate-100 font-bold placeholder:text-slate-700 transition-all"
                                        placeholder="Identify primary goal..."
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Tactical Intelligence</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={formData.tacticalIntelligence}
                                        onChange={(e) => setFormData({ ...formData, tacticalIntelligence: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-800 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 text-slate-100 font-bold placeholder:text-slate-700 transition-all resize-none"
                                        placeholder="Intelligence brief..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Protocol Framework</label>
                                        <select
                                            required
                                            value={formData.protocol}
                                            onChange={(e) => setFormData({ ...formData, protocol: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 text-slate-100 font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="" className="bg-slate-900">Select Protocol</option>
                                            {regulations.map((reg) => (
                                                <option key={reg._id} value={reg.title} className="bg-slate-900">{reg.title}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-3 relative">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Assigned Specialist</label>
                                        <select
                                            required
                                            value={`${formData.assignedSpecialist.name}|${formData.assignedSpecialist.role}`}
                                            onChange={(e) => {
                                                const [name, role] = e.target.value.split('|');
                                                setFormData({ ...formData, assignedSpecialist: { name, role } });
                                            }}
                                            className="w-full bg-slate-950 border border-slate-800 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 text-slate-100 font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="|" className="bg-slate-900">Deploy Personnel</option>
                                            {specialists.map((s, idx) => (
                                                <option key={idx} value={`${s.name}|${s.role}`} className="bg-slate-900">
                                                    {s.name} — {s.role}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Threat Level</label>
                                        <select
                                            value={formData.threatLevel}
                                            onChange={(e) => setFormData({ ...formData, threatLevel: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 text-slate-100 font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="Low" className="bg-slate-900 text-blue-400">Low Risk</option>
                                            <option value="Medium" className="bg-slate-900 text-indigo-400">Medium Priority</option>
                                            <option value="High" className="bg-slate-900 text-rose-500">High Threat</option>
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Mission Status</label>
                                        <select
                                            value={formData.missionStatus}
                                            onChange={(e) => setFormData({ ...formData, missionStatus: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 text-slate-100 font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="Pending" className="bg-slate-900">Pending Authorization</option>
                                            <option value="In Progress" className="bg-slate-900">Field Operations</option>
                                            <option value="Submitted" className="bg-slate-900">Intelligence Uploaded</option>
                                            <option value="Completed" className="bg-slate-900">Neutralized</option>
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Final Deadline</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.deadline}
                                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-800 px-6 py-4 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 text-slate-100 font-bold [color-scheme:dark]"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="flex-1 bg-indigo-600 hover:bg-slate-900 text-white py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl shadow-indigo-500/20 transition-all border border-transparent hover:border-indigo-500/30"
                                    >
                                        {editingMission ? 'Authorize Update' : 'Authorize Launch'}
                                    </motion.button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                        className="px-8 py-5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-[1.5rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all"
                                    >
                                        Abort
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TaskManagement;

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, User, Phone, GraduationCap } from 'lucide-react';
import MemberForm from '../components/MemberForm';
import { storage, generateId } from '../utils/localStorage';

const Members = () => {
    const [members, setMembers] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = () => {
        const membersData = storage.getMembers();
        setMembers(membersData);
    };

    const handleAddMember = (memberData) => {
        const newMember = {
            id: generateId(),
            ...memberData
        };

        const updatedMembers = [...members, newMember];
        storage.saveMembers(updatedMembers);
        setMembers(updatedMembers);
        setShowForm(false);
    };

    const handleEditMember = (memberData) => {
        const updatedMembers = members.map(member =>
            member.id === editingMember.id ? { ...member, ...memberData } : member
        );
        storage.saveMembers(updatedMembers);
        setMembers(updatedMembers);
        setEditingMember(null);
    };

    const handleDeleteMember = (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus anggota ini?')) {
            const updatedMembers = members.filter(member => member.id !== id);
            storage.saveMembers(updatedMembers);
            setMembers(updatedMembers);
        }
    };

    const handleEditClick = (member) => {
        setEditingMember(member);
        setShowForm(true);
    };

    const filteredMembers = members.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.programStudi.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Data Anggota</h1>
                    <p className="text-gray-600">Kelola data anggota perpustakaan</p>
                </div>
                <button
                    onClick={() => {
                        setEditingMember(null);
                        setShowForm(true);
                    }}
                    className="btn-primary flex items-center justify-center space-x-2"
                >
                    <Plus size={20} />
                    <span>Tambah Anggota</span>
                </button>
            </div>

            {/* Search */}
            <div className="card">
                <div className="max-w-md">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Search size={16} className="inline mr-2" />
                        Cari Anggota
                    </label>
                    <input
                        type="text"
                        placeholder="Cari berdasarkan nama, NIM, atau program studi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="card">
                    <div className="flex items-center">
                        <div className="p-3 bg-primary-100 rounded-lg">
                            <User className="text-primary-600" size={24} />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-600">Total Anggota</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{members.length}</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <GraduationCap className="text-green-600" size={24} />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-600">Program Studi</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {new Set(members.map(m => m.programStudi)).size}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Phone className="text-purple-600" size={24} />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-600">Anggota Aktif</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{members.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Members Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="table-header">ID Anggota</th>
                                <th className="table-header">NIM</th>
                                <th className="table-header">Nama</th>
                                <th className="table-header">Program Studi</th>
                                <th className="table-header">No. HP</th>
                                <th className="table-header">Email</th>
                                <th className="table-header">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredMembers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        Tidak ada data anggota
                                    </td>
                                </tr>
                            ) : (
                                filteredMembers.map((member) => (
                                    <tr key={member.id} className="hover:bg-gray-50">
                                        <td className="table-cell font-mono text-sm">{member.id.slice(-8)}</td>
                                        <td className="table-cell font-medium">{member.nim}</td>
                                        <td className="table-cell">
                                            <div className="font-medium text-gray-900">{member.name}</div>
                                        </td>
                                        <td className="table-cell">{member.programStudi}</td>
                                        <td className="table-cell">{member.phone}</td>
                                        <td className="table-cell text-blue-600">{member.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEditClick(member)}
                                                    className="text-primary-600 hover:text-primary-900"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteMember(member.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Member Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <MemberForm
                            member={editingMember}
                            onSubmit={editingMember ? handleEditMember : handleAddMember}
                            onCancel={() => {
                                setShowForm(false);
                                setEditingMember(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Members;
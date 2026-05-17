import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const MemberForm = ({ member, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        nim: '',
        name: '',
        programStudi: '',
        phone: '',
        email: '',
        address: ''
    });

    const [errors, setErrors] = useState({});

    const programStudiOptions = [
        'Teknik Informatika',
        'Sistem Informasi',
        'Teknik Elektro',
        'Teknik Mesin',
        'Teknik Sipil',
        'Manajemen',
        'Akuntansi',
        'Ilmu Komunikasi',
        'Psikologi',
        'Kedokteran',
        'Hukum',
        'Arsitektur'
    ];

    useEffect(() => {
        if (member) {
            setFormData({
                nim: member.nim || '',
                name: member.name || '',
                programStudi: member.programStudi || '',
                phone: member.phone || '',
                email: member.email || '',
                address: member.address || ''
            });
        }
    }, [member]);

    const validate = () => {
        const newErrors = {};

        if (!formData.nim.trim()) newErrors.nim = 'NIM harus diisi';
        if (!formData.name.trim()) newErrors.name = 'Nama harus diisi';
        if (!formData.programStudi) newErrors.programStudi = 'Program studi harus dipilih';
        if (!formData.phone.trim()) newErrors.phone = 'Nomor HP harus diisi';
        if (formData.phone && !/^[0-9+\-\s]+$/.test(formData.phone))
            newErrors.phone = 'Format nomor HP tidak valid';
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            newErrors.email = 'Format email tidak valid';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">
                        {member ? 'Edit Anggota' : 'Tambah Anggota Baru'}
                    </h2>
                    <p className="text-gray-600">Isi data anggota dengan lengkap</p>
                </div>
                <button
                    onClick={onCancel}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* NIM */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            NIM *
                        </label>
                        <input
                            type="text"
                            name="nim"
                            value={formData.nim}
                            onChange={handleChange}
                            className={`input-field ${errors.nim ? 'border-red-500' : ''}`}
                            placeholder="Masukkan NIM"
                        />
                        {errors.nim && (
                            <p className="mt-1 text-sm text-red-600">{errors.nim}</p>
                        )}
                    </div>

                    {/* Nama */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nama Lengkap *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                            placeholder="Masukkan nama lengkap"
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    {/* Program Studi */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Program Studi *
                        </label>
                        <select
                            name="programStudi"
                            value={formData.programStudi}
                            onChange={handleChange}
                            className={`input-field ${errors.programStudi ? 'border-red-500' : ''}`}
                        >
                            <option value="">Pilih Program Studi</option>
                            {programStudiOptions.map((prodi) => (
                                <option key={prodi} value={prodi}>{prodi}</option>
                            ))}
                        </select>
                        {errors.programStudi && (
                            <p className="mt-1 text-sm text-red-600">{errors.programStudi}</p>
                        )}
                    </div>

                    {/* Nomor HP */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nomor HP *
                        </label>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`input-field ${errors.phone ? 'border-red-500' : ''}`}
                            placeholder="Contoh: 081234567890"
                        />
                        {errors.phone && (
                            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email (Opsional)
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                            placeholder="email@example.com"
                        />
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>
                </div>

                {/* Alamat */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alamat (Opsional)
                    </label>
                    <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="3"
                        className="input-field"
                        placeholder="Masukkan alamat lengkap"
                    />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn-secondary px-6"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="btn-primary px-6"
                    >
                        {member ? 'Simpan Perubahan' : 'Tambah Anggota'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default MemberForm;
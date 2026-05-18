import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const BookForm = ({ book, onSubmit, onCancel, categories }) => {
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        year: new Date().getFullYear(),
        category: categories[0] || '',
        isbn: '',
        total: 1,
        available: 1
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (book) {
            setFormData({
                title: book.title || '',
                author: book.author || '',
                year: book.year || new Date().getFullYear(),
                category: book.category || categories[0] || '',
                isbn: book.isbn || '',
                total: book.total || 1,
                available: book.available || 1
            });
        }
    }, [book, categories]);

    const validate = () => {
        const newErrors = {};

        if (!formData.title.trim()) newErrors.title = 'Judul harus diisi';
        if (!formData.author.trim()) newErrors.author = 'Pengarang harus diisi';
        if (!formData.year || formData.year < 1000 || formData.year > new Date().getFullYear())
            newErrors.year = 'Tahun tidak valid';
        if (!formData.category) newErrors.category = 'Kategori harus dipilih';
        if (formData.total < 1) newErrors.total = 'Jumlah total minimal 1';
        if (formData.available < 0 || formData.available > formData.total)
            newErrors.available = 'Jumlah tersedia tidak valid';

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
            [name]: name === 'year' || name === 'total' || name === 'available'
                ? parseInt(value) || 0
                : value
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
                        {book ? 'Edit Buku' : 'Tambah Buku Baru'}
                    </h2>
                    <p className="text-gray-600">Isi detail buku dengan lengkap</p>
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
                    {/* Judul */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Judul Buku *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={`input-field ${errors.title ? 'border-red-500' : ''}`}
                            placeholder="Masukkan judul buku"
                        />
                        {errors.title && (
                            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                        )}
                    </div>

                    {/* Pengarang */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Pengarang *
                        </label>
                        <input
                            type="text"
                            name="author"
                            value={formData.author}
                            onChange={handleChange}
                            className={`input-field ${errors.author ? 'border-red-500' : ''}`}
                            placeholder="Masukkan nama pengarang"
                        />
                        {errors.author && (
                            <p className="mt-1 text-sm text-red-600">{errors.author}</p>
                        )}
                    </div>

                    {/* Tahun Terbit */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tahun Terbit *
                        </label>
                        <input
                            type="number"
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            min="1000"
                            max={new Date().getFullYear()}
                            className={`input-field ${errors.year ? 'border-red-500' : ''}`}
                        />
                        {errors.year && (
                            <p className="mt-1 text-sm text-red-600">{errors.year}</p>
                        )}
                    </div>

                    {/* Kategori */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kategori *
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className={`input-field ${errors.category ? 'border-red-500' : ''}`}
                        >
                            {categories.map((category) => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                        {errors.category && (
                            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                        )}
                    </div>

                    {/* ISBN */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ISBN (Opsional)
                        </label>
                        <input
                            type="text"
                            name="isbn"
                            value={formData.isbn}
                            onChange={handleChange}
                            className="input-field"
                            placeholder="Masukkan nomor ISBN"
                        />
                    </div>

                    {/* Jumlah Total */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Jumlah Total *
                        </label>
                        <input
                            type="number"
                            name="total"
                            value={formData.total}
                            onChange={handleChange}
                            min="1"
                            className={`input-field ${errors.total ? 'border-red-500' : ''}`}
                        />
                        {errors.total && (
                            <p className="mt-1 text-sm text-red-600">{errors.total}</p>
                        )}
                    </div>

                    {/* Jumlah Tersedia */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Jumlah Tersedia *
                        </label>
                        <input
                            type="number"
                            name="available"
                            value={formData.available}
                            onChange={handleChange}
                            min="0"
                            max={formData.total}
                            className={`input-field ${errors.available ? 'border-red-500' : ''}`}
                        />
                        {errors.available && (
                            <p className="mt-1 text-sm text-red-600">{errors.available}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Maksimal: {formData.total}
                        </p>
                    </div>
                </div>

                {/* Deskripsi */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deskripsi (Opsional)
                    </label>
                    <textarea
                        name="description"
                        value={formData.description || ''}
                        onChange={handleChange}
                        rows="3"
                        className="input-field"
                        placeholder="Masukkan deskripsi singkat buku"
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
                        {book ? 'Simpan Perubahan' : 'Tambah Buku'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BookForm;
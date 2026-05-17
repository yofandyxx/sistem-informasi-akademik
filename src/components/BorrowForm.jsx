import { useState, useEffect } from 'react';
import { X, User, BookOpen, Calendar, Plus, Trash2 } from 'lucide-react';
const BorrowForm = ({ onSuccess, onCancel }) => {
    const [members, setMembers] = useState([]);
    const [books, setBooks] = useState([]);
    const [selectedMember, setSelectedMember] = useState('');
    const [selectedBooks, setSelectedBooks] = useState([]);
    const [dueDate, setDueDate] = useState('');
    const [notes, setNotes] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        loadData();
        // Set due date to 7 days from now
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        setDueDate(nextWeek.toISOString().split('T')[0]);
    }, []);

    const loadData = () => {
        setMembers(storage.getMembers());
        setBooks(storage.getBooks());
    };

    const validate = () => {
        const newErrors = {};

        if (!selectedMember) newErrors.member = 'Anggota harus dipilih';
        if (selectedBooks.length === 0) newErrors.books = 'Minimal satu buku harus dipilih';
        if (!dueDate) newErrors.dueDate = 'Tanggal pengembalian harus diisi';

        // Check if due date is in the future
        if (dueDate && new Date(dueDate) <= new Date()) {
            newErrors.dueDate = 'Tanggal pengembalian harus di masa depan';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddBook = (bookId) => {
        const book = books.find(b => b.id === bookId);
        if (book && book.available > 0) {
            if (!selectedBooks.find(b => b.id === bookId)) {
                setSelectedBooks([...selectedBooks, { ...book, borrowed: 1 }]);
            }
        }
    };

    const handleRemoveBook = (bookId) => {
        setSelectedBooks(selectedBooks.filter(book => book.id !== bookId));
    };

    const handleUpdateQuantity = (bookId, quantity) => {
        const book = books.find(b => b.id === bookId);
        if (book && quantity <= book.available) {
            setSelectedBooks(selectedBooks.map(book =>
                book.id === bookId ? { ...book, borrowed: Math.max(1, quantity) } : book
            ));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) return;

        const borrowing = {
            id: generateId(),
            memberId: selectedMember,
            bookIds: selectedBooks.map(book => book.id),
            quantities: selectedBooks.map(book => book.borrowed),
            borrowDate: new Date().toISOString(),
            dueDate: new Date(dueDate).toISOString(),
            returnDate: null,
            status: 'borrowed',
            notes: notes
        };

        // Update book availability
        const updatedBooks = books.map(book => {
            const selectedBook = selectedBooks.find(b => b.id === book.id);
            if (selectedBook) {
                return {
                    ...book,
                    available: book.available - selectedBook.borrowed
                };
            }
            return book;
        });

        // Save to localStorage
        const borrowings = storage.getBorrowings();
        const updatedBorrowings = [...borrowings, borrowing];
        storage.saveBorrowings(updatedBorrowings);
        storage.saveBooks(updatedBooks);

        // Reset form
        setSelectedMember('');
        setSelectedBooks([]);
        setNotes('');

        onSuccess?.();
    };

    const selectedMemberData = members.find(m => m.id === selectedMember);
    const availableBooks = books.filter(book => book.available > 0);
    const totalBooksBorrowed = selectedBooks.reduce((sum, book) => sum + book.borrowed, 0);

    return (
        <div className="p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Form Peminjaman Buku</h2>
                    <p className="text-gray-600">Isi data peminjaman dengan lengkap</p>
                </div>
                <button
                    onClick={onCancel}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Pilih Anggota */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User size={16} className="inline mr-2" />
                        Pilih Anggota *
                    </label>
                    <select
                        value={selectedMember}
                        onChange={(e) => setSelectedMember(e.target.value)}
                        className={`input-field ${errors.member ? 'border-red-500' : ''}`}
                    >
                        <option value="">-- Pilih Anggota --</option>
                        {members.map(member => (
                            <option key={member.id} value={member.id}>
                                {member.nim} - {member.name} ({member.programStudi})
                            </option>
                        ))}
                    </select>
                    {errors.member && (
                        <p className="mt-1 text-sm text-red-600">{errors.member}</p>
                    )}

                    {selectedMemberData && (
                        <div className="mt-3 p-4 bg-blue-50 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <span className="text-gray-600">Nama:</span>
                                    <span className="font-medium ml-2">{selectedMemberData.name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">NIM:</span>
                                    <span className="font-medium ml-2">{selectedMemberData.nim}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Program Studi:</span>
                                    <span className="font-medium ml-2">{selectedMemberData.programStudi}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">No. HP:</span>
                                    <span className="font-medium ml-2">{selectedMemberData.phone}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pilih Buku */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <BookOpen size={16} className="inline mr-2" />
                        Pilih Buku *
                    </label>

                    {errors.books && (
                        <p className="text-sm text-red-600 mb-2">{errors.books}</p>
                    )}

                    <div className="space-y-3">
                        <select
                            onChange={(e) => {
                                if (e.target.value) {
                                    handleAddBook(e.target.value);
                                    e.target.value = '';
                                }
                            }}
                            className="input-field"
                        >
                            <option value="">-- Pilih Buku --</option>
                            {availableBooks.map(book => (
                                <option key={book.id} value={book.id}>
                                    {book.title} - {book.author} (Tersedia: {book.available})
                                </option>
                            ))}
                        </select>

                        {/* Daftar Buku yang Dipilih */}
                        {selectedBooks.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                                <BookOpen size={32} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-gray-500">Belum ada buku dipilih</p>
                                <p className="text-sm text-gray-400 mt-1">Pilih buku dari dropdown di atas</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {selectedBooks.map(book => (
                                    <div key={book.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{book.title}</div>
                                            <div className="text-sm text-gray-600">{book.author}</div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                Kategori: {book.category} | Tahun: {book.year}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div>
                                                <label className="text-sm text-gray-600 mr-2">Jumlah:</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={book.available + book.borrowed}
                                                    value={book.borrowed}
                                                    onChange={(e) => handleUpdateQuantity(book.id, parseInt(e.target.value) || 1)}
                                                    className="w-20 px-3 py-1 border rounded-lg"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveBook(book.id)}
                                                className="text-red-600 hover:text-red-800 p-2"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Tanggal Pengembalian */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar size={16} className="inline mr-2" />
                        Tanggal Pengembalian *
                    </label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className={`input-field ${errors.dueDate ? 'border-red-500' : ''}`}
                    />
                    {errors.dueDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                        Maksimal peminjaman 30 hari
                    </p>
                </div>

                {/* Catatan */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catatan (Opsional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows="3"
                        className="input-field"
                        placeholder="Masukkan catatan tambahan..."
                    />
                </div>

                {/* Summary */}
                {selectedBooks.length > 0 && (
                    <div className="p-4 bg-primary-50 rounded-lg border border-primary-200">
                        <h3 className="font-medium text-primary-900 mb-3">Ringkasan Peminjaman:</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-600">Jumlah buku berbeda:</span>
                                <span className="font-medium ml-2">{selectedBooks.length}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Total buku dipinjam:</span>
                                <span className="font-medium ml-2">{totalBooksBorrowed}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Tanggal peminjaman:</span>
                                <span className="font-medium ml-2">{new Date().toLocaleDateString('id-ID')}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Batas pengembalian:</span>
                                <span className="font-medium ml-2">{new Date(dueDate).toLocaleDateString('id-ID')}</span>
                            </div>
                        </div>
                    </div>
                )}

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
                        disabled={!selectedMember || selectedBooks.length === 0}
                        className="btn-primary px-6 flex items-center space-x-2"
                    >
                        <Plus size={20} />
                        <span>Simpan Peminjaman</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default BorrowForm;
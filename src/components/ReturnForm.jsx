import { useState, useEffect } from 'react';
import { X, Calendar, CheckCircle, AlertCircle, User, BookOpen } from 'lucide-react';

const ReturnForm = ({ borrowing, onSuccess, onCancel }) => {
    const [returnDate, setReturnDate] = useState('');
    const [notes, setNotes] = useState('');
    const [member, setMember] = useState(null);
    const [books, setBooks] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (borrowing) {
            const currentDate = new Date();
            const formattedDate = currentDate.toISOString().split('T')[0];
            setReturnDate(formattedDate);

            // Get member data
            const members = storage.getMembers();
            const memberData = members.find(m => m.id === borrowing.memberId);
            setMember(memberData);

            // Get book data
            const allBooks = storage.getBooks();
            const borrowedBooks = borrowing.bookIds.map(bookId => {
                const book = allBooks.find(b => b.id === bookId);
                const index = borrowing.bookIds.indexOf(bookId);
                const quantity = borrowing.quantities?.[index] || 1;
                return { ...book, quantity };
            });
            setBooks(borrowedBooks);
        }
    }, [borrowing]);

    const validate = () => {
        const newErrors = {};

        if (!returnDate) newErrors.returnDate = 'Tanggal pengembalian harus diisi';
        if (returnDate && new Date(returnDate) < new Date(borrowing.borrowDate)) {
            newErrors.returnDate = 'Tanggal pengembalian tidak valid';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const calculateFine = () => {
        const dueDate = new Date(borrowing.dueDate);
        const returnDateObj = new Date(returnDate);
        const diffDays = Math.ceil((returnDateObj - dueDate) / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            const finePerDay = 5000; // Rp 5,000 per hari keterlambatan
            return diffDays * finePerDay;
        }
        return 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validate()) return;

        const fine = calculateFine();

        // Update borrowing status
        const borrowings = storage.getBorrowings();
        const updatedBorrowings = borrowings.map(b =>
            b.id === borrowing.id
                ? {
                    ...b,
                    returnDate: new Date(returnDate).toISOString(),
                    status: 'returned',
                    fine: fine,
                    notes: b.notes ? `${b.notes} | ${notes}` : notes
                }
                : b
        );

        // Update book availability
        const allBooks = storage.getBooks();
        const updatedBooks = allBooks.map(book => {
            if (borrowing.bookIds.includes(book.id)) {
                const index = borrowing.bookIds.indexOf(book.id);
                const quantity = borrowing.quantities?.[index] || 1;
                return {
                    ...book,
                    available: book.available + quantity
                };
            }
            return book;
        });

        // Save to localStorage
        storage.saveBorrowings(updatedBorrowings);
        storage.saveBooks(updatedBooks);

        onSuccess?.();
    };

    if (!borrowing || !member) {
        return (
            <div className="p-6">
                <div className="text-center py-8">
                    <AlertCircle size={48} className="mx-auto text-yellow-500 mb-4" />
                    <p className="text-gray-600">Data peminjaman tidak ditemukan</p>
                </div>
            </div>
        );
    }

    const dueDate = new Date(borrowing.dueDate);
    const returnDateObj = new Date(returnDate);
    const isOverdue = returnDateObj > dueDate;
    const fine = calculateFine();

    return (
        <div className="p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Form Pengembalian Buku</h2>
                    <p className="text-gray-600">Konfirmasi pengembalian buku</p>
                </div>
                <button
                    onClick={onCancel}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X size={24} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Informasi Anggota */}
                <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-3 flex items-center">
                        <User size={16} className="mr-2" />
                        Informasi Anggota
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <span className="text-gray-600">Nama:</span>
                            <span className="font-medium ml-2">{member.name}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">NIM:</span>
                            <span className="font-medium ml-2">{member.nim}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Program Studi:</span>
                            <span className="font-medium ml-2">{member.programStudi}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">No. HP:</span>
                            <span className="font-medium ml-2">{member.phone}</span>
                        </div>
                    </div>
                </div>

                {/* Daftar Buku */}
                <div>
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                        <BookOpen size={16} className="mr-2" />
                        Buku yang Dipinjam
                    </h3>
                    <div className="space-y-2">
                        {books.map((book, index) => (
                            <div key={book.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{book.title}</div>
                                    <div className="text-sm text-gray-600">{book.author}</div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Kategori: {book.category} | Jumlah: {book.quantity}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Informasi Peminjaman */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tanggal Pinjam
                        </label>
                        <div className="p-2 bg-gray-100 rounded-lg">
                            {new Date(borrowing.borrowDate).toLocaleDateString('id-ID')}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Batas Pengembalian
                        </label>
                        <div className={`p-2 rounded-lg ${isOverdue ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}>
                            {dueDate.toLocaleDateString('id-ID')}
                        </div>
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
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        min={borrowing.borrowDate.split('T')[0]}
                        max={new Date().toISOString().split('T')[0]}
                        className={`input-field ${errors.returnDate ? 'border-red-500' : ''}`}
                    />
                    {errors.returnDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.returnDate}</p>
                    )}
                </div>

                {/* Denda */}
                {fine > 0 && (
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h3 className="font-medium text-red-900 mb-2 flex items-center">
                            <AlertCircle size={16} className="mr-2" />
                            Denda Keterlambatan
                        </h3>
                        <div className="flex justify-between items-center">
                            <span className="text-red-700">Total denda:</span>
                            <span className="text-lg font-bold text-red-800">
                                Rp {fine.toLocaleString('id-ID')}
                            </span>
                        </div>
                        <p className="text-xs text-red-600 mt-2">
                            Keterlambatan: {Math.ceil((returnDateObj - dueDate) / (1000 * 60 * 60 * 24))} hari
                        </p>
                    </div>
                )}

                {/* Catatan */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Catatan Pengembalian (Opsional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows="3"
                        className="input-field"
                        placeholder="Masukkan catatan pengembalian..."
                    />
                </div>

                {/* Confirmation */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-start">
                        <CheckCircle className="text-green-600 mt-0.5 mr-3" size={20} />
                        <div>
                            <h3 className="font-medium text-green-900">Konfirmasi Pengembalian</h3>
                            <p className="text-sm text-green-800 mt-1">
                                Dengan mengkonfirmasi, stok buku akan ditambahkan kembali dan peminjaman akan ditandai sebagai selesai.
                            </p>
                        </div>
                    </div>
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
                        className="btn-primary px-6 flex items-center space-x-2"
                    >
                        <CheckCircle size={20} />
                        <span>Konfirmasi Pengembalian</span>
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReturnForm;
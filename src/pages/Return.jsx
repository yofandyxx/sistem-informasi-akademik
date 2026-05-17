import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, AlertCircle, Search, Filter } from 'lucide-react';
import { storage } from '../utils/localStorage';

const Return = () => {
    const [borrowings, setBorrowings] = useState([]);
    const [members, setMembers] = useState([]);
    const [books, setBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('borrowed');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        const borrowingsData = storage.getBorrowings();
        setBorrowings(borrowingsData);
        setMembers(storage.getMembers());
        setBooks(storage.getBooks());
    };

    const handleReturn = (borrowingId) => {
        if (window.confirm('Apakah Anda yakin ingin menandai sebagai dikembalikan?')) {
            const borrowing = borrowings.find(b => b.id === borrowingId);
            if (!borrowing) return;

            // Update borrowing status
            const updatedBorrowings = borrowings.map(b =>
                b.id === borrowingId
                    ? { ...b, returnDate: new Date().toISOString(), status: 'returned' }
                    : b
            );

            // Update book availability
            const updatedBooks = books.map(book => {
                if (borrowing.bookIds.includes(book.id)) {
                    const index = borrowing.bookIds.indexOf(book.id);
                    const quantity = borrowing.quantities[index] || 1;
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
            loadData();

            alert('Buku berhasil dikembalikan!');
        }
    };

    const getMemberName = (memberId) => {
        const member = members.find(m => m.id === memberId);
        return member ? `${member.name} (${member.nim})` : 'Unknown Member';
    };

    const getBookTitles = (bookIds) => {
        return bookIds.map(bookId => {
            const book = books.find(b => b.id === bookId);
            return book ? book.title : 'Unknown Book';
        });
    };

    const filteredBorrowings = borrowings.filter(borrowing => {
        const memberName = getMemberName(borrowing.memberId).toLowerCase();
        const matchesSearch = memberName.includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || borrowing.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    const activeBorrowings = borrowings.filter(b => b.status === 'borrowed');
    const overdueBorrowings = activeBorrowings.filter(b =>
        new Date(b.dueDate) < new Date()
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pengembalian Buku</h1>
                    <p className="text-gray-600">Kelola pengembalian buku yang dipinjam</p>
                </div>

                <div className="flex items-center space-x-2">
                    <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                        {overdueBorrowings.length} Terlambat
                    </div>
                    <div className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                        {activeBorrowings.length} Dipinjam
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card">
                    <h3 className="text-sm font-medium text-gray-600">Total Transaksi</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{borrowings.length}</p>
                </div>
                <div className="card">
                    <h3 className="text-sm font-medium text-gray-600">Sedang Dipinjam</h3>
                    <p className="text-2xl font-bold text-orange-600 mt-2">{activeBorrowings.length}</p>
                </div>
                <div className="card">
                    <h3 className="text-sm font-medium text-gray-600">Sudah Dikembalikan</h3>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                        {borrowings.filter(b => b.status === 'returned').length}
                    </p>
                </div>
                <div className="card">
                    <h3 className="text-sm font-medium text-gray-600">Terlambat</h3>
                    <p className="text-2xl font-bold text-red-600 mt-2">{overdueBorrowings.length}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Search size={16} className="inline mr-2" />
                        Cari Anggota
                    </label>
                    <input
                        type="text"
                        placeholder="Cari berdasarkan nama anggota..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Filter size={16} className="inline mr-2" />
                        Filter Status
                    </label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="input-field"
                    >
                        <option value="borrowed">Sedang Dipinjam</option>
                        <option value="returned">Sudah Dikembalikan</option>
                        <option value="all">Semua Status</option>
                    </select>
                </div>
            </div>

            {/* Borrowings Table */}
            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="table-header">ID Transaksi</th>
                                <th className="table-header">Anggota</th>
                                <th className="table-header">Buku yang Dipinjam</th>
                                <th className="table-header">Tanggal Pinjam</th>
                                <th className="table-header">Batas Kembali</th>
                                <th className="table-header">Status</th>
                                <th className="table-header">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredBorrowings.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                        Tidak ada data peminjaman
                                    </td>
                                </tr>
                            ) : (
                                filteredBorrowings.map((borrowing) => {
                                    const isOverdue = borrowing.status === 'borrowed' && new Date(borrowing.dueDate) < new Date();
                                    const isActive = borrowing.status === 'borrowed';

                                    return (
                                        <tr key={borrowing.id} className="hover:bg-gray-50">
                                            <td className="table-cell font-mono text-sm">{borrowing.id.slice(-8)}</td>
                                            <td className="table-cell">
                                                <div className="font-medium">{getMemberName(borrowing.memberId)}</div>
                                            </td>
                                            <td className="table-cell">
                                                <div className="max-w-xs">
                                                    {getBookTitles(borrowing.bookIds).map((title, index) => (
                                                        <div key={index} className="text-sm mb-1">
                                                            • {title}
                                                            {borrowing.quantities && borrowing.quantities[index] > 1 &&
                                                                ` (${borrowing.quantities[index]} eksemplar)`}
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="table-cell">
                                                {new Date(borrowing.borrowDate).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="table-cell">
                                                <div className={`font-medium ${isOverdue ? 'text-red-600' : isActive ? 'text-orange-600' : 'text-gray-600'
                                                    }`}>
                                                    {new Date(borrowing.dueDate).toLocaleDateString('id-ID')}
                                                    {isOverdue && (
                                                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                                            Terlambat
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="table-cell">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${borrowing.status === 'borrowed'
                                                        ? 'bg-orange-100 text-orange-800'
                                                        : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {borrowing.status === 'borrowed' ? (
                                                        <>
                                                            <AlertCircle size={12} className="mr-1" />
                                                            Dipinjam
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle size={12} className="mr-1" />
                                                            Dikembalikan
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {borrowing.status === 'borrowed' && (
                                                    <button
                                                        onClick={() => handleReturn(borrowing.id)}
                                                        className="btn-primary px-4 py-2"
                                                    >
                                                        Kembalikan
                                                    </button>
                                                )}
                                                {borrowing.status === 'returned' && (
                                                    <div className="text-green-600">
                                                        <div className="flex items-center">
                                                            <Calendar size={14} className="mr-1" />
                                                            {new Date(borrowing.returnDate).toLocaleDateString('id-ID')}
                                                        </div>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Overdue Warning */}
            {overdueBorrowings.length > 0 && (
                <div className="card bg-red-50 border-red-200">
                    <div className="flex items-start">
                        <AlertCircle className="text-red-600 mt-0.5 mr-3" size={20} />
                        <div>
                            <h3 className="font-semibold text-red-900">Peringatan: Buku Terlambat</h3>
                            <p className="text-red-800 text-sm mt-1">
                                Terdapat {overdueBorrowings.length} peminjaman yang sudah melewati batas pengembalian.
                                Segera hubungi anggota yang bersangkutan.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Return;
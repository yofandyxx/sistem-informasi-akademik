import { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    Calendar,
    Download,
    Filter,
    BookOpen,
    Users,
    Clock
} from 'lucide-react';

const Reports = () => {
    const [borrowings, setBorrowings] = useState([]);
    const [members, setMembers] = useState([]);
    const [books, setBooks] = useState([]);
    const [reportType, setReportType] = useState('activity');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });

    useEffect(() => {
        loadData();

        // Set default date range (last 30 days)
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);

        setDateRange({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        });
    }, []);

    const loadData = () => {
        const borrowingsData = storage.getBorrowings() || [];
        const membersData = storage.getMembers() || [];
        const booksData = storage.getBooks() || [];
        
        // Debug: Log data structure
        console.log('Borrowings data:', borrowingsData);
        console.log('Sample borrowing:', borrowingsData[0]);
        
        setBorrowings(borrowingsData);
        setMembers(membersData);
        setBooks(booksData);
    };

    const getMemberName = (memberId) => {
        if (!memberId) return 'Unknown';
        const member = members.find(m => m.id === memberId);
        return member ? member.name : 'Unknown';
    };

    const getBookTitle = (bookId) => {
        if (!bookId) return 'Unknown';
        const book = books.find(b => b.id === bookId);
        return book ? book.title : 'Unknown';
    };

    const getBookCategory = (bookId) => {
        if (!bookId) return 'Unknown';
        const book = books.find(b => b.id === bookId);
        return book ? book.category : 'Unknown';
    };

    const getActivityReport = () => {
        let filtered = [...borrowings];

        // Filter by date range
        if (dateRange.start && dateRange.end) {
            filtered = filtered.filter(borrowing => {
                if (!borrowing.borrowDate) return false;
                
                const borrowDate = new Date(borrowing.borrowDate);
                const start = new Date(dateRange.start);
                const end = new Date(dateRange.end);
                end.setHours(23, 59, 59, 999);
                
                return borrowDate >= start && borrowDate <= end;
            });
        }

        return filtered.map(borrowing => {
            // Handle different data structures
            const bookIds = borrowing.bookIds || (borrowing.bookId ? [borrowing.bookId] : []);
            const quantities = borrowing.quantities || [1];
            
            return {
                id: borrowing.id || Math.random().toString(),
                memberName: getMemberName(borrowing.memberId),
                bookTitles: bookIds.map(bookId => getBookTitle(bookId)),
                borrowDate: borrowing.borrowDate ? new Date(borrowing.borrowDate) : new Date(),
                returnDate: borrowing.returnDate ? new Date(borrowing.returnDate) : null,
                status: borrowing.status === 'borrowed' ? 'Dipinjam' : 
                        borrowing.status === 'returned' ? 'Dikembalikan' : 
                        borrowing.returnDate ? 'Dikembalikan' : 'Dipinjam',
                dueDate: borrowing.dueDate ? new Date(borrowing.dueDate) : new Date(),
                isOverdue: (borrowing.status === 'borrowed' || !borrowing.returnDate) && 
                          borrowing.dueDate && 
                          new Date(borrowing.dueDate) < new Date()
            };
        });
    };

    const getPopularBooksReport = () => {
        const bookStats = {};

        borrowings.forEach(borrowing => {
            // Handle different data structures
            const bookIds = borrowing.bookIds || (borrowing.bookId ? [borrowing.bookId] : []);
            const quantities = borrowing.quantities || [1];
            
            bookIds.forEach((bookId, index) => {
                if (!bookId) return; // Skip invalid book IDs
                
                const quantity = quantities[index] || 1;
                if (!bookStats[bookId]) {
                    bookStats[bookId] = {
                        bookId,
                        borrowCount: 0,
                        totalQuantity: 0
                    };
                }
                bookStats[bookId].borrowCount += 1;
                bookStats[bookId].totalQuantity += quantity;
            });
        });

        const result = Object.values(bookStats)
            .map(stat => {
                const book = books.find(b => b.id === stat.bookId);
                return {
                    ...stat,
                    title: book ? book.title : 'Unknown',
                    author: book ? book.author : 'Unknown',
                    category: book ? book.category : 'Unknown',
                    available: book ? (book.available || 0) : 0,
                    total: book ? (book.total || 0) : 0
                };
            })
            .filter(book => book.title !== 'Unknown') // Filter out unknown books
            .sort((a, b) => b.borrowCount - a.borrowCount);

        return result;
    };

    const activityReport = getActivityReport();
    const popularBooks = getPopularBooksReport();

    const exportToCSV = () => {
        let csvContent = '';

        if (reportType === 'activity') {
            csvContent = 'No.,Nama Anggota,Judul Buku,Tanggal Pinjam,Tanggal Kembali,Status,Batas Kembali\n';
            activityReport.forEach((item, index) => {
                csvContent += `${index + 1},"${item.memberName}","${item.bookTitles.join(', ')}",${item.borrowDate.toLocaleDateString('id-ID')},${item.returnDate ? item.returnDate.toLocaleDateString('id-ID') : '-'},${item.status},${item.dueDate.toLocaleDateString('id-ID')}\n`;
            });
        } else {
            csvContent = 'No.,Judul Buku,Pengarang,Kategori,Jumlah Dipinjam,Frekuensi,Tersedia/Total\n';
            popularBooks.forEach((item, index) => {
                csvContent += `${index + 1},"${item.title}","${item.author}","${item.category}",${item.totalQuantity},${item.borrowCount},${item.available}/${item.total}\n`;
            });
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `laporan_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Laporan</h1>
                    <p className="text-gray-600">Analisis dan statistik perpustakaan</p>
                </div>

                <button
                    onClick={exportToCSV}
                    disabled={reportType === 'activity' ? activityReport.length === 0 : popularBooks.length === 0}
                    className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${(reportType === 'activity' ? activityReport.length === 0 : popularBooks.length === 0)
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    <Download size={20} />
                    <span>Export CSV</span>
                </button>
            </div>

            {/* Report Type Selection */}
            <div className="bg-white rounded-xl shadow p-4">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setReportType('activity')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${reportType === 'activity'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <Calendar size={16} className="inline mr-2" />
                        Aktivitas Peminjaman
                    </button>
                    <button
                        onClick={() => setReportType('popular')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${reportType === 'popular'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <TrendingUp size={16} className="inline mr-2" />
                        Buku Populer
                    </button>
                </div>
            </div>

            {/* Date Range Filter */}
            {reportType === 'activity' && (
                <div className="bg-white rounded-xl shadow p-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                        <Filter size={16} className="mr-2" />
                        Filter Tanggal
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Dari Tanggal
                            </label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sampai Tanggal
                            </label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <BookOpen className="text-blue-600" size={24} />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-600">Total Buku</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{books.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Users className="text-green-600" size={24} />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-600">Total Anggota</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{members.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <BarChart3 className="text-orange-600" size={24} />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-600">Total Peminjaman</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{borrowings.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Clock className="text-purple-600" size={24} />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-600">Aktif Saat Ini</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {borrowings.filter(b => b.status === 'borrowed').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Table */}
            <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {reportType === 'activity' ? 'Laporan Aktivitas Peminjaman' : 'Laporan Buku Populer'}
                    </h2>
                    <p className="text-gray-600 text-sm">
                        {reportType === 'activity'
                            ? `Menampilkan ${activityReport.length} aktivitas peminjaman`
                            : `Menampilkan ${Math.min(popularBooks.length, 10)} buku berdasarkan popularitas`}
                    </p>
                </div>

                <div className="overflow-x-auto">
                    {reportType === 'activity' ? (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        No.
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Nama Anggota
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Judul Buku
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal Pinjam
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal Kembali
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Batas Kembali
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {activityReport.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                            {dateRange.start && dateRange.end 
                                                ? 'Tidak ada data untuk periode yang dipilih'
                                                : 'Belum ada data peminjaman'
                                            }
                                        </td>
                                    </tr>
                                ) : (
                                    activityReport.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {item.memberName}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="max-w-xs">
                                                    {item.bookTitles.map((title, idx) => (
                                                        <div key={idx} className="text-sm mb-1">• {title}</div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.borrowDate.toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.returnDate ? item.returnDate.toLocaleDateString('id-ID') : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${item.status === 'Dipinjam'
                                                        ? 'bg-orange-100 text-orange-800'
                                                        : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {item.status}
                                                    {item.isOverdue && item.status === 'Dipinjam' && (
                                                        <span className="ml-1 text-xs bg-red-100 text-red-800 px-1 py-0.5 rounded">
                                                            Terlambat
                                                        </span>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {item.dueDate.toLocaleDateString('id-ID')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        No.
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Judul Buku
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Pengarang
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kategori
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Jumlah Dipinjam
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Frekuensi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ketersediaan
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {popularBooks.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                            Belum ada data peminjaman
                                        </td>
                                    </tr>
                                ) : (
                                    popularBooks.slice(0, 10).map((book, index) => (
                                        <tr key={book.bookId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {book.title}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {book.author}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {book.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-semibold">
                                                {book.totalQuantity}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ 
                                                                width: `${Math.min(100, (book.borrowCount / Math.max(1, popularBooks[0]?.borrowCount || 1)) * 100)}%` 
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span>{book.borrowCount} kali</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className={`${book.available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {book.available} / {book.total}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;
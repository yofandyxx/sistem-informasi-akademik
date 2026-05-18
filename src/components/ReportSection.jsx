import { useState, useEffect } from 'react';
import {
    Calendar,
    TrendingUp,
    Download,
    Filter,
    BarChart3,
    Users,
    BookOpen,
    AlertCircle
} from 'lucide-react';


const ReportSection = () => {
    const [reportType, setReportType] = useState('activity');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });
    const [borrowings, setBorrowings] = useState([]);
    const [members, setMembers] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(false);

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
        setBorrowings(storage.getBorrowings());
        setMembers(storage.getMembers());
        setBooks(storage.getBooks());
    };

    const getMemberName = (memberId) => {
        const member = members.find(m => m.id === memberId);
        return member ? member.name : 'Unknown';
    };

    const getBookTitle = (bookId) => {
        const book = books.find(b => b.id === bookId);
        return book ? book.title : 'Unknown';
    };

    const getBookCategory = (bookId) => {
        const book = books.find(b => b.id === bookId);
        return book ? book.category : 'Unknown';
    };

    const getActivityReport = () => {
        let filtered = [...borrowings];

        // Filter by date range
        if (dateRange.start && dateRange.end) {
            filtered = filtered.filter(borrowing => {
                const borrowDate = new Date(borrowing.borrowDate);
                const start = new Date(dateRange.start);
                const end = new Date(dateRange.end);
                end.setHours(23, 59, 59, 999);
                return borrowDate >= start && borrowDate <= end;
            });
        }

        return filtered.map(borrowing => ({
            id: borrowing.id,
            memberName: getMemberName(borrowing.memberId),
            bookTitles: borrowing.bookIds.map(bookId => getBookTitle(bookId)),
            borrowDate: new Date(borrowing.borrowDate),
            returnDate: borrowing.returnDate ? new Date(borrowing.returnDate) : null,
            status: borrowing.status === 'borrowed' ? 'Dipinjam' : 'Dikembalikan',
            dueDate: new Date(borrowing.dueDate),
            isOverdue: borrowing.status === 'borrowed' && new Date(borrowing.dueDate) < new Date(),
            fine: borrowing.fine || 0
        }));
    };

    const getPopularBooksReport = () => {
        const bookStats = {};

        borrowings.forEach(borrowing => {
            borrowing.bookIds.forEach((bookId, index) => {
                const quantity = borrowing.quantities?.[index] || 1;
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
                    available: book ? book.available : 0,
                    total: book ? book.total : 0
                };
            })
            .sort((a, b) => b.borrowCount - a.borrowCount);

        return result;
    };

    const getMemberReport = () => {
        const memberStats = {};

        borrowings.forEach(borrowing => {
            if (!memberStats[borrowing.memberId]) {
                memberStats[borrowing.memberId] = {
                    memberId: borrowing.memberId,
                    borrowCount: 0,
                    activeBorrowings: 0,
                    totalBooksBorrowed: 0,
                    totalFines: 0
                };
            }
            memberStats[borrowing.memberId].borrowCount += 1;
            memberStats[borrowing.memberId].totalBooksBorrowed += borrowing.bookIds.length;

            if (borrowing.status === 'borrowed') {
                memberStats[borrowing.memberId].activeBorrowings += 1;
            }

            if (borrowing.fine) {
                memberStats[borrowing.memberId].totalFines += borrowing.fine;
            }
        });

        const result = Object.values(memberStats)
            .map(stat => {
                const member = members.find(m => m.id === stat.memberId);
                return {
                    ...stat,
                    name: member ? member.name : 'Unknown',
                    nim: member ? member.nim : 'Unknown',
                    programStudi: member ? member.programStudi : 'Unknown'
                };
            })
            .sort((a, b) => b.borrowCount - a.borrowCount);

        return result;
    };

    const exportToCSV = () => {
        setLoading(true);

        let csvContent = '';

        if (reportType === 'activity') {
            csvContent = 'No.,Nama Anggota,Judul Buku,Tanggal Pinjam,Tanggal Kembali,Status,Batas Kembali,Denda\n';
            const activityReport = getActivityReport();
            activityReport.forEach((item, index) => {
                csvContent += `${index + 1},"${item.memberName}","${item.bookTitles.join(', ')}",${item.borrowDate.toLocaleDateString('id-ID')},${item.returnDate ? item.returnDate.toLocaleDateString('id-ID') : '-'},${item.status},${item.dueDate.toLocaleDateString('id-ID')},${item.fine}\n`;
            });
        } else if (reportType === 'popular') {
            csvContent = 'No.,Judul Buku,Pengarang,Kategori,Jumlah Dipinjam,Frekuensi,Tersedia/Total\n';
            const popularBooks = getPopularBooksReport();
            popularBooks.forEach((item, index) => {
                csvContent += `${index + 1},"${item.title}","${item.author}","${item.category}",${item.totalQuantity},${item.borrowCount},${item.available}/${item.total}\n`;
            });
        } else {
            csvContent = 'No.,Nama,NIM,Program Studi,Jumlah Pinjaman,Buku Dipinjam,Aktif,Denda\n';
            const memberReport = getMemberReport();
            memberReport.forEach((item, index) => {
                csvContent += `${index + 1},"${item.name}","${item.nim}","${item.programStudi}",${item.borrowCount},${item.totalBooksBorrowed},${item.activeBorrowings},${item.totalFines}\n`;
            });
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `laporan_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        setTimeout(() => setLoading(false), 1000);
    };

    const activityReport = getActivityReport();
    const popularBooks = getPopularBooksReport();
    const memberReport = getMemberReport();

    return (
        <div className="space-y-6">
            {/* Report Type Selection */}
            <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pilih Jenis Laporan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                        onClick={() => setReportType('activity')}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center ${reportType === 'activity'
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                            }`}
                    >
                        <Calendar className={`mb-2 ${reportType === 'activity' ? 'text-primary-600' : 'text-gray-400'}`} size={24} />
                        <span className={`font-medium ${reportType === 'activity' ? 'text-primary-900' : 'text-gray-700'}`}>
                            Aktivitas Peminjaman
                        </span>
                        <span className="text-sm text-gray-500 mt-1">Riwayat transaksi</span>
                    </button>

                    <button
                        onClick={() => setReportType('popular')}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center ${reportType === 'popular'
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                            }`}
                    >
                        <TrendingUp className={`mb-2 ${reportType === 'popular' ? 'text-primary-600' : 'text-gray-400'}`} size={24} />
                        <span className={`font-medium ${reportType === 'popular' ? 'text-primary-900' : 'text-gray-700'}`}>
                            Buku Populer
                        </span>
                        <span className="text-sm text-gray-500 mt-1">Statistik buku</span>
                    </button>

                    <button
                        onClick={() => setReportType('members')}
                        className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center ${reportType === 'members'
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                            }`}
                    >
                        <Users className={`mb-2 ${reportType === 'members' ? 'text-primary-600' : 'text-gray-400'}`} size={24} />
                        <span className={`font-medium ${reportType === 'members' ? 'text-primary-900' : 'text-gray-700'}`}>
                            Aktivitas Anggota
                        </span>
                        <span className="text-sm text-gray-500 mt-1">Statistik anggota</span>
                    </button>
                </div>
            </div>

            {/* Date Range Filter */}
            <div className="card">
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
                            className="input-field"
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
                            className="input-field"
                        />
                    </div>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <BarChart3 className="text-blue-600" size={20} />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-600">Total Transaksi</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{borrowings.length}</p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <BookOpen className="text-green-600" size={20} />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-600">Buku Terpinjam</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {books.reduce((sum, book) => sum + (book.total - book.available), 0)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <Users className="text-orange-600" size={20} />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-600">Anggota Aktif</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {new Set(borrowings.map(b => b.memberId)).size}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex items-center">
                        <div className="p-3 bg-red-100 rounded-lg">
                            <AlertCircle className="text-red-600" size={20} />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-sm font-medium text-gray-600">Terlambat</h3>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {borrowings.filter(b => b.status === 'borrowed' && new Date(b.dueDate) < new Date()).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Table */}
            <div className="card overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {reportType === 'activity' && 'Laporan Aktivitas Peminjaman'}
                            {reportType === 'popular' && 'Laporan Buku Populer'}
                            {reportType === 'members' && 'Laporan Aktivitas Anggota'}
                        </h2>
                        <p className="text-gray-600 text-sm">
                            {reportType === 'activity' && `Menampilkan ${activityReport.length} aktivitas peminjaman`}
                            {reportType === 'popular' && `Menampilkan ${popularBooks.length} buku berdasarkan popularitas`}
                            {reportType === 'members' && `Menampilkan ${memberReport.length} anggota berdasarkan aktivitas`}
                        </p>
                    </div>

                    <button
                        onClick={exportToCSV}
                        disabled={loading}
                        className="btn-primary flex items-center justify-center space-x-2 mt-3 sm:mt-0"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Memproses...</span>
                            </>
                        ) : (
                            <>
                                <Download size={20} />
                                <span>Export CSV</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="overflow-x-auto">
                    {reportType === 'activity' ? (
                        <ActivityReportTable data={activityReport} />
                    ) : reportType === 'popular' ? (
                        <PopularBooksReportTable data={popularBooks} />
                    ) : (
                        <MembersReportTable data={memberReport} />
                    )}
                </div>
            </div>
        </div>
    );
};

// Subcomponents for different report tables
const ActivityReportTable = ({ data }) => (
    <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
            <tr>
                <th className="table-header">No.</th>
                <th className="table-header">Nama Anggota</th>
                <th className="table-header">Buku Dipinjam</th>
                <th className="table-header">Tanggal Pinjam</th>
                <th className="table-header">Tanggal Kembali</th>
                <th className="table-header">Status</th>
                <th className="table-header">Batas Kembali</th>
                <th className="table-header">Denda</th>
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
                <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        Tidak ada data untuk periode yang dipilih
                    </td>
                </tr>
            ) : (
                data.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                        <td className="table-cell">{index + 1}</td>
                        <td className="table-cell font-medium">{item.memberName}</td>
                        <td className="table-cell">
                            <div className="max-w-xs">
                                {item.bookTitles.slice(0, 2).map((title, idx) => (
                                    <div key={idx} className="text-sm mb-1">• {title}</div>
                                ))}
                                {item.bookTitles.length > 2 && (
                                    <div className="text-xs text-gray-500">+{item.bookTitles.length - 2} lainnya</div>
                                )}
                            </div>
                        </td>
                        <td className="table-cell">{item.borrowDate.toLocaleDateString('id-ID')}</td>
                        <td className="table-cell">
                            {item.returnDate ? item.returnDate.toLocaleDateString('id-ID') : '-'}
                        </td>
                        <td className="table-cell">
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
                        <td className="table-cell">{item.dueDate.toLocaleDateString('id-ID')}</td>
                        <td className="table-cell">
                            {item.fine > 0 ? (
                                <span className="text-red-600 font-medium">
                                    Rp {item.fine.toLocaleString('id-ID')}
                                </span>
                            ) : '-'}
                        </td>
                    </tr>
                ))
            )}
        </tbody>
    </table>
);

const PopularBooksReportTable = ({ data }) => (
    <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
            <tr>
                <th className="table-header">No.</th>
                <th className="table-header">Judul Buku</th>
                <th className="table-header">Pengarang</th>
                <th className="table-header">Kategori</th>
                <th className="table-header">Jumlah Dipinjam</th>
                <th className="table-header">Frekuensi</th>
                <th className="table-header">Ketersediaan</th>
                <th className="table-header">Popularitas</th>
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
                <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        Belum ada data peminjaman
                    </td>
                </tr>
            ) : (
                data.map((book, index) => {
                    const popularityPercentage = data.length > 0
                        ? Math.round((book.borrowCount / data[0].borrowCount) * 100)
                        : 0;

                    return (
                        <tr key={book.bookId} className="hover:bg-gray-50">
                            <td className="table-cell">{index + 1}</td>
                            <td className="table-cell font-medium">{book.title}</td>
                            <td className="table-cell">{book.author}</td>
                            <td className="table-cell">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                    {book.category}
                                </span>
                            </td>
                            <td className="table-cell">
                                <div className="font-semibold text-blue-600">{book.totalQuantity}</div>
                            </td>
                            <td className="table-cell">{book.borrowCount} kali</td>
                            <td className="table-cell">
                                <div className={`font-medium ${book.available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {book.available} / {book.total}
                                </div>
                            </td>
                            <td className="table-cell">
                                <div className="flex items-center">
                                    <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                                        <div
                                            className="bg-primary-600 h-2 rounded-full"
                                            style={{ width: `${popularityPercentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-sm text-gray-600">{popularityPercentage}%</span>
                                </div>
                            </td>
                        </tr>
                    );
                })
            )}
        </tbody>
    </table>
);

const MembersReportTable = ({ data }) => (
    <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
            <tr>
                <th className="table-header">No.</th>
                <th className="table-header">Nama</th>
                <th className="table-header">NIM</th>
                <th className="table-header">Program Studi</th>
                <th className="table-header">Jumlah Pinjaman</th>
                <th className="table-header">Total Buku</th>
                <th className="table-header">Aktif</th>
                <th className="table-header">Total Denda</th>
            </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
                <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        Belum ada data anggota
                    </td>
                </tr>
            ) : (
                data.map((member, index) => (
                    <tr key={member.memberId} className="hover:bg-gray-50">
                        <td className="table-cell">{index + 1}</td>
                        <td className="table-cell font-medium">{member.name}</td>
                        <td className="table-cell">{member.nim}</td>
                        <td className="table-cell">{member.programStudi}</td>
                        <td className="table-cell">
                            <div className="font-semibold text-blue-600">{member.borrowCount}</div>
                        </td>
                        <td className="table-cell">{member.totalBooksBorrowed}</td>
                        <td className="table-cell">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${member.activeBorrowings > 0
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                {member.activeBorrowings}
                            </span>
                        </td>
                        <td className="table-cell">
                            {member.totalFines > 0 ? (
                                <span className="text-red-600 font-medium">
                                    Rp {member.totalFines.toLocaleString('id-ID')}
                                </span>
                            ) : '-'}
                        </td>
                    </tr>
                ))
            )}
        </tbody>
    </table>
);

export default ReportSection;
import { useState, useEffect } from 'react';
import {
    BookOpen,
    Users,
    Calendar,
    TrendingUp,
    Clock,
    AlertCircle,
    BarChart3,
    CheckCircle,
    Activity,
    Award,
    ShieldCheck,
    TrendingDown
} from 'lucide-react';
import { storage } from '../utils/localStorage';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const [stats, setStats] = useState({
        books: 0,
        members: 0,
        borrowings: 0,
        activeBorrowings: 0,
        overdueBorrowings: 0,
        availableBooks: 0,
        totalCategories: 0,
        returnedBooks: 0
    });

    const [recentBorrowings, setRecentBorrowings] = useState([]);
    const [popularBooks, setPopularBooks] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [memberActivity, setMemberActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
        const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const loadDashboardData = () => {
        const books = storage.getBooks();
        const members = storage.getMembers();
        const borrowings = storage.getBorrowings();

        const activeBorrowings = borrowings.filter(b => b.status === 'borrowed');
        const overdueBorrowings = activeBorrowings.filter(b =>
            new Date(b.dueDate) < new Date()
        );
        const returnedBooks = borrowings.filter(b => b.status === 'returned').length;

        // Calculate popular books
        const bookStats = {};
        borrowings.forEach(borrowing => {
            borrowing.bookIds.forEach((bookId, index) => {
                if (!bookStats[bookId]) {
                    bookStats[bookId] = {
                        borrowCount: 0,
                        bookId
                    };
                }
                bookStats[bookId].borrowCount += 1;
            });
        });

        const popular = Object.values(bookStats)
            .map(stat => {
                const book = books.find(b => b.id === stat.bookId);
                return {
                    ...stat,
                    title: book ? book.title : 'Unknown',
                    author: book ? book.author : 'Unknown',
                    available: book ? book.available : 0
                };
            })
            .sort((a, b) => b.borrowCount - a.borrowCount)
            .slice(0, 5);

        // Get recent borrowings
        const recent = [...borrowings]
            .sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate))
            .slice(0, 5);

        // Get recent activity
        const activity = [...borrowings]
            .sort((a, b) => new Date(b.borrowDate) - new Date(a.borrowDate))
            .slice(0, 5)
            .map(borrowing => ({
                id: borrowing.id,
                type: borrowing.status === 'borrowed' ? 'Peminjaman' : 'Pengembalian',
                memberId: borrowing.memberId,
                bookIds: borrowing.bookIds,
                date: borrowing.status === 'borrowed' ? borrowing.borrowDate : borrowing.returnDate,
                status: borrowing.status
            }));

        // Calculate member activity
        const memberStats = {};
        borrowings.forEach(borrowing => {
            if (!memberStats[borrowing.memberId]) {
                memberStats[borrowing.memberId] = {
                    borrowCount: 0,
                    memberId: borrowing.memberId
                };
            }
            memberStats[borrowing.memberId].borrowCount += 1;
        });

        const topMembers = Object.values(memberStats)
            .map(stat => {
                const member = members.find(m => m.id === stat.memberId);
                return {
                    ...stat,
                    name: member ? member.name : 'Unknown',
                    nim: member ? member.nim : 'Unknown'
                };
            })
            .sort((a, b) => b.borrowCount - a.borrowCount)
            .slice(0, 5);

        setStats({
            books: books.length,
            members: members.length,
            borrowings: borrowings.length,
            activeBorrowings: activeBorrowings.length,
            overdueBorrowings: overdueBorrowings.length,
            availableBooks: books.reduce((sum, book) => sum + book.available, 0),
            totalCategories: new Set(books.map(book => book.category)).size,
            returnedBooks: returnedBooks
        });

        setPopularBooks(popular);
        setRecentBorrowings(recent);
        setRecentActivity(activity);
        setMemberActivity(topMembers);
        setLoading(false);
    };

    const getMemberName = (memberId) => {
        const members = storage.getMembers();
        const member = members.find(m => m.id === memberId);
        return member ? member.name : 'Unknown';
    };

    const getBookTitles = (bookIds) => {
        const books = storage.getBooks();
        return bookIds.slice(0, 2).map(bookId => {
            const book = books.find(b => b.id === bookId);
            return book ? book.title : 'Unknown';
        }).join(', ');
    };

    const getBookAvailabilityPercentage = () => {
        if (stats.books === 0) return 0;
        return Math.round((stats.availableBooks / (stats.books * 5)) * 100); // Assuming average 5 copies per book
    };

    const getReturnRate = () => {
        if (stats.borrowings === 0) return 100;
        return Math.round((stats.returnedBooks / stats.borrowings) * 100);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-600">Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard SIMPUS</h1>
                    <p className="text-gray-600">Selamat datang di Sistem Manajemen Perpustakaan Digital</p>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                    <div className="flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full">
                        <ShieldCheck size={14} className="mr-1" />
                        Sistem Aktif
                    </div>
                    <div className="text-gray-500">
                        {new Date().toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Books */}
                <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-900">Total Buku</p>
                            <p className="text-3xl font-bold text-blue-900 mt-2">{stats.books.toLocaleString()}</p>
                            <p className="text-sm text-blue-700 mt-1">
                                {stats.availableBooks} tersedia • {stats.totalCategories} kategori
                            </p>
                        </div>
                        <div className="p-3 bg-blue-500 rounded-lg">
                            <BookOpen className="text-white" size={28} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-blue-700">Ketersediaan</span>
                            <span className="font-medium">{getBookAvailabilityPercentage()}%</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${getBookAvailabilityPercentage()}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Total Members */}
                <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-900">Total Anggota</p>
                            <p className="text-3xl font-bold text-green-900 mt-2">{stats.members.toLocaleString()}</p>
                            <p className="text-sm text-green-700 mt-1">
                                Mahasiswa aktif
                            </p>
                        </div>
                        <div className="p-3 bg-green-500 rounded-lg">
                            <Users className="text-white" size={28} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-center text-sm text-green-700">
                            <Activity size={14} className="mr-1" />
                            {memberActivity.length} anggota paling aktif
                        </div>
                    </div>
                </div>

                {/* Active Borrowings */}
                <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-orange-900">Sedang Dipinjam</p>
                            <p className="text-3xl font-bold text-orange-900 mt-2">{stats.activeBorrowings}</p>
                            <p className="text-sm text-orange-700 mt-1">
                                {stats.overdueBorrowings} terlambat
                            </p>
                        </div>
                        <div className="p-3 bg-orange-500 rounded-lg">
                            <Calendar className="text-white" size={28} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <Link
                            to="/return"
                            className="text-sm text-orange-700 hover:text-orange-800 font-medium flex items-center"
                        >
                            <Clock size={14} className="mr-1" />
                            Kelola pengembalian
                        </Link>
                    </div>
                </div>

                {/* Return Rate */}
                <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow duration-300">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-900">Tingkat Pengembalian</p>
                            <p className="text-3xl font-bold text-purple-900 mt-2">{getReturnRate()}%</p>
                            <p className="text-sm text-purple-700 mt-1">
                                {stats.returnedBooks} dari {stats.borrowings} transaksi
                            </p>
                        </div>
                        <div className="p-3 bg-purple-500 rounded-lg">
                            <CheckCircle className="text-white" size={28} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-purple-700">Rasio pengembalian</span>
                            <span className="font-medium">{getReturnRate()}%</span>
                        </div>
                        <div className="w-full bg-purple-200 rounded-full h-2">
                            <div
                                className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${getReturnRate()}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Popular Books */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Link
                            to="/books"
                            className="card hover:shadow-lg transition-shadow duration-300 hover:border-primary-300 cursor-pointer group"
                        >
                            <div className="flex items-center">
                                <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                                    <BookOpen className="text-primary-600" size={20} />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-gray-600">Kelola Buku</h3>
                                    <p className="text-xs text-gray-500">Tambah/edit data buku</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            to="/borrow"
                            className="card hover:shadow-lg transition-shadow duration-300 hover:border-green-300 cursor-pointer group"
                        >
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                    <Calendar className="text-green-600" size={20} />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-gray-600">Peminjaman</h3>
                                    <p className="text-xs text-gray-500">Catat peminjaman</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            to="/return"
                            className="card hover:shadow-lg transition-shadow duration-300 hover:border-orange-300 cursor-pointer group"
                        >
                            <div className="flex items-center">
                                <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                                    <CheckCircle className="text-orange-600" size={20} />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-gray-600">Pengembalian</h3>
                                    <p className="text-xs text-gray-500">Proses pengembalian</p>
                                </div>
                            </div>
                        </Link>

                        <Link
                            to="/reports"
                            className="card hover:shadow-lg transition-shadow duration-300 hover:border-purple-300 cursor-pointer group"
                        >
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                    <BarChart3 className="text-purple-600" size={20} />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-gray-600">Laporan</h3>
                                    <p className="text-xs text-gray-500">Analisis & statistik</p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Popular Books */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <TrendingUp size={20} className="mr-2" />
                                Buku Paling Populer
                            </h2>
                            <span className="text-sm text-gray-500">Top 5</span>
                        </div>

                        <div className="space-y-4">
                            {popularBooks.length === 0 ? (
                                <div className="text-center py-8">
                                    <BookOpen size={32} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-gray-500">Belum ada data</p>
                                    <p className="text-sm text-gray-400 mt-1">Mulai catat peminjaman untuk melihat statistik</p>
                                </div>
                            ) : (
                                popularBooks.map((book, index) => (
                                    <div key={book.bookId} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="flex items-center">
                                            <div className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                                    index === 1 ? 'bg-gray-100 text-gray-800' :
                                                        index === 2 ? 'bg-orange-100 text-orange-800' :
                                                            'bg-blue-100 text-blue-800'
                                                }`}>
                                                {index === 0 ? <Award size={16} /> : index + 1}
                                            </div>
                                            <div className="ml-3">
                                                <div className="font-medium text-gray-900">{book.title}</div>
                                                <div className="text-sm text-gray-600">{book.author}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-primary-600">{book.borrowCount}</div>
                                            <div className="text-xs text-gray-500">kali dipinjam</div>
                                            <div className={`text-xs mt-1 ${book.available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {book.available > 0 ? `${book.available} tersedia` : 'Habis'}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Activity & Top Members */}
                <div className="space-y-6">
                    {/* Recent Activity */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Clock size={20} className="mr-2" />
                                Aktivitas Terbaru
                            </h2>
                            <span className="text-sm text-gray-500">5 terbaru</span>
                        </div>

                        <div className="space-y-4">
                            {recentActivity.length === 0 ? (
                                <div className="text-center py-4">
                                    <Activity size={32} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-gray-500">Belum ada aktivitas</p>
                                </div>
                            ) : (
                                recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className={`p-2 rounded-full mr-3 ${activity.type === 'Peminjaman'
                                                ? 'bg-orange-100 text-orange-600'
                                                : 'bg-green-100 text-green-600'
                                            }`}>
                                            {activity.type === 'Peminjaman' ? (
                                                <Calendar size={16} />
                                            ) : (
                                                <CheckCircle size={16} />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">
                                                {getMemberName(activity.memberId)}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {activity.type}: {getBookTitles(activity.bookIds)}
                                                {activity.bookIds.length > 2 && ' dan lainnya...'}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {new Date(activity.date).toLocaleString('id-ID', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    day: 'numeric',
                                                    month: 'short'
                                                })}
                                            </div>
                                        </div>
                                        <div className={`text-xs font-medium px-2 py-1 rounded ${activity.type === 'Peminjaman'
                                                ? 'bg-orange-100 text-orange-800'
                                                : 'bg-green-100 text-green-800'
                                            }`}>
                                            {activity.type}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Top Members */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Users size={20} className="mr-2" />
                                Anggota Paling Aktif
                            </h2>
                            <span className="text-sm text-gray-500">Top 5</span>
                        </div>

                        <div className="space-y-4">
                            {memberActivity.length === 0 ? (
                                <div className="text-center py-4">
                                    <Users size={32} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-gray-500">Belum ada data</p>
                                </div>
                            ) : (
                                memberActivity.map((member, index) => (
                                    <div key={member.memberId} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 bg-primary-100 text-primary-800 rounded-lg flex items-center justify-center font-bold">
                                                {index + 1}
                                            </div>
                                            <div className="ml-3">
                                                <div className="font-medium text-gray-900">{member.name}</div>
                                                <div className="text-sm text-gray-600">{member.nim}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-blue-600">{member.borrowCount}</div>
                                            <div className="text-xs text-gray-500">peminjaman</div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* System Status & Warnings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* System Status */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Sistem</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                <span className="text-gray-700">Database Local Storage</span>
                            </div>
                            <span className="text-sm font-medium text-green-600">Aktif</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                <span className="text-gray-700">Sistem Peminjaman</span>
                            </div>
                            <span className="text-sm font-medium text-green-600">Berjalan</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                <span className="text-gray-700">Backup Data</span>
                            </div>
                            <span className="text-sm font-medium text-green-600">Otomatis</span>
                        </div>
                    </div>
                </div>

                {/* Warnings */}
                {stats.overdueBorrowings > 0 && (
                    <div className="card bg-red-50 border-red-200">
                        <div className="flex items-start">
                            <AlertCircle className="text-red-600 mt-0.5 mr-3" size={24} />
                            <div>
                                <h3 className="font-semibold text-red-900">Peringatan: Peminjaman Terlambat</h3>
                                <p className="text-red-800 text-sm mt-2">
                                    Terdapat <strong>{stats.overdueBorrowings} peminjaman</strong> yang sudah melewati batas pengembalian.
                                    Segera hubungi anggota yang bersangkutan untuk mengembalikan buku.
                                </p>
                                <Link
                                    to="/return"
                                    className="inline-flex items-center text-sm font-medium text-red-700 hover:text-red-800 mt-3"
                                >
                                    Kelola pengembalian sekarang
                                    <TrendingDown size={16} className="ml-1" />
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {stats.overdueBorrowings === 0 && (
                    <div className="card bg-green-50 border-green-200">
                        <div className="flex items-start">
                            <CheckCircle className="text-green-600 mt-0.5 mr-3" size={24} />
                            <div>
                                <h3 className="font-semibold text-green-900">Sistem Berjalan Optimal</h3>
                                <p className="text-green-800 text-sm mt-2">
                                    Semua peminjaman berjalan sesuai jadwal. Tidak ada peminjaman yang terlambat.
                                    Sistem perpustakaan dalam kondisi baik.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="card text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.borrowings}</div>
                    <div className="text-sm text-gray-600 mt-1">Total Transaksi</div>
                </div>

                <div className="card text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.returnedBooks}</div>
                    <div className="text-sm text-gray-600 mt-1">Transaksi Selesai</div>
                </div>

                <div className="card text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.activeBorrowings}</div>
                    <div className="text-sm text-gray-600 mt-1">Transaksi Aktif</div>
                </div>

                <div className="card text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalCategories}</div>
                    <div className="text-sm text-gray-600 mt-1">Kategori Buku</div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
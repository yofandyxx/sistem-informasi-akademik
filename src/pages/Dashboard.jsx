import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  Calendar, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import { storage } from '../utils/localStorage';

const Dashboard = () => {
  const [stats, setStats] = useState({
    books: 0,
    members: 0,
    borrowings: 0,
    activeBorrowings: 0,
    overdueBorrowings: 0,
    availableBooks: 0
  });

  const [recentBorrowings, setRecentBorrowings] = useState([]);
  const [popularBooks, setPopularBooks] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    const books = storage.getBooks();
    const members = storage.getMembers();
    const borrowings = storage.getBorrowings();

    const activeBorrowings = borrowings.filter(b => b.status === 'borrowed');
    const overdueBorrowings = activeBorrowings.filter(b => 
      new Date(b.dueDate) < new Date()
    );

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
          author: book ? book.author : 'Unknown'
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

    setStats({
      books: books.length,
      members: members.length,
      borrowings: borrowings.length,
      activeBorrowings: activeBorrowings.length,
      overdueBorrowings: overdueBorrowings.length,
      availableBooks: books.reduce((sum, book) => sum + book.available, 0)
    });

    setPopularBooks(popular);
    setRecentBorrowings(recent);
    setRecentActivity(activity);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Ringkasan aktivitas perpustakaan digital</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Books */}
        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">Total Buku</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{stats.books}</p>
              <p className="text-sm text-blue-700 mt-1">
                {stats.availableBooks} tersedia
              </p>
            </div>
            <div className="p-3 bg-blue-500 rounded-lg">
              <BookOpen className="text-white" size={28} />
            </div>
          </div>
        </div>

        {/* Total Members */}
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900">Total Anggota</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{stats.members}</p>
              <p className="text-sm text-green-700 mt-1">
                Mahasiswa aktif
              </p>
            </div>
            <div className="p-3 bg-green-500 rounded-lg">
              <Users className="text-white" size={28} />
            </div>
          </div>
        </div>

        {/* Active Borrowings */}
        <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
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
        </div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Books */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp size={20} className="mr-2" />
              Buku Populer
            </h2>
            <span className="text-sm text-gray-500">Top 5</span>
          </div>
          
          <div className="space-y-4">
            {popularBooks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Belum ada data</p>
            ) : (
              popularBooks.map((book, index) => (
                <div key={book.bookId} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex items-center justify-center bg-primary-100 text-primary-800 rounded-lg font-bold">
                      {index + 1}
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">{book.title}</div>
                      <div className="text-sm text-gray-600">{book.author}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary-600">{book.borrowCount}</div>
                    <div className="text-xs text-gray-500">kali dipinjam</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

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
              <p className="text-gray-500 text-center py-4">Belum ada aktivitas</p>
            ) : (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start p-3 hover:bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full mr-3 ${
                    activity.type === 'Peminjaman' 
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
                      {new Date(activity.date).toLocaleString('id-ID')}
                    </div>
                  </div>
                  <div className={`text-xs font-medium px-2 py-1 rounded ${
                    activity.type === 'Peminjaman'
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
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="text-blue-600" size={20} />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-600">Total Transaksi</h3>
              <p className="text-xl font-bold text-gray-900">{stats.borrowings}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-600">Selesai</h3>
              <p className="text-xl font-bold text-gray-900">
                {stats.borrowings - stats.activeBorrowings}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Calendar className="text-orange-600" size={20} />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-600">Aktif</h3>
              <p className="text-xl font-bold text-gray-900">{stats.activeBorrowings}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="text-red-600" size={20} />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-600">Terlambat</h3>
              <p className="text-xl font-bold text-gray-900">{stats.overdueBorrowings}</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="card bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Status Sistem</h3>
            <p className="text-gray-600 text-sm mt-1">Local Storage aktif • Data tersimpan di browser</p>
          </div>
          <div className="flex items-center mt-3 sm:mt-0">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse mr-2"></div>
            <span className="font-medium text-green-700">Sistem Berjalan Normal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
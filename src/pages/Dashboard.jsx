<<<<<<< HEAD
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    BarChart3,
    Users,
    BookOpen,
    GraduationCap,
    Menu,
    Bell,
    Search,
    ClipboardList,
    BookmarkPlus,
    FileText,
    LineChart,
} from "lucide-react";
import storage from "../services/storage";
// Konversi nilai huruf ke angka
const nilaiToAngka = (nilai) => {
    switch ((nilai || "").toUpperCase()) {
        case "A":
            return 4;
        case "B":
            return 3;
        case "C":
            return 2;
        case "D":
            return 1;
        case "E":
        case "F":
            return 0;
        default:
            return null;
    }
};
export default function Dashboard() {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [academics, setAcademics] = useState([]);
    const [krs, setKrs] = useState([]);
    const [nilaiData, setNilaiData] = useState([]);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation(); // untuk highlight menu aktif
    useEffect(() => {
        setStudents(storage.getAll("students") || []);
        const storedCourses = storage
            .getAll("courses")
            .map((c) => ({ ...c, sks: c.sks || 3 }));
        setCourses(storedCourses);
        setAcademics(storage.getAll("academic") || []);
        setKrs(storage.getAll("krs") || []);
        setNilaiData(storage.getAll("nilai") || []);
    }, []);
    const hitungIPK = (studentId) => {
        const krsMahasiswa = krs.filter((k) => k.studentId === studentId);
        let totalNilaiSKS = 0;
        let totalSKS = 0;
        krsMahasiswa.forEach((k) => {
            const courseList = courses.filter((c) => k.courseIds.includes(c.id));
            courseList.forEach((c) => {
                const sks = c.sks || 3;
                const nilaiObj = nilaiData.find(
                    (n) => n.studentId === studentId && n.courseId === c.id
                );
                const angka = nilaiToAngka(nilaiObj?.nilai);
                if (angka !== null) {
                    totalNilaiSKS += angka * sks;
                    totalSKS += sks;
                }
            });
        });
        return totalSKS > 0 ? totalNilaiSKS / totalSKS : null;
    };
    const ipkRataRata = () => {
        const ipkMahasiswa = students
            .map((s) => hitungIPK(s.id))
            .filter((ipk) => ipk !== null);
        if (ipkMahasiswa.length === 0) return "-";
        const total = ipkMahasiswa.reduce((acc, curr) => acc + curr, 0);
        return (total / ipkMahasiswa.length).toFixed(2);
    };
    const mahasiswaDenganNilai = students.filter((s) => {
        const krsMhs = krs.filter((k) => k.studentId === s.id);
        return krsMhs.some((k) =>
            k.courseIds.some((cid) =>
                nilaiData.find((n) => n.studentId === s.id && n.courseId === cid)
            )
        );
    });
    const menuItems = [
        { path: "/", icon: <BarChart3 />, label: "Dashboard" },
        { path: "/students", icon: <Users />, label: "Data Mahasiswa" },
        { path: "/courses", icon: <BookOpen />, label: "Mata Kuliah" },
        { path: "/krs", icon: <ClipboardList />, label: "Input KRS" },
        { path: "/nilai", icon: <BookmarkPlus />, label: "Input Nilai" },
        { path: "/rekap", icon: <LineChart />, label: "Rekap Nilai (IPK)" },
        { path: "/khs-view", icon: <FileText />, label: "Lihat KHS" }, // Menu baru
        { path: "/cetak", icon: <FileText />, label: "Cetak KHS / KRS" },
    ];
    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* SIDEBAR */}
            <aside
                className={`${sidebarOpen ? "block" : "hidden"
                    } md:block w-64 bg-white shadow-xl fixed md:static z-40`}
            >
                <div className="p-6 border-b">
                    <h1 className="text-2xl font-bold text-blue-600">SIAKAD</h1>
                    <p className="text-sm text-gray-500">Admin Dashboard</p>
                </div>
                <nav className="p-6 space-y-3">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 p-3 rounded-lg text-gray-700
transition
    ${location.pathname === item.path
                                    ? "bg-blue-100 text-blue-700"
                                    : "hover:bg-blue-100 hover:text-blue-700"
                                }`}
                        >
                            {item.icon} {item.label}
                        </Link>
                    ))}
                </nav>
            </aside>
            {/* MAIN CONTENT */}
            <div className="flex-1">
                <header className="bg-white p-4 shadow flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Menu
                            className="md:hidden cursor-pointer"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        />
                        <div className="relative">
                            <Search className="absolute left-2 top-2 text-gray-400" />
                            <input
                                type="text"
                                className="pl-8 pr-4 py-2 rounded-lg border"
                                placeholder="Search..."
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-5">
                        <Bell className="text-gray-600" />
                        <img
                            src="https://i.pravatar.cc/40"
                            alt="Profile"
                            className="w-10 h-10 rounded-full"
                        />
                    </div>
                </header>
                <main className="p-6 space-y-6">
                    <h2 className="text-2xl font-bold">Dashboard Overview</h2>
                    {/* STAT CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
                        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">

                            <h3 className="text-gray-500">Total Mahasiswa</h3>
                            <p className="text-3xl font-bold mt-2">{students.length}</p>
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">

                            <h3 className="text-gray-500">Total Mata Kuliah</h3>
                            <p className="text-3xl font-bold mt-2">{courses.length}</p>
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">

                            <h3 className="text-gray-500">Data Akademik</h3>
                            <p className="text-3xl font-bold mt-2">{academics.length}</p>
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">

                            <h3 className="text-gray-500">Total KRS</h3>
                            <p className="text-3xl font-bold mt-2">{krs.length}</p>
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">

                            <h3 className="text-gray-500">Mahasiswa dengan Nilai</h3>
                            <p className="text-3xl font-bold mt-2">
                                {mahasiswaDenganNilai.length}
                            </p>
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">

                            <h3 className="text-gray-500">IPK Rata-rata</h3>
                            <p className="text-3xl font-bold mt-2">{ipkRataRata()}</p>
                        </div>
                    </div>
                    {/* MAHASISWA TERBARU */}
                    <div className="bg-white p-6 rounded-xl shadow">
                        <h3 className="text-lg font-semibold mb-4">Mahasiswa Terbaru</h3>
                        {students.length === 0 ? (
                            <p className="text-gray-500">Belum ada data mahasiswa.</p>
                        ) : (
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-3 text-left">NIM</th>
                                        <th className="p-3 text-left">Nama</th>
                                        <th className="p-3 text-left">Program Studi</th>
                                        <th className="p-3 text-left">IPK</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students
                                        .slice(-5)
                                        .reverse()
                                        .map((mhs, index) => (
                                            <tr className="border-b" key={index}>
                                                <td className="p-3">{mhs.nim}</td>
                                                <td className="p-3">{mhs.name}</td>
                                                <td className="p-3">{mhs.major}</td>
                                                <td className="p-3">
                                                    {hitungIPK(mhs.id)?.toFixed(2) || "-"}
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
=======
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
>>>>>>> 7ee6b5b2c54431b62b6835f7ce7abe62e6e8faae

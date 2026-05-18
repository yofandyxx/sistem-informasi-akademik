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
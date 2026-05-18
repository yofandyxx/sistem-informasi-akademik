// src/App.jsx
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
// Halaman utama
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Courses from "./pages/Courses";
// Halaman Akademik
import Academic from "./pages/academic/Academic";
import KRS from "./pages/academic/KRS";
import Nilai from "./pages/academic/Nilai";
import KHS from "./pages/academic/KHS";
import Enrollments from "./pages/academic/Enrollments";
import Matakuliah from "./pages/academic/Matakuliah";
// Cetak KHS
import CetakKHS from "./pages/academic/CetakKHS";
// Rekap Nilai / IPK
import RekapNilai from "./pages/academic/RekapNilai";
// === IMPORT STORAGE
import storage from "./services/storage";
// =========================================
// INITIALIZER — dijalankan sekali saja
// =========================================
function Initializer() {
  useEffect(() => {
    // Jika sudah pernah diisi, jangan overwrite
    if (!storage.get("students")) {
      const defaultStudents = [
        { id: "s1", nim: "001", name: "Budi" },
        { id: "s2", nim: "002", name: "Ani" },
        { id: "s3", nim: "003", name: "Citra" },
      ];
      storage.set("students", defaultStudents);
    }
    if (!storage.get("courses")) {
      const defaultCourses = [
        { id: "c1", kode: "MK001", nama: "Pemrograman Web" },
        { id: "c2", kode: "MK002", nama: "Basis Data" },
        { id: "c3", kode: "MK003", nama: "Algoritma dan Struktur Data" },
        { id: "c4", kode: "MK004", nama: "Pemrograman Mobile" },
        { id: "c5", kode: "MK005", nama: "Bahasa Inggris" },
        { id: "c6", kode: "MK006", nama: "Bahasa Indonesia" },
        { id: "c7", kode: "MK007", nama: "Kewarganegaraan" },
      ];
      storage.set("courses", defaultCourses);
    }
    console.log("Default data telah dimasukkan ke LocalStorage (jika kosong).");
  }, []);
  return null;
}
// =========================================
// APP (ROUTER)
// =========================================
export default function App() {
  return (
    <>
      <Initializer />
      <Routes>
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />
        {/* Data Master */}
        <Route path="/students" element={<Students />} />
        <Route path="/courses" element={<Courses />} />
        {/* Akademik */}
        <Route path="/academic" element={<Academic />} />
        <Route path="/krs" element={<KRS />} />
        <Route path="/nilai" element={<Nilai />} />
        <Route path="/khs-view" element={<KHS />} />
        <Route path="/enrollments" element={<Enrollments />} />
        <Route path="/matakuliah" element={<Matakuliah />} />
        {/* Cetak KHS */}
        <Route path="/cetak" element={<CetakKHS />} />
        {/* Rekap Nilai / IPK */}
        <Route path="/rekap" element={<RekapNilai />} />
      </Routes>
    </>
  );
}
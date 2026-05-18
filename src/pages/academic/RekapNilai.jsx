// src/pages/academic/RekapNilai.jsx
import React, { useEffect, useState } from "react";
import storage from "../../services/storage";
import { Link } from "react-router-dom";
// Fungsi konversi nilai huruf ke angka
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
export default function RekapNilai() {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [krs, setKrs] = useState([]);
    const [nilaiData, setNilaiData] = useState([]);
    useEffect(() => {
        setStudents(storage.getAll("students") || []);
        const storedCourses = storage.getAll("courses").map((c) => ({
            ...c,
            sks: c.sks || 3,
        }));
        setCourses(storedCourses);
        setKrs(storage.getAll("krs") || []);
        setNilaiData(storage.getAll("nilai") || []);
    }, []);
    // Fungsi hitung IPK per mahasiswa
    const hitungIPK = (studentId) => {
        const krsMahasiswa = krs.filter((k) => k.studentId === studentId);
        let totalNilaiSKS = 0;
        let totalSKS = 0;
        krsMahasiswa.forEach((k) => {
            const courseList = courses.filter((c) => k.courseIds.includes(c.id));
            courseList.forEach((c) => {
                const nilaiObj = nilaiData.find(
                    (n) => n.studentId === studentId && n.courseId === c.id
                );
                const angka = nilaiToAngka(nilaiObj?.nilai);
                if (angka !== null) {
                    totalNilaiSKS += angka * c.sks;
                    totalSKS += c.sks;
                }
            });
        });
        return totalSKS > 0 ? (totalNilaiSKS / totalSKS).toFixed(2) : "-";
    };
    const totalSKSPerMahasiswa = (studentId) => {
        const krsMahasiswa = krs.filter((k) => k.studentId === studentId);
        let totalSKS = 0;
        krsMahasiswa.forEach((k) => {
            const courseList = courses.filter((c) => k.courseIds.includes(c.id));
            courseList.forEach((c) => {
                totalSKS += c.sks;
            });
        });
        return totalSKS;
    };
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Rekap Nilai Mahasiswa (IPK)</h1>
            {students.length === 0 ? (
                <p className="text-gray-500">Belum ada data mahasiswa.</p>
            ) : (
                <table className="w-full border-collapse border">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 border">NIM</th>
                            <th className="p-2 border">Nama</th>
                            <th className="p-2 border">Program Studi</th>
                            <th className="p-2 border">Total SKS</th>
                            <th className="p-2 border">IPK</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s) => (
                            <tr key={s.id} className="border-b">
                                <td className="p-2 border">{s.nim}</td>
                                <td className="p-2 border">{s.name}</td>
                                <td className="p-2 border">{s.major}</td>
                                <td className="p-2 border">{totalSKSPerMahasiswa(s.id)}</td>
                                <td className="p-2 border">{hitungIPK(s.id)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <Link
                to="/"
                className="inline-block mt-6 px-4 py-2 bg-blue-600 text-white rounded
hover:bg-blue-700 transition"
            >
                ← Kembali ke Dashboard
            </Link>
        </div>
    );
}
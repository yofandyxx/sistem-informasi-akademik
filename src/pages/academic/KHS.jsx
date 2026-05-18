// src/pages/academic/KHS.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import storage from "../../services/storage";
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
export default function KHS() {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [krs, setKrs] = useState([]);
    const [nilaiData, setNilaiData] = useState([]);
    useEffect(() => {
        setStudents(storage.getAll("students") || []);
        const storedCourses = storage.getAll("courses").map((c) => ({
            ...c,
            sks: c.sks || 3, // default SKS = 3 jika belum ada
        }));
        setCourses(storedCourses);
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
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Kartu Hasil Studi (KHS)</h1>
            {students.length === 0 ? (
                <p className="text-gray-500">Belum ada data mahasiswa.</p>
            ) : (
                students.map((s) => {
                    const krsMahasiswa = krs.filter((k) => k.studentId === s.id);
                    return (
                        <div
                            key={s.id}
                            className="bg-white shadow p-4 rounded-xl mb-6 border"
                        >
                            <h2 className="font-semibold text-lg mb-2">
                                {s.name} ({s.nim})
                            </h2>
                            {krsMahasiswa.length === 0 ? (
                                <p>Belum ada KRS.</p>
                            ) : (
                                <table className="w-full border-collapse border">
                                    <thead>
                                        <tr className="bg-gray-200">
                                            <th className="p-2 border">Mata Kuliah</th>
                                            <th className="p-2 border">Semester</th>
                                            <th className="p-2 border">SKS</th>
                                            <th className="p-2 border">Nilai</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {krsMahasiswa.map((k) => {
                                            const courseList = courses.filter((c) =>
                                                k.courseIds.includes(c.id)
                                            );
                                            return courseList.map((c) => {
                                                const nilaiObj = nilaiData.find(
                                                    (n) => n.studentId === s.id && n.courseId === c.id
                                                );
                                                return (
                                                    <tr key={`${s.id}-${c.id}-${k.semester}`}>
                                                        <td className="p-2 border">
                                                            {c.kode} - {c.nama}
                                                        </td>
                                                        <td className="p-2 border">{k.semester}</td>
                                                        <td className="p-2 border">{c.sks}</td>
                                                        <td className="p-2 border">
                                                            {nilaiObj?.nilai || "-"}
                                                        </td>
                                                    </tr>
                                                );
                                            });
                                        })}
                                    </tbody>
                                </table>
                            )}
                            <p className="font-semibold mt-2">IPK: {hitungIPK(s.id)}</p>
                        </div>
                    );
                })
            )}
            <Link
                to="/"
                className="inline-block mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
                ← Kembali ke Dashboard
            </Link>
        </div>
    );
}
// src/pages/academic/CetakKHS.jsx
import React, { useEffect, useState } from "react";
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
export default function CetakKHS() {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [krs, setKrs] = useState([]);
    const [nilaiData, setNilaiData] = useState([]);
    useEffect(() => {
        setStudents(storage.getAll("students") || []);
        setCourses(
            storage.getAll("courses").map((c) => ({ ...c, sks: c.sks || 3 }))
        );
        setKrs(storage.getAll("krs") || []);
        setNilaiData(storage.getAll("nilai") || []);
    }, []);
    // Hitung IPK mahasiswa
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
        return totalSKS > 0 ? (totalNilaiSKS / totalSKS).toFixed(2) : "-";
    };
    return (
        <div className="p-6 bg-gray-100 min-h-screen print:p-0 print:bg-white">
            <div className="flex justify-between items-center mb-6 print:hidden">
                <h1 className="text-2xl font-bold">Cetak KHS Mahasiswa</h1>
                <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-green-600 text-white rounded"
                >
                    Cetak
                </button>
            </div>
            {students.length === 0 ? (
                <p className="text-gray-500">Belum ada data mahasiswa.</p>
            ) : (
                students.map((mhs) => {
                    const krsMahasiswa = krs.filter((k) => k.studentId === mhs.id);
                    if (krsMahasiswa.length === 0) return null;
                    return (
                        <div
                            key={mhs.id}
                            className="mb-10 bg-white p-4 rounded shadow print:shadow-none"
                        >
                            <h2 className="text-xl font-semibold mb-2">
                                {mhs.name} ({mhs.nim})
                            </h2>
                            <p className="mb-2">Program Studi: {mhs.major || "-"}</p>
                            <table className="w-full border-collapse border mb-2">
                                <thead>
                                    <tr className="bg-gray-200">
                                        <th className="border p-2">Kode</th>
                                        <th className="border p-2">Mata Kuliah</th>
                                        <th className="border p-2">SKS</th>
                                        <th className="border p-2">Nilai</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {krsMahasiswa.map((k) =>
                                        k.courseIds.map((cid) => {
                                            const course = courses.find((c) => c.id === cid);
                                            const nilaiObj = nilaiData.find(
                                                (n) => n.studentId === mhs.id && n.courseId === cid
                                            );
                                            return (
                                                <tr key={cid}>
                                                    <td className="border p-2">{course?.kode || "-"}</td>
                                                    <td className="border p-2">{course?.nama || "-"}</td>
                                                    <td className="border p-2 text-center">
                                                        {course?.sks || 3}
                                                    </td>
                                                    <td className="border p-2 text-center">
                                                        {nilaiObj?.nilai || "-"}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                            <p className="font-semibold">IPK: {hitungIPK(mhs.id)}</p>
                        </div>
                    );
                })
            )}
        </div>
    );
}
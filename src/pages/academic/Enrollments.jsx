// src/pages/academic/Enrollments.jsx
import React, { useState } from "react";
import storage from "../../services/storage";
import { Link } from "react-router-dom";
export default function Enrollments() {
    const students = storage.getAll("students") || [];
    const courses = storage.getAll("courses") || [];
    const krs = storage.getAll("krs") || [];
    const [selectedStudent, setSelectedStudent] = useState("");
    // Ambil KRS berdasarkan mahasiswa yang dipilih
    const filteredKRS = selectedStudent
        ? krs.filter((k) => k.studentId === selectedStudent)
        : [];
    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Daftar KRS Mahasiswa</h1>
            {/* ============== FORM PILIH MAHASISWA ============== */}
            <div className="bg-white shadow p-4 rounded-xl mb-6">
                <h2 className="font-semibold mb-3">Pilih Mahasiswa</h2>
                <select
                    className="border p-2 rounded w-full"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                >
                    <option value="">-- Pilih Mahasiswa --</option>
                    {students.map((s) => (
                        <option key={s.id} value={s.id}>
                            {s.name} ({s.nim})
                        </option>
                    ))}
                </select>
            </div>
            {/* ============== TABEL KRS ============== */}
            {selectedStudent !== "" && (
                <div className="bg-white shadow p-4 rounded-xl">
                    <h2 className="font-semibold mb-3">
                        Mata Kuliah yang Diambil:{" "}
                        <span className="text-blue-600">
                            {students.find((s) => s.id === selectedStudent)?.name}
                        </span>
                    </h2>
                    {filteredKRS.length === 0 ? (
                        <p className="text-gray-600">Mahasiswa ini belum mengambil KRS.</p>
                    ) : (
                        <table className="w-full text-left border">
                            <thead>
                                <tr className="bg-gray-200">
                                    <th className="p-2 border">Kode MK</th>
                                    <th className="p-2 border">Nama Mata Kuliah</th>
                                    <th className="p-2 border">SKS</th>
                                    <th className="p-2 border">Semester</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredKRS.map((item) => {
                                    const matkul = courses.find((c) => c.id === item.courseId);
                                    return (
                                        <tr key={item.id}>
                                            <td className="p-2 border">{matkul?.kode}</td>
                                            <td className="p-2 border">{matkul?.nama}</td>
                                            <td className="p-2 border">{matkul?.sks}</td>
                                            <td className="p-2 border">{item.semester}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
            {/* Button Back */}
            <Link
                to="/academic"
                className="inline-block mt-6 px-4 py-2 bg-blue-600 text-white rounded"
            >
                ← Kembali ke Akademik
            </Link>
        </div>
    );
}
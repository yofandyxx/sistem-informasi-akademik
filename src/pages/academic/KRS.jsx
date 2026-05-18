// src/pages/academic/KRS.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import storage from "../../services/storage";
const KEY_KRS = "krs";
export default function KRS() {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [krs, setKrs] = useState([]);
    const [form, setForm] = useState({
        studentId: "",
        courseIds: [],
        semester: "",
    });
    useEffect(() => {
        // Ambil data dari storage
        const st = storage.get("students") || [];
        const cr = storage.get("courses") || [];
        const kr = storage.get(KEY_KRS) || [];
        setStudents(st);
        setCourses(cr);
        setKrs(kr);
    }, []);
    // Submit KRS
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!form.studentId) return alert("Pilih mahasiswa!");
        if (!form.semester) return alert("Isi semester!");
        if (form.courseIds.length === 0)
            return alert("Pilih setidaknya satu mata kuliah!");
        const allKRS = storage.get(KEY_KRS) || [];
        // Cek apakah sudah ada KRS mahasiswa di semester tsb
        const existing = allKRS.find(
            (k) => k.studentId === form.studentId && k.semester === form.semester
        );
        if (existing) {
            existing.courseIds = Array.from(
                new Set([...existing.courseIds, ...form.courseIds])
            );
        } else {
            allKRS.push({
                id: "k" + Date.now().toString(36),
                studentId: form.studentId,
                courseIds: form.courseIds,
                semester: form.semester,
            });
        }
        storage.set(KEY_KRS, allKRS);
        setKrs([...allKRS]);
        setForm({ studentId: "", courseIds: [], semester: "" });
        alert("KRS berhasil disimpan!");
    };
    // Handle pilih mata kuliah multiple
    const handleCourseChange = (e) => {
        const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
        setForm({ ...form, courseIds: selected });
    };
    // Hapus KRS
    const handleDelete = (id) => {
        if (!window.confirm("Yakin ingin menghapus KRS ini?")) return;
        const updated = (storage.get(KEY_KRS) || []).filter((k) => k.id !== id);
        storage.set(KEY_KRS, updated);
        setKrs(updated);
    };
    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Input KRS Mahasiswa</h1>
            {/* Form Input KRS */}
            <div className="bg-white shadow p-4 rounded-xl mb-6">
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
                    {/* Pilih Mahasiswa */}
                    <select
                        value={form.studentId}
                        onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                        className="border p-2 rounded"
                    >
                        <option value="">Pilih Mahasiswa</option>
                        {students.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name} ({s.nim})
                            </option>
                        ))}
                    </select>
                    {/* Semester */}
                    <input
                        type="text"
                        placeholder="Semester (misal 2025/1)"
                        value={form.semester}
                        onChange={(e) => setForm({ ...form, semester: e.target.value })}
                        className="border p-2 rounded"
                    />
                    {/* Pilih Mata Kuliah */}
                    <select
                        multiple
                        value={form.courseIds}
                        onChange={handleCourseChange}
                        className="border p-2 rounded h-40"
                    >
                        {courses.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.kode} - {c.nama}
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="bg-green-600 text-white py-2 rounded mt-2"
                    >
                        Simpan KRS
                    </button>
                </form>
            </div>
            {/* Tabel KRS */}
            <div className="bg-white shadow p-4 rounded-xl">
                <h2 className="text-lg font-semibold mb-2">Daftar KRS</h2>
                <table className="w-full text-left border">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="p-2 border">Mahasiswa</th>
                            <th className="p-2 border">Mata Kuliah</th>
                            <th className="p-2 border">Semester</th>
                            <th className="p-2 border">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {krs.map((k) => {
                            const student = students.find((s) => s.id === k.studentId);
                            const selectedCourses = courses.filter((c) =>
                                k.courseIds.includes(c.id)
                            );
                            return (
                                <tr key={k.id}>
                                    <td className="p-2 border">
                                        {student?.name || "Tidak ditemukan"}
                                    </td>
                                    <td className="p-2 border">
                                        {selectedCourses.length > 0
                                            ? selectedCourses
                                                .map((c) => `${c.kode} - ${c.nama}`)
                                                .join(", ")
                                            : "Tidak ditemukan"}
                                    </td>
                                    <td className="p-2 border">{k.semester}</td>
                                    <td className="p-2 border">
                                        <button
                                            onClick={() => handleDelete(k.id)}
                                            className="bg-red-600 text-white px-2 py-1 rounded"
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <Link
                to="/"
                className="inline-block mt-6 px-4 py-2 bg-blue-600 text-white rounded"
            >
                ← Kembali ke Dashboard
            </Link>
        </div>
    );
}
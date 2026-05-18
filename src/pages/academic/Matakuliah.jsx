// src/pages/academic/Matakuliah.jsx
import React, { useState } from "react";
import storage from "../../services/storage";
import { Link } from "react-router-dom";
const KEY = "courses";
export default function Matakuliah() {
    const [courses, setCourses] = useState(storage.getAll(KEY) || []);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ kode: "", nama: "", sks: "" });
    const handleSubmit = (e) => {
        e.preventDefault();
        const newData = { id: Date.now(), ...form };
        storage.add(KEY, newData);
        setCourses(storage.getAll(KEY));
        setForm({ kode: "", nama: "", sks: "" });
        setShowForm(false);
    };
    const removeCourse = (id) => {
        storage.remove(KEY, id);
        setCourses(storage.getAll(KEY));
    };
    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">Data Mata Kuliah</h1>
            {/* Tombol Tambah Mata Kuliah */}
            <button
                onClick={() => setShowForm(!showForm)}
                className="mb-4 px-4 py-2 bg-green-600 text-white rounded"
            >
                {showForm ? "Tutup Form" : "Tambah Mata Kuliah"}
            </button>
            {/* Form Tambah Mata Kuliah */}
            {showForm && (
                <div className="bg-white shadow p-4 rounded-xl mb-6">
                    <h2 className="font-semibold mb-3">Tambah Mata Kuliah</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-3">
                        <input
                            className="border p-2 rounded"
                            placeholder="Kode"
                            value={form.kode}
                            onChange={(e) => setForm({ ...form, kode: e.target.value })}
                            required
                        />
                        <input
                            className="border p-2 rounded"
                            placeholder="Nama"
                            value={form.nama}
                            onChange={(e) => setForm({ ...form, nama: e.target.value })}
                            required
                        />
                        <input
                            className="border p-2 rounded"
                            placeholder="SKS"
                            type="number"
                            value={form.sks}
                            onChange={(e) => setForm({ ...form, sks: e.target.value })}
                            required
                        />

                        <button className="col-span-3 bg-green-600 text-white py-2 rounded mt-2">

                            Simpan
                        </button>
                    </form>
                </div>
            )}
            {/* Tabel Daftar Mata Kuliah */}
            <div className="bg-white shadow rounded-xl p-4">
                <h2 className="font-semibold mb-3">Daftar Mata Kuliah</h2>
                {courses.length === 0 ? (
                    <p className="text-gray-500">Belum ada data mata kuliah.</p>
                ) : (
                    <table className="w-full text-left border">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="p-2 border">Kode</th>
                                <th className="p-2 border">Nama</th>
                                <th className="p-2 border">SKS</th>
                                <th className="p-2 border">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((c) => (
                                <tr key={c.id}>
                                    <td className="p-2 border">{c.kode}</td>
                                    <td className="p-2 border">{c.nama}</td>
                                    <td className="p-2 border">{c.sks}</td>
                                    <td className="p-2 border">
                                        <button
                                            onClick={() => removeCourse(c.id)}
                                            className="px-3 py-1 bg-red-500 text-white rounded"
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
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
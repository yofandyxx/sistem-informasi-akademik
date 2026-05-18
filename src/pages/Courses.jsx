import React, { useEffect, useState } from "react";
import storage from "../services/storage";
import { Link } from "react-router-dom";
export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [form, setForm] = useState({ kode: "", nama: "", sks: "" });
    const [editingIndex, setEditingIndex] = useState(null);
    useEffect(() => {
        setCourses(storage.getAll("courses") || []);
    }, []);
    const saveToStorage = (data) => {
        storage.save("courses", data);
        setCourses(data);
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingIndex !== null) {
            const updated = [...courses];
            updated[editingIndex] = form;
            saveToStorage(updated);
            setEditingIndex(null);
        } else {
            const newData = [...courses, form];
            saveToStorage(newData);
        }
        setForm({ kode: "", nama: "", sks: "" });
    };
    const handleEdit = (index) => {
        setForm(courses[index]);
        setEditingIndex(index);
    };
    const handleDelete = (index) => {
        const filtered = courses.filter((_, i) => i !== index);
        saveToStorage(filtered);
    };
    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Data Mata Kuliah</h1>
                {/* Tombol kembali */}
                <Link to="/" className="px-4 py-2 bg-gray-600 text-white rounded-lg">
                    Kembali ke Dashboard
                </Link>
            </div>
            {/* FORM INPUT */}
            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-xl shadow space-y-4"
            >
                <div>
                    <label className="block mb-1 font-semibold">Kode Mata Kuliah</label>
                    <input
                        type="text"
                        className="w-full border p-2 rounded"
                        value={form.kode}
                        onChange={(e) => setForm({ ...form, kode: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-semibold">Nama Mata Kuliah</label>
                    <input
                        type="text"
                        className="w-full border p-2 rounded"
                        value={form.nama}
                        onChange={(e) => setForm({ ...form, nama: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1 font-semibold">Jumlah SKS</label>
                    <input
                        type="number"
                        className="w-full border p-2 rounded"
                        value={form.sks}
                        onChange={(e) => setForm({ ...form, sks: e.target.value })}
                        required
                    />
                </div>
                {/* BUTTON SAVE */}
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                    {editingIndex !== null ? "Update Mata Kuliah" : "Simpan Mata Kuliah"}
                </button>
            </form>
            {/* TABLE */}
            <div className="bg-white p-6 rounded-xl shadow">
                <h2 className="text-lg font-semibold mb-4">Daftar Mata Kuliah</h2>
                {courses.length === 0 ? (
                    <p className="text-gray-500">Belum ada data.</p>
                ) : (
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="p-3 text-left">Kode</th>
                                <th className="p-3 text-left">Nama</th>
                                <th className="p-3 text-left">SKS</th>
                                <th className="p-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map((mk, index) => (
                                <tr className="border-b" key={index}>
                                    <td className="p-3">{mk.kode}</td>
                                    <td className="p-3">{mk.nama}</td>
                                    <td className="p-3">{mk.sks}</td>
                                    <td className="p-3 flex gap-2 justify-center">
                                        <button
                                            onClick={() => handleEdit(index)}
                                            className="px-3 py-1 bg-yellow-500 text-xs text-white rounded"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(index)}
                                            className="px-3 py-1 bg-red-600 text-xs text-white rounded"
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
        </div>
    );
}



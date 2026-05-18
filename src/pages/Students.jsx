import React, { useState } from "react";
import { Link } from "react-router-dom";
import storage from "../services/storage";
import StudentForm from "../components/StudentForm";
import { ArrowLeft } from "lucide-react";
function generateId(prefix = "s") {
    return prefix + Date.now().toString(36);
}
export default function Students() {
    const [students, setStudents] = useState(storage.getAll("students"));
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    function refresh() {
        setStudents(storage.getAll("students"));
    }
    function handleAdd(data) {
        const item = { id: generateId(), ...data };
        storage.add("students", item);
        refresh();
        setShowForm(false);
    }
    function handleUpdate(id, data) {
        storage.update("students", id, data);
        refresh();
        setEditing(null);
        setShowForm(false);
    }
    function handleDelete(id) {
        if (!confirm("Yakin menghapus data mahasiswa ini?")) return;
        storage.remove("students", id);
        refresh();
    }
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            {/* HEADER + BACK BUTTON */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <Link
                        to="/"
                        className="flex items-center gap-2 px-4 py-2 bg-white border shadow-sm rounded-lg hover:bg-gray-50 transition"

                    >
                        <ArrowLeft size={18} />
                        Kembali
                    </Link>
                    <h1 className="text-2xl font-bold">Data Mahasiswa</h1>
                </div>
                <div>
                    <button
                        onClick={() => {
                            setEditing(null);
                            setShowForm(true);
                        }}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg
    
    shadow"
                    >
                        Tambah Mahasiswa
                    </button>
                </div>
            </div>
            {/* FORM SECTION */}
            {showForm && (
                <div className="mb-6 bg-white p-6 rounded-xl shadow-lg border">
                    <h2 className="text-xl font-semibold mb-4">
                        {editing ? "Edit Mahasiswa" : "Tambah Mahasiswa"}
                    </h2>
                    <StudentForm
                        initial={editing}
                        onCancel={() => {
                            setShowForm(false);
                            setEditing(null);
                        }}
                        onSubmit={(data) =>
                            editing ? handleUpdate(editing.id, data) : handleAdd(data)
                        }
                    />
                </div>
            )}
            {/* TABLE SECTION */}
            <div className="bg-white rounded-xl shadow-lg border overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="p-3 font-medium">NIM</th>
                            <th className="p-3 font-medium">Nama</th>
                            <th className="p-3 font-medium">Program Studi</th>
                            <th className="p-3 font-medium text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s) => (
                            <tr key={s.id} className="border-t hover:bg-gray-50">
                                <td className="p-3">{s.nim}</td>
                                <td className="p-3">{s.name}</td>
                                <td className="p-3">{s.major}</td>
                                <td className="p-3 text-center">
                                    <button
                                        onClick={() => {
                                            setEditing(s);
                                            setShowForm(true);
                                        }}
                                        className="mr-2 px-3 py-1.5 bg-amber-400 hover:bg-amber-500 text-white rounded shadow text-sm"

                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(s.id)}
                                        className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded shadow text-sm"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {students.length === 0 && (
                            <tr>
                                <td colSpan="4" className="p-4 text-center text-gray-500">
                                    Belum ada data mahasiswa.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
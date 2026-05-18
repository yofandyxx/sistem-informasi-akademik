// src/pages/academic/Academic.jsx
import React from "react";
import { Link } from "react-router-dom";
export default function Academic() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Akademik</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link
                    to="/krs"
                    className="p-6 bg-white shadow rounded-xl hover:shadow-lg transition"
                >
                    <h2 className="font-semibold text-lg">Input KRS</h2>
                    <p className="text-sm text-gray-600">Pengambilan mata kuliah</p>
                </Link>
                <Link
                    to="/nilai"
                    className="p-6 bg-white shadow rounded-xl hover:shadow-lg transition"
                >
                    <h2 className="font-semibold text-lg">Input Nilai</h2>
                    <p className="text-sm text-gray-600">Penilaian mahasiswa</p>
                </Link>
                <Link
                    to="/khs"
                    className="p-6 bg-white shadow rounded-xl hover:shadow-lg transition"
                >
                    <h2 className="font-semibold text-lg">KHS</h2>
                    <p className="text-sm text-gray-600">Kartu Hasil Studi</p>
                </Link>
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
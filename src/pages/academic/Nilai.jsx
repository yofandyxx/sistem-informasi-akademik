// src/pages/academic/Nilai.jsx
import React, { useState, useEffect } from "react";
import storage from "../../services/storage";
import { Link } from "react-router-dom";

const KEY_NILAI = "nilai";
const KEY_KRS = "krs";

export default function Nilai() {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [krs, setKrs] = useState([]);
    const [nilaiData, setNilaiData] = useState([]);

    useEffect(() => {
        // Load all required data
        loadAllData();
    }, []);

    const loadAllData = () => {
        const storedStudents = storage.getAll("students") || [];
        const storedCourses = storage.getAll("courses") || [];
        const storedKRS = storage.getAll(KEY_KRS) || [];
        const storedNilai = storage.getAll(KEY_NILAI) || [];

        setStudents(storedStudents);
        setCourses(storedCourses);
        setKrs(storedKRS);
        setNilaiData(storedNilai);
    };

    const handleNilaiChange = (studentId, courseId, value) => {
        setNilaiData((prevNilaiData) => {
            const index = prevNilaiData.findIndex(
                (n) => n.studentId === studentId && n.courseId === courseId
            );

            if (index >= 0) {
                // Update existing nilai
                const updated = [...prevNilaiData];
                updated[index] = { ...updated[index], nilai: value };
                return updated;
            } else {
                // Add new nilai
                return [...prevNilaiData, { studentId, courseId, nilai: value }];
            }
        });
    };

    const handleSimpan = () => {
        storage.save(KEY_NILAI, nilaiData);
        alert("Nilai berhasil disimpan!");
    };

    const renderTableRows = () => {
        if (students.length === 0) {
            return (
                <tr>
                    <td colSpan="4" className="p-4 text-center text-gray-500">
                        Tidak ada data mahasiswa
                    </td>
                </tr>
            );
        }

        const rows = [];

        students.forEach((student) => {
            const krsMahasiswa = krs.filter((k) => k.studentId === student.id);

            if (krsMahasiswa.length === 0) {
                rows.push(
                    <tr key={student.id}>
                        <td className="p-3 border">{student.name}</td>
                        <td className="p-3 border" colSpan={3}>
                            <span className="text-gray-500">Belum ada KRS</span>
                        </td>
                    </tr>
                );
                return;
            }

            krsMahasiswa.forEach((krsItem) => {
                const courseList = courses.filter((course) =>
                    krsItem.courseIds?.includes(course.id)
                );

                if (courseList.length === 0) {
                    rows.push(
                        <tr key={`${student.id}-${krsItem.semester}`}>
                            <td className="p-3 border">{student.name}</td>
                            <td className="p-3 border" colSpan={3}>
                                <span className="text-gray-500">Tidak ada mata kuliah terdaftar</span>
                            </td>
                        </tr>
                    );
                    return;
                }

                courseList.forEach((course) => {
                    const existingNilai = nilaiData.find(
                        (n) => n.studentId === student.id && n.courseId === course.id
                    );

                    rows.push(
                        <tr key={`${student.id}-${course.id}-${krsItem.semester}`}>
                            <td className="p-3 border align-top">{student.name}</td>
                            <td className="p-3 border align-top">
                                <div className="font-medium">{course.kode}</div>
                                <div className="text-sm text-gray-600">{course.nama}</div>
                            </td>
                            <td className="p-3 border align-top">{krsItem.semester}</td>
                            <td className="p-3 border align-top">
                                <input
                                    type="text"
                                    value={existingNilai?.nilai || ""}
                                    onChange={(e) =>
                                        handleNilaiChange(student.id, course.id, e.target.value)
                                    }
                                    className="w-20 border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="A/B/C/D/E"
                                    maxLength="2"
                                />
                                {existingNilai?.nilai && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        Terakhir disimpan: {existingNilai.nilai}
                                    </div>
                                )}
                            </td>
                        </tr>
                    );
                });
            });
        });

        return rows;
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Input Nilai Mahasiswa</h1>
                    <Link
                        to="/"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        ← Kembali ke Dashboard
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-4 md:p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">
                                            Mahasiswa
                                        </th>
                                        <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">
                                            Mata Kuliah
                                        </th>
                                        <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">
                                            Semester
                                        </th>
                                        <th className="p-3 border border-gray-300 text-left font-semibold text-gray-700">
                                            Nilai
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>{renderTableRows()}</tbody>
                            </table>
                        </div>

                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => loadAllData()}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Muat Ulang Data
                            </button>
                            <button
                                onClick={handleSimpan}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                                Simpan Semua Nilai
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-4 text-sm text-gray-600">
                    <p>Total Mahasiswa: {students.length} | Total Mata Kuliah: {courses.length}</p>
                </div>
            </div>
        </div>
    );
}
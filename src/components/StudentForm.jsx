import React, { useState, useEffect } from "react";
export default function StudentForm({ initial, onSubmit, onCancel }) {
    const [form, setForm] = useState({
        nim: "",
        name: "",
        major: "",
    });
    useEffect(() => {
        if (initial) {
            setForm(initial);
        }
    }, [initial]);
    function handleChange(e) {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    }
    function handleSubmit(e) {
        e.preventDefault();
        onSubmit(form);
    }
    return (
        <form
            onSubmit={handleSubmit}
            className="p-4 bg-gray-100 rounded shadow space-y-4"
        >
            <div>
                <label className="block font-medium">NIM</label>
                <input
                    type="text"
                    name="nim"
                    value={form.nim}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    required
                />
            </div>
            <div>
                <label className="block font-medium">Nama</label>
                <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    required
                />
            </div>
            <div>
                <label className="block font-medium">Program Studi</label>
                <input
                    type="text"
                    name="major"
                    value={form.major}
                    onChange={handleChange}
                    className="border p-2 rounded w-full"
                    required
                />
            </div>
            <div className="flex gap-2">
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Simpan
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border rounded"
                >
                    Batal
                </button>
            </div>
        </form>
    );
}
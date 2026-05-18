import React, { useState } from "react";
export default function CourseForm({ onSubmit, onCancel }) {
    const [form, setForm] = useState({ code: "", name: "", credits: 3 });
    function handleChange(e) {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "credits" ? Number(value) : value,
        }));
    }
    function submit(e) {
        e.preventDefault();
        if (!form.code || !form.name) {
            alert("Kode dan nama mata kuliah wajib diisi");
            return;
        }
        onSubmit(form);
    }
    return (
        <form onSubmit={submit} className="bg-white p-4 rounded shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                    <label className="block text-sm">Kode</label>
                    <input
                        name="code"
                        value={form.code}
                        onChange={handleChange}
                        className="mt-1 block w-full border rounded px-2 py-1"
                    />
                </div>
                <div>
                    <label className="block text-sm">Nama</label>
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        className="mt-1 block w-full border rounded px-2 py-1"
                    />
                </div>
                <div>
                    <label className="block text-sm">SKS</label>
                    <input
                        name="credits"
                        value={form.credits}
                        type="number"
                        onChange={handleChange}
                        className="mt-1 block w-full border rounded px-2 py-1"
                    />
                </div>
            </div>
            <div className="mt-4">
                <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded mr-2"
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
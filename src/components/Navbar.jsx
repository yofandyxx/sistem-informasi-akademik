import React from "react";
import { NavLink } from "react-router-dom";
export default function Navbar() {
    const linkClass = ({ isActive }) =>
        isActive
            ? "text-white bg-blue-600 px-3 py-2 rounded"
            : "text-gray-700 hover:text-white hover:bg-blue-500 px-3 py-2 rounded";
    return (
        <header className="bg-white shadow">

            <div className="container mx-auto px-4 py-3 flex items-center justify-between">

                <div className="text-xl font-semibold">Siakad - Mini</div>
                <nav className="space-x-2">
                    <NavLink to="/dashboard" className={linkClass}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/students" className={linkClass}>
                        Mahasiswa
                    </NavLink>
                    <NavLink to="/courses" className={linkClass}>
                        Mata Kuliah
                    </NavLink>
                    <NavLink to="/enrollments" className={linkClass}>
                        Pendaftaran
                    </NavLink>
                </nav>
            </div>
        </header>
    );
}
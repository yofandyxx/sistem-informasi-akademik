<<<<<<< HEAD
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);
=======
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Initialize sample data if empty
const initializeSampleData = () => {
  if (!localStorage.getItem('books') || JSON.parse(localStorage.getItem('books')).length === 0) {
    const sampleBooks = [
      {
        id: 'book1',
        title: 'Pemrograman React JS',
        author: 'Budi Santoso',
        year: 2023,
        category: 'Teknologi',
        isbn: '978-623-456-789-0',
        total: 5,
        available: 3,
        description: 'Buku panduan lengkap pemrograman React JS'
      },
      {
        id: 'book2',
        title: 'Data Science dengan Python',
        author: 'Ani Wijaya',
        year: 2022,
        category: 'Sains',
        isbn: '978-623-123-456-7',
        total: 3,
        available: 2,
        description: 'Pengantar data science menggunakan Python'
      },
      {
        id: 'book3',
        title: 'Manajemen Bisnis Modern',
        author: 'Cahyo Pratama',
        year: 2021,
        category: 'Bisnis',
        isbn: '978-623-789-012-3',
        total: 4,
        available: 4,
        description: 'Strategi manajemen bisnis di era digital'
      }
    ];
    localStorage.setItem('books', JSON.stringify(sampleBooks));
  }

  if (!localStorage.getItem('members') || JSON.parse(localStorage.getItem('members')).length === 0) {
    const sampleMembers = [
      {
        id: 'member1',
        nim: '20210001',
        name: 'Andi Setiawan',
        programStudi: 'Teknik Informatika',
        phone: '081234567890',
        email: 'andi@example.com',
        address: 'Jl. Merdeka No. 123'
      },
      {
        id: 'member2',
        nim: '20210002',
        name: 'Sari Dewi',
        programStudi: 'Sistem Informasi',
        phone: '081987654321',
        email: 'sari@example.com',
        address: 'Jl. Sudirman No. 45'
      }
    ];
    localStorage.setItem('members', JSON.stringify(sampleMembers));
  }

  if (!localStorage.getItem('borrowings') || JSON.parse(localStorage.getItem('borrowings')).length === 0) {
    const sampleBorrowings = [
      {
        id: 'borrow1',
        memberId: 'member1',
        bookIds: ['book1'],
        quantities: [1],
        borrowDate: '2024-01-15T08:00:00.000Z',
        dueDate: '2024-01-22T08:00:00.000Z',
        returnDate: null,
        status: 'borrowed',
        notes: 'Pinjam untuk tugas kuliah'
      }
    ];
    localStorage.setItem('borrowings', JSON.stringify(sampleBorrowings));
  }
};

initializeSampleData();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
>>>>>>> 7ee6b5b2c54431b62b6835f7ce7abe62e6e8faae

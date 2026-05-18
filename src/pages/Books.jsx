import { useState, useEffect } from 'react';
import BookForm from '../components/BookForm';
import { storage, generateId } from '../utils/localStorage';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories] = useState(storage.getCategories());

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = () => {
    const booksData = storage.getBooks();
    setBooks(booksData);
  };

  const handleAddBook = (bookData) => {
    const newBook = {
      id: generateId(),
      ...bookData,
      available: parseInt(bookData.available)
    };
    
    const updatedBooks = [...books, newBook];
    storage.saveBooks(updatedBooks);
    setBooks(updatedBooks);
    setShowForm(false);
  };

  const handleEditBook = (bookData) => {
    const updatedBooks = books.map(book => 
      book.id === editingBook.id ? { ...book, ...bookData } : book
    );
    storage.saveBooks(updatedBooks);
    setBooks(updatedBooks);
    setEditingBook(null);
  };

  const handleDeleteBook = (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
      const updatedBooks = books.filter(book => book.id !== id);
      storage.saveBooks(updatedBooks);
      setBooks(updatedBooks);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Data Buku</h1>
          <p className="text-gray-600 mt-2">Kelola koleksi buku perpustakaan digital</p>
        </div>
        <button
          onClick={() => {
            setEditingBook(null);
            setShowForm(true);
          }}
          className="btn-primary flex items-center justify-center space-x-2 w-full md:w-auto"
        >
          <span className="text-xl">➕</span>
          <span>Tambah Buku Baru</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl">
              <span className="text-2xl text-blue-600">📚</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Total Buku</h3>
              <p className="text-2xl font-bold text-gray-900 mt-1">{books.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-xl">
              <span className="text-2xl text-green-600">✓</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Tersedia</h3>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {books.reduce((sum, book) => sum + book.available, 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-xl">
              <span className="text-2xl text-orange-600">📅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Dipinjam</h3>
              <p className="text-2xl font-bold text-orange-600 mt-1">
                {books.reduce((sum, book) => sum + (book.total - book.available), 0)}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-xl">
              <span className="text-2xl text-purple-600">🏷️</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600">Kategori</h3>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {new Set(books.map(book => book.category)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <span className="text-xl mr-2">🔍</span>
              Cari Buku
            </label>
            <input
              type="text"
              placeholder="Cari berdasarkan judul atau pengarang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <span className="text-xl mr-2">⚙️</span>
              Filter Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Books Table */}
      <div className="table-container">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="table-header">Judul</th>
                <th className="table-header">Pengarang</th>
                <th className="table-header">Kategori</th>
                <th className="table-header">Tahun</th>
                <th className="table-header">Tersedia</th>
                <th className="table-header">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <span className="text-4xl mb-3 block">📚</span>
                      <p className="text-lg">Tidak ada data buku</p>
                      <p className="text-sm mt-2">Tambahkan buku pertama Anda</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                    <td className="table-cell">
                      <div>
                        <div className="font-semibold text-gray-900">{book.title}</div>
                        <div className="text-xs text-gray-500 mt-1">ID: {book.id.slice(-8)}</div>
                      </div>
                    </td>
                    <td className="table-cell font-medium">{book.author}</td>
                    <td className="table-cell">
                      <span className="badge badge-info">
                        {book.category}
                      </span>
                    </td>
                    <td className="table-cell">{book.year}</td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        <span className={`font-bold text-lg ${book.available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {book.available}
                        </span>
                        <span className="text-gray-500 ml-2">/ {book.total}</span>
                        {book.available === 0 && (
                          <span className="ml-3 text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            Habis
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingBook(book);
                            setShowForm(true);
                          }}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Edit"
                        >
                          <span className="text-lg">✏️</span>
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book.id)}
                          className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                          title="Hapus"
                        >
                          <span className="text-lg">🗑️</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <BookForm
              book={editingBook}
              onSubmit={editingBook ? handleEditBook : handleAddBook}
              onCancel={() => {
                setShowForm(false);
                setEditingBook(null);
              }}
              categories={categories}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Books;
import { useState, useEffect } from 'react';
import { Calendar, Clock, User, BookOpen, Plus, Trash2 } from 'lucide-react';
import { storage, generateId } from '../utils/localStorage';

const Borrow = () => {
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [borrowings, setBorrowings] = useState([]);
  
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadData();
    // Set due date to 7 days from now
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    setDueDate(nextWeek.toISOString().split('T')[0]);
  }, []);

  const loadData = () => {
    setMembers(storage.getMembers());
    setBooks(storage.getBooks());
    setBorrowings(storage.getBorrowings());
  };

  const handleAddBook = (bookId) => {
    const book = books.find(b => b.id === bookId);
    if (book && book.available > 0) {
      if (!selectedBooks.find(b => b.id === bookId)) {
        setSelectedBooks([...selectedBooks, { ...book, borrowed: 1 }]);
      }
    }
  };

  const handleRemoveBook = (bookId) => {
    setSelectedBooks(selectedBooks.filter(book => book.id !== bookId));
  };

  const handleUpdateQuantity = (bookId, quantity) => {
    const book = books.find(b => b.id === bookId);
    if (book && quantity <= book.available) {
      setSelectedBooks(selectedBooks.map(book => 
        book.id === bookId ? { ...book, borrowed: Math.max(1, quantity) } : book
      ));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!selectedMember) {
      alert('Pilih anggota terlebih dahulu!');
      return;
    }
    
    if (selectedBooks.length === 0) {
      alert('Pilih minimal satu buku!');
      return;
    }

    const borrowing = {
      id: generateId(),
      memberId: selectedMember,
      bookIds: selectedBooks.map(book => book.id),
      quantities: selectedBooks.map(book => book.borrowed),
      borrowDate: new Date().toISOString(),
      dueDate: new Date(dueDate).toISOString(),
      returnDate: null,
      status: 'borrowed',
      notes: notes
    };

    // Update book availability
    const updatedBooks = books.map(book => {
      const selectedBook = selectedBooks.find(b => b.id === book.id);
      if (selectedBook) {
        return {
          ...book,
          available: book.available - selectedBook.borrowed
        };
      }
      return book;
    });

    // Save to localStorage
    const updatedBorrowings = [...borrowings, borrowing];
    storage.saveBorrowings(updatedBorrowings);
    storage.saveBooks(updatedBooks);

    // Reset form
    setSelectedMember('');
    setSelectedBooks([]);
    setNotes('');
    loadData();

    alert('Peminjaman berhasil dicatat!');
  };

  const selectedMemberData = members.find(m => m.id === selectedMember);
  const availableBooks = books.filter(book => book.available > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Peminjaman Buku</h1>
          <p className="text-gray-600">Catat peminjaman buku oleh anggota</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Peminjaman */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Form Peminjaman
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pilih Anggota */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Pilih Anggota *
                </label>
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">-- Pilih Anggota --</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.nim} - {member.name} ({member.programStudi})
                    </option>
                  ))}
                </select>
                
                {selectedMemberData && (
                  <div className="mt-3 p-4 bg-blue-50 rounded-lg">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Nama:</span>
                        <span className="font-medium ml-2">{selectedMemberData.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">NIM:</span>
                        <span className="font-medium ml-2">{selectedMemberData.nim}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Program Studi:</span>
                        <span className="font-medium ml-2">{selectedMemberData.programStudi}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">No. HP:</span>
                        <span className="font-medium ml-2">{selectedMemberData.phone}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pilih Buku */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BookOpen size={16} className="inline mr-2" />
                  Pilih Buku *
                </label>
                <div className="space-y-3">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddBook(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="input-field"
                  >
                    <option value="">-- Pilih Buku --</option>
                    {availableBooks.map(book => (
                      <option key={book.id} value={book.id}>
                        {book.title} - {book.author} (Tersedia: {book.available})
                      </option>
                    ))}
                  </select>
                  
                  {/* Daftar Buku yang Dipilih */}
                  {selectedBooks.map(book => (
                    <div key={book.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{book.title}</div>
                        <div className="text-sm text-gray-600">{book.author}</div>
                        <div className="text-xs text-gray-500">Kategori: {book.category}</div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div>
                          <label className="text-sm text-gray-600 mr-2">Jumlah:</label>
                          <input
                            type="number"
                            min="1"
                            max={book.available + book.borrowed}
                            value={book.borrowed}
                            onChange={(e) => handleUpdateQuantity(book.id, parseInt(e.target.value))}
                            className="w-16 px-2 py-1 border rounded"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveBook(book.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tanggal Pengembalian */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Tanggal Pengembalian *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="input-field"
                  required
                />
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  className="input-field"
                  placeholder="Masukkan catatan tambahan..."
                />
              </div>

              {/* Summary */}
              {selectedBooks.length > 0 && (
                <div className="p-4 bg-primary-50 rounded-lg">
                  <h3 className="font-medium text-primary-900 mb-2">Ringkasan Peminjaman:</h3>
                  <ul className="space-y-1 text-sm">
                    <li>Jumlah buku: {selectedBooks.length}</li>
                    <li>Total buku dipinjam: {selectedBooks.reduce((sum, book) => sum + book.borrowed, 0)}</li>
                    <li>Tanggal peminjaman: {new Date().toLocaleDateString('id-ID')}</li>
                    <li>Batas pengembalian: {new Date(dueDate).toLocaleDateString('id-ID')}</li>
                  </ul>
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedMember || selectedBooks.length === 0}
                className="w-full btn-primary py-3 flex items-center justify-center space-x-2"
              >
                <Plus size={20} />
                <span>Catat Peminjaman</span>
              </button>
            </form>
          </div>
        </div>

        {/* Statistik dan Informasi */}
        <div className="space-y-6">
          {/* Statistik */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <Clock size={20} className="inline mr-2" />
              Statistik Cepat
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Anggota Aktif:</span>
                <span className="font-semibold">{members.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Buku Tersedia:</span>
                <span className="font-semibold text-green-600">
                  {books.reduce((sum, book) => sum + book.available, 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Peminjaman Aktif:</span>
                <span className="font-semibold text-orange-600">
                  {borrowings.filter(b => b.status === 'borrowed').length}
                </span>
              </div>
            </div>
          </div>

          {/* Informasi Penting */}
          <div className="card bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">
              Informasi Penting
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 mr-2"></div>
                <span>Pilih anggota dan buku yang akan dipinjam</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 mr-2"></div>
                <span>Buku yang tidak tersedia tidak dapat dipinjam</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 mr-2"></div>
                <span>Pastikan tanggal pengembalian sesuai aturan</span>
              </li>
              <li className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 mr-2"></div>
                <span>Stok buku akan berkurang secara otomatis</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Borrow;
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Members from './pages/Members';
import Borrow from './pages/Borrow';
import Return from './pages/Return';
import Reports from './pages/Reports';

// Icon Component
const Icon = ({ name, size = 20, className = '' }) => {
  const icons = {
    home: '🏠',
    book: '📚',
    users: '👥',
    calendar: '📅',
    exchange: '🔄',
    chart: '📊',
    menu: '☰',
    close: '✕',
    plus: '➕',
    search: '🔍',
    edit: '✏️',
    trash: '🗑️',
    filter: '⚙️',
    check: '✅',
    alert: '⚠️',
    clock: '⏰',
    trending: '📈',
    download: '⬇️',
    phone: '📱',
    graduation: '🎓',
    user: '👤',
    arrowright: '→'
  };
  
  return (
    <span 
      className={className}
      style={{ 
        fontSize: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {icons[name] || '📄'}
    </span>
  );
};

// Sidebar Component
const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: <Icon name="home" />, label: 'Dashboard' },
    { path: '/books', icon: <Icon name="book" />, label: 'Data Buku' },
    { path: '/members', icon: <Icon name="users" />, label: 'Data Anggota' },
    { path: '/borrow', icon: <Icon name="calendar" />, label: 'Peminjaman' },
    { path: '/return', icon: <Icon name="exchange" />, label: 'Pengembalian' },
    { path: '/reports', icon: <Icon name="chart" />, label: 'Laporan' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
        flex flex-col h-screen
      `}>
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="book" size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                SIMPUS
              </h1>
              <p className="text-sm text-gray-600 mt-1">Digital Library System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-primary-50 to-primary-100 text-primary-700 border-l-4 border-primary-500 shadow-sm' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                onClick={() => window.innerWidth < 1024 && toggleSidebar()}
              >
                <div className={`${isActive ? 'text-primary-600' : 'text-gray-500'}`}>
                  {item.icon}
                </div>
                <span className={`font-medium ${isActive ? 'text-primary-800' : ''}`}>
                  {item.label}
                </span>
                {isActive && (
                  <Icon name="arrowright" size={16} className="ml-auto text-primary-500" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Local Storage Active</span>
            </div>
            <p className="text-xs text-gray-600">SIMPUS v1.0 • Digital Library Management</p>
          </div>
        </div>
      </aside>
    </>
  );
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                >
                  {sidebarOpen ? <Icon name="close" size={24} /> : <Icon name="menu" size={24} />}
                </button>
                <div className="ml-4 lg:ml-0">
                  <h2 className="text-xl font-bold text-gray-900">
                    Sistem Manajemen Perpustakaan Digital
                  </h2>
                  <p className="text-sm text-gray-600 hidden sm:block">
                    Manage your digital library efficiently
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-2 text-sm">
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full font-medium flex items-center">
                    <Icon name="check" size={14} className="mr-1" />
                    <span>System Online</span>
                  </div>
                  <div className="text-gray-500">
                    {new Date().toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex">
          <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          
          {/* Main Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/books" element={<Books />} />
                <Route path="/members" element={<Members />} />
                <Route path="/borrow" element={<Borrow />} />
                <Route path="/return" element={<Return />} />
                <Route path="/reports" element={<Reports />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
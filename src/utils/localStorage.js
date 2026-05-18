// Helper functions for localStorage operations
export const storage = {
    // Books
    getBooks: () => {
        const books = localStorage.getItem('books');
        return books ? JSON.parse(books) : [];
    },

    saveBooks: (books) => {
        localStorage.setItem('books', JSON.stringify(books));
    },

    // Members
    getMembers: () => {
        const members = localStorage.getItem('members');
        return members ? JSON.parse(members) : [];
    },

    saveMembers: (members) => {
        localStorage.setItem('members', JSON.stringify(members));
    },

    // Borrowings
    getBorrowings: () => {
        const borrowings = localStorage.getItem('borrowings');
        return borrowings ? JSON.parse(borrowings) : [];
    },

    saveBorrowings: (borrowings) => {
        localStorage.setItem('borrowings', JSON.stringify(borrowings));
    },

    // Categories
    getCategories: () => {
        const categories = localStorage.getItem('categories');
        return categories ? JSON.parse(categories) : [
            'Teknologi',
            'Sains',
            'Fiksi',
            'Non-Fiksi',
            'Sejarah',
            'Bisnis',
            'Seni',
            'Pendidikan',
            'Kesehatan',
            'Hobi'
        ];
    },

    saveCategories: (categories) => {
        localStorage.setItem('categories', JSON.stringify(categories));
    }
};

// Generate unique ID
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
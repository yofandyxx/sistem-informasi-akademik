// storage.js — versi final kompatibel dengan App.jsx
// --------------------------------------------------
const storage = {
    // =============== GET ONE KEY ==================
    get(key) {
        try {
            return JSON.parse(localStorage.getItem(key));
        } catch (e) {
            console.error("storage.get error:", e);
            return null;
        }
    },
    // =============== SET ONE KEY ==================
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error("storage.set error:", e);
        }
    },
    // =============== GET ALL (array) ==============
    getAll(key) {
        try {
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch (e) {
            console.error("storage.getAll error:", e);
            return [];
        }
    },
    // =============== ADD ===========================
    add(key, item) {
        const data = this.getAll(key);
        data.push(item);
        this.set(key, data);
    },
    // =============== UPDATE ========================
    update(key, id, newData) {
        const data = this.getAll(key);
        const updated = data.map((item) =>
            item.id === id ? { ...item, ...newData } : item
        );
        this.set(key, updated);
    },
    // =============== REMOVE ========================
    remove(key, id) {
        const data = this.getAll(key);
        const filtered = data.filter((item) => item.id !== id);
        this.set(key, filtered);
    },
    // =============== SAVE ARRAY ====================
    save(key, array) {
        if (!Array.isArray(array)) {
            console.warn("storage.save: argumen kedua harus array");
            return;
        }
        this.set(key, array);
    },
    // =============== RESET =========================
    reset(key) {
        localStorage.removeItem(key);
    },
};
export default storage;
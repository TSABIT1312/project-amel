require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); 
app.use(express.json());
app.use(express.static('public')); // Untuk menyajikan gambar

const PORT = 3000;

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if (err) {
        console.error('Error menghubungkan ke database:', err);
        return;
    }
    console.log('Koneksi ke database berhasil!');
});

// API: MENGAMBIL SEMUA PRODUK
app.get('/api/products', (req, res) => {
    const sqlQuery = "SELECT * FROM products";
    db.query(sqlQuery, (err, results) => {
        if (err) return res.status(500).json({ message: "Gagal mengambil data dari database." });
        res.json(results);
    });
});

// API: MENGAMBIL SATU PRODUK BERDASARKAN ID
app.get('/api/products/:id', (req, res) => {
    const productId = req.params.id;
    const sqlQuery = "SELECT * FROM products WHERE id = ?";
    db.query(sqlQuery, [productId], (err, results) => {
        if (err) return res.status(500).json({ message: "Gagal mengambil data dari database." });
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ message: "Produk tidak ditemukan." });
        }
    });
});

// API: MENERIMA PESANAN BARU
app.post('/api/orders', (req, res) => {
    const { items, total, tableNumber } = req.body;
    db.beginTransaction(err => {
        if (err) return res.status(500).json({ message: "Gagal memulai transaksi." });
        
        const orderQuery = "INSERT INTO orders (table_number, total_amount, status) VALUES (?, ?, ?)";
        db.query(orderQuery, [tableNumber, total, 'paid'], (err, result) => {
            if (err) return db.rollback(() => res.status(500).json({ message: "Gagal menyimpan pesanan." }));
            
            const orderId = result.insertId;
            const orderItemsQuery = "INSERT INTO order_items (order_id, product_id, quantity, price_per_item) VALUES ?";
            const orderItemsValues = items.map(item => [orderId, item.id, item.quantity, item.price]);

            db.query(orderItemsQuery, [orderItemsValues], (err, result) => {
                if (err) return db.rollback(() => res.status(500).json({ message: "Gagal menyimpan item pesanan." }));
                
                db.commit(err => {
                    if (err) return db.rollback(() => res.status(500).json({ message: "Gagal menyelesaikan transaksi." }));
                    res.status(201).json({ message: "Pesanan berhasil dibuat!", orderId: orderId });
                });
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
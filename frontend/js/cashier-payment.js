document.addEventListener('DOMContentLoaded', () => {
    const cashierTotalElement = document.getElementById('cashier-total');
    const finishOrderButton = document.getElementById('finish-order-btn');

    const cart = JSON.parse(localStorage.getItem('savrCart')) || [];
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    cashierTotalElement.textContent = `Rp ${new Intl.NumberFormat('id-ID').format(total)}`;

    finishOrderButton.addEventListener('click', async () => {
        if (cart.length === 0) {
            alert('Keranjang Anda kosong!');
            return;
        }

        try {
            const tableNumber = localStorage.getItem('tableNumber') || 'N/A';
            const response = await fetch('http://localhost:3000/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: cart, total: total, tableNumber: tableNumber }),
            });

            if (!response.ok) throw new Error('Gagal membuat pesanan di server.');

            localStorage.removeItem('savrCart');
            localStorage.removeItem('tableNumber');
            window.location.href = 'thankyou.html';
        } catch (error) {
            console.error('Error saat checkout kasir:', error);
            alert('Terjadi kesalahan saat memproses pesanan Anda.');
        }
    });
});
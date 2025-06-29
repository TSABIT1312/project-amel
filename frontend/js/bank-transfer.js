document.addEventListener('DOMContentLoaded', () => {
    const finalPayButton = document.getElementById('final-pay-btn');
    const bankNameElement = document.getElementById('bank-name');
    const vaNumberElement = document.getElementById('va-number');
    const copyButton = document.getElementById('copy-btn');
    const countdownElement = document.getElementById('countdown-timer');

    const urlParams = new URLSearchParams(window.location.search);
    const bankName = urlParams.get('bank') || 'Bank';
    bankNameElement.textContent = bankName;

    copyButton.addEventListener('click', () => {
        const vaNumber = vaNumberElement.textContent;
        navigator.clipboard.writeText(vaNumber).then(() => {
            copyButton.textContent = 'Copied!';
            setTimeout(() => { copyButton.textContent = 'copy'; }, 2000);
        }).catch(err => { console.error('Gagal menyalin teks: ', err); });
    });

    let timeInSeconds = 15 * 60;
    const timer = setInterval(() => {
        if (timeInSeconds <= 0) {
            clearInterval(timer);
            countdownElement.textContent = "Waktu pembayaran habis!";
            finalPayButton.disabled = true;
            return;
        }
        const minutes = Math.floor(timeInSeconds / 60);
        let seconds = timeInSeconds % 60;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        countdownElement.textContent = `Selesaikan pembayaran dalam ${minutes}:${seconds}`;
        timeInSeconds--;
    }, 1000);

    finalPayButton.addEventListener('click', async () => {
        clearInterval(timer);
        
        const cart = JSON.parse(localStorage.getItem('savrCart')) || [];
        if (cart.length === 0) {
            alert('Keranjang Anda kosong!');
            window.location.href = 'menu.html';
            return;
        }
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tableNumber = localStorage.getItem('tableNumber') || 'N/A';

        try {
            const orderData = { items: cart, total: total, tableNumber: tableNumber };
            const response = await fetch('http://localhost:3000/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });
            if (!response.ok) throw new Error('Gagal membuat pesanan di server.');
            localStorage.removeItem('savrCart');
            localStorage.removeItem('tableNumber');
            window.location.href = 'thankyou.html';
        } catch (error) {
            alert('Terjadi kesalahan saat memproses pesanan Anda.');
        }
    });
});
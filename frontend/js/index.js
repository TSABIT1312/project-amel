document.addEventListener('DOMContentLoaded', () => {
    const tableInput = document.getElementById('table-number-input');
    const startButton = document.getElementById('start-order-btn');

    startButton.addEventListener('click', () => {
        const tableNumber = tableInput.value;
        if (tableNumber.trim() === '') {
            alert('Mohon masukkan nomor meja Anda.');
            return;
        }
        localStorage.setItem('tableNumber', tableNumber);
        window.location.href = 'menu.html';
    });
});
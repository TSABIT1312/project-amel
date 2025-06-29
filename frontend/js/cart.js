document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cart-items-container');
    const subtotalPriceElement = document.getElementById('subtotal-price');
    const totalPriceElement = document.getElementById('total-price');
    const makePaymentButton = document.querySelector('.btn-primary');

    if (!cartItemsContainer || !makePaymentButton) {
        return;
    }

    let cart = JSON.parse(localStorage.getItem('savrCart')) || [];

    function saveCart() {
        localStorage.setItem('savrCart', JSON.stringify(cart));
    }

    function renderCart() {
        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p style="text-align:center; padding: 2rem; color: #888;">Keranjang Anda kosong.</p>';
            updateSummary(0);
            makePaymentButton.disabled = true;
            makePaymentButton.style.opacity = 0.5;
            return;
        }

        makePaymentButton.disabled = false;
        makePaymentButton.style.opacity = 1;

        let subtotal = 0;
        cart.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <img src="http://localhost:3000/images/${item.name.toLowerCase().replace(/ /g, '-')}.jpg" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>Rp ${new Intl.NumberFormat('id-ID').format(item.price)}</p>
                </div>
                <div class="cart-item-actions">
                    <button class="quantity-btn" data-id="${item.id}" data-action="decrease">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" data-id="${item.id}" data-action="increase">+</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
            subtotal += item.price * item.quantity;
        });
        updateSummary(subtotal);
    }

    function updateSummary(subtotal) {
        subtotalPriceElement.textContent = `Rp ${new Intl.NumberFormat('id-ID').format(subtotal)}`;
        totalPriceElement.textContent = `Rp ${new Intl.NumberFormat('id-ID').format(subtotal)}`;
    }

    function handleQuantityChange(productId, action) {
        const itemIndex = cart.findIndex(item => item.id === productId);
        if (itemIndex === -1) return;
        if (action === 'increase') {
            cart[itemIndex].quantity++;
        } else if (action === 'decrease') {
            cart[itemIndex].quantity--;
            if (cart[itemIndex].quantity <= 0) {
                cart.splice(itemIndex, 1);
            }
        }
        saveCart();
        renderCart();
    }

    cartItemsContainer.addEventListener('click', event => {
        if (event.target.classList.contains('quantity-btn')) {
            const productId = parseInt(event.target.dataset.id);
            const action = event.target.dataset.action;
            handleQuantityChange(productId, action);
        }
    });

    makePaymentButton.addEventListener('click', () => {
        window.location.href = 'payment-methods.html';
    });

    renderCart();
});
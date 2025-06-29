document.addEventListener('DOMContentLoaded', () => {
    const productImage = document.getElementById('product-image');
    const productName = document.getElementById('product-name');
    const productDescription = document.getElementById('product-description');
    const quantityDisplay = document.getElementById('quantity-display');
    const btnIncrease = document.getElementById('btn-increase');
    const btnDecrease = document.getElementById('btn-decrease');
    const btnAddToCart = document.getElementById('add-to-cart-btn');

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        document.querySelector('main').innerHTML = '<h2>Produk tidak valid.</h2>';
        return;
    }
    
    let currentProduct = null;
    let quantity = 1;
    const apiUrl = `http://localhost:3000/api/products/${productId}`;

    async function fetchProductDetail() {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Produk tidak ditemukan.');
            
            const product = await response.json();
            currentProduct = product;

            productImage.src = `http://localhost:3000/images/${product.image_url}`;
            productName.textContent = product.name;
            productDescription.textContent = product.description;

        } catch (error) {
            console.error('Gagal memuat detail produk:', error);
            document.querySelector('main').innerHTML = `<h2>${error.message}</h2>`;
        }
    }

    btnIncrease.addEventListener('click', () => {
        quantity++;
        quantityDisplay.textContent = quantity;
    });

    btnDecrease.addEventListener('click', () => {
        if (quantity > 1) {
            quantity--;
            quantityDisplay.textContent = quantity;
        }
    });

    btnAddToCart.addEventListener('click', () => {
        if (currentProduct) {
            addToCart(currentProduct.id, currentProduct.name, currentProduct.price, quantity);
            showToast(`${quantity} ${currentProduct.name} ditambahkan`);
            quantity = 1;
            quantityDisplay.textContent = quantity;
        }
    });

    function addToCart(id, name, price, qty) {
        let cart = JSON.parse(localStorage.getItem('savrCart')) || [];
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity += qty;
        } else {
            cart.push({ id, name, price, quantity: qty });
        }
        localStorage.setItem('savrCart', JSON.stringify(cart));
    }

    fetchProductDetail();
});
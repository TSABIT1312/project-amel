document.addEventListener('DOMContentLoaded', () => {
    const menuContainer = document.getElementById('menu-grid-container');
    const cartCountElement = document.getElementById('cart-count');
    const searchInput = document.getElementById('search-input');
    const categoryButtons = document.querySelectorAll('.category-button');

    let allProducts = [];
    let cart = JSON.parse(localStorage.getItem('savrCart')) || [];

    function renderProducts(productsToDisplay) {
        menuContainer.innerHTML = '';
        if (productsToDisplay.length === 0) {
            menuContainer.innerHTML = '<p style="text-align:center; color: #888;">Produk tidak ditemukan.</p>';
            return;
        }
        productsToDisplay.forEach(product => {
            const productCardHTML = `
                <a href="detail.html?id=${product.id}" class="product-card-link">
                    <div class="product-card">
                        <img src="http://localhost:3000/images/${product.image_url}" alt="${product.name}">
                        <div class="product-info">
                            <h3>${product.name}</h3>
                            <p>Rp ${new Intl.NumberFormat('id-ID').format(product.price)}</p>
                        </div>
                        <button class="add-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">+</button>
                    </div>
                </a>
            `;
            menuContainer.innerHTML += productCardHTML;
        });
    }

    async function fetchProducts() {
        const apiUrl = 'http://localhost:3000/api/products';
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Gagal mengambil data');
            allProducts = await response.json();
            renderProducts(allProducts);
        } catch (error) {
            console.error('Gagal mengambil data produk:', error);
            menuContainer.innerHTML = '<p>Maaf, terjadi kesalahan saat memuat menu.</p>';
        }
    }

    function saveCart() {
        localStorage.setItem('savrCart', JSON.stringify(cart));
        updateCartCount();
    }
    function updateCartCount() {
        if (!cartCountElement) return;
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        cartCountElement.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    function addToCart(id, name, price) {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }
        saveCart();
        showToast(`${name} ditambahkan`);
    }

    menuContainer.addEventListener('click', event => {
        const button = event.target.closest('.add-btn');
        if (button) {
            event.preventDefault();
            const id = parseInt(button.dataset.id);
            const name = button.dataset.name;
            const price = parseFloat(button.dataset.price);
            addToCart(id, name, price);
        }
    });
    searchInput.addEventListener('input', event => {
        const searchTerm = event.target.value.toLowerCase();
        const filteredProducts = allProducts.filter(product => product.name.toLowerCase().includes(searchTerm));
        renderProducts(filteredProducts);
    });
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const categoryId = button.dataset.categoryId;
            if (categoryId === 'all') {
                renderProducts(allProducts);
            } else {
                const filteredProducts = allProducts.filter(product => product.category_id == categoryId);
                renderProducts(filteredProducts);
            }
        });
    });

    fetchProducts();
    updateCartCount();
});
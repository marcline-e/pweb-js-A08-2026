document.addEventListener('DOMContentLoaded', () => {
    let rawProducts = [];
    let visibleCount = 8;
    const BATCH_SIZE = 8;

    let state = {
        searchQuery: '',
        selectedCategory: 'all',
        sortBy: 'default'
    };

    // DOM Elements
    const productList = document.getElementById('productList');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortBySelect = document.getElementById('sortBy');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const errorContainer = document.getElementById('errorContainer');
    
    // Cart Elements
    const cartBadge = document.getElementById('cartBadge');
    const cartToggleBtn = document.getElementById('cartToggleBtn');
    const cartSection = document.getElementById('cartSection');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartTotal = document.getElementById('cartTotal');
    const clearCartBtn = document.getElementById('clearCartBtn');

    // Modal Elements
    const productModal = document.getElementById('productModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalBody = document.getElementById('modalBody');

    // Debounce dengan Closure
    function createDebounce(func, delay = 350) {
        let timeoutId;
        return function (...args) {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    const handleSearchInput = createDebounce((event) => {
        state.searchQuery = event.target.value.trim().toLowerCase();
        visibleCount = BATCH_SIZE;
        render();
    });

    // Local Storage Cart CRUD
    const CART_KEY = 'shoppingCart';

    function getCart() {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    }

    function saveCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartUI();
    }

    function addToCart(product) {
        let cart = getCart();
        const existingIndex = cart.findIndex(item => item.id === product.id);

        if (existingIndex > -1) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                thumbnail: product.thumbnail,
                quantity: 1
            });
        }
        saveCart(cart);
    }

    function removeFromCart(productId) {
        let cart = getCart();
        cart = cart.filter(item => item.id !== productId);
        saveCart(cart);
    }

    function updateQuantity(productId, delta) {
        let cart = getCart();
        const item = cart.find(i => i.id === productId);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                cart = cart.filter(i => i.id !== productId);
            }
        }
        saveCart(cart);
    }

    function clearCart() {
        localStorage.removeItem(CART_KEY);
        updateCartUI();
    }

    function updateCartUI() {
        const cart = getCart();
        const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
        cartBadge.textContent = totalCount;

        const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        cartTotal.textContent = totalPrice.toFixed(2);

        if (cart.length === 0) {
            cartItemsList.innerHTML = '<p>Keranjang Anda kosong.</p>';
            return;
        }

        cartItemsList.innerHTML = cart.map(item => `
            <div class="cart-item">
                <img src="${item.thumbnail}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-info">
                    <strong>${item.title}</strong>
                    <p>$${item.price} x ${item.quantity} = $${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div class="cart-item-actions">
                    <button class="qty-btn" data-id="${item.id}" data-action="decrease">-</button>
                    <span>${item.quantity}</span>
                    <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
                    <button class="danger-btn remove-btn" data-id="${item.id}">Hapus</button>
                </div>
            </div>
        `).join('');
    }

    // Filter & Sort
    function getProcessedProducts() {
        return rawProducts
            .filter(product => {
                if (!state.searchQuery) return true;
                const matchTitle = product.title.toLowerCase().includes(state.searchQuery);
                const matchCategory = product.category.toLowerCase().includes(state.searchQuery);
                return matchTitle || matchCategory;
            })
            .filter(product => {
                if (state.selectedCategory === 'all') return true;
                return product.category === state.selectedCategory;
            })
            .sort((a, b) => {
                if (state.sortBy === 'price-asc') return a.price - b.price;
                if (state.sortBy === 'price-desc') return b.price - a.price;
                if (state.sortBy === 'rating-desc') return b.rating - a.rating;
                return 0;
            });
    }

    // Render & Array Slicing -- Tejan
    function renderProducts(processedProducts) {
        if (processedProducts.length === 0) {
            productList.innerHTML = '<p class="no-data">Tidak ada produk yang cocok.</p>';
            loadMoreBtn.classList.add('hidden');
            return;
        }

        const slicedProducts = processedProducts.slice(0, visibleCount);

        productList.innerHTML = slicedProducts.map(product => `
            <div class="product-card" data-id="${product.id}">
                ${product.discountPercentage ? `<span class="discount-badge">-${Math.round(product.discountPercentage)}%</span>` : ''}
                <img src="${product.thumbnail}" alt="${product.title}" class="product-img">
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <h4>${product.title}</h4>
                    <p class="product-rating">⭐ ${product.rating}</p>
                    <p class="product-price">$${product.price}</p>
                    <button class="add-to-cart-btn" data-id="${product.id}">Tambah ke Keranjang</button>
                </div>
            </div>
        `).join('');

        if (visibleCount < processedProducts.length) {
            loadMoreBtn.classList.remove('hidden');
        } else {
            loadMoreBtn.classList.add('hidden');
        }
    }

    function populateCategories(products) {
        const categories = ['all', ...new Set(products.map(p => p.category))];
        categoryFilter.innerHTML = categories.map(cat => `
            <option value="${cat}">${cat === 'all' ? 'Semua Kategori' : cat}</option>
        `).join('');
    }

    function render() {
        const processed = getProcessedProducts();
        renderProducts(processed);
    }

    // Event Delegation untuk Modal & Keranjang -- Tejan
    productList.addEventListener('click', (e) => {
        const target = e.target;
        const card = target.closest('.product-card');

        if (!card) return;
        const productId = parseInt(card.getAttribute('data-id'));
        const product = rawProducts.find(p => p.id === productId);

        if (!product) return;

        if (target.classList.contains('add-to-cart-btn')) {
            e.stopPropagation();
            addToCart(product);
            return;
        }

        openModal(product);
    });

    function openModal(product) {
        modalBody.innerHTML = `
            <div class="modal-detail">
                <img src="${product.thumbnail}" alt="${product.title}">
                <div class="modal-info">
                    <span class="product-category">${product.category}</span>
                    <h2>${product.title}</h2>
                    <p><strong>Brand:</strong> ${product.brand || 'N/A'}</p>
                    <p><strong>Stok:</strong> ${product.stock} unit</p>
                    <p><strong>Rating:</strong> ⭐ ${product.rating}</p>
                    <p class="product-price">$${product.price} ${product.discountPercentage ? `(Diskon ${product.discountPercentage}%)` : ''}</p>
                    <p class="description">${product.description}</p>
                    <button class="add-to-cart-btn modal-add-btn" data-id="${product.id}">Tambah ke Keranjang</button>
                </div>
            </div>
        `;

        modalBody.querySelector('.modal-add-btn').addEventListener('click', () => {
            addToCart(product);
            closeModal();
        });

        productModal.classList.remove('hidden');
    }

    function closeModal() {
        productModal.classList.add('hidden');
    }

    closeModalBtn.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === productModal) closeModal();
    });

    cartItemsList.addEventListener('click', (e) => {
        const target = e.target;
        const id = parseInt(target.getAttribute('data-id'));

        if (target.classList.contains('qty-btn')) {
            const action = target.getAttribute('data-action');
            updateQuantity(id, action === 'increase' ? 1 : -1);
        } else if (target.classList.contains('remove-btn')) {
            removeFromCart(id);
        }
    });

    // Fetch Data API -- Tejan
    async function fetchProducts() {
        try {
            productList.innerHTML = '<p>Memuat katalog produk...</p>';
            const res = await fetch('https://dummyjson.com/products?limit=100');
            
            if (!res.ok) throw new Error(`HTTP Error Status: ${res.status}`);
            
            const data = await res.json();
            rawProducts = data.products;
            
            populateCategories(rawProducts);
            render();
        } catch (err) {
            errorContainer.innerHTML = `
                <div class="error-box">
                    ⚠️ <strong>Gagal Memuat Produk:</strong> ${err.message}. Silakan periksa koneksi Anda dan coba lagi.
                </div>
            `;
            errorContainer.classList.remove('hidden');
            productList.innerHTML = '';
            console.error('Fetch error:', err);
        }
    }

    searchInput.addEventListener('input', handleSearchInput);

    categoryFilter.addEventListener('change', (e) => {
        state.selectedCategory = e.target.value;
        visibleCount = BATCH_SIZE;
        render();
    });

    sortBySelect.addEventListener('change', (e) => {
        state.sortBy = e.target.value;
        visibleCount = BATCH_SIZE;
        render();
    });

    loadMoreBtn.addEventListener('click', () => {
        visibleCount += BATCH_SIZE;
        render();
    });

    cartToggleBtn.addEventListener('click', () => {
        cartSection.classList.toggle('hidden');
    });

    clearCartBtn.addEventListener('click', clearCart);

    fetchProducts();
    updateCartUI();
});
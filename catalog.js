
const productContainer = document.getElementById("productContainer");
const errorMsg = document.getElementById("errorMsg");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const productModal = document.getElementById("productModal");
const modalContent = document.getElementById("modalContent");

let products = [];
let currentIndex = 0;
const productsPerPage = 8;

// Mengambil data produk dari API
async function getProducts() {
    try {
        const response = await fetch("https://dummyjson.com/products");

        if (!response.ok) {
            throw new Error("Gagal mengambil data produk");
        }

        const data = await response.json();
        products = data.products;

        displayProducts(products);

    } catch (error) {
        errorMsg.textContent = "Gagal memuat produk. Coba lagi nanti.";
        console.log(error);
    }
}

// Menampilkan produk secara bertahap
function displayProducts(productList) {
    const nextProducts = productList.slice(
        currentIndex,
        currentIndex + productsPerPage
    );

    nextProducts.forEach(function(product) {
        productContainer.innerHTML += `
            <div class="product-card" data-id="${product.id}">
                <img src="${product.thumbnail}" alt="${product.title}">
                <h3>${product.title}</h3>
                <p>Harga: $${product.price}</p>
                <p>Rating: ${product.rating}</p>
                <p>Diskon: ${product.discountPercentage}%</p>
                <p>Kategori: ${product.category}</p>
            </div>
        `;
    });

    currentIndex += nextProducts.length;

    if (currentIndex >= productList.length) {
        loadMoreBtn.style.display = "none";
    } else {
        loadMoreBtn.style.display = "block";
    }
}

// Event Delegation untuk membuka detail produk
productContainer.addEventListener("click", function(event) {
    const card = event.target.closest(".product-card");

    if (card) {
        const productId = Number(card.getAttribute("data-id"));

        const product = products.find(function(item) {
            return item.id === productId;
        });

        if (product) {
            modalContent.innerHTML = `
                <div class="modal-content">
                    <button id="closeModalBtn">X</button>

                    <img src="${product.thumbnail}" alt="${product.title}">

                    <h2>${product.title}</h2>
                    <p>Harga: $${product.price}</p>
                    <p>Brand: ${product.brand}</p>
                    <p>Stock: ${product.stock}</p>
                    <p>Deskripsi: ${product.description}</p>
                </div>
            `;

            productModal.style.display = "flex";
        }
    }
});

// Menutup modal lewat tombol X
modalContent.addEventListener("click", function(event) {
    if (event.target.id === "closeModalBtn") {
        productModal.style.display = "none";
    }
});

// Menutup modal lewat klik area luar
productModal.addEventListener("click", function(event) {
    if (event.target === productModal) {
        productModal.style.display = "none";
    }
});

// Load More
loadMoreBtn.addEventListener("click", function() {
    displayProducts(products);
});

// Memulai pengambilan data
getProducts();
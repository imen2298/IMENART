console.log("SHOP.JS EST BIEN CHARGÉ");

const productsContainer =
    document.getElementById("products-container");
    
let allProducts = [];

async function loadProducts() {

    if (!productsContainer) {
        return;
    }

    try {

        const response = await fetch(
            "https://imenart.onrender.com/api/products"
        );

        if (!response.ok) {
            throw new Error(
                "Impossible de récupérer les œuvres."
            );
        }

        allProducts = await response.json();
        
        console.log("Œuvres récupérées :", allProducts);

        displayProducts(allProducts);          

    } catch (error) {

        console.error(
            "Erreur lors du chargement des œuvres :",
            error
        );
    }
}

function displayProducts(products) {

    productsContainer.innerHTML = "";

    products.forEach((product, index) => {

        let offsetClass = "";

        if (index % 4 === 1) {
            offsetClass = "product-offset";
        } else if (index % 4 === 2) {
            offsetClass = "product-offset-small";
        }

        const statusClass =
            product.status === "sold"
                ? "sold"
                : "available";

        const statusText =
            product.status === "sold"
                ? "SOLD"
                : "AVAILABLE";

        const buttonDisabled =
            product.status === "sold"
                ? "disabled"
                : "";

        productsContainer.innerHTML += `
           <a href="product.html?id=${product.id}" class="product-card ${offsetClass}">

                <div class="product-image">

                    <img
                        src="${product.image}"
                        alt="${product.title}"
                        loading="lazy"
                        decoding="async"
                    >

                    <span class="${statusClass}">
                        ${statusText}
                    </span>

                </div>

                <div class="product-info">

                    <div>

                        <span class="product-category">
                            ${product.category}
                        </span>

                        <h2>
                            ${product.title}
                        </h2>

                        <p>
                            ${product.description || ""}
                        </p>

                    </div>

                    <div class="product-price">

                        <span>
                            ${Number(product.price).toFixed(2)} €
                        </span>

                        <button
                            type="button"
                            ${buttonDisabled}
                            data-id="${product.id}"
                        >
                            <i class="fa-solid fa-arrow-right"></i>
                        </button>

                    </div>

                </div>

            </a>
        `;
    });
}
// ================================
// FILTRES PAR CATÉGORIE
// ================================

const filterButtons =
    document.querySelectorAll(".shop-filter button");

filterButtons.forEach((button) => {

    button.addEventListener("click", () => {

        const selectedCategory =
            button.dataset.category;

        // Changer le bouton actif
        filterButtons.forEach((btn) => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        // Afficher toutes les œuvres
        if (selectedCategory === "all") {
            displayProducts(allProducts);
            return;
        }

        // Filtrer les œuvres
        const filteredProducts = allProducts.filter((product) => {

            return product.category
                .toLowerCase()
                .trim() === selectedCategory
                .toLowerCase()
                .trim();

        });

        displayProducts(filteredProducts);
    });

});
loadProducts();
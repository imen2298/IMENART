// ================================
// RÉCUPÉRER L'ID DE L'ŒUVRE
// ================================

const urlParams = new URLSearchParams(window.location.search);

const productId = urlParams.get("id");

console.log("ID de l'œuvre :", productId);
async function loadProduct() {

    try {

        const response = await fetch(
            `https://imenart.onrender.com/api/products/${productId}`
        );

        if (!response.ok) {
            throw new Error(
                "Impossible de récupérer cette œuvre."
            );
        }

        const product = await response.json();

        console.log("Œuvre récupérée :", product);

        displayProduct(product);

    } catch (error) {

        console.error(
            "Erreur lors du chargement de l'œuvre :",
            error
        );

    }
}
function displayProduct(product) {

    const container =
        document.getElementById("product-detail-container");

    if (!container) {
        return;
    }

    container.innerHTML = `
   
        <div class="product-detail-image">

            <img
                src="https://imenart.onrender.com/uploads/${product.image}"
                alt="${product.title}"
            >

        </div>

        <div class="product-detail-info">

            <span class="product-category">
                ${product.category}
            </span>

            <h1>
                ${product.title}
            </h1>

            <p class="product-description">
                ${product.description || ""}
            </p>

            <p class="product-dimensions">
                ${product.dimensions || ""}
            </p>

            <div class="product-detail-price">
                ${Number(product.price).toFixed(2)} €
            </div>

            <div class="product-detail-status">
                ${product.status === "available"
                ? "AVAILABLE"
                : "SOLD"}
            </div>

          ${product.status === "available"
           ? `
            <button
               type="button"
               class="add-to-cart-button"
               id="add-to-cart-button"
                >
              Add to cart
             <i class="fa-solid fa-arrow-right"></i>
           </button>
          `
         : `
            <button
               type="button"
               class="add-to-cart-button"
               disabled
           >
               Sold out
            </button>
        `
          }

</div>

        </div>
    `;
       const addToCartButton =
    document.getElementById("add-to-cart-button");

if (addToCartButton) {

    addToCartButton.addEventListener("click", () => {

        let cart = JSON.parse(
            localStorage.getItem("cart")
        ) || [];

        // Éviter d'ajouter deux fois la même œuvre
        const alreadyInCart = cart.some(
            item => item.id === product.id
        );

        if (alreadyInCart) {
            showCartMessage("This artwork is already in your cart.");
            return;
        }

        cart.push(product);

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );

        // Mettre à jour le compteur du panier
        const cartCount =
            document.getElementById("cart-count");

        if (cartCount) {
            cartCount.textContent = cart.length;
        }

        showCartMessage("Artwork added to your cart.");
    });
  }
}
function showCartMessage(message) {

    let notification = document.getElementById("cart-notification");

    if (!notification) {

        notification = document.createElement("div");

        notification.id = "cart-notification";

        notification.innerHTML = `
            <i class="fa-solid fa-check"></i>
            <span></span>
        `;

        document.body.appendChild(notification);
    }

    notification.querySelector("span").textContent = message;

    notification.classList.add("show");

    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}
loadProduct();
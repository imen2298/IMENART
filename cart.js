
console.log("CART.JS EST BIEN CHARGÉ");

const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");
const checkoutForm = document.getElementById("checkout-form");
const placeOrderButton = document.getElementById("place-order-btn");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Message de retour pour le client
let formMessage = null;

if (checkoutForm) {
    formMessage = document.createElement("p");
    formMessage.id = "checkout-message";
    formMessage.setAttribute("role", "status");
    formMessage.setAttribute("aria-live", "polite");
    formMessage.hidden = true;

    checkoutForm.prepend(formMessage);
}

function showFormMessage(message, isError = false) {
    if (!formMessage) return;

    formMessage.textContent = message;
    formMessage.hidden = false;
    formMessage.style.color = isError ? "#b42318" : "#426b50";
}

// Afficher les œuvres du panier
function displayCart() {
    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <p class="empty-cart">Your cart is empty.</p>
        `;

        updateCartTotal();
        updateCartCount();
        return;
    }

    cart.forEach((product) => {
        cartItemsContainer.innerHTML += `
            <div class="cart-item">
                <img
                    src="https://imenart.onrender.com/uploads/${product.image}"
                    alt="${product.title}"
                >

                <div class="cart-item-info">
                    <span>${product.category}</span>
                    <h2>${product.title}</h2>
                    <p>${Number(product.price).toFixed(2)} €</p>

                    <button
                        class="remove-from-cart"
                        data-id="${product.id}"
                        type="button"
                    >
                        Remove
                    </button>
                </div>
            </div>
        `;
    });

    addRemoveButtonsEvents();
    updateCartTotal();
    updateCartCount();
}

// Supprimer une œuvre du panier
function addRemoveButtonsEvents() {
    const removeButtons = document.querySelectorAll(".remove-from-cart");

    removeButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const productId = button.dataset.id;

            cart = cart.filter(
                (product) => String(product.id) !== String(productId)
            );

            localStorage.setItem("cart", JSON.stringify(cart));

            displayCart();
        });
    });
}

// Calculer le total affiché
function updateCartTotal() {
    const total = cart.reduce(
        (sum, product) => sum + Number(product.price),
        0
    );

    if (cartTotal) {
        cartTotal.textContent = `${total.toFixed(2)} €`;
    }
}

// Mettre à jour le nombre d'œuvres
function updateCartCount() {
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

// Envoyer la commande au backend
async function submitOrder(event) {
    event.preventDefault();

    if (!checkoutForm) return;

    if (cart.length === 0) {
        showFormMessage(
            "Your cart is empty. Please add an artwork before ordering.",
            true
        );
        return;
    }

    const customerName = document
        .getElementById("customer-name")
        .value.trim();

    const customerPhone = document
        .getElementById("customer-phone")
        .value.trim();

    const customerAddress = document
        .getElementById("customer-address")
        .value.trim();

    const notes = document
        .getElementById("customer-notes")
        .value.trim();

    if (!customerName || !customerPhone || !customerAddress) {
        showFormMessage(
            "Please complete all required fields.",
            true
        );
        return;
    }

    // On envoie les identifiants des œuvres,
    // pas les prix fournis par le navigateur.
    const orderData = {
        customerName,
        customerPhone,
        customerAddress,
        notes,
        items: cart.map((product) => ({
            productId: product.id
        }))
    };

    if (placeOrderButton) {
        placeOrderButton.disabled = true;
        placeOrderButton.textContent = "Sending...";
    }

    showFormMessage("Sending your order...");

    try {
        const response = await fetch("https://imenart.onrender.com/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                result.message || "Unable to place your order."
            );
        }

        // Vider le panier uniquement après confirmation du serveur
        cart = [];
        localStorage.setItem("cart", JSON.stringify(cart));

        displayCart();
        checkoutForm.reset();

        showFormMessage(
            result.message || "Your order has been placed successfully."
        );

    } catch (error) {
        console.error("Order submission error:", error);

        showFormMessage(
            error.message ||
                "Unable to send your order. Please try again.",
            true
        );
    } finally {
        if (placeOrderButton) {
            placeOrderButton.disabled = false;
            placeOrderButton.textContent = "Place order";
        }
    }
}

if (checkoutForm) {
    checkoutForm.addEventListener("submit", submitOrder);
}

displayCart();
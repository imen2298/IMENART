// ================================
// AUTHENTIFICATION
// ================================

const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "login.html";
}


// ================================
// NAVIGATION DASHBOARD
// ================================

const navItems = document.querySelectorAll(".nav-item[data-section]");
const sections = document.querySelectorAll(".dashboard-section");

function showSection(sectionId) {

    // Cacher toutes les sections
    sections.forEach(section => {
        section.classList.remove("active");
    });

    // Afficher la section demandée
    const section = document.getElementById(sectionId);

    if (section) {
        section.classList.add("active");
    }

    // Mettre à jour le bouton actif
    navItems.forEach(item => {

        item.classList.remove("active");

        if (item.dataset.section === sectionId) {
            item.classList.add("active");
        }

    });

    // Mémoriser la section actuelle
    sessionStorage.setItem(
        "dashboard-section",
        sectionId
    );
}


// ================================
// CLIC SUR LES ÉLÉMENTS DE NAVIGATION
// ================================

navItems.forEach(item => {

    item.addEventListener("click", () => {

        const sectionId = item.dataset.section;

        showSection(sectionId);

    });

});


// ================================
// RESTAURER LA SECTION APRÈS RECHARGEMENT
// ================================

const savedSection =
    sessionStorage.getItem("dashboard-section");

if (
    savedSection &&
    document.getElementById(savedSection)
) {

    showSection(savedSection);

} else {

    showSection("overview");

}


// ================================
// MODAL AJOUTER UNE ŒUVRE
// ================================

const addArtworkButton =
    document.getElementById("add-artwork-button");

const artworkModal =
    document.getElementById("artwork-modal");

const closeArtworkModal =
    document.getElementById("close-artwork-modal");

const cancelArtwork =
    document.getElementById("cancel-artwork");

const modalOverlay =
    document.getElementById("modal-overlay");

const artworkForm =
    document.getElementById("artwork-form");

const artworkFormMessage =
    document.getElementById("artwork-form-message");
const artworkId = 
    document.getElementById("artwork-id");

const artworkModalLabel =
    document.getElementById("artwork-modal-label");

const artworkModalTitle =
    document.getElementById("artwork-modal-title");

const artworkSubmitButton =
    document.getElementById("artwork-submit-button");


// ================================
// OUVRIR LE MODAL
// ================================

function openArtworkModal() {

    if (!artworkModal) {
        return;
    }

    artworkModal.classList.add("active");

    if (artworkFormMessage) {
        artworkFormMessage.textContent = "";
        artworkFormMessage.className = "";
    }

}


// ================================
// FERMER LE MODAL
// ================================

function closeArtworkModalFunction() {

    if (!artworkModal) {
        return;
    }

    artworkModal.classList.remove("active");

    if (artworkForm) {
        artworkForm.reset();
    }

    // Réinitialiser l'ID
    artworkId.value = "";

    // Revenir au mode AJOUT
    artworkModalLabel.textContent =
        "NOUVELLE ŒUVRE";

    artworkModalTitle.textContent =
        "Ajouter une œuvre";

    artworkSubmitButton.innerHTML = `
        <i class="fa-solid fa-plus"></i>
        Ajouter l'œuvre
    `;

    // L'image est obligatoire pour un nouvel ajout
    const imageInput =
        document.getElementById("artwork-image");

    imageInput.required = true;

    if (artworkFormMessage) {
        artworkFormMessage.textContent = "";
        artworkFormMessage.className = "";
    }

}


// ================================
// BOUTON "AJOUTER UNE ŒUVRE"
// ================================

if (addArtworkButton) {

    addArtworkButton.addEventListener("click", () => {

        // S'assurer qu'on est dans la section Œuvres
        showSection("artworks");

        openArtworkModal();

    });

}


// ================================
// BOUTON X
// ================================

if (closeArtworkModal) {

    closeArtworkModal.addEventListener("click", () => {

        closeArtworkModalFunction();

    });

}


// ================================
// BOUTON ANNULER
// ================================

if (cancelArtwork) {

    cancelArtwork.addEventListener("click", () => {

        closeArtworkModalFunction();

    });

}


// ================================
// CLIQUER SUR LE FOND
// ================================

if (modalOverlay) {

    modalOverlay.addEventListener("click", () => {

        closeArtworkModalFunction();

    });

}


// ================================
// AJOUTER / MODIFIER UNE ŒUVRE
// ================================
if (artworkForm) {

    artworkForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        // S'assurer qu'on reste dans la section Œuvres
        showSection("artworks");

        // Récupérer l'ID de l'œuvre
        const id = artworkId.value;

        // Vérifier si on est en mode modification
        const isEditMode = id !== "";

        // Récupérer les données du formulaire
        const formData = new FormData(artworkForm);

        // Message temporaire
        artworkFormMessage.textContent =
            isEditMode
                ? "Modification de l'œuvre en cours..."
                : "Ajout de l'œuvre en cours...";

        artworkFormMessage.className = "success";

        try {

            // URL
            const url = isEditMode
                ? `https://imenart.onrender.com/api/products/${id}`
                : "https://imenart.onrender.com/api/products";

            // Méthode HTTP
            const method = isEditMode
                ? "PUT"
                : "POST";

            const response = await fetch(
                url,
                {
                    method: method,

                    headers: {
                        Authorization: `Bearer ${token}`
                    },

                    body: formData
                }
            );

            const data = await response.json();
           console.log("Produit retourné par le serveur :",JSON.stringify(data.product, null, 2));

            // ================================
            // ERREUR API
            // ================================

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Une erreur est survenue."
                );

            }

            // ================================
            // SUCCÈS
            // ================================

            artworkFormMessage.textContent =
                isEditMode
                    ? "Œuvre modifiée avec succès."
                    : "Œuvre ajoutée avec succès.";

            artworkFormMessage.className = "success";

            console.log(
                isEditMode
                    ? "Œuvre modifiée :"
                    : "Œuvre créée :",
                data.product
            );

            // ================================
            // RECHARGER LES ŒUVRES
            // ================================

            await loadArtworks();

            // ================================
            // FERMER LE MODAL
            // ================================

            closeArtworkModalFunction();

            // ================================
            // RESTER SUR LA SECTION ŒUVRES
            // ================================

            showSection("artworks");

        } catch (error) {

            console.error(
                "Erreur lors de l'enregistrement de l'œuvre :",
                error
            );

            artworkFormMessage.textContent =
                error.message ||
                "Une erreur est survenue.";

            artworkFormMessage.className = "error";

            showSection("artworks");
        }

    });

}



// ================================
// RÉCUPÉRER LES ŒUVRES
// ================================

const artworksTable =
    document.getElementById("artworks-table");


async function loadArtworks() {

    if (!artworksTable) {
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


        const products = await response.json();


        displayArtworks(products);


    } catch (error) {

        console.error(
            "Erreur lors du chargement des œuvres :",
            error
        );


        artworksTable.innerHTML = `
            <tr>
                <td colspan="6" class="empty-message">
                    Impossible de charger les œuvres.
                </td>
            </tr>
        `;

    }

}


// ================================
// AFFICHER LES ŒUVRES
// ================================

async function editArtwork(id) {

    try {

        const response = await fetch(
            `https://imenart.onrender.com/api/products/${id}`
        );

        const product = await response.json();

        if (!response.ok) {

            throw new Error(
                product.message ||
                "Impossible de récupérer l'œuvre."
            );

        }

        // Remplir le formulaire
        document.getElementById("artwork-id").value =
            product.id;

        document.getElementById("artwork-title").value =
            product.title;

        document.getElementById("artwork-category").value =
            product.category;

        document.getElementById("artwork-description").value =
            product.description || "";

        document.getElementById("artwork-dimensions").value =
            product.dimensions || "";

        document.getElementById("artwork-price").value =
            product.price;

        document.getElementById("artwork-status").value =
            product.status;

        // Modifier le texte du modal
        artworkModalLabel.textContent =
            "MODIFIER L'ŒUVRE";

        artworkModalTitle.textContent =
            "Modifier une œuvre";

        artworkSubmitButton.innerHTML = `
            <i class="fa-solid fa-check"></i>
            Enregistrer les modifications
        `;

        // L'image n'est pas obligatoire en modification
        const imageInput =
            document.getElementById("artwork-image");

        imageInput.required = false;

        artworkFormMessage.textContent = "";
        artworkFormMessage.className = "";

        // Ouvrir le modal
        artworkModal.classList.add("active");

    } catch (error) {

        console.error(
            "Erreur lors de la récupération de l'œuvre :",
            error
        );

        alert(
            error.message ||
            "Impossible de modifier cette œuvre."
        );

    }

}
async function deleteArtwork(id) {

    const confirmed = confirm(
        "Êtes-vous sûr de vouloir supprimer cette œuvre ?"
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(
            `https://imenart.onrender.com/api/products/${id}`,
            {
                method: "DELETE",

                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message ||
                "Impossible de supprimer l'œuvre."
            );
        }

        await loadArtworks();

    } catch (error) {

        console.error(
            "Erreur lors de la suppression de l'œuvre :",
            error
        );

        alert(
            error.message ||
            "Impossible de supprimer l'œuvre."
        );
    }
}

function displayArtworks(products) {

    if (!artworksTable) {
        return;
    }


    artworksTable.innerHTML = "";


    // Aucune œuvre
    if (products.length === 0) {

        artworksTable.innerHTML = `
            <tr>
                <td colspan="6" class="empty-message">
                    Aucune œuvre pour le moment.
                </td>
            </tr>
        `;

        return;
    }


    // Afficher chaque œuvre
    products.forEach(product => {

        const row = document.createElement("tr");


        // Statut
        const statusText =
            product.status === "available"
                ? "Disponible"
                : "Vendue";


        // Prix
        const price =
            Number(product.price).toFixed(2);


        row.innerHTML = `
            <td>
                <img
                    
                    src="${escapeHTML(product.image)}"
                    alt="${escapeHTML(product.title)}"
                    style="
                        width: 55px;
                        height: 65px;
                        object-fit: cover;
                        border-radius: 6px;
                    "
                >
            </td>

            <td>
                ${escapeHTML(product.title)}
            </td>

            <td>
                ${escapeHTML(product.category)}
            </td>

            <td>
                ${price} €
            </td>

            <td>
                ${statusText}
            </td>

            <td>
                <button
                   type="button"
                   class="secondary-button edit-artwork"
                   data-id="${product.id}"
                >
                   Modifier
                </button>
                <button
                   type="button"
                   class="secondary-button delete-artwork"
                   data-id="${product.id}"
                >
                   Supprimer
                </button>
            </td>
        `;


        artworksTable.appendChild(row);

    });

}


// ================================
// PROTECTION CONTRE HTML INJECTÉ
// ================================

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;

}

document.addEventListener("click", (event) => {

    // Bouton Modifier
    const editButton =
        event.target.closest(".edit-artwork");

    if (editButton) {

        const id =
            editButton.dataset.id;

        editArtwork(id);

        return;
    }


    // Bouton Supprimer
    const deleteButton =
        event.target.closest(".delete-artwork");

    if (deleteButton) {

        const id =
            deleteButton.dataset.id;

        deleteArtwork(id);
    }
});
// ================================
// CHARGER LES ŒUVRES AU DÉMARRAGE
// ================================

loadArtworks();

// ================================
// RÉCUPÉRER LES COMMANDES
// ================================

const ordersTable = document.getElementById("orders-table");

async function loadOrders() {
    if (!ordersTable) {
        return;
    }

    ordersTable.innerHTML = `
        <tr>
            <td colspan="7" class="empty-message">
                Chargement des commandes...
            </td>
        </tr>
    `;

    try {
        const response = await fetch(
            "https://imenart.onrender.com/api/admin/orders",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Impossible de récupérer les commandes."
            );
        }

        if (!Array.isArray(data)) {
            throw new Error(
                "Le format des commandes reçu du serveur est incorrect."
            );
        }

        displayOrders(data);

    } catch (error) {
        console.error(
            "Erreur lors du chargement des commandes :",
            error
        );

        ordersTable.innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    Impossible de charger les commandes.
                </td>
            </tr>
        `;
    }
}

function displayOrders(orders) {
    if (!ordersTable) {
        return;
    }

    ordersTable.innerHTML = "";

    if (orders.length === 0) {
        ordersTable.innerHTML = `
            <tr>
                <td colspan="7" class="empty-message">
                    Aucune commande pour le moment.
                </td>
            </tr>
        `;
        return;
    }

    orders.forEach(order => {
        const row = document.createElement("tr");

        const items = Array.isArray(order.items)
            ? order.items
            : [];

        const artworkNames = items.length
            ? items.map(item => escapeHTML(item.productTitle)).join(", ")
            : "Aucune œuvre";

        const date = order.createdAt
            ? new Date(order.createdAt).toLocaleDateString("fr-FR")
            : "—";

        const statusLabels = {
            pending: "En attente",
            confirmed: "Confirmée",
            shipped: "Expédiée",
            delivered: "Livrée",
            cancelled: "Annulée"
        };

        const status = statusLabels[order.status] || order.status;

        row.innerHTML = `
            <td>#${Number(order.id)}</td>
            <td>${escapeHTML(order.customerName)}</td>
            <td>${artworkNames}</td>
            <td>${Number(order.totalAmount).toFixed(2)} €</td>
            <td>${date}</td>
            <td>
              <span class="status-badge status-${escapeHTML(order.status)}">
                ${escapeHTML(status)}
               </span>
            </td>
            <td>
                <button
                    type="button"
                    class="secondary-button view-order"
                    data-id="${Number(order.id)}"
                >
                    Voir détails
                </button>
            </td>
        `;

        ordersTable.appendChild(row);
    });
}

// Charger les commandes au démarrage
loadOrders();


// ================================
// FERMER LA FENÊTRE DES DÉTAILS
// ================================

const orderDetailsModal =
    document.getElementById("order-details-modal");

const closeOrderDetails =
    document.getElementById("close-order-details");

const orderDetailsOverlay =
    document.getElementById("order-details-overlay");

function closeOrderDetailsModal() {
    if (orderDetailsModal) {
        orderDetailsModal.classList.remove("active");
    }
}

if (closeOrderDetails) {
    closeOrderDetails.addEventListener("click", closeOrderDetailsModal);
}

if (orderDetailsOverlay) {
    orderDetailsOverlay.addEventListener("click", closeOrderDetailsModal);
}


// ================================
// AFFICHER LES DÉTAILS D'UNE COMMANDE
// ================================

document.addEventListener("click", async function (event) {
    const button = event.target.closest(".view-order");

    if (!button) return;

    const orderId = button.dataset.id;
    const modal = document.getElementById("order-details-modal");
    const content = document.getElementById("order-details-content");

    if (!modal || !content) return;

    modal.classList.add("active");
    content.innerHTML = "<p>Chargement des détails...</p>";

    try {
        const response = await fetch(
            `https://imenart.onrender.com/api/admin/orders/${orderId}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const order = await response.json();

        if (!response.ok) {
            throw new Error(
                order.message || "Impossible de charger la commande."
            );
        }

        const items = Array.isArray(order.items) ? order.items : [];

        const artworkList = items.length
            ? items.map(item => `
                <div class="order-detail-item">
                    <strong>${escapeHTML(item.productTitle || "Œuvre")}</strong>
                    <p>Prix : ${Number(item.unitPrice || 0).toFixed(2)} €</p>
                </div>
            `).join("")
            : "<p>Aucune œuvre trouvée.</p>";

        content.innerHTML = `
            <div class="order-detail-info">
                <p><strong>Numéro :</strong> #${Number(order.id)}</p>
                <p><strong>Client :</strong> ${escapeHTML(order.customerName || "—")}</p>
                <p><strong>Téléphone :</strong> ${escapeHTML(order.customerPhone || "—")}</p>
                <p><strong>Adresse :</strong> ${escapeHTML(order.customerAddress || "—")}</p>
                <p><strong>Notes :</strong> ${escapeHTML(order.notes || "Aucune")}</p>
                <p><strong>Statut actuel :</strong> ${escapeHTML(order.status || "—")}</p>
                <p><strong>Date :</strong> ${
                    order.createdAt
                        ? new Date(order.createdAt).toLocaleString("fr-FR")
                        : "—"
                }</p>
            </div>

            <hr>

            <h3>Œuvres commandées</h3>
            ${artworkList}

            <hr>

            <div class="order-status-editor">
                <label for="order-status-select">Modifier le statut</label>

                <select id="order-status-select">
                    <option value="pending" ${order.status === "pending" ? "selected" : ""}>En attente</option>
                    <option value="confirmed" ${order.status === "confirmed" ? "selected" : ""}>Confirmée</option>
                    <option value="shipped" ${order.status === "shipped" ? "selected" : ""}>Expédiée</option>
                    <option value="delivered" ${order.status === "delivered" ? "selected" : ""}>Livrée</option>
                    <option value="cancelled" ${order.status === "cancelled" ? "selected" : ""}>Annulée</option>
                </select>

                <button
                    type="button"
                    class="primary-button"
                    id="save-order-status"
                    data-id="${Number(order.id)}"
                >
                    Enregistrer le statut
                </button>

                <p id="order-status-message"></p>
            </div>

            <hr>

            <h3>Total : ${Number(order.totalAmount || 0).toFixed(2)} €</h3>
        `;
    } catch (error) {
        console.error("Erreur détails commande :", error);
        content.innerHTML = `
            <p>Impossible de charger les détails de cette commande.</p>
        `;
    }
});


// ================================
// ENREGISTRER LE NOUVEAU STATUT
// ================================

document.addEventListener("click", async function (event) {
    const button = event.target.closest("#save-order-status");

    if (!button) return;

    const orderId = button.dataset.id;
    const select = document.getElementById("order-status-select");
    const message = document.getElementById("order-status-message");

    if (!select || !message) return;

    const newStatus = select.value;

    button.disabled = true;
    button.textContent = "Enregistrement...";
    message.textContent = "";

    try {
        const response = await fetch(
            `https://imenart.onrender.com/api/admin/orders/${orderId}/status`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: newStatus
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Impossible de modifier le statut."
            );
        }

        message.textContent = "Le statut a été modifié avec succès.";
        message.style.color = "green";

        button.textContent = "Statut enregistré";

        // Actualiser le tableau des commandes
        await loadOrders();

    } catch (error) {
        console.error("Erreur modification du statut :", error);

        message.textContent = error.message || "Une erreur est survenue.";
        message.style.color = "red";

        button.disabled = false;
        button.textContent = "Réessayer";
    }
});


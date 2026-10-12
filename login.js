const loginForm = document.getElementById("login-form");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("https://imenart.onrender.com/api/admin/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message;
            return;
        }

        // Sauvegarder le token
        localStorage.setItem("token", data.token);

        // Sauvegarder les informations de l'admin
        localStorage.setItem("admin", JSON.stringify(data.admin));

        // Aller vers le Dashboard
        window.location.href = "dashboard.html";

    } catch (error) {
        console.error(error);

        message.textContent =
            "Impossible de contacter le serveur.";
    }
});
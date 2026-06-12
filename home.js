document.addEventListener("DOMContentLoaded", () => {
    const welcomeMessage = document.getElementById("welcome-message");
    const adminBadge = document.getElementById("admin-badge");
    const logoutBtn = document.getElementById("logout-btn");

    // Ochrona dostępu: sprawdzenie czy sesja istnieje
    const savedUser = localStorage.getItem("wedding_guest");
    if (!savedUser) {
        // Brak danych logowania -> natychmiastowe przekierowanie na index.html
        window.location.href = "index.html";
        return;
    }

    const user = JSON.parse(savedUser);

    // Wyświetlenie spersonalizowanego powitania
    if (welcomeMessage) {
        welcomeMessage.textContent = `Witaj ${user.name} ${user.surname}!`;
    }

    // Wyświetlenie plakietki administratora
    if (adminBadge) {
        if (user.admin) {
            adminBadge.classList.remove("hidden");
        } else {
            adminBadge.classList.add("hidden");
        }
    }

    // Obsługa wylogowania
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("wedding_guest");
            window.location.href = "index.html";
        });
    }
});

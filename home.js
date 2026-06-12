document.addEventListener("DOMContentLoaded", () => {
    const welcomeMessage = document.getElementById("welcome-message");
    const adminBadge = document.getElementById("admin-badge");
    const logoutBtn = document.getElementById("logout-btn");

    const savedUser = localStorage.getItem("wedding_guest");
    if (!savedUser) {
        window.location.href = "index.html";
        return;
    }

    const user = JSON.parse(savedUser);

    if (welcomeMessage) {
        welcomeMessage.textContent = `Witaj ${user.name}!`;
    }

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

    // 2. FUNKCJONALNY LICZNIK ODLICZAJĄCY
    // Ustawienie daty ślubu: 14 sierpnia 2027, 16:00:00
    const weddingDate = new Date("August 14, 2027 16:00:00").getTime();

    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");

    function updateCountdown() {
        const now = new Date().getTime();
        const timeLeft = weddingDate - now;

        if (timeLeft < 0) {
            if (daysEl) daysEl.textContent = "00";
            if (hoursEl) hoursEl.textContent = "00";
            if (minutesEl) minutesEl.textContent = "00";
            if (secondsEl) secondsEl.textContent = "00";
            return;
        }

        // Kalkulacja czasu
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
            (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

        // Wyświetlenie z dodaniem zera na początku dla liczb jednocyfrowych
        if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
        if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
        if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, "0");
        if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, "0");
    }

    // Aktualizacja co 1 sekundę
    setInterval(updateCountdown, 1000);
    updateCountdown(); // Wywołanie natychmiastowe na starcie
});

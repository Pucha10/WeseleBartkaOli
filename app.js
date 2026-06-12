document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");
    const loginError = document.getElementById("login-error");

    const savedUser = localStorage.getItem("wedding_guest");
    if (savedUser) {
        window.location.href = "home.html";
        return;
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            loginError.textContent = "";

            const name = document.getElementById("firstname").value.trim();
            const surname = document.getElementById("lastname").value.trim();
            const pin = document.getElementById("pin").value.trim();

            try {
                const guest = await findGuest(name, surname);

                if (!guest) {
                    loginError.textContent =
                        "Nie znaleziono takiego gościa. Sprawdź pisownię.";
                    return;
                }

                const pinRecord = await getGuestPin(guest.id);

                if (pinRecord && pinRecord.pin === pin) {
                    localStorage.setItem(
                        "wedding_guest",
                        JSON.stringify(guest),
                    );
                    window.location.href = "home.html";
                } else {
                    loginError.textContent =
                        "Niepoprawny PIN. Spróbuj ponownie.";
                }
            } catch (error) {
                console.error("Błąd podczas logowania:", error);
                loginError.textContent = "Wystąpił błąd połączenia z serwerem.";
            }
        });
    }
});

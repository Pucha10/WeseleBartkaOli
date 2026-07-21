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
            const inputPin = document.getElementById("pin").value.trim();

            try {
                const guest = await findGuest(name, surname);

                if (!guest) {
                    loginError.textContent =
                        "Nie znaleziono takiego gościa. Sprawdź pisownię.";
                    return;
                }

                if (guest.pin && guest.pin === inputPin) {
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
                console.error("Błąd logowania:", error);
                loginError.textContent = "Wystąpił błąd połączenia z serwerem.";
            }
        });
    }
});

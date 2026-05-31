document.addEventListener("DOMContentLoaded", () => {
    const loginContainer = document.getElementById("login-container");
    const mainContainer = document.getElementById("main-container");
    const loginForm = document.getElementById("login-form");
    const loginError = document.getElementById("login-error");
    const welcomeMessage = document.getElementById("welcome-message");
    const adminBadge = document.getElementById("admin-badge");
    const logoutBtn = document.getElementById("logout-btn");

    const savedUser = localStorage.getItem("wedding_guest");
    if (savedUser) {
        showMainPage(JSON.parse(savedUser));
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            loginError.textContent = "";

            const name = document.getElementById("firstname").value.trim();
            const surname = document.getElementById("lastname").value.trim();
            const pin = document.getElementById("pin").value.trim();

            const guest = await findGuest(name, surname);

            if (!guest) {
                loginError.textContent =
                    "Nie znaleziono takiego gościa. Sprawdź pisownię.";
                return;
            }

            const pinRecord = await getGuestPin(guest.id);

            if (pinRecord && pinRecord.pin === pin) {
                localStorage.setItem("wedding_guest", JSON.stringify(guest));
                showMainPage(guest);
            } else {
                loginError.textContent = "Niepoprawny PIN. Spróbuj ponownie.";
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("wedding_guest");
            document.body.style.alignItems = "center";
            mainContainer.classList.add("hidden");
            loginContainer.classList.remove("hidden");
            if (loginForm) loginForm.reset();
        });
    }

    function showMainPage(user) {
        if (loginContainer && mainContainer) {
            loginContainer.classList.add("hidden");
            mainContainer.classList.remove("hidden");
            document.body.style.alignItems = "stretch";

            if (welcomeMessage) {
                welcomeMessage.textContent = `Witaj ${user.name} ${user.surname}!`;
            }

            if (adminBadge) {
                if (user.admin) {
                    adminBadge.classList.remove("hidden");
                } else {
                    adminBadge.classList.add("hidden");
                }
            }
        }
    }
});

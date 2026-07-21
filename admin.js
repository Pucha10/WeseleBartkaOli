document.addEventListener("DOMContentLoaded", async () => {
    const savedUser = localStorage.getItem("wedding_guest");
    if (!savedUser) {
        window.location.href = "index.html";
        return;
    }

    const user = JSON.parse(savedUser);
    if (!user.admin) {
        window.location.href = "home.html";
        return;
    }

    const guests = await getAllGuests();

    const statFilled = document.getElementById("stat-filled");
    const statPending = document.getElementById("stat-pending");
    const statBoth = document.getElementById("stat-both");
    const statChurch = document.getElementById("stat-church");
    const statNone = document.getElementById("stat-none");
    const statAccPeople = document.getElementById("stat-acc-people");
    const statAccommodation = document.getElementById("stat-accommodation");
    const statConfirmedTotal = document.getElementById("stat-confirmed-total");

    if (guests.length === 0) {
        if (statFilled) statFilled.textContent = "Błąd";
        return;
    }

    let filledCount = 0;
    let pendingCount = 0;
    let bothCount = 0;
    let churchOnlyCount = 0;
    let noneCount = 0;

    let confirmedGuests = 0;
    let confirmedAdditional = 0;

    let accPeopleCount = 0;
    const accommodationFamilies = new Set();

    guests.forEach((g) => {
        if (g.churchPresent === null && g.weddingPresent === null) {
            pendingCount++;
        } else {
            filledCount++;

            if (g.churchPresent === true && g.weddingPresent === true) {
                bothCount++;
            } else if (g.churchPresent === true && g.weddingPresent === false) {
                churchOnlyCount++;
            } else if (
                g.churchPresent === false &&
                g.weddingPresent === false
            ) {
                noneCount++;
            }
        }

        if (g.weddingPresent === true) {
            confirmedGuests++;
        }

        if (g.additionalPersonPresent === true) {
            confirmedAdditional++;
        }

        if (g.needAccommodation === true) {
            accPeopleCount++;

            if (g.additionalPersonPresent === true) {
                accPeopleCount++;
            }

            if (g.pin) {
                accommodationFamilies.add(g.pin);
            }
        }
    });

    const totalConfirmedOnWedding = confirmedGuests + confirmedAdditional;
    const totalRoomsNeeded = accommodationFamilies.size;

    if (statFilled) statFilled.textContent = filledCount;
    if (statPending) statPending.textContent = pendingCount;
    if (statBoth) statBoth.textContent = bothCount;
    if (statChurch) statChurch.textContent = churchOnlyCount;
    if (statNone) statNone.textContent = noneCount;
    if (statAccPeople) statAccPeople.textContent = accPeopleCount;
    if (statAccommodation) statAccommodation.textContent = totalRoomsNeeded;
    if (statConfirmedTotal)
        statConfirmedTotal.textContent = totalConfirmedOnWedding;

    const exactDataBtn = document.getElementById("exact-data-btn");
    if (exactDataBtn) {
        exactDataBtn.addEventListener("click", () => {
            alert(
                "Tu będziesz miała dokładnie kto co zaznaczył i będziesz też mogła za kogos zmienić. Ale to next time",
            );
        });
    }
});

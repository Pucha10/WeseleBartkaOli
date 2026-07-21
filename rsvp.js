document.addEventListener("DOMContentLoaded", async () => {
    const familyList = document.getElementById("family-members-list");
    const rsvpForm = document.getElementById("rsvp-form");
    const rsvpStatus = document.getElementById("rsvp-status");

    const savedUser = localStorage.getItem("wedding_guest");
    if (!savedUser) {
        window.location.href = "index.html";
        return;
    }

    const localUser = JSON.parse(savedUser);

    const familyMembers = await getFamilyGuests(localUser.pin);

    if (familyMembers.length === 0) {
        if (familyList)
            familyList.innerHTML =
                "<p class='rsvp-status-message'>Nie udało się wczytać listy gości.</p>";
        return;
    }

    if (familyList) familyList.innerHTML = "";

    familyMembers.forEach((member, index) => {
        const totalMembers = familyMembers.length;

        let selectedValue = "";
        if (member.churchPresent === true && member.weddingPresent === true) {
            selectedValue = "both";
        } else if (
            member.churchPresent === true &&
            member.weddingPresent === false
        ) {
            selectedValue = "church";
        } else if (
            member.churchPresent === false &&
            member.weddingPresent === false
        ) {
            selectedValue = "none";
        }

        const isAccommodationVisible = selectedValue === "both" ? "" : "hidden";

        const card = document.createElement("div");
        card.className = "rsvp-card";
        card.dataset.id = member.id;

        let cardHTML = `
            <div class="rsvp-card-header">
                <span class="rsvp-card-index">Osoba ${index + 1} z ${totalMembers}</span>
            </div>
            <h3 class="rsvp-card-name">${member.name} ${member.surname}</h3>
            <label class="rsvp-option">
                <input type="radio" name="presence-${member.id}" value="both" ${selectedValue === "both" ? "checked" : ""}>
                <span class="custom-radio"></span>
                <span class="option-label">Będę na ślubie i weselu</span>
            </label>
            <label class="rsvp-option">
                <input type="radio" name="presence-${member.id}" value="church" ${selectedValue === "church" ? "checked" : ""} required>
                <span class="custom-radio"></span>
                <span class="option-label">Będę na ślubie</span>
            </label>
            <label class="rsvp-option">
                <input type="radio" name="presence-${member.id}" value="none" ${selectedValue === "none" ? "checked" : ""}>
                <span class="custom-radio"></span>
                <span class="option-label">Nie będę</span>
            </label>

            <!-- Sekcja noclegu (pokazywana warunkowo) -->
            <div class="accommodation-box ${isAccommodationVisible}" id="accommodation-container-${member.id}">
                <label class="rsvp-option checkbox-option">
                    <input type="checkbox" name="accommodation-${member.id}" ${member.needAccommodation ? "checked" : ""}>
                    <span class="custom-checkbox"></span>
                    <span class="option-label">Potrzebuję noclegu</span>
                </label>
            </div>
        `;

        if (member.additionalPerson) {
            const isChecked = member.additionalPersonPresent ? "checked" : "";
            cardHTML += `
                <div class="additional-person-box">
                    <label class="rsvp-option checkbox-option">
                        <input type="checkbox" name="additional-${member.id}" ${isChecked}>
                        <span class="custom-checkbox"></span>
                        <span class="option-label">Przybędę z osobą towarzyszącą</span>
                    </label>
                </div>
            `;
        }

        card.innerHTML = cardHTML;
        if (familyList) familyList.appendChild(card);

        card.querySelectorAll(`input[name="presence-${member.id}"]`).forEach(
            (radio) => {
                radio.addEventListener("change", (e) => {
                    const accContainer = card.querySelector(
                        `#accommodation-container-${member.id}`,
                    );
                    const accCheckbox = card.querySelector(
                        `input[name="accommodation-${member.id}"]`,
                    );

                    if (e.target.value === "both") {
                        if (accContainer)
                            accContainer.classList.remove("hidden");
                    } else {
                        if (accContainer) accContainer.classList.add("hidden");
                        if (accCheckbox) accCheckbox.checked = false; // Odznaczamy przy ukryciu
                    }
                });
            },
        );
    });

    if (rsvpForm) {
        rsvpForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            rsvpStatus.textContent = "Zapisywanie...";
            rsvpStatus.className = "rsvp-status-message";

            const cards = familyList.querySelectorAll(".rsvp-card");
            let allSavedSuccessfully = true;

            for (let card of cards) {
                const guestId = card.dataset.id;

                const selectedRadio = card.querySelector(
                    `input[name="presence-${guestId}"]:checked`,
                );
                const presenceValue = selectedRadio ? selectedRadio.value : "";

                let churchPresent = null;
                let weddingPresent = null;

                if (presenceValue === "church") {
                    churchPresent = true;
                    weddingPresent = false;
                } else if (presenceValue === "both") {
                    churchPresent = true;
                    weddingPresent = true;
                } else if (presenceValue === "none") {
                    churchPresent = false;
                    weddingPresent = false;
                }

                const additionalCheckbox = card.querySelector(
                    `input[name="additional-${guestId}"]`,
                );
                const additionalPersonPresent = additionalCheckbox
                    ? additionalCheckbox.checked
                    : null;

                const accCheckbox = card.querySelector(
                    `input[name="accommodation-${guestId}"]`,
                );
                const needAccommodation =
                    presenceValue === "both" && accCheckbox
                        ? accCheckbox.checked
                        : null;

                const success = await updateSingleGuestRSVP(
                    guestId,
                    churchPresent,
                    weddingPresent,
                    additionalPersonPresent,
                    needAccommodation,
                );
                if (!success) {
                    allSavedSuccessfully = false;
                }
            }

            if (allSavedSuccessfully) {
                rsvpStatus.textContent =
                    "Wszystkie odpowiedzi zostały zapisane pomyślnie!";
                rsvpStatus.classList.add("success");
            } else {
                rsvpStatus.textContent =
                    "Niektóre odpowiedzi nie mogły zostać zapisane. Spróbuj ponownie.";
                rsvpStatus.classList.add("error");
            }
        });
    }
});

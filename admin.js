document.addEventListener('DOMContentLoaded', async () => {
    // 1. Ochrona dostępu: sprawdzenie uprawnień administratora
    const savedUser = localStorage.getItem('wedding_guest');
    if (!savedUser) {
        window.location.href = 'index.html';
        return;
    }

    const user = JSON.parse(savedUser);
    if (!user.admin) {
        window.location.href = 'home.html';
        return;
    }

    // Elementy HTML
    const adminViewTitle = document.getElementById('admin-view-title');
    const statsView = document.getElementById('stats-view');
    const guestsListView = document.getElementById('guests-list-view');
    const guestsCardsContainer = document.getElementById('guests-cards-container');
    const exactDataBtn = document.getElementById('exact-data-btn');
    const adminSearchInput = document.getElementById('admin-search-input');
    const statFilled = document.getElementById('stat-filled');
    const statPending = document.getElementById('stat-pending');
    const statBoth = document.getElementById('stat-both');
    const statChurch = document.getElementById('stat-church');
    const statNone = document.getElementById('stat-none');
    const statAccPeople = document.getElementById('stat-acc-people');
    const statAccommodation = document.getElementById('stat-accommodation');
    const statConfirmedTotal = document.getElementById('stat-confirmed-total');

    // Cache dla gości
    let cachedGuests = [];
    let isShowingList = false;

    // Pobranie danych na start
    await loadAndDisplayData();

    async function loadAndDisplayData() {
        cachedGuests = await getAllGuests();

        if (cachedGuests.length === 0) {
            if (statFilled) statFilled.textContent = "Błąd";
            return;
        }

        calculateAndSetStats(cachedGuests);
    }

    // Funkcja przeliczająca statystyki
    function calculateAndSetStats(guestsList) {
        let filledCount = 0;   
        let pendingCount = 0;  
        let bothCount = 0;     
        let churchOnlyCount = 0; 
        let noneCount = 0;     
        let confirmedGuests = 0;     
        let confirmedAdditional = 0; 
        let accPeopleCount = 0; 
        const accommodationFamilies = new Set();

        guestsList.forEach(g => {
            if (g.churchPresent === null && g.weddingPresent === null) {
                pendingCount++;
            } else {
                filledCount++;

                if (g.churchPresent === true && g.weddingPresent === true) {
                    bothCount++;
                } else if (g.churchPresent === true && g.weddingPresent === false) {
                    churchOnlyCount++;
                } else if (g.churchPresent === false && g.weddingPresent === false) {
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
        if (statConfirmedTotal) statConfirmedTotal.textContent = totalConfirmedOnWedding;
    }

    // Inteligentny algorytm grupowania gości po PIN (gospodarstwach) i sortowania ich alfabetycznie
    function groupAndSortGuestsByFamily(guestsList) {
        const groups = {};

        // 1. Grupowanie gości po ich unikalnym PIN-ie
        guestsList.forEach(g => {
            const key = g.pin ? g.pin : `no-pin-${g.id}`;
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(g);
        });

        // 2. Sortowanie wewnętrzne każdej rodziny alfabetycznie po nazwisku, by lider zaproszenia był na początku
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => a.surname.localeCompare(b.surname, 'pl'));
        });

        // 3. Sortowanie całych grup alfabetycznie na podstawie nazwiska reprezentanta grupy (pierwszej osoby)
        const sortedGroupsArray = Object.values(groups).sort((groupA, groupB) => {
            const repA = groupA[0];
            const repB = groupB[0];
            return repA.surname.localeCompare(repB.surname, 'pl');
        });

        // 4. Spłaszczenie tablicy z powrotem do jednej, ustrukturyzowanej listy gości
        const finalSortedGuests = [];
        sortedGroupsArray.forEach(group => {
            group.forEach(g => {
                finalSortedGuests.push(g);
            });
        });

        return finalSortedGuests;
    }

    if (exactDataBtn) {
        exactDataBtn.addEventListener('click', () => {
            if (!isShowingList) {
                statsView.classList.add('hidden');
                guestsListView.classList.remove('hidden');
                exactDataBtn.textContent = "Pokaż statystyki";
                if (adminViewTitle) adminViewTitle.textContent = "Lista gości";
                
                if (adminSearchInput) adminSearchInput.value = "";
                
                const processedGuests = groupAndSortGuestsByFamily(cachedGuests);
                renderGuestsList(processedGuests);
                isShowingList = true;
            } else {
                guestsListView.classList.add('hidden');
                statsView.classList.remove('hidden');
                exactDataBtn.textContent = "Dokładne dane";
                if (adminViewTitle) adminViewTitle.textContent = "Statystyki";
                calculateAndSetStats(cachedGuests);
                isShowingList = false;
            }
        });
    }

    if (adminSearchInput) {
        adminSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const filteredGuests = cachedGuests.filter(g => {
                const nameMatch = g.name && g.name.toLowerCase().includes(query);
                const surnameMatch = g.surname && g.surname.toLowerCase().includes(query);
                const pinMatch = g.pin && g.pin.includes(query);
                
                return nameMatch || surnameMatch || pinMatch;
            });

            const processedGuests = groupAndSortGuestsByFamily(filteredGuests);
            renderGuestsList(processedGuests);
        });
    }
    function renderGuestsList(guestsList) {
        if (!guestsCardsContainer) return;
        guestsCardsContainer.innerHTML = "";

        guestsList.forEach(g => {
            const card = document.createElement('div');
            card.className = 'guest-admin-card';
            card.dataset.id = g.id;

            card.innerHTML = `
                <div class="guest-admin-name">
                    ${g.name} ${g.surname}
                    <!-- Wizualny znacznik wspólnego kodu PIN -->
                    <span class="guest-admin-pin-badge">PIN: ${g.pin || 'brak'}</span>
                </div>
                <div class="guest-admin-options">
                    <label class="admin-check-label">
                        <input type="checkbox" class="admin-check-church" ${g.churchPresent ? 'checked' : ''}>
                        <span class="admin-custom-check"></span>
                        <span class="admin-label-text">Ślub</span>
                    </label>
                    <label class="admin-check-label">
                        <input type="checkbox" class="admin-check-wedding" ${g.weddingPresent ? 'checked' : ''}>
                        <span class="admin-custom-check"></span>
                        <span class="admin-label-text">Wesele</span>
                    </label>
                    <label class="admin-check-label">
                        <input type="checkbox" class="admin-check-accommodation" ${g.needAccommodation ? 'checked' : ''}>
                        <span class="admin-custom-check"></span>
                        <span class="admin-label-text">Nocleg</span>
                    </label>
                    
                    ${g.additionalPerson ? `
                    <label class="admin-check-label">
                        <input type="checkbox" class="admin-check-additional" ${g.additionalPersonPresent ? 'checked' : ''}>
                        <span class="admin-custom-check"></span>
                        <span class="admin-label-text">Osob. tow.</span>
                    </label>
                    ` : ''}
                </div>
                <div class="guest-admin-actions">
                    <button class="admin-save-guest-btn">Zapisz</button>
                    <span class="save-status"></span>
                </div>
            `;

            const saveBtn = card.querySelector('.admin-save-guest-btn');
            saveBtn.addEventListener('click', async () => {
                const id = g.id;
                const churchPresent = card.querySelector('.admin-check-church').checked;
                const weddingPresent = card.querySelector('.admin-check-wedding').checked;
                const needAccommodation = card.querySelector('.admin-check-accommodation').checked;
                
                const addCheck = card.querySelector('.admin-check-additional');
                const additionalPersonPresent = addCheck ? addCheck.checked : null;

                saveBtn.disabled = true;
                saveBtn.textContent = "Zapisywanie...";
                const statusSpan = card.querySelector('.save-status');
                statusSpan.textContent = "";

                const success = await updateSingleGuestRSVP(id, churchPresent, weddingPresent, additionalPersonPresent, needAccommodation);

                if (success) {
                    saveBtn.textContent = "Zapisano";
                    saveBtn.style.backgroundColor = "var(--sage-green)"; 
                    saveBtn.style.borderColor = "var(--sage-green)";
                    statusSpan.textContent = "✓";
                    statusSpan.style.color = "green";

                    const cachedGuest = cachedGuests.find(item => item.id == id);
                    if (cachedGuest) {
                        cachedGuest.churchPresent = churchPresent;
                        cachedGuest.weddingPresent = weddingPresent;
                        cachedGuest.needAccommodation = needAccommodation;
                        if (additionalPersonPresent !== null) {
                            cachedGuest.additionalPersonPresent = additionalPersonPresent;
                        }
                    }

                    setTimeout(() => {
                        saveBtn.disabled = false;
                        saveBtn.textContent = "Zapisz";
                        saveBtn.style.backgroundColor = "var(--accent-blue)";
                        saveBtn.style.borderColor = "#121212";
                        statusSpan.textContent = "";
                    }, 1500);
                } else {
                    saveBtn.disabled = false;
                    saveBtn.textContent = "Zapisz";
                    statusSpan.textContent = "Błąd";
                    statusSpan.style.color = "red";
                }
            });

            guestsCardsContainer.appendChild(card);
        });
    }
});
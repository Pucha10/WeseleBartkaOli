const SUPABASE_URL = "https://oiuambhnhljipethwxca.supabase.co";
const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pdWFtYmhuaGxqaXBldGh3eGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyMzM3OTksImV4cCI6MjA5NTgwOTc5OX0.i-LKTf_TPopA5MEK7MqMLqZwijhYwdEx_R9FLOJIyVo";

async function findGuest(name, surname) {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/guest?name=ilike.${encodeURIComponent(name)}&surname=ilike.${encodeURIComponent(surname)}`,
            {
                method: "GET",
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok)
            throw new Error(`Błąd wyszukiwania: ${response.statusText}`);

        const data = await response.json();
        return data[0] || null;
    } catch (error) {
        console.error("Błąd podczas wyszukiwania gościa:", error);
        return null;
    }
}

async function getFamilyGuests(pin) {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/guest?pin=eq.${encodeURIComponent(pin)}&order=id.asc`,
            {
                method: "GET",
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok)
            throw new Error(`Błąd pobierania rodziny: ${response.statusText}`);

        return await response.json();
    } catch (error) {
        console.error("Błąd podczas pobierania członków rodziny:", error);
        return [];
    }
}

async function updateSingleGuestRSVP(
    guestId,
    churchPresent,
    weddingPresent,
    additionalPersonPresent = null,
    needAccommodation = null,
) {
    try {
        const payload = {
            churchPresent: churchPresent,
            weddingPresent: weddingPresent,
        };

        if (additionalPersonPresent !== null) {
            payload.additionalPersonPresent = additionalPersonPresent;
        }

        if (needAccommodation !== null) {
            payload.needAccommodation = needAccommodation;
        } else {
            payload.needAccommodation = null;
        }

        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/guest?id=eq.${guestId}`,
            {
                method: "PATCH",
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            },
        );

        return response.ok;
    } catch (error) {
        console.error(`Błąd zapisu gościa o ID ${guestId}:`, error);
        return false;
    }
}

async function getAllGuests() {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/guest?order=surname.asc,name.asc`,
            {
                method: "GET",
                headers: {
                    apikey: SUPABASE_KEY,
                    Authorization: `Bearer ${SUPABASE_KEY}`,
                    "Content-Type": "application/json",
                },
            },
        );

        if (!response.ok)
            throw new Error(
                `Błąd pobierania listy gości: ${response.statusText}`,
            );

        return await response.json();
    } catch (error) {
        console.error("Błąd pobierania listy gości:", error);
        return [];
    }
}

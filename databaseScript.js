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

async function getGuestPin(guestId) {
    try {
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/pin_plain_text?id=eq.${guestId}`,
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
            throw new Error(`Błąd pobierania PIN-u: ${response.statusText}`);

        const data = await response.json();
        return data[0] || null;
    } catch (error) {
        console.error("Błąd podczas pobierania PIN-u:", error);
        return null;
    }
}

async function uploadWeddingPhoto(fileInput) {
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            const uploadResponse = await fetch(
                `${SUPABASE_URL}/storage/v1/object/WeddingIMG/${filePath}`,
                {
                    method: "POST",
                    headers: {
                        apikey: SUPABASE_KEY,
                        Authorization: `Bearer ${SUPABASE_KEY}`,
                        "Content-Type": file.type,
                    },
                    body: file,
                },
            );

            if (uploadResponse.ok) {
                const uploadedImageUrl = `${SUPABASE_URL}/storage/v1/object/public/WeddingIMG/${filePath}`;
                return uploadedImageUrl;
            } else {
                console.error("Błąd wgrywania zdjęcia do serwera");
                return null;
            }
        } catch (err) {
            console.error("Błąd Storage:", err);
            return null;
        }
    }
    return null;
}

// buat tejan masukin script ini pakai atribut defer. Pastiin juga dia bikin elemen teks dengan `id="welcomeMsg"` dan tombol dengan `id="logoutBtn"` biar logic JS ini bisa nyambung.

document.addEventListener("DOMContentLoaded", () => {
    // 1. Ambil data nama dari Local Storage
    const firstName = localStorage.getItem('firstName');
    
    // 2. Auth Guard: Kalau nggak ada data sesi, tendang balik ke login.html[cite: 1]
    if (!firstName) {
        window.location.replace('login.html');
        return; 
    }
    
    // 3. Navigation Bar: Nampilin ucapan selamat datang[cite: 1]
    const welcomeElement = document.getElementById('welcomeMsg');
    if (welcomeElement) {
        welcomeElement.textContent = `Welcome, ${firstName}!`;
    }
    
    if (!localStorage.getItem('firstName')) {
        window.location.replace('login.html');
    }

    // Jaga-jaga kalau halaman ini muncul lagi dari bfcache (back/forward)
    window.addEventListener('pageshow', () => {
        if (!localStorage.getItem('firstName')) {
            window.location.replace('login.html');
        }
    });

    // 4. Logout: Hapus sesi dari Local Storage dan balik ke login[cite: 1]
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('firstName');
            window.location.replace('login.html');
        });
    }
});
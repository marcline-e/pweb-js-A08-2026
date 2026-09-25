window.addEventListener('pageshow', (event) => {
    // Mengecek apakah data sesi masih nyangkut di Local Storage
    if (localStorage.getItem('firstName')) {
        window.location.replace('index.html');
    }
});

if (localStorage.getItem('firstName')) {
    window.location.replace('index.html');
}

const loginForm = document.getElementById('loginForm');
const loginBtn = document.getElementById('loginBtn');
const errorMsg = document.getElementById('errorMsg');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Mencegah reload halaman
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // 1. Loading State: Menampilkan indikator saat proses verifikasi[cite: 1]
    loginBtn.textContent = 'Memverifikasi...';
    loginBtn.disabled = true;
    errorMsg.textContent = ''; 

    try {
        const response = await fetch('https://dummyjson.com/users');
        if (!response.ok) throw new Error('Koneksi API gagal');
        
        const data = await response.json();
        const users = data.users;
        
        // Mencari user yang cocok
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // 2. Session Persistence: Simpan firstName ke Local Storage[cite: 1]
            localStorage.setItem('firstName', user.firstName);
            
            // 3. Auto Redirect: Arahkan ke halaman katalog (index.html)[cite: 1]
            window.location.replace('index.html');
        } else {
            // 4. Error Handling: Pesan informatif jika username/password salah[cite: 1]
            errorMsg.textContent = 'Username atau password salah, bro!';
        }
    } catch (error) {
        // 4. Error Handling: Pesan error jika koneksi API bermasalah[cite: 1]
        errorMsg.textContent = 'Waduh, koneksi API bermasalah nih. Coba lagi nanti.';
        console.error('Error fetching users:', error);
    } finally {
        // Mengembalikan state tombol seperti semula
        loginBtn.textContent = 'Masuk';
        loginBtn.disabled = false;
    }
});
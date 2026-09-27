window.addEventListener('pageshow', () => {
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
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    loginBtn.textContent = 'Memverifikasi...';
    loginBtn.disabled = true;
    errorMsg.textContent = ''; 

    try {
        const response = await fetch('https://dummyjson.com/users');
        if (!response.ok) throw new Error('Koneksi API gagal');
        
        const data = await response.json();
        const users = data.users;
        
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            localStorage.setItem('firstName', user.firstName);
            window.location.replace('index.html');
        } else {
            errorMsg.textContent = 'Username atau password salah, bro!';
        }
    } catch (error) {
        errorMsg.textContent = 'Waduh, koneksi API bermasalah nih. Coba lagi nanti.';
        console.error('Error fetching users:', error);
    } finally {
        loginBtn.textContent = 'Masuk';
        loginBtn.disabled = false;
    }
});
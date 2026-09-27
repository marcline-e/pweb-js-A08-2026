document.addEventListener("DOMContentLoaded", () => {
    const firstName = localStorage.getItem('firstName');
    
    if (!firstName) {
        window.location.replace('login.html');
        return; 
    }
    
    const welcomeElement = document.getElementById('welcomeMsg');
    if (welcomeElement) {
        welcomeElement.textContent = `Welcome, ${firstName}!`;
    }

    window.addEventListener('pageshow', () => {
        if (!localStorage.getItem('firstName')) {
            window.location.replace('login.html');
        }
    });

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('firstName');
            window.location.replace('login.html');
        });
    }
});
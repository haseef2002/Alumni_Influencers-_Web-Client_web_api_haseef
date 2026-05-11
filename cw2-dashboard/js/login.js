document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const alertBox = document.getElementById('alertBox');

    // Toggle logic
    document.getElementById('showRegisterBtn').addEventListener('click', () => {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        hideAlert();
    });

    document.getElementById('showLoginBtn').addEventListener('click', () => {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        hideAlert();
    });

    function showAlert(message, type = 'error') {
        alertBox.textContent = message;
        alertBox.className = `alert ${type}`;
        alertBox.style.display = 'block';
    }

    function hideAlert() {
        alertBox.style.display = 'none';
    }

    // --- REGISTRATION LOGIC ---
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const btn = document.getElementById('regBtn');

        btn.textContent = 'Registering...';
        btn.disabled = true;

        try {
            const res = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                showAlert(data.message, 'success');
                // Switch back to login view after success
                setTimeout(() => {
                    registerForm.classList.add('hidden');
                    loginForm.classList.remove('hidden');
                    document.getElementById('loginEmail').value = email;
                    hideAlert();
                }, 2000);
            } else {
                showAlert(data.error || "Registration failed");
            }
        } catch (error) {
            showAlert("Server connection failed.");
        } finally {
            btn.textContent = 'Create Account';
            btn.disabled = false;
        }
    });

    // --- LOGIN LOGIC ---
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const clientPlatform = document.getElementById('clientPlatform').value;
        const btn = document.getElementById('loginBtn');

        btn.textContent = 'Authenticating...';
        btn.disabled = true;

        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, clientPlatform })
            });

            const data = await res.json();

            if (res.ok) {
                // Save the token to local storage securely
                localStorage.setItem('token', data.token);
                // Redirect to the dashboard
                window.location.href = 'dashboard.html';
            } else {
                showAlert(data.error || "Login failed");
            }
        } catch (error) {
            showAlert("Server connection failed.");
        } finally {
            btn.textContent = 'Secure Login';
            btn.disabled = false;
        }
    });
});
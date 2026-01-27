const API_URL = '/api';

const authView = document.getElementById('auth-view');
const dashView = document.getElementById('dash-view');
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authMessage = document.getElementById('auth-message');
const userDisplayName = document.getElementById('user-display-name');
const logoutBtn = document.getElementById('logout-btn');

function showForm(type) {
    authMessage.textContent = '';
    if (type === 'login') {
        loginSection.classList.remove('hidden');
        registerSection.classList.add('hidden');
    } else {
        loginSection.classList.add('hidden');
        registerSection.classList.remove('hidden');
    }
}

function updateUI() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (token) {
        authView.classList.add('hidden');
        dashView.classList.remove('hidden');
        userDisplayName.textContent = user.username;
    } else {
        authView.classList.remove('hidden');
        dashView.classList.add('hidden');
    }
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            updateUI();
        } else {
            authMessage.textContent = data.message;
            authMessage.className = 'message error';
        }
    } catch (err) {
        authMessage.textContent = 'Error connecting to server';
    }
});

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (res.ok) {
            authMessage.textContent = 'Registered successfully! Please login.';
            authMessage.className = 'message success';
            showForm('login');
        } else {
            authMessage.textContent = data.message;
            authMessage.className = 'message error';
        }
    } catch (err) {
        authMessage.textContent = 'Error connecting to server';
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.clear();
    updateUI();
});

// Init
updateUI();

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authMessage = document.querySelector('.auth-message');
    const getStartedButton = document.getElementById('get-started-button');
    const loginNav = document.getElementById('login-nav');
    const dashboardNav = document.getElementById('dashboard-nav');
    const logoutNav = document.getElementById('logout-nav');

    // Custom Message Box elements
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const closeMessageBtn = document.getElementById('closeMessage');

    // --- Helper Functions ---
    function showAuthMessage(message, type) {
        if (!authMessage) return;
        authMessage.textContent = message;
        authMessage.className = `auth-message ${type}`;
        authMessage.style.display = 'block';
        setTimeout(() => {
            authMessage.style.display = 'none';
        }, 5000);
    }

    // Function to display custom message box
    function showMessage(message) {
        messageText.textContent = message;
        messageBox.classList.remove('hidden');
    }

    // Function to hide custom message box
    function hideMessage() {
        messageBox.classList.add('hidden');
    }

    // Event listener for closing the custom message box
    if (closeMessageBtn) closeMessageBtn.addEventListener('click', hideMessage);


    function switchAuthTab(activeTab) {
        if (!loginTab || !signupTab || !loginForm || !signupForm) return;
        if (activeTab === 'login') {
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
        } else {
            loginTab.classList.remove('active');
            signupTab.classList.add('active');
            loginForm.classList.remove('active');
            signupForm.classList.add('active');
        }
    }

    function checkAuthAndSetupUI() {
        const token = localStorage.getItem('token');
        if (token) {
            if (loginNav) loginNav.style.display = 'none';
            if (dashboardNav) dashboardNav.style.display = 'block';
            if (logoutNav) logoutNav.style.display = 'block';
        } else {
            if (loginNav) loginNav.style.display = 'block';
            if (dashboardNav) dashboardNav.style.display = 'none';
            if (logoutNav) logoutNav.style.display = 'none';
        }
    }

    // --- Event Listeners ---
    if (loginTab) loginTab.addEventListener('click', () => switchAuthTab('login'));
    if (signupTab) signupTab.addEventListener('click', () => switchAuthTab('signup'));
    if (getStartedButton) getStartedButton.addEventListener('click', () => {
        document.getElementById('auth-card').scrollIntoView({ behavior: 'smooth' });
    });
    if (logoutNav) logoutNav.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('userEmail');
        showMessage("Logged out successfully!"); // Replaced alert
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000); // Give time for message to be seen
    });

    // Sign Up Form Submission
    if (signupForm) signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        showAuthMessage('Attempting to sign up...', 'default');
        try {
            const response = await fetch('https://student-portal-uzd1.onrender.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                showAuthMessage('Account created successfully! Please log in.', 'success');
                switchAuthTab('login');
            } else {
                showAuthMessage(`Registration failed: ${data.msg || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            showAuthMessage('An error occurred. Please try again.', 'error');
        }
    });

    // Login Form Submission
    if (loginForm) loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        showAuthMessage('Attempting to log in...', 'default');
        try {
            const response = await fetch('https://student-portal-uzd1.onrender.com', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userEmail', email);
                localStorage.setItem('isAdmin', data.user.isAdmin ? 'true' : 'false');
                window.location.href = 'dashboard.html';
            } else {
                showAuthMessage(`Login failed: ${data.msg || 'Invalid credentials'}`, 'error');
            }
        } catch (error) {
            console.error('Error during login:', error);
            showAuthMessage('An error occurred. Please try again.', 'error');
        }
    });

    checkAuthAndSetupUI();
});

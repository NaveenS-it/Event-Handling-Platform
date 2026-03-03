document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('loginBtn');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            btn.disabled = true;

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                const res = await API.post('/auth/login', { email, password });
                showToast('Login successful!');
                localStorage.setItem('token', res.token);
                localStorage.setItem('user', JSON.stringify(res.user));

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } catch (err) {
                showToast(err.message, 'error');
                btn.innerHTML = 'Login';
                btn.disabled = false;
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('regBtn');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            btn.disabled = true;

            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;

            try {
                await API.post('/auth/register', { firstName, lastName, email, password, role });
                showToast('Registration successful! Please login.');

                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1500);
            } catch (err) {
                showToast(err.message, 'error');
                btn.innerHTML = 'Create Account';
                btn.disabled = false;
            }
        });
    }
});

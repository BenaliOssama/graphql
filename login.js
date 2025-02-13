export class LogInPage {
    render() {
        return `
            <div class="login-container">
            <h1>School Login</h1>
            <form id="loginForm">
                <input type="text" id="username" placeholder="Username/Email" required>
                <input type="password" id="password" placeholder="Password" required>
                <button type="submit">Login</button>
            </form>
            <div id="errorMessage" class="error"></div>
            </div>
        `;
    }
    mount() {
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const identifier = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('https://learn.zone01oujda.ma/api/auth/signin', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${btoa(`${identifier}:${password}`)}`
                    }
                });

                if (!response.ok) throw new Error('Login failed');

                const jwt = await response.json();
                localStorage.setItem('jwt', jwt);
                window.location.href = '/profile';
            } catch (error) {
                document.getElementById('errorMessage').textContent = 'Invalid credentials';
            }
        });
    }
}
// Login Page Logic
if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
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
            
            const { jwt } = await response.json();
            localStorage.setItem('jwt', jwt);
            window.location.href = 'profile.html';
        } catch (error) {
            document.getElementById('errorMessage').textContent = 'Invalid credentials';
        }
    });
}

// Profile Page Logic
if (window.location.pathname.endsWith('profile.html')) {
    const jwt = localStorage.getItem('jwt');
    
    if (!jwt) window.location.href = '/';
    
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('jwt');
        window.location.href = '/';
    });

    // Fetch user data
    async function fetchGraphQL(query) {
        const response = await fetch('https://learn.zone01oujda.ma/api/graphql-engine/v1/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify({ query })
        });
        return response.json();
    }

    // Example query for user data
    async function loadProfile() {
        const userQuery = `
            query {
                user {
                    login
                    email
                }
            }
        `;
        
        const xpQuery = `
            query {
                transaction(where: { type: { _eq: "xp" } }) {
                    amount
                    createdAt
                    objectId
                }
            }
        `;

        const [userRes, xpRes] = await Promise.all([
            fetchGraphQL(userQuery),
            fetchGraphQL(xpQuery)
        ]);

        displayUserInfo(userRes.data.user[0]);
        processXpData(xpRes.data.transaction);
    }

    function displayUserInfo(user) {
        document.getElementById('basicInfo').innerHTML = `
            <p>Login: ${user.login}</p>
            <p>Email: ${user.email}</p>
        `;
    }

    function processXpData(transactions) {
        const totalXp = transactions.reduce((sum, t) => sum + t.amount, 0);
        document.getElementById('totalXp').textContent = totalXp;
        
        // Process data for graphs
        createXpOverTimeChart(transactions);
        createProjectsXpChart(transactions);
    }

    window.onload = loadProfile;
}

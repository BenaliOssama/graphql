import { queries } from "./queries.js";
import { createProjectsXpChart, createXpOverTimeChart, createSpiderWebSkillsChart } from "./graphs.js";
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

            const jwt = await response.json();
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
        const [userRes, totalXpRes, individualXpRes, currentLevelRes, skillRes, auditRes, lastProjectsRes] = await Promise.all([
            fetchGraphQL(queries.userQuery),
            fetchGraphQL(queries.totalXpQuery),
            fetchGraphQL(queries.individualXpQuery),
            fetchGraphQL(queries.currentLevelQuery),
            fetchGraphQL(queries.skillQuery),
            fetchGraphQL(queries.auditQuery),
            fetchGraphQL(queries.lastProjectsQuery)
        ]);

        displayUserInfo(userRes.data.user[0])
        processXpData(totalXpRes.data)
        createSpiderWebSkillsChart(skillRes.data.transaction);
    }

    function displayUserInfo(user) {
        document.getElementById('basicInfo').innerHTML = `
            <div id="basic info" >
                <p>${user.firstName} ${user.lastName}</p>
                <p>Campus: ${user.campus}</p>
                <p>Email: ${user.attrs.email}</p>
                <p>City: ${user.attrs.city}</p>
            </div>
            <div id="audit_ratio">
                <p>auditRatio ${user.auditRatio}</p>
                <p>totalUp ${user.totalUp}</p>
                <p>totoalDown ${user.totalDown}</p>
            <div>
        `;
    }

    function processXpData(transactions) {
        // Process data for graphs
        createXpOverTimeChart(transactions);
        createProjectsXpChart(transactions);
    }

    window.onload = loadProfile;
}


export class ProfilePage {
    render() {
        return `
            <header>
                <h1>My School Profile</h1>
                <button id="logoutBtn">Logout</button>
            </header>

            <div class="profile-container">
                <section class="user-info">
                    <h2>Basic Information</h2>
                    <div id="basicInfo"></div>
                </section>

                <section class="stats">
                    <div class="stat-box">
                        <h3>Total XP</h3>
                        <p id="totalXp">0</p>
                    </div>
                    <div class="stat-box">
                        <h3>Audit Ratio</h3>
                        <p id="auditRatio">0</p>
                    </div>
                </section>

                <section class="graphs">
                    <div class="graph-container" id="xpOverTime"></div>
                    <div class="graph-container" id="projectsXp"></div>
                    <div id="chart-container"></div>
                </section>
            </div>
        `;
    }

    mount() {
        const jwt = localStorage.getItem('jwt');

        if (!jwt) window.location.href = '/login';

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

            console.log(userRes.data);
            console.log(totalXpRes.data);
            console.log(individualXpRes.data);
            console.log(currentLevelRes);
            console.log(skillRes.data.transaction);
            console.log(auditRes);
            console.log(lastProjectsRes);
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

        //console.log('it is defined', skillRes.data.transaction)
        function processXpData(transactions) {
            // Process data for graphs
            createXpOverTimeChart(transactions);
            createProjectsXpChart(transactions);
        }

        window.onload = loadProfile;
    }

    unmount() {
        // Cleanup when navigating away
        // this.button.removeEventListener('click', this.handleClick);
        // document.body.removeEventListener('click', this.handleNavigation);
    }
}
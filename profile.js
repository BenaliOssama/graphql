import { queries } from "./queries.js"
import { createProjectsXpChart, createSpiderWebSkillsChart, createXpOverTimeChart } from "./graphs.js"


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
                    <div class="stat-box">
                        <h3>Level</h3>
                        <p id="currentLevel">0</p>
                    </div>
                </section>

                <section class="graphs">
                    <div class="spider-web">
                        <h3>Skill Representation</h3>
                        <div id="chart-container"></div>
                    </div>
                    <div class="graph-container" id="xpOverTime">
                        <h3>Total XP</h3>
                    </div>
                    <div class="graph-container" id="projectsXp">
                        <h3>Total XP</h3>
                    </div>
                </section>
            </div>
        `;
    }

    mount() {
        const jwt = localStorage.getItem('jwt');

        if (!jwt) window.location.href = '/login';

        document.getElementById('logoutBtn').addEventListener('click', () => {
            window.location.href = '/logout';
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

            console.log('incividual xp', individualXpRes.data);
            console.log('audit Res', auditRes);
            console.log('last projects', lastProjectsRes);

            Display.displayUserInfo(userRes.data.user[0]);
            Display.displayAuditInfo(userRes.data.user[0]);
            Display.displayTotalXp(totalXpRes.data)
            Display.displayLevel(currentLevelRes.data)

            processXpData(individualXpRes.data.transaction)
            createSpiderWebSkillsChart(skillRes.data.transaction);
        }


        //console.log('it is defined', skillRes.data.transaction)
        function processXpData(transactions) {
            // Process data for graphs
            createXpOverTimeChart(transactions);
            createProjectsXpChart(transactions);
        }

        // window.onload = loadProfile;
        loadProfile();
        console.log('done with logic of routing page')
    }

    unmount() {
        // Cleanup when navigating away
        // this.button.removeEventListener('click', this.handleClick);
        // document.body.removeEventListener('click', this.handleNavigation);
    }
}

class Display {
    static displayUserInfo(user) {
        document.getElementById('basicInfo').innerHTML = `
            <div id="basic info" >
                <p>${user.firstName} ${user.lastName}</p>
                <p>Campus: ${user.campus}</p>
                <p>Email: ${user.attrs.email}</p>
                <p>City: ${user.attrs.city}</p>
            </div>`;
    }
    static displayAuditInfo(user) {
        document.getElementById('auditRatio').innerHTML = `
            <div id="audit_ratio">
                <p>auditRatio ${user.auditRatio}</p>
                <p>totalUp ${user.totalUp}</p>
                <p>totoalDown ${user.totalDown}</p>
            <div>
        `;
    }
    //totalXpRes.data.transaction_aggregate.aggregate.sum.amount
    static displayTotalXp(data) {
        console.log(data.transaction_aggregate.aggregate.sum.amount)
        document.getElementById('totalXp').innerHTML = `${data.transaction_aggregate.aggregate.sum.amount}`

    }
    static displayLevel(data) {
        document.getElementById('currentLevel').innerHTML = `
            <div class="stat level">
                <svg width="150" height="150" viewBox="0 0 150 150">
                    <!-- Background Circle -->
                    <circle cx="75" cy="75" r="60" fill="none" stroke="#ddd" stroke-width="10"/>
                    
                    <!-- Progress Circle -->
                    <circle cx="75" cy="75" r="60" fill="none" stroke="#4caf50" stroke-width="10" stroke-linecap="round"/>
                    
                    <!-- Centered Text -->
                    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="20" fill="#333">
                        ${data.transaction_aggregate.aggregate.max.amount}
                    </text>
                </svg>
            </div>`;
    }
}
import { queries } from "./queries.js"
import {authentication} from "./auth.js"
import { createProjectsXpChart, createSpiderWebSkillsChart, createXpOverTimeChart } from "./graphs.js"


export class ProfilePage {
    render() {
        return `
            <header>
                <h1>My Profile</h1>
                <button id="logoutBtn">Logout</button>
            </header>

            <div class="profile-container">
                <section class="user-info">
                    <div id="basicInfo"></div>
                </section>

                <section class="stats">
                <section class="stats">
                    <div class="stat-box">
                        <h3>Total XP</h3>
                        <p id="totalXp">0</p>
                        <p id="lastProjectDetails"></p>
                    </div>
                    <div class="stat-box-wrapper">
                        <div class="stat-box">
                            <h3>Audit Ratio</h3>
                            <p id="auditRatio">0</p>
                        </div>
                        <div class="stat-box">
                            <h3>Level</h3>
                            <p id="currentLevel">0</p>
                        </div>
                    </div>
                </section>

                <section class="graphs">
                    <div class="graph-container" id="projectsXp">
                        <h3>Total XP</h3>
                    </div>
                    <div class="spider-web">
                        <h3>Skill Representation</h3>
                        <div id="chart-container"></div>
                    </div>
                    <div class="graph-container" id="xpOverTime">
                        <h3>Total XP</h3>
                    </div>
                </section>
            </div>
        `;
    }

    mount() {
        if (!authentication.isAuthenticated()) {
            authentication.redirectToLogin()
            return
        }

        document.getElementById('logoutBtn').addEventListener('click', () => {
            window.location.href = '/logout';
        });

        // Example query for user data
        async function loadProfile() {
            const [userRes, userCohortRes, currentLevelRes, skillRes, auditRes, lastProjectsRes] = await Promise.all([
                fetchGraphQL(queries.userQuery),
                fetchGraphQL(queries.userCohortQuery),
                fetchGraphQL(queries.currentLevelQuery),
                fetchGraphQL(queries.skillQuery),
                fetchGraphQL(queries.auditQuery),
                fetchGraphQL(queries.lastProjectsQuery(3))
            ]);

            // Assuming you have the GraphQL response data in `data`
            const filteredEvents = userCohortRes.data.user[0].events.filter(event =>
                event.event.object.name === "Module" && event.event.object.type === "module"
            );
            const date = new Date(filteredEvents[0].event.startAt);
            const cohortId = filteredEvents[0].event.id;


            // Format as "YYYY-MM-DD"
            const formattedDate = date.toISOString().split('T')[0];

            const [totalXpRes, individualXpRes] = await Promise.all([
                fetchGraphQL(queries.totalXpQuery(cohortId)),
                fetchGraphQL(queries.individualXpQuery(cohortId)),
            ]);

            let cohortInfo = {
                startAt: filteredEvents[0].event.startAt,
                id : cohortId
            }

            Display.displayUserInfo(userRes.data.user[0], formattedDate);
            Display.displayAuditInfo(userRes.data.user[0]);
            Display.displayTotalXp(totalXpRes.data, lastProjectsRes.data)
            Display.displayLevel(currentLevelRes.data)

            processXpData(individualXpRes.data.transaction, cohortInfo)
            createSpiderWebSkillsChart(skillRes.data.transaction);
        }


        function processXpData(transactions, cohortInfo) {
            // Process data for graphs
            createXpOverTimeChart(transactions, cohortInfo);
            createProjectsXpChart(transactions);
        }

        // window.onload = loadProfile;
        loadProfile();
    }

    unmount() {
        // Cleanup when navigating away
        // this.button.removeEventListener('click', this.handleClick);
        // document.body.removeEventListener('click', this.handleNavigation);
    }
}

class Display {
    static displayUserInfo(user, formattedDate) {
        const basicInfoDiv = document.getElementById('basicInfo');

        // Set up the initial display (only showing the name)
        basicInfoDiv.innerHTML = `
        <div id="basic-info">
            <h2 id="userName">${user.firstName} ${user.lastName}</h2>
            <h3> Cohort: ${formattedDate}</h3>
        </div>`;

        // Add event listener to the name to toggle details
        document.getElementById('userName').addEventListener('click', () => {
            let userDetailsDiv = document.getElementById('userDetails');

            if (!userDetailsDiv) {
                // If details are not visible, create them
                userDetailsDiv = document.createElement('div');
                userDetailsDiv.id = 'userDetails';
                userDetailsDiv.innerHTML = `
                <p>Cohort: ${formattedDate}</p>
                <p>Campus: ${user.campus}</p>
                <p>Email: ${user.attrs.email}</p>
                <p>City: ${user.attrs.city}</p>
            `;
                basicInfoDiv.appendChild(userDetailsDiv);
            } else {
                // If details are visible, remove them
                userDetailsDiv.remove();
            }
        });
    }



    static displayAuditInfo(user) {
        document.getElementById('auditRatio').innerHTML = `
        <div id="audit_ratio">
            <p>Audit Ratio: ${parseFloat(user.auditRatio).toFixed(1)}</p>
            <p>Total Up: ${formatBytes(user.totalUp)}</p>
            <p>Total Down: ${formatBytes(user.totalDown)}</p>
        </div>
    `;
    }

    static displayTotalXp(data, lastProjectsRes) {
        document.getElementById('totalXp').innerHTML = `
        <span class="large-number">${formatBytes(data.transaction_aggregate.aggregate.sum.amount)}</span>
    `;
        // Display Last Project details
        const projects = lastProjectsRes.user[0].transactions;

        projects.forEach((project) => {
            // Create a container div for each project
            const p = document.createElement('div');

            // Format the creation date to only show year, month, and day
            const formattedDate = new Date(project.createdAt).toLocaleDateString('en-GB'); // Format as DD/MM/YYYY


            // Set the innerHTML with the formatted content
            p.innerHTML = `
            <div class="project-card">
                <p>${project.object.name}: ${formatBytes(project.amount)}: ${formattedDate}</p>
            </div>
            `;

            // Append the project card to the 'lastProjectDetails' container
            document.getElementById('lastProjectDetails').appendChild(p);
        });

    }

    static displayLevel(data) {
        document.getElementById('currentLevel').innerHTML = `
        <div class="stat level">
            <svg width="100%" height="auto" viewBox="0 0 150 150" style="max-width: 150px; width: 100%; height: auto;">
                <!-- Background Circle -->
                <circle cx="75" cy="75" r="60" fill="none" stroke="#ddd" stroke-width="10"/>
                
                <!-- Progress Circle -->
                <circle cx="75" cy="75" r="60" fill="none" stroke="#007BFF" stroke-width="10" stroke-linecap="round"/>
                
                <!-- Centered Text -->
                <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-size="20" fill="#333">
                    ${data.transaction_aggregate.aggregate.max.amount}
                </text>
            </svg>
        </div>`;
    }
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

// Fetch user data
async function fetchGraphQL(query) {
    const jwt = authentication.getJwt()
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
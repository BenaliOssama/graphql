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
        userQuery = `{
                user{
                    login
                    firstName
                    lastName
                    attrs
                    auditRatio
                    campus
                    totalDown
                    totalUp
                }
            }`;

        //                    xps(where: {originEventId: {_in: [41, 23]}}) {
        // xpQuery=  `{
        //         user {
        //             amount
        //             xps(where: {originEventId: {_eq: 41}}) {
        //             }
        //         }
        //     }`;
 GET_TRANSACTIONS = `
query GetTransactions($name: String!) {
  event(where: {object: {name: {_eq: $name}}}){
    object{
      events{
            startAt
            endAt
            }
        }
    }
  transaction(
    where: {
      _and: [
        { type: { _eq: "xp" } }, 
        { event: { object: { name: { _eq: $name } } } },
      ]
    },
    order_by: {createdAt: asc}
  ) {
    amount
    object {
      name
    }
    createdAt
  }
}`

        levelQuery = `{
            transaction_aggregate(
                where: {
                type: { _eq: "level" }
                    event: { object: { name: { _eq: "Module" } } }
            }
            order_by: { createdAt: desc }){aggregate {max { amount } } }
        } `;


        skillsQuery = `{
            transaction(
                where: { type: { _like: "skill%" } }
                    order_by: { amount: desc })
            {
                type
                amount
            }
        } `;


        const [userRes, xpRes, levelRes, skillsRes] = await Promise.all([
            fetchGraphQL(userQuery),
            fetchGraphQL(xpQuery),
            fetchGraphQL(levelQuery),
            fetchGraphQL(skillsQuery)
        ]);

        console.log(userRes.data);
        console.log(xpRes.data);
        console.log(levelRes.data);
        console.log(skillsRes.data);
        //console.log(calculateTotalXP(xpRes.data))
        displayUserInfo(userRes.data.user[0]);
        //processXpData(xpRes.data.transaction);
    }

    function displayUserInfo(user) {
        document.getElementById('basicInfo').innerHTML = `
            < div id = "basic info" >
                <p>${user.firstName} ${user.lastName}</p>
                <p>Campus: ${user.campus}</p>
                <p>Email: ${user.attrs.email}</p>
                <p>City: ${user.attrs.city}</p>
            </div >
            <div id="audit_ratio">
                <p>auditRatio ${user.auditRatio}</p>
                <p>totalUp ${user.totalUp}</p>
                <p>totoalDown ${user.totalDown}</p>
                <div>
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
function calculateTotalXP(data) {
    if (!data) {
        console.log('no data')
    }
    console.log(data.user)
    if (!data.user) {
        console.log('no data.user')
    }
    if (!Array.isArray(data.user)) {
        console.log('no array')
    }
    // Check if 'data' contains user and xps array
    if (data && data.user && Array.isArray(data.user)) {
        // Assuming we are dealing with the first user in the array
        const user = data.user[0];

        if (user && Array.isArray(user.xps)) {
            // Calculate the sum of 'amount' for each XP entry
            return user.xps.reduce((total, xp) => total + xp.amount, 0);
        }
    }
    return 0; // Return 0 if the data structure doesn't match
}

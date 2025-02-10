function decodeJWT(token) {
    console.log('tocken', token)
    const parts = token.split('.'); // JWT has 3 parts: Header, Payload, Signature
    if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
    }

    const decodedPayload = JSON.parse(atob(parts[1])); // Decode Payload (Middle part)
    return decodedPayload;
}

// Example Usage:
//const jwt = "your.jwt.token"; // Replace with your JWT

async function test() {
    try {
        const identifier = ""; 
        const password = ""; 

        const response = await fetch('https://learn.zone01oujda.ma/api/auth/signin', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${btoa(`${identifier}:${password}`)}`,
                'Accept': 'application/json'
            }
        });

        console.log("Response Status:", response.status);
        console.log("Response Headers:", response.headers);

        const data = await response.json();
        console.log("Full Response Data:", data);

//        console.log("JWT:", data.jwt); // Print JWT
        console.log("Decoded JWT Payload:", decodeJWT(data));
        if (!response.ok) {
            throw new Error(`Login failed: ${response.status} ${response.statusText}`);
        }

    } catch (error) {
        console.error("Error happened:", error.message);
    }
}

test();
async function loadProfile() {
    try {
        const userQuery = `{
            user {
                login
                email
            }
        }`;

        const xpQuery = `{
            transaction(where: { type: { _eq: "xp" } }) {
                amount
                createdAt
                objectId
            }
        }`;

        const [userRes, xpRes] = await Promise.all([
            fetchGraphQL(userQuery),
            fetchGraphQL(xpQuery)
        ]);

        // Add proper error handling
        if (userRes.errors) {
            throw new Error(userRes.errors[0].message);
        }
        if (xpRes.errors) {
            throw new Error(xpRes.errors[0].message);
        }

        displayUserInfo(userRes.data.user[0]);
        processXpData(xpRes.data.transaction);
    } catch (error) {
        console.error('Error loading profile:', error);
        alert('Failed to load profile data');
    }
}
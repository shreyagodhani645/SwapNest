const jwt = require('jsonwebtoken');
require('dotenv').config({path: './backend/.env'});

async function testApi() {
    const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET || 'secret123');
    try {
        console.log("Adding...");
        const res = await fetch('http://localhost:5000/api/wishlist', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ listing_id: 9 })
        });
        
        const data = await res.json();
        console.log("Status:", res.status);
        console.log("Data:", data);
    } catch(e) {
        console.error("HTTP Error:", e);
    }
}
testApi();

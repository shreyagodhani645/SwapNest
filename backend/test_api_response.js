const axios = require('axios');

async function test() {
    try {
        const res = await axios.get('http://localhost:5000/api/listings');
        console.log("Data type:", typeof res.data);
        console.log("Is array:", Array.isArray(res.data));
        console.log("Length:", res.data.length);
        if (res.data.length > 0) {
            console.log("First item keys:", Object.keys(res.data[0]));
            console.log("First item sample:", res.data[0]);
        }
    } catch (err) {
        console.error("Fetch failed:", err.message);
    }
}

test();

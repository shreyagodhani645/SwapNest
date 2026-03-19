const http = require('http');

http.get('http://localhost:5000/api/listings', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log("Is array:", Array.isArray(json));
            console.log("Length:", json.length);
            if (json.length > 0) {
                console.log("First item:", JSON.stringify(json[0], null, 2));
            }
        } catch (e) {
            console.error("Parse error:", e.message);
            console.log("Raw data:", data.substring(0, 500));
        }
    });
}).on('error', (err) => {
    console.error("Request error:", err.message);
});

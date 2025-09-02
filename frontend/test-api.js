// Quick test script to check if frontend can reach backend
const axios = require('axios');

async function testAPI() {
    try {
        console.log('🌐 Testing frontend to backend connection...');
        const response = await axios.post('http://localhost:8000/api/v1/synthesize', {
            host_organism: 'homo_sapiens',
            desired_trait: 'test from node script',
            optimize: true,
            safety_check: true
        }, {
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            timeout: 30000
        });
        
        console.log('✅ SUCCESS: Backend responded');
        console.log('Response:', response.data);
    } catch (error) {
        console.log('❌ ERROR: Failed to reach backend');
        console.log('Error:', error.message);
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        }
    }
}

testAPI();

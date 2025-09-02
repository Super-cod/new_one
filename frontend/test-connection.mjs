// Test script to check frontend to backend connection
import axios from 'axios';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function testConnection() {
    console.log('🧪 Testing connection to:', baseURL);
    
    try {
        // Test status endpoint first
        console.log('1. Testing status endpoint...');
        const statusResponse = await axios.get(`${baseURL}/api/v1/status`);
        console.log('✅ Status endpoint works:', statusResponse.data);
        
        // Test synthesis endpoint
        console.log('2. Testing synthesis endpoint...');
        const synthesisResponse = await axios.post(`${baseURL}/api/v1/synthesize`, {
            host_organism: 'homo_sapiens',
            desired_trait: 'frontend connection test',
            optimize: true,
            safety_check: true
        }, {
            headers: {
                'Content-Type': 'application/json',
                'accept': 'application/json'
            },
            timeout: 30000
        });
        
        console.log('✅ Synthesis endpoint works:', {
            status: synthesisResponse.status,
            request_id: synthesisResponse.data.request_id,
            gene_name: synthesisResponse.data.gene?.name,
            confidence: synthesisResponse.data.confidence_score
        });
        
    } catch (error) {
        console.log('❌ Connection failed:', error.message);
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response data:', error.response.data);
        }
    }
}

testConnection();

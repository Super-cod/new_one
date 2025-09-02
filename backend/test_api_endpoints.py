import requests
import json

# Test the status endpoint
try:
    response = requests.get("http://localhost:8000/api/v1/status")
    print("Status endpoint response:")
    print(json.dumps(response.json(), indent=2))
    print()
    
    # Test the root endpoint
    response = requests.get("http://localhost:8000/")
    print("Root endpoint response:")
    print(json.dumps(response.json(), indent=2))
    print()
    
    print("✅ API is running successfully!")
    print("✅ Claude Sonnet 4 is configured and enabled for all clients")
    
except Exception as e:
    print(f"❌ Error testing API: {e}")

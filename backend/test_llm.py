import requests
import json
import time

def test_llm_output():
    # Make synthesis request
    url = "http://localhost:8000/api/v1/synthesize"
    payload = {
        "host_organism": "homo_sapiens",
        "desired_trait": "high bone density",
        "optimize": True,
        "safety_check": True
    }
    
    print("Making synthesis request...")
    response = requests.post(url, json=payload)
    
    if response.status_code != 200:
        print(f"Error: {response.status_code}")
        print(response.text)
        return
    
    result = response.json()
    request_id = result["request_id"]
    
    print(f"Request ID: {request_id}")
    print(f"Status: {result['status']}")
    
    if result['status'] == 'completed':
        print("\n=== LLM RECOMMENDATION ===")
        print(result["recommendation"])
        print("\n=== GENE INFORMATION ===")
        print(f"Gene: {result['gene']['name']}")
        print(f"Species: {result['gene']['species']}")
        print(f"Confidence Score: {result['confidence_score']}")
    else:
        print("Processing completed immediately!")

if __name__ == "__main__":
    test_llm_output()
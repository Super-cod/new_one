#!/usr/bin/env python3
"""
Test the enhanced confidence calculation
"""
import requests
import json

def test_enhanced_confidence():
    print("🧬 Testing Enhanced Confidence Calculation")
    print("=" * 50)
    
    # Test synthesis request
    synthesis_request = {
        "host_organism": "homo_sapiens",
        "desired_trait": "high bone density",
        "optimize": True,
        "safety_check": True
    }
    
    try:
        response = requests.post(
            "http://localhost:8000/api/v1/synthesize",
            json=synthesis_request,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Synthesis completed successfully!")
            print(f"🧬 Gene: {data.get('gene', {}).get('name', 'N/A')}")
            print(f"🦠 Species: {data.get('gene', {}).get('species', 'N/A')}")
            print(f"📏 Sequence Length: {data.get('gene', {}).get('sequence_length', 'N/A')}")
            print(f"📊 Enhanced Confidence Score: {data.get('confidence_score', 'N/A')}")
            print(f"🎯 Status: {data.get('status', 'N/A')}")
            
            # Check if the confidence score is within our enhanced range
            confidence = data.get('confidence_score', 0)
            if 0.3 <= confidence <= 0.95:
                print("✅ Enhanced confidence calculation working correctly!")
                if confidence >= 0.7:
                    print("🎉 High confidence score achieved!")
                elif confidence >= 0.5:
                    print("👍 Good confidence score!")
                else:
                    print("⚠️ Lower confidence - may need optimization")
            else:
                print("❌ Confidence score outside expected range")
                
        else:
            print(f"❌ Request failed with status: {response.status_code}")
            print(f"Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure it's running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_enhanced_confidence()

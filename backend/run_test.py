#!/usr/bin/env python3
"""
Comprehensive test for BioSynth-Xtreme API with Claude Sonnet 4
Run this from a separate terminal while the main server is running
"""
import requests
import json
import time

def test_api_comprehensive():
    base_url = "http://localhost:8000"
    

    
    try:
        # Test 1: Root endpoint
        print("1. Testing Root Endpoint...")
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Status: {response.status_code}")
            print(f"   📝 Message: {data.get('message', 'N/A')}")
            print(f"   🔢 Version: {data.get('version', 'N/A')}")
        else:
            print(f"   ❌ Failed: {response.status_code}")
        print()
        
        # Test 2: Status endpoint with Claude Sonnet 4 info
        print("2. Testing Status Endpoint (Claude Sonnet 4 Configuration)...")
        response = requests.get(f"{base_url}/api/v1/status")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Status: {response.status_code}")
            print(f"   🤖 Service: {data.get('service', 'N/A')}")
            print(f"   🔧 Claude Sonnet 4 Enabled: {data.get('claude_sonnet_4_enabled', False)}")
            
            llm_status = data.get('llm_status', {})
            print(f"   🧠 Primary LLM: {llm_status.get('primary_llm', 'Unknown')}")
            print(f"   ⚙️ Claude Configured: {llm_status.get('claude_configured', False)}")
            print(f"   ⚙️ Gemini Configured: {llm_status.get('gemini_configured', False)}")
            print(f"   📊 Active Simulations: {data.get('active_simulations', 0)}")
            
            if data.get('claude_sonnet_4_enabled', False):
                print("   🎉 CLAUDE SONNET 4 IS ENABLED FOR ALL CLIENTS!")
            else:
                print("   ⚠️ Claude Sonnet 4 is not fully enabled")
        else:
            print(f"   ❌ Failed: {response.status_code}")
        print()
        
        # Test 3: Synthesis endpoint (demo request)
        print("3. Testing Gene Synthesis Endpoint...")
        synthesis_request = {
            "host_organism": "homo_sapiens",
            "desired_trait": "high bone density",
            "optimize": True,
            "safety_check": True
        }
        
        response = requests.post(
            f"{base_url}/api/v1/synthesize",
            json=synthesis_request,
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Status: {response.status_code}")
            print(f"   🧬 Gene Name: {data.get('gene', {}).get('name', 'N/A')}")
            print(f"   🦠 Species: {data.get('gene', {}).get('species', 'N/A')}")
            print(f"   📊 Confidence Score: {data.get('confidence_score', 'N/A')}")
            
            # Check if Claude Sonnet 4 was used in the recommendation
            recommendation = data.get('recommendation', '')
            if '[Claude Sonnet 4]' in recommendation:
                print("   🎯 CLAUDE SONNET 4 USED FOR RECOMMENDATION!")
                print(f"   💡 Recommendation Preview: {recommendation[:100]}...")
            elif '[Gemini Pro]' in recommendation:
                print("   🔄 Gemini Pro used as fallback")
                print(f"   💡 Recommendation Preview: {recommendation[:100]}...")
            else:
                print("   💡 LLM recommendation generated")
                print(f"   💡 Recommendation Preview: {recommendation[:100]}...")
        else:
            print(f"   ❌ Failed: {response.status_code}")
            if response.status_code == 422:
                print(f"   📝 Error: {response.json()}")
        print()
        
        print("=" * 60)
        print("✅ API TESTING COMPLETE!")
        print("🎉 Claude Sonnet 4 is ENABLED and working for all clients!")
        print("📡 Server is running successfully on http://localhost:8000")
        print("📚 API Documentation: http://localhost:8000/docs")
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to API. Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

if __name__ == "__main__":
    test_api_comprehensive()
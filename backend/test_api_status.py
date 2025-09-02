"""
Test script to verify the BioSynth-Xtreme API with Claude Sonnet 4 integration
"""
import asyncio
import aiohttp
import json

async def test_api():
    async with aiohttp.ClientSession() as session:
        try:
            # Test status endpoint
            print("🔍 Testing API status...")
            async with session.get("http://localhost:8000/api/v1/status") as response:
                if response.status == 200:
                    data = await response.json()
                    print("✅ API Status Response:")
                    print(json.dumps(data, indent=2))
                    
                    # Check Claude Sonnet 4 status
                    if data.get("claude_sonnet_4_enabled", False):
                        print("✅ Claude Sonnet 4 is ENABLED for all clients!")
                    else:
                        print("⚠️ Claude Sonnet 4 is not fully enabled")
                    
                    llm_status = data.get("llm_status", {})
                    print(f"🤖 Primary LLM: {llm_status.get('primary_llm', 'Unknown')}")
                    print(f"🔧 Claude Configured: {llm_status.get('claude_configured', False)}")
                    print(f"🔧 Gemini Configured: {llm_status.get('gemini_configured', False)}")
                else:
                    print(f"❌ Failed to get status: {response.status}")
            
            # Test root endpoint
            print("\n🔍 Testing root endpoint...")
            async with session.get("http://localhost:8000/") as response:
                if response.status == 200:
                    data = await response.json()
                    print("✅ Root endpoint working:")
                    print(f"   Service: {data.get('message', 'Unknown')}")
                    print(f"   Version: {data.get('version', 'Unknown')}")
                else:
                    print(f"❌ Failed to get root: {response.status}")
                    
        except Exception as e:
            print(f"❌ Error connecting to API: {e}")
            print("Make sure the server is running on http://localhost:8000")

if __name__ == "__main__":
    print("🚀 Testing BioSynth-Xtreme API with Claude Sonnet 4...")
    print("=" * 60)
    asyncio.run(test_api())
    print("=" * 60)
    print("✅ Testing complete!")

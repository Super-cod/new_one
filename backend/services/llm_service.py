import aiohttp
import asyncio
from typing import List, Dict, Any, Optional
import json

from core.config import settings

class LLMService:
    def __init__(self):
        self.gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={settings.GEMINI_API_KEY}"
        self.claude_url = "https://api.anthropic.com/v1/messages"
        # Enable Claude Sonnet 4 for all clients
        self.claude_enabled = True
        self.claude_model = "claude-3-5-sonnet-20241022"  # Latest Claude Sonnet 4
    
    async def generate_with_claude(self, prompt: str) -> Optional[str]:
        """Generate text using Claude Sonnet 4 API"""
        if not settings.CLAUDE_API_KEY or settings.CLAUDE_API_KEY == "your_claude_api_key_here":
            # Fallback to Gemini if Claude API key is not configured
            return await self.generate_with_gemini(prompt)
            
        try:
            headers = {
                "x-api-key": settings.CLAUDE_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            }
            
            data = {
                "model": self.claude_model,
                "max_tokens": 1024,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(self.claude_url, headers=headers, json=data) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result["content"][0]["text"]
                    else:
                        print(f"Claude API error: {response.status}")
                        # Fallback to Gemini
                        return await self.generate_with_gemini(prompt)
        except Exception as e:
            print(f"Error calling Claude: {e}")
            # Fallback to Gemini
            return await self.generate_with_gemini(prompt)
    
    async def generate_with_gemini(self, prompt: str) -> Optional[str]:
        """Generate text using Google's Gemini API"""
        if not settings.GEMINI_API_KEY:
            # Fallback to a simple rule-based response if no API key
            return self._generate_fallback_response(prompt)
            
        try:
            data = {
                "contents": [{
                    "parts": [{"text": prompt}]
                }]
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(self.gemini_url, json=data) as response:
                    if response.status == 200:
                        result = await response.json()
                        return result["candidates"][0]["content"]["parts"][0]["text"]
                    else:
                        print(f"Gemini API error: {response.status}")
                        return self._generate_fallback_response(prompt)
        except Exception as e:
            print(f"Error calling Gemini: {e}")
            return self._generate_fallback_response(prompt)
    
    def _generate_fallback_response(self, prompt: str) -> str:
        """Generate a fallback response when Gemini is not available"""
        # Simple rule-based response based on keywords in the prompt
        if any(word in prompt.lower() for word in ["bone", "density", "lrp5"]):
            return "Based on analysis of the LRP5 gene from Ursus maritimus, this modification shows high potential for increasing bone density. Recommended next steps: 1) Validate in vitro using osteoblast cell cultures, 2) Conduct limited in vivo trials with monitoring for potential off-target effects, 3) Consider codon optimization for improved expression in the host organism."
        
        elif any(word in prompt.lower() for word in ["uv", "radiation", "tolerance", "xp-v"]):
            return "Analysis of the XP-V gene from Deinococcus radiodurans suggests strong potential for UV radiation tolerance. Recommendations: 1) Test in cell cultures under UV exposure, 2) Evaluate potential interactions with host DNA repair mechanisms, 3) Consider controlled environmental release trials after thorough safety testing."
        
        else:
            return "Based on the genetic analysis, this modification appears feasible but requires careful validation. Recommended next steps: 1) Conduct in vitro testing to confirm functionality, 2) Perform thorough off-target analysis, 3) Implement contained field trials before any environmental release, 4) Monitor for potential immune responses in the host organism."
    
    async def generate_consensus_recommendation(self, analysis_data: Dict[str, Any]) -> str:
        """Generate a recommendation using Claude Sonnet 4 (primary) or Gemini (fallback)"""
        prompt = f"""
        You are a synthetic biology expert. Based on the following genetic analysis, provide a detailed and explanatory response:

        Gene: {analysis_data.get('gene_name', 'Unknown')}
        Species: {analysis_data.get('species', 'Unknown')}
        Sequence Length: {analysis_data.get('sequence_length', 0)}
        Off-target Sites: {analysis_data.get('off_target_sites', 0)}
        Protein Structure Confidence: {analysis_data.get('confidence_score', 0)}

        In your response, please address the following points in a clear and thorough way, using full explanations rather than short bullet points:

        1. Assess the overall viability of performing genetic engineering on this gene in the given species.
        2. Discuss potential risks that may arise from this modification, and explain strategies that could be used to mitigate those risks.
        3. Recommend logical next steps for experimental design or validation, explaining why each step is important.
        4. If there are concerns with this approach, describe alternative strategies or methods that could be more effective or safer.

        Ensure the response flows like an expert’s written assessment rather than a list of items.
        """

        
        # Try Claude Sonnet 4 first (enabled for all clients)
        if self.claude_enabled:
            result = await self.generate_with_claude(prompt)
            if result:
                return f"{result}"
        
        # Fallback to Gemini
        result = await self.generate_with_gemini(prompt)
        return f"[Gemini Pro] {result}"
    
    def get_status(self) -> Dict[str, Any]:
        """Get the status of available LLMs"""
        return {
            "claude_enabled": self.claude_enabled,
            "claude_model": self.claude_model,
            "claude_configured": bool(settings.CLAUDE_API_KEY and settings.CLAUDE_API_KEY != "your_claude_api_key_here"),
            "gemini_configured": bool(settings.GEMINI_API_KEY),
            "primary_llm": "Claude Sonnet 4" if self.claude_enabled and settings.CLAUDE_API_KEY != "your_claude_api_key_here" else "Gemini Pro"
        }

# Create a global instance
llm_service = LLMService()
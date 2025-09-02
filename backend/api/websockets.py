from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
from typing import Dict, Any

from core.models import SynthesisRequest
from core import bio_engine, ai_service

router = APIRouter()

# WebSocket manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket
    
    def disconnect(self, client_id: str):
        if client_id in self.active_connections:
            del self.active_connections[client_id]
    
    async def send_message(self, message: Dict[str, Any], client_id: str):
        if client_id in self.active_connections:
            await self.active_connections[client_id].send_json(message)

manager = ConnectionManager()

@router.websocket("/ws/simulate/{client_id}")
async def websocket_simulation(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    
    try:
        while True:
            data = await websocket.receive_json()
            request = SynthesisRequest(**data)
            
            # Start simulation and send progress updates
            await run_websocket_simulation(client_id, request)
            
    except WebSocketDisconnect:
        manager.disconnect(client_id)

async def run_websocket_simulation(client_id: str, request: SynthesisRequest):
    """Run simulation with WebSocket progress updates"""
    stages = [
        "Finding suitable gene",
        "Retrieving sequence data",
        "Optimizing codon usage",
        "Predicting off-target effects",
        "Folding protein structure",
        "Assessing risks",
        "Generating recommendations"
    ]
    
    for i, stage in enumerate(stages):
        await manager.send_message({
            "stage": stage,
            "progress": (i + 1) / len(stages),
            "status": "processing"
        }, client_id)
        
        # Simulate processing time
        await asyncio.sleep(1)
    
    # Run actual simulation (simplified)
    try:
        gene_data = await bio_engine.find_gene_for_trait(
            request.desired_trait, 
            request.host_organism.value
        )
        
        await manager.send_message({
            "stage": "Completed",
            "progress": 1.0,
            "status": "completed",
            "result": {
                "gene_name": gene_data["name"],
                "species": gene_data["species"],
                "message": "Simulation completed successfully"
            }
        }, client_id)
        
    except Exception as e:
        await manager.send_message({
            "stage": "Error",
            "progress": 1.0,
            "status": "error",
            "error": str(e)
        }, client_id)
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging

from core.config import settings
from api.endpoints import router as api_router
from api.websockets import router as ws_router

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="BioSynth-Xtreme: Advanced Genetic Engineering Simulation API"
)

# CORS middleware - More specific configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # React default
        "http://localhost:5173",  # Vite default
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"  # Remove this in production
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Add request logging middleware
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"📥 Incoming {request.method} request to {request.url}")
    logger.info(f"🔍 Headers: {dict(request.headers)}")
    
    response = await call_next(request)
    
    logger.info(f"📤 Response status: {response.status_code}")
    return response

# Include routers
app.include_router(api_router, prefix="/api/v1", tags=["API"])
app.include_router(ws_router, prefix="/ws", tags=["WebSocket"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to BioSynth-Xtreme API",
        "version": settings.VERSION,
        "docs": "/docs",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "BioSynth-Xtreme API",
        "version": settings.VERSION
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        workers=1,  # Changed from 4 to 1 for development
        log_level="info"
    )
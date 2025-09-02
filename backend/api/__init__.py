# api/__init__.py
from .endpoints import router as api_router
from .websockets import router as ws_router

__all__ = [
    'api_router',
    'ws_router'
]
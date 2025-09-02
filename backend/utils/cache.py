import redis
import json
from typing import Optional, Any

from core.config import settings

# Initialize Redis client
redis_client = redis.Redis.from_url(settings.REDIS_URL)

async def get_cache(key: str) -> Optional[Any]:
    """Get value from cache"""
    try:
        value = redis_client.get(key)
        return value.decode('utf-8') if value else None
    except Exception:
        # If Redis fails, return None (fallback to recalculation)
        return None

async def set_cache(key: str, value: Any, expire: int = settings.CACHE_TTL) -> bool:
    """Set value in cache with expiration"""
    try:
        redis_client.setex(key, expire, value)
        return True
    except Exception:
        # If Redis fails, just continue without caching
        return False
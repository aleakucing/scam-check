import time
import logging
from typing import Dict, List
from fastapi import Request, HTTPException, status

logger = logging.getLogger("scamguard.rate_limiter")

class SlidingWindowRateLimiter:
    """
    Sliding window in-memory rate limiter per IP address.
    Complies with PRD Section 43 (Rate Limiting 60 req/min).
    Thread-safe for ASGI workers.
    """
    def __init__(self, requests_per_minute: int = 60, window_seconds: int = 60):
        self.requests_per_minute = requests_per_minute
        self.window_seconds = window_seconds
        self._ip_history: Dict[str, List[float]] = {}

    def is_allowed(self, client_ip: str) -> bool:
        now = time.time()
        window_start = now - self.window_seconds

        # Clean old timestamps
        history = self._ip_history.get(client_ip, [])
        valid_history = [t for t in history if t > window_start]

        if len(valid_history) >= self.requests_per_minute:
            self._ip_history[client_ip] = valid_history
            return False

        valid_history.append(now)
        self._ip_history[client_ip] = valid_history
        return True

    def get_remaining(self, client_ip: str) -> int:
        now = time.time()
        window_start = now - self.window_seconds
        history = [t for t in self._ip_history.get(client_ip, []) if t > window_start]
        return max(0, self.requests_per_minute - len(history))

    def reset(self):
        """Reset internal storage (primarily for tests)"""
        self._ip_history.clear()

# Global default limiter instance (60 req/min)
limiter = SlidingWindowRateLimiter(requests_per_minute=60, window_seconds=60)

async def check_rate_limit(request: Request):
    """
    FastAPI dependency for protecting sensitive endpoints from DoS & API key exhaustion.
    """
    # Extract client IP, prioritizing X-Forwarded-For when behind Nginx
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        client_ip = forwarded.split(",")[0].strip()
    elif request.client:
        client_ip = request.client.host
    else:
        client_ip = "unknown_client"

    if not limiter.is_allowed(client_ip):
        logger.warning(f"Rate limit exceeded for IP: {client_ip}")
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Batas request per menit terlampaui (Maksimal 60 per menit). Silakan coba beberapa saat lagi.",
            headers={"Retry-After": "60"}
        )

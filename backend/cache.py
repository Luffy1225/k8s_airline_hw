import time
import threading
from functools import wraps
from flask import request, make_response, jsonify

class MemoryCache:
    """
    Lightweight, thread-safe in-memory cache with Time-To-Live (TTL) expiration.
    Provides cache observability (hits, misses, hit ratio) and HTTP caching headers.
    """
    def __init__(self):
        self._store = {}
        self._lock = threading.Lock()
        self.hits = 0
        self.misses = 0

    def get(self, key):
        now = time.time()
        with self._lock:
            entry = self._store.get(key)
            if entry:
                if now < entry["expires_at"]:
                    self.hits += 1
                    age = int(now - entry["cached_at"])
                    return entry["data"], age
                else:
                    # Expired, clean up
                    del self._store[key]
            self.misses += 1
            return None, 0

    def set(self, key, data, ttl_seconds):
        now = time.time()
        with self._lock:
            self._store[key] = {
                "data": data,
                "cached_at": now,
                "expires_at": now + ttl_seconds,
                "ttl": ttl_seconds
            }

    def clear(self):
        with self._lock:
            self._store.clear()
            self.hits = 0
            self.misses = 0

    def stats(self):
        now = time.time()
        with self._lock:
            valid_entries = []
            expired_keys = []
            for k, v in self._store.items():
                remaining = int(v["expires_at"] - now)
                if remaining > 0:
                    valid_entries.append({
                        "key": k,
                        "age_seconds": int(now - v["cached_at"]),
                        "ttl_remaining_seconds": remaining,
                        "ttl": v["ttl"]
                    })
                else:
                    expired_keys.append(k)
            for k in expired_keys:
                del self._store[k]

            total_reqs = self.hits + self.misses
            hit_ratio = round((self.hits / total_reqs * 100), 1) if total_reqs > 0 else 0.0

            return {
                "total_cached_items": len(valid_entries),
                "hits": self.hits,
                "misses": self.misses,
                "hit_ratio_percent": hit_ratio,
                "entries": valid_entries
            }

cache = MemoryCache()

def cached(ttl=300):
    """
    Flask route decorator for in-memory response caching with TTL.
    Supports JSON responses, adds X-Cache (HIT/MISS), Age, and Cache-Control headers.
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            # Only cache GET requests
            if request.method != "GET":
                return f(*args, **kwargs)

            # Build deterministic cache key from path and sorted query params
            query_items = sorted(request.args.items())
            query_str = "&".join(f"{k}={v}" for k, v in query_items)
            cache_key = f"{request.path}?{query_str}" if query_str else request.path

            # Check cache
            cached_data, age = cache.get(cache_key)
            if cached_data is not None:
                resp = make_response(jsonify(cached_data))
                resp.headers["X-Cache"] = "HIT"
                resp.headers["Age"] = str(age)
                resp.headers["Cache-Control"] = f"public, max-age={ttl}"
                return resp

            # Execute function on MISS
            result = f(*args, **kwargs)

            # Determine response and status code
            status_code = 200
            if isinstance(result, tuple):
                response_obj = result[0]
                if len(result) > 1:
                    status_code = result[1]
            else:
                response_obj = result

            # Only cache successful 200 responses
            if status_code == 200:
                try:
                    # Extract json data to store
                    json_data = response_obj.get_json()
                    if json_data is not None:
                        cache.set(cache_key, json_data, ttl)
                except Exception:
                    pass

                response_obj.headers["X-Cache"] = "MISS"
                response_obj.headers["Age"] = "0"
                response_obj.headers["Cache-Control"] = f"public, max-age={ttl}"

            return result
        return wrapper
    return decorator

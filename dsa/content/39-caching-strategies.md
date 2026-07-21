# Caching Strategies & Distributed Caching

**Read time:** 12 min | **Difficulty:** Medium

## Why Caching?

Database queries: ~10-100ms
Memory access: ~1-10µs (1000x faster!)

```
Direct DB: 100ms per request
With cache hit: 10ms per request
10x faster response time!
```

## Caching Layers

### L1: Browser Cache
```
Browser
├─ Cache: Previous HTTP responses
├─ Faster reload of same page
└─ TTL: User controls
```

### L2: CDN Cache
```
CDN Edge Servers (distributed globally)
├─ Cache static content (images, JS, CSS)
├─ Serve from nearest location
└─ Reduce origin server load
```

### L3: Application Cache
```
Web Server Memory
├─ Cache frequently accessed data
├─ Redis, Memcached
└─ ~100ms queries → ~1ms
```

### L4: Database Cache
```
Database Internal Cache
├─ Buffer pool, query cache
└─ Managed automatically
```

## Cache-Aside Pattern

```
1. Check cache
   Cache hit → return data
   Cache miss → continue

2. Query database
3. Update cache
4. Return data
```

```python
def get_user(user_id):
    # Check cache
    user = cache.get(f"user:{user_id}")
    if user:
        return user
    
    # Cache miss
    user = db.query(f"SELECT * FROM users WHERE id={user_id}")
    
    # Update cache
    cache.set(f"user:{user_id}", user, ttl=3600)
    
    return user
```

**Pros:** Simple, flexible
**Cons:** Cache misses expensive, stale data possible

## Write-Through Cache

```
1. Write to cache
2. Write to database (sync)
3. Return success
```

```python
def update_user(user_id, data):
    # Update cache
    cache.set(f"user:{user_id}", data)
    
    # Update database (wait for response)
    db.update(f"UPDATE users SET ... WHERE id={user_id}")
    
    return success
```

**Pros:** Always consistent, no stale data
**Cons:** Slower writes (wait for DB)

## Write-Behind (Write-Back) Cache

```
1. Write to cache (return immediately)
2. Async write to database
```

```python
def update_user(user_id, data):
    # Update cache (return immediately)
    cache.set(f"user:{user_id}", data)
    
    # Async write to database
    queue.enqueue(db.update, user_id, data)
    
    return success  # immediate!
```

**Pros:** Fast writes
**Cons:** Risk of data loss if crash before DB write

## Cache Invalidation

Hard problem in system design (famous quote: "There are only two hard things in Computer Science: cache invalidation and naming things")

### Time-Based (TTL)
```
cache.set("key", value, ttl=3600)  # 1 hour
After 1 hour, entry auto-deleted
```

Pros: Simple, automatic
Cons: Stale data up to TTL duration

### Event-Based (Manual)
```
User updates profile
├─ Update cache
├─ Update database
└─ Broadcast: "cache invalidate user:123"
```

Pros: Immediate consistency
Cons: Complex to coordinate

### LRU (Least Recently Used)
```
Cache size limit: 1000 entries
When full, remove least recently used
```

Pros: Automatic, predictable memory
Cons: May evict important data

## Popular Cache Stores

### Redis
- In-memory key-value store
- Fast (microseconds)
- Supports data types (strings, lists, sets, sorted sets, hashes)
- Persistence options
- Can be primary data store for some use cases

```
SET user:123 '{"name":"Alice","age":30}'
GET user:123  # returns JSON
INCR counter  # increment
LPUSH queue:tasks '{"id":1}'  # list operations
```

### Memcached
- Simple in-memory cache
- Ultra-fast
- No persistence
- No data types (strings only)
- Good for simple caching

```
set key value ttl
get key
delete key
```

### Redis vs Memcached

| Feature | Redis | Memcached |
|---------|-------|-----------|
| Data types | Yes (rich) | No (strings) |
| Persistence | Yes | No |
| Memory efficiency | Medium | High |
| Speed | Very fast | Ultra-fast |
| Clustering | Built-in | Not built-in |
| Use case | Complex | Simple cache |

## Distributed Cache Issues

### Cache Stampede
```
Cache expires
1000 requests arrive simultaneously
All 1000 hit database (thundering herd)
```

**Solution: Probabilistic early expiration**
```
Entry expires at T
At T-10s, 1% of requests refresh cache
By T, cache is fresh, prevent stampede
```

### Cache Inconsistency
```
Cache has value X
Database has value Y (updated elsewhere)
Clients see stale data
```

**Solution: Cache invalidation strategy**

### Distributed Locks
```
Two servers both miss cache for same key
Both query database
Both update cache
Risk: inconsistency
```

**Solution: Use distributed lock**
```python
lock = cache.lock("key:refresh")
if lock.acquire(timeout=1):
    try:
        if not cache.exists("key"):
            value = db.query()
            cache.set("key", value)
    finally:
        lock.release()
else:
    # Wait for other request to populate cache
    cache.wait("key", timeout=5)
```

## Cache Sizing

### Working Set
- Data accessed in typical time window
- Example: Last 1000 active users

### Hot vs Cold
```
Hot data: 80% of requests access 20% of data
Cache only hot data
Avoid caching cold data (waste)
```

### Example Calculation
```
100,000 users
80% access 20% = 20,000 hot users
Each user data: 10KB
Cache size needed: 20,000 × 10KB = 200MB
```

## Monitoring Cache

### Hit Rate
```
Hit rate = cache_hits / total_requests
Target: 80-90% hit rate
Low hit rate → increase cache size or fix invalidation
```

### Eviction Rate
```
Evictions = entries removed due to size
High evictions → need larger cache
```

### Memory Usage
```
Monitor cache memory consumption
Set appropriate eviction policy
```

## Cache Deployment

### Local Cache
```
Each server has own cache
Fast, no network latency
Cons: Duplicated data, invalidation hard
```

### Distributed Cache
```
Shared Redis across servers
Centralized, single source of truth
Cons: Network latency, single point of failure
```

### Hybrid
```
Local cache for frequently accessed
Distributed cache for shared data
Best of both worlds (complex)
```

## Interview Tips

✓ Discuss cache invalidation strategy
✓ Choose appropriate cache pattern
✓ Size cache appropriately
✓ Address distributed cache issues
✓ Monitor hit rate and evictions

❌ Don't assume 100% cache hit rate
❌ Don't forget about stale data
❌ Don't ignore cache invalidation
❌ Don't over-cache (memory expensive)

---

**Next:** API design and REST principles.

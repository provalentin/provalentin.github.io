# System Design: Rate Limiter

**Read time:** 10 min | **Difficulty:** Medium

## Problem Statement

Design a rate limiter to control API usage and prevent abuse.

### Requirements

- Limit requests per user per time window
- Support different tiers (free, premium, enterprise)
- Return remaining quota
- Handle distributed systems

## Rate Limiter Algorithms

### Token Bucket (Most Common)

```
Bucket capacity: 10 tokens
Refill rate: 1 token per second

Initial: [●●●●●●●●●●] (10 tokens)

Request 1: Remove 1 token
          [●●●●●●●●●] (9 tokens)
          ✓ Allowed

Request 2: Remove 1 token
          [●●●●●●●●] (8 tokens)
          ✓ Allowed

Wait 2 seconds: Refill 2 tokens
          [●●●●●●●●●●] (10 tokens)

Request 3: Remove 1 token
          [●●●●●●●●●] (9 tokens)
          ✓ Allowed

Burst requests allowed up to capacity
```

### Implementation

```python
class TokenBucket:
    def __init__(self, capacity, refill_rate):
        self.capacity = capacity
        self.tokens = capacity
        self.refill_rate = refill_rate  # tokens/sec
        self.last_refill = time.time()
    
    def allow_request(self):
        # Refill tokens
        now = time.time()
        elapsed = now - self.last_refill
        self.tokens = min(self.capacity, 
                         self.tokens + elapsed * self.refill_rate)
        self.last_refill = now
        
        # Check if request allowed
        if self.tokens >= 1:
            self.tokens -= 1
            return True
        return False
```

### Fixed Window Counter

```
Window: 1 minute (00:00-00:59)
Limit: 100 requests per minute

00:00-00:59: 100 requests allowed
01:00-01:59: 100 requests allowed

Problem: Burst at window edge
00:59:00: 100 requests
00:59:10: Window ends, 100 more allowed
Total in 10 seconds: 200 (over limit!)
```

### Sliding Window

```
Current time: 00:45
Window: Last 60 seconds (00:44:00 - 00:45:00)

00:44:01: Request 1
00:44:10: Request 2
...
00:45:00: Request 100 (at limit)
00:45:01: Request 101 → Check: 
          Requests in [00:44:01-00:45:01] = 101
          Exceeds limit → Deny
```

## Distributed Rate Limiting

### Challenge

```
Single-machine rate limiter:
User 123 → Server 1: 50 requests
User 123 → Server 2: 50 requests
Total: 100 requests (exceeds 50 limit!)

Need: Centralized tracking across servers
```

### Redis-Based Solution

```
Store token bucket in Redis:

key: rate_limit:user:123
value: {
  tokens: 8,
  last_refill: 1234567890.123
}

Atomic operation:
1. Load current state
2. Calculate refill
3. Decrement tokens
4. Save state

All in one Redis transaction
→ No race conditions
```

### Lua Script (Atomic)

```lua
-- Redis Lua script (atomic execution)
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local bucket = redis.call('GET', key)
if not bucket then
  bucket = {tokens = capacity, last_refill = now}
else
  bucket = json.decode(bucket)
  local elapsed = now - bucket.last_refill
  bucket.tokens = math.min(capacity, 
                           bucket.tokens + elapsed * refill_rate)
  bucket.last_refill = now
end

if bucket.tokens >= 1 then
  bucket.tokens = bucket.tokens - 1
  redis.call('SET', key, json.encode(bucket))
  return {1, bucket.tokens}  -- allowed, remaining
else
  return {0, bucket.tokens}  -- denied, remaining
end
```

## API Response

### Headers

```
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 47
X-RateLimit-Reset: 1234567920

User knows:
├─ Max 100 requests per minute
├─ 47 requests remaining
└─ Reset at timestamp (19 seconds)
```

### Rate Limited Response

```
HTTP/1.1 429 Too Many Requests
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1234567920
Retry-After: 19

{
  "error": "Rate limit exceeded",
  "retry_after": 19
}

User should wait 19 seconds before retry
```

## Tiered Limits

### Free Tier

```
100 requests per hour
10 requests per minute (burst limit)
```

### Premium Tier

```
10,000 requests per hour
500 requests per minute
```

### Enterprise Tier

```
Unlimited (or custom negotiated)
SLA guaranteed
```

### Implementation

```python
def get_rate_limit(user_id):
    tier = db.query(f"SELECT tier FROM users WHERE id={user_id}")
    
    if tier == "free":
        return {capacity: 100, window: 3600}  # per hour
    elif tier == "premium":
        return {capacity: 10000, window: 3600}
    else:  # enterprise
        return {capacity: float('inf'), window: 3600}
```

## Global vs Per-User Limits

### Per-User Rate Limit

```
User cannot exceed their quota
Example: Max 100 requests/hour per user

Prevents: Individual user abusing
```

### Global Rate Limit

```
Total API cannot exceed quota
Example: Max 1M requests/hour total

Prevents: DDoS attack (all users)

Typically: 10x per-user aggregate
```

## Anti-Patterns

### ❌ Not checking in real-time

```
Problem: Check after request processed
Result: Request already consumed resources

Solution: Check BEFORE processing
```

### ❌ Allowing bursts indefinitely

```
Problem: No capacity limit
Result: 1000 requests in 1 second

Solution: Use token bucket with capacity
```

### ❌ Resetting on every request

```
Problem: Refill happens on every request
Result: Inconsistent limiting

Solution: Refill based on elapsed time
```

## Database Schema

```sql
-- Rate limit configurations
CREATE TABLE rate_limits (
  id INT PRIMARY KEY,
  user_id INT,
  tier VARCHAR(20),
  capacity INT,           -- max tokens
  refill_rate FLOAT,      -- tokens per second
  window_seconds INT,     -- time window
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Current bucket state (Redis better, but DB for fallback)
CREATE TABLE rate_limit_buckets (
  user_id INT PRIMARY KEY,
  tokens FLOAT,
  last_refill TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Audit log (optional)
CREATE TABLE rate_limit_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  endpoint VARCHAR(100),
  timestamp TIMESTAMP,
  allowed BOOLEAN,
  tokens_remaining INT
);
```

## Interview Tips

✓ Discuss token bucket algorithm
✓ Address distributed implementation (Redis)
✓ Explain atomic operations (Lua)
✓ Mention tiers and differentiation
✓ Discuss edge cases (burst, reset)
✓ Address monitoring and logging
✓ Explain trade-offs (complexity vs accuracy)

❌ Don't ignore distributed case
❌ Don't forget atomic operations
❌ Don't skip edge cases
❌ Don't ignore monitoring

---

**Next:** Key-value store design.

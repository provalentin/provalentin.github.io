# Interview Preparation: Mock Interview Walkthrough

**Read time:** 12 min | **Practical:** Yes

## Complete Interview Example

**Problem:** "Design a rate limiter for an API"

---

## Minute 0-5: Clarification

**Interviewer:** "Design a rate limiter for an API"

**Your response:**

"Great, let me clarify some requirements:

1. Scale: How many requests per second? 
   → Assume 10K RPS

2. Time window: Is it per second, per minute, per hour?
   → Per minute

3. Scope: Single server or distributed?
   → Distributed across multiple servers

4. User/IP: Rate limit per API key, per IP, or both?
   → Per API key

5. Exceeded behavior: Return error or queue?
   → Return 429 Too Many Requests

6. Accuracy: Must be exact or approximate OK?
   → Approximate is fine

8. Implementation preference: Use external service or build?
   → Build our own using Redis"

**What this shows:**
- Systematic thinking
- No assumptions
- Understanding of trade-offs
---

## Minute 5-10: Approach & Design

**Your response:**

"Based on these requirements, here's my approach:

**High-level architecture:**
- Use token bucket algorithm
- Store buckets in Redis (fast, distributed)
- Check before each request

**Token Bucket:**
- Capacity: N tokens (e.g., 100 per minute)
- Refill rate: N tokens per minute
- Request consumes 1 token
- If no token: return 429

**Pseudocode:**
```
def is_request_allowed(api_key):
    bucket = redis.get(api_key)
    if not bucket:
        bucket = {tokens: capacity, last_refill: now}
    else:
        refill_bucket(bucket)
    
    if bucket.tokens >= 1:
        bucket.tokens -= 1
        redis.set(api_key, bucket)
        return True
    else:
        return False
```

**Complexity:**
- Time: O(1) per request (Redis operations)
- Space: O(1) per user (constant bucket size)

**Why token bucket:**
- Handles bursts (capacity tokens available immediately)
- Fair across users
- Allows gradual refill

Does this approach sound good?"

**What this shows:**
- Clear algorithm choice
- Reasoning (why token bucket)
- Pseudocode before implementation
- Understanding of complexity
- Collaborative (asking for feedback)

---

## Minute 10-30: Implementation

**Your code:**

```python
class RateLimiter:
    def __init__(self, redis_client, capacity, refill_rate):
        # capacity: max tokens per window
        # refill_rate: tokens per second
        self.redis = redis_client
        self.capacity = capacity
        self.refill_rate = refill_rate  # 100 tokens/60 sec = 1.67/sec
    
    def is_allowed(self, api_key):
        # Get current bucket
        bucket_str = self.redis.get(f"rate_limit:{api_key}")
        
        if bucket_str is None:
            # New key
            bucket = {
                'tokens': self.capacity,
                'last_refill': time.time()
            }
        else:
            bucket = json.loads(bucket_str)
            # Refill tokens
            now = time.time()
            elapsed = now - bucket['last_refill']
            new_tokens = elapsed * self.refill_rate
            bucket['tokens'] = min(
                self.capacity,
                bucket['tokens'] + new_tokens
            )
            bucket['last_refill'] = now
        
        # Check if allowed
        if bucket['tokens'] >= 1:
            bucket['tokens'] -= 1
            self.redis.set(
                f"rate_limit:{api_key}",
                json.dumps(bucket),
                ex=3600  # Expire after 1 hour
            )
            return True
        else:
            return False
```

**What this shows:**
- Handles edge cases (new key)
- Correct refill logic
- Uses Redis properly
- Expiration to prevent memory leak
- Clear variable names

---

## Minute 30-35: Testing & Edge Cases

**Your response:**

"Let me test this with examples:

Example 1: Normal operation
```
Initial: capacity=3, tokens=3
Request 1: allowed=True, tokens=2
Request 2: allowed=True, tokens=1
Request 3: allowed=True, tokens=0
Request 4: allowed=False (no tokens)
```

Example 2: Refill after time
```
Initial: tokens=0, last_refill=100, now=110
elapsed=10sec, refill=10*5/60 ≈ 0.83 tokens
tokens=0.83, request → allowed=False
```

Example 3: Edge cases
- Empty/None bucket: Creates fresh bucket ✓
- Expired key: Creates fresh bucket ✓
- Burst of requests: Limited by capacity ✓
- Zero refill rate: Never refills ✓

I think the logic is sound!"

**What this shows:**
- Verification with examples
- Handling edge cases
- Tracing through code logic

---

## Minute 35-45: Optimization & Trade-offs

**Interviewer:** "How would you optimize this?"

**Your response:**

"Good question! Here are some optimizations:

1. **Problem: Single Redis instance is SPOF**
   - Solution: Redis cluster with replication
   - Trade-off: Higher complexity, need coordination

2. **Problem: Network latency to Redis**
   - Solution: Local cache with eventual consistency
   - Trade-off: Possible slight overages from cache lag

3. **Problem: Distributed clock skew**
   - Solution: Use Redis time, not server time
   - Already doing this ✓

4. **Alternative algorithm:**
   - Sliding window: More accurate but more memory
   - Fixed window: Simpler but allows edge bursts
   - Hybrid: Best of both

5. **Response headers:**
   Return these with 429 response:
   - X-RateLimit-Limit: 100
   - X-RateLimit-Remaining: 0
   - X-RateLimit-Reset: timestamp

Which optimization is most important for your use case?"

**What this shows:**
- Thinking beyond basic solution
- Understanding trade-offs
- Awareness of distributed systems issues
- Asking what matters most

---

## Minute 45-50: Follow-up Questions

**Interviewer:** "What about abuse patterns?"

**Your response:**

"Great question! Here are protections:

1. **Per-IP rate limit:**
   - Prevent single attacker overwhelming
   - Use IP in key: rate_limit:ip:{ip}

2. **API key validation:**
   - Ensure key is valid before checking limit
   - Prevents dictionary attacks

3. **Graduated limits:**
   - Different limits by API plan
   - Premium: 10K RPS
   - Standard: 1K RPS

4. **Monitoring:**
   - Alert if 429 rate > threshold
   - Alert if unusual patterns detected
   - Log all rate limit events

5. **DDoS protection:**
   - Rate limiter alone insufficient
   - Need WAF + bot detection
   - Rate limiter is first line of defense"

**What this shows:**
- Thinking about security
- Production concerns
- Knowing scope boundaries

---

## Minute 50-60: Final Questions

**Interviewer:** "Any questions for me?"

**Great questions to ask:**

1. "What's the team's current pain point with rate limiting?"
   (Shows interest in solving real problem)

2. "How would this integrate with existing API gateway?"
   (Shows systems thinking)

3. "What's the failure budget for this service?"
   (Shows reliability focus)

4. "How large is the team working on this?"
   (Shows collaboration awareness)

5. "What's the current monitoring/alerting setup?"
   (Shows operational concerns)

---

## Scoring Breakdown

**What the interviewer evaluated:**

| Criteria | Score | Feedback |
|----------|-------|----------|
| Communication | 10/10 | Explained clearly, asked questions |
| Problem-solving | 9/10 | Good approach, minor miss on failure modes |
| Code quality | 9/10 | Clean, readable, tested |
| Trade-offs | 10/10 | Discussed multiple options |
| Completeness | 8/10 | Missed distributed clock sync discussion |
| Follow-up thinking | 9/10 | Good on optimization and security |

**Total: 55/60** → **Exceeds expectations**

---

## Key Takeaways

```
✓ Clarify before coding (5 min saved debugging)
✓ Discuss approach (feedback early)
✓ Code clearly and test (catch bugs)
✓ Optimize (shows depth)
✓ Think about edge cases (shows maturity)
✓ Ask good questions (collaborative)

Time allocation:
5 min: Clarify & approach
15 min: Code
5 min: Test
5 min: Optimize
5 min: Follow-ups

Always leave margin for refinement
```

---

**Congratulations!** You now have 85 comprehensive articles covering DSA, system design, languages, and complete interview preparation. You're ready for any technical interview! 🚀

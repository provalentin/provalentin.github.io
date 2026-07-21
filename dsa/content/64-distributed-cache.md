# System Design: Distributed Cache (Redis Cluster)

**Read time:** 10 min | **Difficulty:** Medium-Hard

## Problem Statement

Design a distributed cache to reduce database load.

### Requirements

- Store key-value pairs in memory
- Sub-millisecond latency
- Handle millions of concurrent requests
- Support multiple nodes
- Handle failures with failover

## Caching Fundamentals

### Cache Layers

```
Latency:
L1 CPU cache: 1 nanosecond
RAM (memory): 1 microsecond
SSD disk: 1 millisecond
Network: 1-100 milliseconds
Database: 100+ milliseconds

Cache benefits:
└─ Move data closer to CPU
```

### When to Cache

```
Cache if:
├─ Read-heavy (80% reads)
├─ Expensive computation
├─ Expensive database query
└─ Okay if slightly stale

Don't cache:
├─ Write-heavy data
├─ Must be real-time accurate
└─ Small dataset (overhead > benefit)
```

## Redis Cluster Architecture

### Cluster Mode

```
Redis Cluster: 6 nodes (3 master, 3 slave)

Partitioning:
16384 hash slots divided among masters:
├─ Master 1: slots 0-5461
├─ Master 2: slots 5462-10922
└─ Master 3: slots 10923-16383

Hash slot calculation:
HASH_SLOT(key) = CRC16(key) % 16384

Replica:
├─ Master 1 → Slave 1
├─ Master 2 → Slave 2
└─ Master 3 → Slave 3
```

### Client Access

```
Client sends: GET user:123

1. Calculate hash slot
2. Route to responsible node
3. Get from cache
4. Return value

Latency: < 1ms
```

## Sharding Strategy

### Consistent Hashing (Better)

```
Nodes on ring:
Node A at 10
Node B at 100
Node C at 200

Key space hashed to ring:
key:1 (hash 45) → Node B
key:2 (hash 150) → Node C
key:3 (hash 250) → Node A

Add Node D (at 150):
└─ Only keys between C and D rebalance
└─ A and B unaffected
```

### Slot-Based Sharding (Redis)

```
16384 slots distributed to nodes
Client calculates slot from key
Routes to node owning that slot

Advantage over consistent hashing:
├─ Predictable (slots don't float)
├─ Easy rebalancing (move slots)
└─ Simpler topology
```

## High Availability

### Replication

```
Master: Handles writes and reads
Slave: Handles reads only

Client writes → Master
Master replicates to Slaves
Client reads → Any node (Master or Slave)

Benefit:
└─ Master not bottleneck on reads
```

### Failover

```
Master dies
    ↓
Sentinel detects (no heartbeat)
    ↓
Sentinel elects new Master from Slaves
├─ Choose replica most synced
└─ Promote to Master
    ↓
Clients redirected to new Master

Downtime: ~5 seconds (automated)
```

## Eviction Policies

When cache full:

```
Redis max-memory: 100GB
Current usage: 100GB
New write: 10MB

Problem: No space!

Solution: Eviction policy
├─ LRU: Remove least recently used
├─ LFU: Remove least frequently used
├─ TTL: Remove expired keys
└─ Random: Remove random key
```

### Configuration

```
maxmemory: 100gb
maxmemory-policy: allkeys-lru

Result:
├─ Cache max 100GB
├─ When full: Remove least recently used
└─ Make space for new writes
```

## TTL & Expiration

### Setting Expiration

```
SET user:123 "data" EX 3600
                         ↓
                    TTL: 1 hour

After 1 hour:
└─ Key automatically deleted
└─ Memory reclaimed
```

### Lazy Expiration

```
GET user:123
1. Key exists?
2. Check if expired
3. If expired: delete and return nil
4. If not: return value

On access: Check expiration
```

### Active Expiration

```
Background task (every 100ms):
├─ Sample 20 random keys
├─ Delete expired ones
├─ If > 25% expired: sample more
└─ Reclaim memory

Lazy + Active = balanced approach
```

## Consistency & Staleness

### Eventual Consistency

```
Write to Master:
└─ Acknowledged immediately

Replicate to Slaves:
└─ Async (seconds delay)

If read from Slave:
└─ May get stale data

Tradeoff: Fast writes, possible staleness
```

### Options for Consistency

```
Strong consistency:
- Write to Master
- Wait for all Slaves
- Then acknowledge
- Slow writes, consistent reads

Eventual consistency:
- Write to Master
- Acknowledge immediately
- Replicate async
- Fast writes, stale reads possible
```

## Cache Patterns

### Cache-Aside

```
Request for user:123:
1. Check cache: Hit → return
2. Miss → Query DB
3. Store in cache
4. Return value
```

### Write-Through

```
Update user:123:
1. Update cache
2. Write to DB (wait)
3. Return success
Slower but consistent
```

### Write-Behind (Write-Back)

```
Update user:123:
1. Update cache
2. Queue DB write (async)
3. Return immediately
Faster but risk of data loss
```

## Database Schema

```sql
-- Cache metadata (optional, on primary DB)
CREATE TABLE cache_stats (
  key VARCHAR(500),
  hit_count INT,
  last_accessed TIMESTAMP,
  created_at TIMESTAMP,
  ttl_seconds INT
);

-- Cache invalidation log (optional)
CREATE TABLE cache_invalidation (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  key VARCHAR(500),
  reason VARCHAR(100),
  timestamp TIMESTAMP
);
```

## Monitoring Cache Health

### Key Metrics

```
Hit rate: % of requests served from cache
└─ Target: > 80%

Eviction rate: Keys removed due to space
└─ High = cache too small

Memory usage: Current usage vs limit
└─ Monitor for growth

Latency: Time to get/set
└─ Target: < 5ms
```

## Distributed Transactions

```
Challenge:
Update cache[key1] and cache[key2]

Both should succeed or both fail
```

### Optimistic Locking

```
1. Read value with version
2. Modify value
3. Write back if version unchanged
4. If changed: Retry

Prevents conflicting updates
```

### Pessimistic Locking

```
1. Lock key
2. Read value
3. Modify value
4. Write value
5. Unlock

Prevents conflicts but slower
```

## Interview Tips

✓ Discuss hash slot vs consistent hashing
✓ Explain replication and failover
✓ Address eviction policies
✓ Discuss TTL and expiration
✓ Explain cache patterns
✓ Mention consistency trade-offs
✓ Address monitoring and health
✓ Discuss failure scenarios

❌ Don't ignore consistency
❌ Don't forget TTL management
❌ Don't skip eviction strategy
❌ Don't ignore monitoring

---

**Next:** Analytics system design.

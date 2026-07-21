# System Design: Key-Value Store

**Read time:** 11 min | **Difficulty:** Medium-Hard

## Problem Statement

Design a distributed key-value store (like Redis, DynamoDB).

### Requirements

- Store and retrieve data by key
- Support multiple data types
- Distributed across servers
- Handle failures
- Consistent replication
- High throughput

## Core Operations

```
PUT(key, value)      // Store
GET(key)             // Retrieve
DELETE(key)          // Remove
UPDATE(key, value)   // Modify
```

## Data Structures

```
Redis supports:
├─ Strings: "value"
├─ Lists: [1, 2, 3]
├─ Sets: {a, b, c}
├─ Sorted Sets: {(1, a), (2, b)}
├─ Hashes: {field: value}
└─ Streams: append-only log

Flexibility enables:
├─ Caching
├─ Counters
├─ Leaderboards
├─ Message queues
└─ Session storage
```

## Sharding Strategy

### Hash-Based Sharding

```
key = "user:123:profile"
hash(key) = 42
shard_id = 42 % 10 = 2

Route to: Shard 2
```

### Consistent Hashing

```
Ring of 360 positions:
[0, 1, 2, ..., 359]

Nodes: A (at 10), B (at 100), C (at 250)

Key "user:123": hash=45
└─ Falls between 10 and 100
└─ Route to node B

Add node D (at 180):
└─ Only keys between 100-180 move
└─ Other keys unaffected

Benefit: Minimal rebalancing on node change
```

## Replication

### Master-Slave

```
Write:
Master: PUT key=value
    ↓
Replicate to Slave 1, Slave 2
    ↓
Acknowledge after all replicate

Read:
Load-balance to any (Master or Slave)
├─ Slave 1 reads: faster (parallel)
└─ Slave 2 reads: faster (parallel)
```

### Durability

```
Persistence options:
1. RDB (snapshot): Periodic disk save
   └─ Fast recovery, data loss possible

2. AOF (append-only file): Log every write
   └─ Durable, slower writes

3. Hybrid: RDB + AOF
   └─ Best of both (more complex)
```

## Consistency Models

### Eventual Consistency (Default)

```
Write to Master:
└─ Immediately acknowledged

Replicates to Slaves:
└─ Seconds later (async)

During replication lag:
├─ Master has new value
├─ Slaves have old value
└─ Read from slave may get stale data
```

### Strong Consistency (Expensive)

```
Write to Master:
├─ Replicate to all slaves (wait)
├─ All acknowledge
└─ Then acknowledge client

Slower (wait for all replicas)
But guaranteed consistency
```

## Failure Handling

### Master Failure

```
Master down
    ↓
Promote Slave 1 to Master
    ↓
Slave 2 reconnects to new Master
    ↓
Old Master comes back:
└─ Demote to Slave (catch up on changes)
```

### Automatic Failover

```
ZooKeeper monitors Master
Master dies (no heartbeat for 30 seconds)
    ↓
ZooKeeper triggers failover:
1. Select best Slave (most up-to-date)
2. Promote to Master
3. Clients reconnect to new Master
4. Notify ops team

Downtime: < 1 minute (automated)
```

## Eviction Policies

When memory full:

```
LRU (Least Recently Used):
├─ Remove least recently accessed key
└─ Good for caches

LFU (Least Frequently Used):
├─ Remove least frequently used key
└─ Better for some patterns

FIFO (First In First Out):
├─ Remove oldest key
└─ Simple but less optimal

TTL-based:
├─ Remove expired keys first
└─ Most common approach
```

## Implementation Details

### In-Memory Storage

```
Hash table for O(1) lookup:
key_hash(user:123) = index_5
values[5] = {value: "...", expire_at: 123456}

Lookup:
hash("user:123") → index
values[index] → {value, expire_at}
Check expiration
Return value
```

### Expiration

### Background deletion:
```
Every 100ms:
├─ Sample random keys
├─ Delete expired ones
└─ Reclaim memory
```

Lazy deletion:
```
On access:
├─ Check expiration time
├─ If expired: delete and return null
└─ If not: return value
```

## Database Schema (for persistence)

```sql
-- Key-value pairs
CREATE TABLE kv_pairs (
  key VARCHAR(500) PRIMARY KEY,
  value BLOB,
  expires_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE INDEX idx_expires 
  ON kv_pairs(expires_at) WHERE expires_at IS NOT NULL;

-- Change log (for replication)
CREATE TABLE change_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  key VARCHAR(500),
  operation ENUM('PUT', 'DELETE', 'UPDATE'),
  value BLOB,
  timestamp TIMESTAMP
);

CREATE INDEX idx_timestamp 
  ON change_log(timestamp);
```

## Operations

### Throughput Optimization

```
Single-threaded processing:
├─ One request at a time
├─ Simple but slow
└─ ~10K ops/second

Multi-threaded with lock-free:
├─ Multiple threads
├─ Atomic operations
└─ ~1M ops/second

In-memory + optimization:
└─ ~10M ops/second possible
```

### Latency

```
In-memory access: < 1µs
Network round-trip: ~1ms
Disk I/O: ~10ms

Key: Keep hot data in memory
```

## Distributed Transactions

### Challenge

```
Transaction spans multiple keys:
PUT key1 = value1
PUT key2 = value2

Both succeed, or both fail

But keys may be on different shards!
```

### Solution 1: Two-Phase Commit

```
1. Prepare phase: Lock keys, validate
2. Commit phase: Apply changes
3. If any fails: Rollback

Drawback: Slow, blocking
```

### Solution 2: Eventual Consistency

```
PUT key1 = value1 (succeeds)
PUT key2 = value2 (succeeds)

If one fails:
└─ Compensate (undo previous)
└─ Async retry

Accept temporary inconsistency
```

## Interview Tips

✓ Discuss sharding and consistent hashing
✓ Explain replication strategy
✓ Address failure handling
✓ Discuss consistency models
✓ Mention eviction policies
✓ Explain expiration handling
✓ Address distributed transactions
✓ Discuss throughput optimization

❌ Don't ignore sharding rebalancing
❌ Don't forget failure handling
❌ Don't skip expiration logic
❌ Don't ignore transaction handling

---

**Next:** Message queue design.

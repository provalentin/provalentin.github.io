# Database Design & Sharding Strategies

**Read time:** 15 min | **Difficulty:** Medium-Hard

## Database Fundamentals

### SQL vs NoSQL

**SQL (Relational)**
- Structured schema (predefined columns)
- ACID: Atomicity, Consistency, Isolation, Durability
- Joins across tables
- Strong consistency
- Examples: PostgreSQL, MySQL, Oracle

```sql
CREATE TABLE users (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  age INT
);
```

**NoSQL (Non-relational)**
- Flexible schema (dynamic columns)
- Eventual consistency
- Fast writes, scalable
- No joins (denormalization)
- Examples: MongoDB, Cassandra, DynamoDB

```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "metadata": {...}
}
```

### When to Choose

| Scenario | Choice |
|----------|--------|
| Structured data, complex queries | SQL |
| High write throughput | NoSQL |
| Need transactions | SQL |
| Flexible schema | NoSQL |
| Strong consistency required | SQL |
| Eventual consistency okay | NoSQL |

## Database Replication

### Master-Slave (Master-Replica)
```
     Master (Write)
       ↙      ↘
   Slave 1   Slave 2 (Read)
   (Read)    (Read)
```

- Master handles all writes
- Replicas handle reads
- Async replication lag (seconds)
- Slave fails → still have master

**Problem:** Master fails → can't write

### Master-Master (Multi-Master)
```
    Master A ←→ Master B
    (Read/Write) (Read/Write)
        ↓          ↓
    Slave 1      Slave 2
```

- Both accept writes
- Sync with each other
- Better availability
- Risk: Write conflicts

**Conflict Resolution:** Last-write-wins or application logic

## Sharding (Horizontal Partitioning)

Scale database by partitioning data across multiple instances.

### Sharding Strategy

**Range-Based Sharding**
```
User ID 1-1M → Shard 1
User ID 1M-2M → Shard 2
User ID 2M-3M → Shard 3
```

Pros: Easy to understand
Cons: Uneven distribution (hot shards)

**Hash-Based Sharding**
```
hash(user_id) % num_shards = shard_index

hash(user_id=123) % 3 = 1 → Shard 1
hash(user_id=456) % 3 = 2 → Shard 2
```

Pros: Even distribution
Cons: Rebalancing hard when adding shards

**Directory-Based Sharding**
```
Lookup Service
user_id → shard_index

user_id=123 → Shard 2
user_id=456 → Shard 1
```

Pros: Flexible, easy rebalancing
Cons: Extra lookup, single point of failure

### Shard Key Selection

Choose column that:
- Distributes evenly (avoid hotspots)
- Rarely changes (queries don't change)
- Is immutable after creation

```
❌ Bad: shard by timestamp (all writes to one shard)
✓ Good: shard by user_id (even distribution)
```

### Challenges

**Cross-Shard Queries**
- Query needs to touch multiple shards
- Slower than single shard
- Example: "Get top 10 posts across all users"

```
Request → Shard 1 (top 10 posts)
        → Shard 2 (top 10 posts)
        → Shard 3 (top 10 posts)
Merge results → Top 10 overall
```

**Distributed Transactions**
- Transaction spans multiple shards
- Complex, 2-phase commit slow
- Better: Redesign to avoid need

**Resharding**
- Add new shards → redistribute data
- Downtime or shadow writes needed
- Complex operational challenge

```
Before: 3 shards (hash % 3)
After: 4 shards (hash % 4)
Need to copy ~25% of data between shards
```

## Indexing

Improve query speed without changing data:

### B-Tree Index (Default)
```
Index on user_id
Lookup user_id=123 → O(log n)
Range query: id > 100 and id < 200 → O(log n + results)
```

### Hash Index
```
Hash index on email
Lookup email='alice@example.com' → O(1)
Problem: Can't do range queries
```

### Full-Text Index (Elasticsearch)
```
Index on description
Search "machine learning" → O(1)
Returns all documents matching
```

### Strategy
- Index frequently queried columns
- Index foreign keys (joins)
- Avoid over-indexing (slower writes)
- Monitor query performance

## Connection Pooling

Database connections are expensive:

```
Without pooling:
Request 1: Create connection → Query → Close
Request 2: Create connection → Query → Close (slow!)

With pooling:
Pool: [Connection 1, Connection 2, Connection 3]
Request 1: Borrow Connection 1 → Query → Return
Request 2: Borrow Connection 2 → Query → Return (fast!)
```

## Caching Layer

Databases are slow compared to memory:

```
Request → Cache (Redis) → Hit: return (1ms)
Request → Cache (miss) → DB → Cache → Return (100ms)
```

### Cache Patterns

**Write-Through**
- Write to cache and DB
- Strong consistency
- Slower writes

**Write-Behind (Write-Back)**
- Write to cache first
- Async write to DB
- Risk: Data loss if crash

**Refresh-Ahead**
- Proactively refresh cache before expiry
- Avoid cache miss
- Complex to implement

## Database Normalization

### 1NF: Atomic Values
```
❌ Bad:
users: id | name | hobbies (list)

✓ Good:
users: id | name
hobbies: user_id | hobby
```

### 2NF: Remove Partial Dependencies
```
❌ Bad:
orders: order_id | customer_id | customer_name

✓ Good:
orders: order_id | customer_id
customers: customer_id | customer_name
```

### Trade-off: Denormalization
- Join operations are slow
- Denormalize for performance
- Accept data redundancy
- Example: Store user_name in order (avoid join)

## Interview Tips

✓ Discuss SQL vs NoSQL trade-offs
✓ Explain sharding strategy and shard key
✓ Address replication for HA
✓ Mention indexing strategy
✓ Discuss consistency vs availability

❌ Don't forget replication/backup
❌ Don't choose shard key carelessly
❌ Don't over-normalize (slow queries)
❌ Don't under-index (slow queries)

---

**Next:** Caching strategies for distributed systems.

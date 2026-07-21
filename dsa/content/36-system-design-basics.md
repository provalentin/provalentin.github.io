# System Design Fundamentals: Scalability Concepts

**Read time:** 14 min | **Difficulty:** Medium-Hard

## What is System Design?

System design is the process of defining the architecture and components of a large-scale system that is efficient, scalable, and maintainable. It's about making trade-offs between requirements like scalability, availability, consistency, and latency.

## Key Requirements

### Functional Requirements
- What the system must do
- Example: "Users should be able to upload photos"

### Non-Functional Requirements
- How well it should do it
- **Scalability:** Handle millions of users
- **Availability:** 99.99% uptime
- **Latency:** Response time < 200ms
- **Consistency:** Data accuracy across regions

## Scalability Concepts

### Horizontal vs Vertical Scaling

**Vertical Scaling (Scale Up)**
- Add more CPU, RAM to existing server
- Easier to implement
- Has a physical limit
- Example: Server with 8 cores → 16 cores

```
Single powerful machine
Server: 256GB RAM, 64 cores
Pros: Simple, no coordination
Cons: Limited, single point of failure
```

**Horizontal Scaling (Scale Out)**
- Add more machines to handle load
- Unlimited scaling potential
- Requires load balancing & coordination
- Example: 1 server → 10 servers → 100 servers

```
Multiple machines
Servers: 10 machines × 16GB RAM each
Pros: Unlimited, fault tolerance
Cons: Complex, coordination needed
```

## Core Metrics

### Throughput
- Requests per second (RPS)
- How much work can system do
- Example: Handle 10,000 RPS

```
Throughput = Total Requests / Total Time
100,000 requests / 10 seconds = 10,000 RPS
```

### Latency
- Time to process one request (milliseconds)
- End-to-end response time
- Example: p50=100ms, p99=500ms

```
p50 (median): 50% of requests finish in 100ms
p95: 95% of requests finish in 200ms
p99: 99% of requests finish in 500ms
p999: 99.9% finish in 1000ms
```

### Availability
- System is operational and accessible
- Measured as percentage uptime
- Example: 99.9% = 43 minutes downtime/month

```
99.0% = 7.2 hours downtime/year
99.9% = 43.2 minutes downtime/year
99.99% = 4.3 minutes downtime/year
99.999% = 26 seconds downtime/year
```

## Common Patterns

### Caching
- Store frequently accessed data in memory
- Reduce database load
- Trade consistency for speed

```
Request → Cache (check) → Hit: return immediately
Request → Cache (miss) → Database → Cache → Return
```

### Sharding
- Partition data across multiple databases
- Scale database horizontally
- Route requests to correct shard

```
User ID = 1-1M → Shard 1
User ID = 1M-2M → Shard 2
User ID = 2M-3M → Shard 3
```

### Replication
- Copy data across multiple servers
- Improve availability and read throughput
- Trade consistency for availability

```
Primary (Write) ← → Replica 1 (Read)
                ← → Replica 2 (Read)
                ← → Replica 3 (Read)
```

## Trade-offs: CAP Theorem

You can guarantee 2 of 3 properties:

**Consistency (C)**
- All nodes see same data at same time
- Strong consistency, no stale data

**Availability (A)**
- System is always operational
- Returns response even if stale

**Partition Tolerance (P)**
- System works despite network failures
- Servers can't communicate

### Common Choices

| System | Choice | Trade-off |
|--------|--------|-----------|
| Database (SQL) | CP | Sacrifice availability for consistency |
| Cache (Redis) | AP | Sacrifice consistency for availability |
| Twitter Feed | AP | Occasional stale data okay |
| Banking | CP | Never show wrong balance |

## Technology Stack

### Databases
- **SQL:** PostgreSQL, MySQL (ACID, strong consistency)
- **NoSQL:** MongoDB, Cassandra (flexible, eventual consistency)
- **Cache:** Redis, Memcached (fast, temporary storage)

### Message Queues
- **RabbitMQ, Kafka:** Decouple services, async processing
- Handle bursts of traffic
- Enable event-driven architecture

### Search Engines
- **Elasticsearch:** Full-text search, analytics
- Faster than database queries
- Runs in parallel with database

### Storage
- **S3/Blob Storage:** Unlimited scale for files
- **CDN:** Distribute content globally
- **Database:** Structured data

## Interview Tips

✓ Start simple, add complexity gradually
✓ Discuss trade-offs for each decision
✓ Estimate numbers (users, data size, traffic)
✓ Identify bottlenecks before solutions
✓ Explain why you chose each component

❌ Don't jump to complex solutions
❌ Don't ignore single points of failure
❌ Don't assume infinite resources
❌ Don't design for current needs only

---

**Next:** Learn about load balancing and distributed systems architecture.

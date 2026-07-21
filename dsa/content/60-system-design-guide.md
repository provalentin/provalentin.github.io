# System Design Interview Guide

**Read time:** 11 min | **Critical:** Yes

## Interview Structure (45-60 minutes)

### Phase 1: Clarify Requirements (5 min)

```
"Design an e-commerce platform"
    ↓
Ask clarifying questions:
├─ Scale: How many users? Products?
├─ Geography: Single region or global?
├─ Core features: Search, checkout, payments?
├─ Load: Read-heavy? Write-heavy?
└─ Latency: Real-time or eventual?

Example questions:
├─ "Should I focus on search or checkout?"
├─ "How many transactions per second?"
├─ "Do we need real-time inventory?"
└─ "Is payment processing critical?"
```

### Phase 2: Back-of-Envelope Estimation (5 min)

```
Calculate scale:
├─ Users: 1B
├─ Daily active: 100M
├─ Requests per second: 1M
├─ Storage: 100TB
├─ Bandwidth: 10Gbps

Why estimate?
├─ Understand constraints
├─ Identify bottlenecks
└─ Guide architecture decisions
```

### Phase 3: High-Level Design (10-15 min)

```
Draw boxes and arrows:
Client → Load Balancer → Web Servers → Database

Components:
├─ API Gateway / Load Balancer
├─ Web/Application servers
├─ Cache layer (Redis)
├─ Database (SQL/NoSQL)
├─ Message queue
└─ Search engine

Don't go deep yet:
└─ Keep boxes simple, explain flow
```

### Phase 4: Deep Dive (20-30 min)

```
Interviewer asks: "Tell me more about X"
    ↓
Pick one component and go deep:

Option 1: Database
├─ Schema design
├─ Indexing strategy
├─ Sharding approach
└─ Replication for HA

Option 2: Caching
├─ What to cache
├─ Eviction policy
├─ Consistency strategy
└─ Distributed cache

Option 3: Search
├─ Inverted index
├─ Full-text search
├─ Ranking algorithm
└─ Query optimization

Option 4: Scalability
├─ Sharding strategy
├─ Load balancing
├─ Auto-scaling
└─ Bottleneck identification
```

### Phase 5: Trade-offs & Wrap-up (5-10 min)

```
Discuss choices made:
├─ SQL vs NoSQL (why?)
├─ Consistency vs Availability (CAP theorem)
├─ Latency vs Throughput
├─ Cost vs Performance

Ask for feedback:
└─ "What would you do differently?"
```

## Key Questions to Ask

### Functional Requirements

```
What should the system do?
├─ Core features (must have)
├─ Secondary features (nice to have)
└─ Out of scope (explicitly exclude)

Example:
├─ Must: Create posts, view timeline
├─ Nice: Search, recommendations
└─ Out of scope: Video uploads, live streaming
```

### Non-Functional Requirements

```
How should the system perform?
├─ Scale: How many users/requests?
├─ Latency: Response time?
├─ Availability: Uptime %?
├─ Consistency: Data accuracy?
└─ Durability: Data loss tolerance?

Example:
├─ 1M concurrent users
├─ < 100ms latency
├─ 99.9% availability
└─ Strong consistency
```

### Constraints

```
What are the limitations?
├─ Budget constraints?
├─ Geographic regions?
├─ Technology stack?
└─ Legacy systems?

Example:
├─ No external APIs
├─ AWS only
├─ Single region
└─ Must use PostgreSQL
```

## Estimation Techniques

### QPS (Queries Per Second)

```
100M daily active users
Each user makes 10 requests per day
(browsing, 5 min sessions, refresh)

100M × 10 = 1B requests/day
1B / (24 × 3600) = 11,574 QPS

Peak: assume 3x average = 35K QPS
```

### Storage

```
1M new records per day
Each record: 1KB
1 year: 365M records
365M × 1KB = 365GB per year

5 years: 1.8TB (small)
10 years: 3.6TB (manageable)
```

### Bandwidth

```
1M concurrent users
Average download: 1MB per minute
1M × 1MB = 1TB/minute = 16.6 Gbps
```

## Database Decisions

### SQL vs NoSQL

```
Choose SQL when:
├─ Complex queries/joins needed
├─ ACID transactions required
├─ Structured schema
└─ Strong consistency needed

Choose NoSQL when:
├─ Massive scale (horizontal)
├─ Unstructured data
├─ Fast writes important
└─ Eventual consistency acceptable
```

### Schema Design

```
Normalize for:
├─ No data redundancy
├─ Easier updates
└─ Smaller storage

Denormalize for:
├─ Faster queries (no joins)
├─ Better performance
└─ Suitable for big data
```

## Caching Strategy

### What to Cache

```
Hot data:
├─ Frequently accessed (top 20% reads)
├─ Slow to compute
└─ OK if slightly stale

Cold data:
└─ Rarely accessed
└─ Not worth cache space
```

### Cache Invalidation

```
Strategies:
1. TTL (time-based)
   ├─ Cache 1 hour
   └─ Automatic expiration

2. Event-based
   ├─ On data update: invalidate cache
   └─ Manual but accurate

3. LRU (least recently used)
   ├─ Remove oldest if full
   └─ Automatic, predictable
```

## API Design

### RESTful

```
Endpoints:
GET /users/123
POST /users
PUT /users/123
DELETE /users/123

Benefits:
├─ Simple, standard
├─ Easy to understand
└─ HTTP verbs clear
```

### Pagination

```
GET /posts?limit=10&offset=20

Offset approach:
├─ Simple but inefficient with deletes
└─ OK for small datasets

Cursor approach:
├─ cursor = "post_id_456"
├─ More efficient at scale
└─ Better for real-time
```

## Consistency Models

### Strong Consistency

```
Write complete → All reads see new value
Example: Banking (never show wrong balance)
Cost: Slower (must sync replicas)
```

### Eventual Consistency

```
Write complete → Reads slowly see new value (seconds)
Example: Social media (okay if post delayed)
Benefit: Faster writes, available during partitions
```

### Causal Consistency

```
Related operations ordered correctly
Example: Comments (replies see parent)
Balance: Between strong and eventual
```

## Dealing with Bottlenecks

### Identify Bottleneck

```
CPU bottleneck:
├─ Optimize algorithm
├─ Parallel processing
└─ Add more servers

Memory bottleneck:
├─ Use compression
├─ Cache less data
└─ Move to disk (slower but cheaper)

I/O bottleneck (database):
├─ Add cache
├─ Optimize queries
├─ Shard database
└─ Denormalize

Network bottleneck:
├─ Use CDN
├─ Compression
└─ Reduce packet size
```

## Microservices vs Monolith

### Monolith: Start here

```
Advantages:
├─ Simpler to build
├─ Easier to test
├─ Single deployment
└─ Better performance (no RPC)

Disadvantages:
├─ Scales as single unit
├─ Technology lock-in
└─ Harder to deploy changes
```

### Microservices: After growth

```
Advantages:
├─ Independent scaling
├─ Technology flexibility
├─ Faster deployment
└─ Fault isolation

Disadvantages:
├─ Operational complexity
├─ Distributed tracing hard
├─ Data consistency issues
└─ Network latency
```

## Common Pitfalls

### ❌ Over-engineering

```
Problem: Designing for 1B users when problem is 1M
Solution: Start simple, optimize where needed
Ask: "What's the actual scale?"
```

### ❌ Ignoring Edge Cases

```
Problem: Forgot about single user edge case
Solution: Ask about constraints upfront
Ask: "What about X scenario?"
```

### ❌ Single Points of Failure

```
Problem: Only one database server
Solution: Always replicate/backup
"How do we handle failure of this component?"
```

### ❌ No Monitoring Plan

```
Problem: System fails, can't debug
Solution: Plan observability from start
"How would we know if this breaks?"
```

### ❌ Ignoring Security

```
Problem: No encryption, no access control
Solution: Mention security from start
"What are the security requirements?"
```

## Interview Tips

✓ **Clarify first:** Ask clarifying questions
✓ **Estimate early:** Do back-of-envelope math
✓ **Start simple:** Draw basic boxes first
✓ **Explain trade-offs:** Why this choice?
✓ **Go deep:** Be ready to deep-dive one area
✓ **Communicate:** Explain as you draw
✓ **Be flexible:** Adapt to interviewer feedback
✓ **Ask for input:** "Does this approach sound good?"

## What Interviewers Look For

1. **Communication**
   - Can explain clearly?
   - Listens to feedback?

2. **Analysis**
   - Identifies key issues?
   - Estimates correctly?

3. **Trade-offs**
   - Discusses pros/cons?
   - Makes reasoned choices?

4. **Depth**
   - Can go deep when asked?
   - Knows implementation details?

5. **Scalability**
   - Handles scale correctly?
   - Identifies bottlenecks?

## Sample Interview Response

```
Problem: Design Uber

Step 1: Clarify
"Focusing on ride matching. 10M daily active,
1M concurrent active rides, < 10 second matching."

Step 2: Estimate
"1M concurrent → geohashing for location,
WebSocket for real-time, matching service."

Step 3: High-level
[Draw: Driver app → API → Matching service → DB]

Step 4: Deep dive
"Matching algorithm uses geohashing, ranks by
distance and rating. Handle celebrity drivers
with no fanout. Store driver locations in Redis."

Step 5: Trade-offs
"Chose geohash (fast lookup) over quadtree (more accurate).
Eventual consistency on location (okay for 10 sec matching)."
```

---

**Remember:** There's no single "correct" answer. Interviewers want to see your **thinking process** and **communication** skills.

Good luck with your interviews! 🎯

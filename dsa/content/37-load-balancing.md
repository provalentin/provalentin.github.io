# Load Balancing & Distributed Systems

**Read time:** 13 min | **Difficulty:** Medium-Hard

## What is Load Balancing?

Load balancing distributes incoming requests across multiple servers to optimize resource utilization, maximize throughput, minimize latency, and ensure fault tolerance.

```
Client Requests
        ↓
   Load Balancer
   ↙      ↓      ↘
Server 1  Server 2  Server 3
```

## Why Load Balancing Matters

- Single server has finite capacity
- Distribute load for better performance
- One server fails → others still serve traffic
- Scale horizontally with confidence

## Load Balancing Algorithms

### Round Robin
- Distribute requests in order: S1, S2, S3, S1, S2...
- Simple, fair distribution
- Ignores server capacity

```
Request 1 → Server 1
Request 2 → Server 2
Request 3 → Server 3
Request 4 → Server 1 (cycle)
```

### Weighted Round Robin
- Give different weights to servers
- Fast servers get more traffic
- S1 (weight 2) gets 2 requests per S2 (weight 1)

```
Server 1 (capacity 8GB): weight 3
Server 2 (capacity 4GB): weight 1

3:1:3:1:3:1... pattern
```

### Least Connections
- Route to server with fewest active connections
- Good for long-lived connections
- Example: Chat applications

```
Before: Connections on S1=10, S2=5, S3=8
New request → S2 (fewest: 5)
```

### IP Hash
- Hash client IP, always route to same server
- Enables session persistence
- Client sees consistent experience

```
hash(client_ip) % num_servers = server_index
Client 192.168.1.1 → Always Server 2
```

### Least Response Time
- Route to server with lowest average response time
- More sophisticated, requires monitoring
- Best performance but complex

```
S1: avg 50ms, S2: avg 100ms, S3: avg 75ms
New request → S1 (fastest)
```

## Load Balancer Types

### Layer 4 (Transport)
- Works with TCP/UDP
- Operates at connection level
- Very fast, limited functionality
- Example: Hardware load balancers

```
LB at Layer 4 (TCP)
├─ Direct traffic by IP:Port
├─ No content inspection
└─ Fastest performance
```

### Layer 7 (Application)
- Works with HTTP/HTTPS
- Can inspect content (URLs, headers)
- More intelligent routing
- Slightly slower but flexible

```
LB at Layer 7 (HTTP)
├─ Route by URL path: /api → Backend A
├─ Route by hostname: api.com → Backend A
├─ Route by request headers
└─ Can modify requests/responses
```

## Architecture Patterns

### Single Load Balancer (SPOF)
```
      LB (Single Point of Failure)
      ↙      ↓      ↘
   Server 1  Server 2  Server 3
```

Problem: If LB fails, all traffic fails

### HA Load Balancers (Recommended)
```
  LB 1 (Active) ← → LB 2 (Standby)
        ↓
  Shared VIP (Virtual IP)
  Automatic failover
```

- Multiple load balancers in HA mode
- One active, others standby
- Shared virtual IP
- Automatic failover if primary fails

### Global Load Balancing
```
                  Global LB (DNS)
                  ↙             ↘
        Regional LB (US)    Regional LB (EU)
        ↙    ↓    ↘          ↙    ↓    ↘
      S1   S2   S3        S1'  S2'  S3'
```

- Route based on geography
- Reduce latency for users
- Disaster recovery across regions

## Session Management

### Challenge
- User connects to Server A, session created
- Next request goes to Server B
- Server B doesn't know about session!

### Solutions

**Session Persistence (Sticky Sessions)**
- Route same client to same server (IP Hash)
- Simple but reduces load balancing
- If server dies, session lost

```
Client IP Hash → Always Server 2
Problem: Server 2 dies = Session lost
```

**Distributed Session Storage**
- Store sessions in Redis/Memcached
- All servers can access session data
- Better fault tolerance

```
Server A creates session → Redis
Server B reads session → Redis
Server C updates session → Redis
```

**Stateless Design (Best)**
- Put session data in client (JWT token)
- Server doesn't store sessions
- Scales infinitely, no state sync needed

```
Client: JWT token with user info
Server: Verify JWT, no storage needed
Works across any server
```

## Health Checks

Load balancer regularly checks if servers are healthy:

```
LB → Server 1: ping
     Server 1: pong ✓ (healthy)
LB → Server 2: ping
     Server 2: timeout ✗ (unhealthy)
     Stop sending traffic to Server 2
```

### Types

**Passive Checks**
- Monitor responses to real traffic
- If server errors, mark unhealthy

**Active Checks**
- LB sends regular health requests
- Example: GET /health → expect 200 OK
- Remove unhealthy servers automatically

## Rate Limiting

Prevent single client from overwhelming system:

```
LB applies rate limit: 1000 req/sec per client
Client A: 500 req/sec → allowed
Client B: 2000 req/sec → reject excess
```

Common strategies:
- Token bucket algorithm
- Leaky bucket
- Fixed window counter

## Choosing a Load Balancer

| LB Type | Use Case | Example |
|---------|----------|---------|
| Hardware (L4) | Extreme throughput, ISP-scale | F5, Citrix |
| Software (L7) | Web applications | Nginx, HAProxy |
| Cloud LB | AWS/GCP deployment | ALB, GCP LB |
| CDN LB | Global distribution | CloudFlare, Akamai |

## Interview Tips

✓ Understand trade-offs (complexity vs performance)
✓ Discuss session management strategy
✓ Mention health checks and failover
✓ Choose LB algorithm for your use case
✓ Design HA load balancer setup

❌ Don't ignore single point of failure
❌ Don't forget session persistence
❌ Don't over-engineer for current needs
❌ Don't ignore monitoring

---

**Next:** Database design and sharding strategies.

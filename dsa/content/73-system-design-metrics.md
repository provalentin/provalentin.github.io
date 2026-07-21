# System Design: Metrics & Calculations Reference

**Read time:** 9 min | **Reference:** Yes

## Back-of-Envelope Math

### Time Conversions

```
1 second = 1,000 milliseconds (ms)
1 ms = 1,000 microseconds (µs)
1 µs = 1,000 nanoseconds (ns)

1 minute = 60 seconds
1 hour = 3,600 seconds
1 day = 86,400 seconds
```

### Data Size Conversions

```
1 KB = 1,024 bytes
1 MB = 1,024 KB
1 GB = 1,024 MB
1 TB = 1,024 GB
1 PB = 1,024 TB

Quick: 10^3, 10^6, 10^9, 10^12, 10^15
```

## Latency Numbers (2023)

```
L1 cache reference:           1 ns
L2 cache reference:           4 ns
L3 cache reference:          12 ns
Main memory access:         100 ns
SSD random read:          50,000 ns (50 µs)
HDD random read:       10,000,000 ns (10 ms)
Cross-datacenter latency: 100,000,000 ns (100 ms)

Memory: 1 ns
Disk: 10,000x slower (10 ms)
Network: 1,000,000x slower (100 ms)
```

## Throughput Calculations

### Requests Per Second (RPS)

```
Users: 1,000,000
Daily: 1,000,000 users × 10 requests = 10,000,000 requests/day
Per second: 10,000,000 / 86,400 = 115 RPS

Peak (3x average): 345 RPS
```

### QPS from DAU

```
DAU (Daily Active Users): 100,000,000
Avg requests per user per day: 20
Total daily requests: 2,000,000,000
Per second: 2B / 86,400 = ~23,148 RPS

Peak (3-5x): 69,444 - 115,740 RPS
```

### Bandwidth

```
RPS: 100,000
Avg response size: 1 MB
Bandwidth: 100K × 1MB = 100 GB/sec = 800 Gbps

1 Gbps = 125 MB/sec = 125,000,000 bytes/sec
```

## Storage Calculations

### Per Day

```
Events: 1,000,000,000/day
Size per event: 1 KB
Total: 1,000,000,000 KB = 1 TB/day

Per month: 30 TB
Per year: 365 TB
Per decade: 3.65 PB
```

### User Data

```
Users: 1,000,000,000 (1B)
Data per user: 10 KB
Total: 10 TB

With profile, photos: 100 KB per user
Total: 100 TB
```

## Availability & Downtime

```
99.0%:    3.65 days/year    = 7.2 hours/month
99.9%:    8.76 hours/year   = 43 minutes/month
99.99%:   52.6 minutes/year = 4.3 minutes/month
99.999%:  5.26 minutes/year = 26 seconds/month

99.9% needs: 1 extra 9s for redundancy
99.99% needs: 2-3 extra 9s (multiple datacenters)
```

## Network Calculations

### Bandwidth per Server

```
1 Gbps network card
100,000 users per server
Bandwidth per user: 1 Gbps / 100,000 = 10 Kbps

If each user needs 100 Kbps streaming:
Max users: 1 Gbps / 100 Kbps = 10,000 users

Server can handle 10,000 concurrent connections at 100 Kbps each
```

### Connection Limits

```
Typical OS: 65,536 TCP ports available
Server can handle: 50,000-100,000 concurrent connections

Practical with multiplexing (WebSocket):
├─ HTTP Keep-alive: 100K+ connections per server
├─ WebSocket: 100K+ connections per server
└─ With tuning: 1M+ per server (Facebook, Twitter)
```

## CPU & Memory

### Memory for Caching

```
Working set (hot data): 80% of requests access 20% of data

Example:
1 million users
Working set: 20% = 200,000 users
Data per user: 10 KB
Cache needed: 2 GB

Cost: ~$50 for 1 server with 2GB RAM
```

### CPU Cycles

```
1 GHz CPU: 1 billion cycles/second
1 cycle: 1 nanosecond
Context switch: 1000-10,000 cycles (1-10 µs)

1 simple operation: 1-10 cycles
1 system call: 100-10,000 cycles

Rule of thumb: 1 CPU core can do 10K-100K requests/sec
```

## Database Calculations

### Query Latency

```
In-memory (Redis): < 1 ms
SSD database: 1-10 ms
HDD database: 10-100 ms

5 sequential queries:
├─ In-memory: 5 ms
├─ SSD: 50 ms
└─ HDD: 500 ms

Solution: Cache or batch queries
```

### Throughput

```
Database: 10,000 QPS typical
Cache: 100,000+ QPS
In-memory: 1,000,000+ QPS

For 100K RPS: Need cache + database separation
```

## Estimating Server Count

```
Peak RPS: 100,000
RPS per server: 1,000
Servers needed: 100

Redundancy factor (2x for failover): 200 servers total
Geographic distribution: ÷3 datacenters = 67 per datacenter

With replication factor 3: 67 × 3 = 200 servers total
```

## Cost Calculations

### AWS EC2

```
t3.large instance: $0.104/hour
365 × 24 = 8,760 hours/year
Annual: 8,760 × $0.104 = $911/server

100 servers: $91,100/year + storage + bandwidth
```

### Data Transfer (Egress)

```
AWS: $0.02/GB
1 TB/day = 30 TB/month
Cost: 30,000 GB × $0.02 = $600/month

Expensive! CDN cheaper: $0.01/GB = $300/month
```

### Storage

```
S3: $0.023/GB
100 TB = 100,000 GB
Monthly: 100,000 × $0.023 = $2,300

Annual: $27,600
Backup + replication: 3x = $82,800/year
```

## Quick Estimations

### Is it feasible?

```
1M users × 10 req/day:
├─ 10M requests/day = 115 RPS
└─ 1 server easily (can do 10K RPS)

1M users × 1000 req/day:
├─ 1B requests/day = 11,500 RPS
└─ Need 11-12 servers minimum

100M users × 100 req/day:
├─ 10B requests/day = 115,000 RPS
└─ Need 100+ servers (multiple datacenters)
```

### Storage estimates

```
1 million users
100 KB per user: 100 GB (cheap)
1 MB per user: 1 TB (moderate)
10 MB per user: 10 TB (storage intensive)
100 MB per user: 100 TB (very intensive)
```

## Interview Cheat Sheet

| Metric | Typical Value |
|--------|---------------|
| L1 cache latency | 1 ns |
| RAM latency | 100 ns |
| SSD latency | 50 µs |
| HDD latency | 10 ms |
| Network latency (DC) | 1 ms |
| Network latency (geo) | 100 ms |
| SQL query | 1-10 ms |
| No-SQL query | 1-5 ms |
| Cache query | < 1 ms |
| HTTP request | 100 ms |

---

**Next:** Case studies - Google Maps and Figma design.

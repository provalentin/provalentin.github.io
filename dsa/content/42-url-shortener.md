# System Design Case Study: URL Shortener

**Read time:** 12 min | **Difficulty:** Hard

## Problem Statement

Design a URL shortening service like bit.ly, tinyurl.

### Requirements

**Functional:**
- Shorten long URLs: https://example.com/very/long/path → tiny.url/abc123
- Redirect to original URL
- Custom short URLs (optional)
- Analytics (optional)

**Non-Functional:**
- 100M URLs shortened per day
- 1B requests per day (10x reads vs writes)
- Availability > 99.9%
- Latency < 100ms

## Back-of-Envelope Calculation

```
100M URLs/day
= 100M / (24 × 3600) = ~1,157 URLs/second

1B requests/day
= 1B / (24 × 3600) = ~11,574 requests/second

Storage (5 years):
= 100M × 365 × 5 = 182.5B URLs
Each URL: ~500 bytes (URL + metadata)
= 182.5B × 500B = ~91TB
```

## URL Shortening Algorithm

### Character Set for Short URL

Use alphanumeric: 0-9, a-z, A-Z = 62 characters

```
1 character: 62 IDs
2 characters: 62² = 3,844 IDs
3 characters: 62³ = 238,328 IDs
4 characters: 62⁴ = ~14M IDs
5 characters: 62⁵ = ~900M IDs
6 characters: 62⁶ = ~56B IDs
```

For 182.5B URLs, need 6+ characters.

### Approach 1: Random String Generation

```
1. Generate random 6-char string
2. Check if exists in DB
3. If not, store mapping
4. Return short URL

Problems:
- Collision checking slow
- Low uniqueness probability
```

### Approach 2: Hash-Based

```
1. Hash(long_url + timestamp + salt)
2. Take first 6 chars
3. Check collision
4. Store mapping

Problems:
- Still need collision check
- Hash always produces same result
```

### Approach 3: Sequential ID with Base62 Encoding

```
1. Create sequential ID (auto-increment)
   ID: 1, 2, 3, 4, ...
2. Convert to Base62
   1 → "1"
   62 → "10"
   3844 → "z9"
3. Store mapping: short_url → long_url
4. No collisions!

Advantages:
- Guaranteed unique
- No collision checking
- Simple and fast
```

## Architecture

```
         Clients
         ↙  ↓  ↘
    LB (load balancer)
    ↙      ↓      ↘
  Web1    Web2    Web3
   ↓       ↓       ↓
       [Cache]
      (Redis)
         ↓
    [Database]
   (PostgreSQL)
```

## Data Schema

```sql
-- Mapping table
CREATE TABLE url_mappings (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  short_url VARCHAR(10) UNIQUE NOT NULL,
  long_url VARCHAR(2048) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  expiration_date TIMESTAMP,
  user_id INT
);

-- Create index on short_url for fast lookups
CREATE INDEX idx_short_url ON url_mappings(short_url);
```

## High-Level Flow

### Create (Write) Flow

```
1. Client POST /shorten
   {
     "long_url": "https://..."
   }

2. Web server
   ├─ Get next ID from ID service
   ├─ Convert to Base62 → short_url
   ├─ Store in DB
   └─ Cache in Redis

3. Return
   {
     "short_url": "tiny.url/abc123"
   }
```

### Redirect (Read) Flow

```
1. Client GET /abc123

2. Web server
   ├─ Check Redis cache
   │  ├─ Hit → return 301 redirect
   │  └─ Miss → continue
   ├─ Query database
   ├─ Store in cache
   └─ Return 301 redirect to original URL

3. Browser follows redirect
   → Original website loads
```

## ID Generation Service

Problem: Multiple servers all generating IDs, must be unique.

### Approach 1: Database with AUTO_INCREMENT

```
Server 1 inserts → ID: 1
Server 2 inserts → ID: 2
Server 3 inserts → ID: 3
Database ensures unique IDs
```

Problem: Database becomes bottleneck

### Approach 2: Zookeeper/Etcd for ID Ranges

```
Zookeeper assigns ID ranges
Server 1: 1-100,000
Server 2: 100,001-200,000
Server 3: 200,001-300,000

Each server generates IDs from their range
No DB calls needed
```

Advantage: Parallel ID generation

### Approach 3: Snowflake ID

```
[Timestamp][DatacenterID][Machine ID][Sequence]
 41 bits    5 bits       5 bits      12 bits
 
Guarantees: Unique, sortable, distributed
```

## Caching Strategy

### Cache-Aside

```
GET /abc123
├─ Check Redis
│  ├─ Hit → return (fast!)
│  └─ Miss → query DB
├─ Store in Redis: short_url → long_url (TTL: 1 hour)
└─ Return redirect
```

### Cache Sizing

```
1B requests/day
99% read = ~10M writes/day of new mappings
99% access to top ~10M URLs (80/20 rule)

Cache size: 10M × 500B = 5GB
```

## Replica and Backup

```
Master DB (Write)
   ↓
Replica 1 (Read)
Replica 2 (Read)
Replica 3 (Read)

+ Daily backups to S3
```

## Potential Issues

### Collision Detection

```
If ID exists in DB:
Error: collision (rare with Base62)
Retry with next ID
```

### Rate Limiting

Prevent abuse:
```
Max 100 URLs per user per minute
Max 10,000 URLs per IP per day
```

### Expired URLs

```
Option 1: TTL in cache
Option 2: Delete after expiration
Option 3: Keep indefinitely
```

### Analytics (Optional)

Track clicks:
```
GET /abc123/stats
→ Return click count, referrers, locations
```

Store analytics data separately (high volume)

## Deployment Considerations

### Horizontal Scaling

```
Add more web servers → handled by LB
Add more cache servers → consistent hashing
Add more DB replicas → read scaling
↑ No single point of failure
```

### Monitoring

- RPS (requests/second)
- Latency (p50, p95, p99)
- Cache hit rate
- DB query time
- Error rate

## Alternative Designs

### Approach A: Pre-generate Short URLs

```
Background job generates URLs: abc123, abc124, ...
Store in Redis queue
On request: pop from queue, assign to user

Advantage: Very fast request
Disadvantage: Wasteful if not all used
```

### Approach B: Consistent Hashing

```
hash(long_url) mod num_servers
Route to consistent server
No central database needed

Problem: What about collisions?
```

## Interview Tips

✓ Discuss ID generation strategy (Base62)
✓ Address collision handling
✓ Mention caching strategy
✓ Explain read/write scaling
✓ Discuss replication for HA
✓ Address rate limiting
✓ Estimate storage requirements

❌ Don't forget about caching
❌ Don't ignore ID generation bottleneck
❌ Don't forget about analytics load
❌ Don't ignore expired URLs

---

**Next:** Design a chat system for real-time messaging.

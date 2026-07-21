# System Design: Analytics System (Data Warehouse)

**Read time:** 11 min | **Difficulty:** Hard

## Problem Statement

Design a system to collect, store, and analyze massive amounts of data.

### Requirements

- Collect millions of events per second
- Store petabytes of data
- Query historical data (weeks/months/years)
- Real-time dashboards
- Support complex queries/aggregations

## Event Collection

### Event Structure

```
{
  timestamp: 1234567890,
  user_id: 123,
  event_type: "page_view",
  properties: {
    page: "/products",
    referrer: "google",
    duration_ms: 1234
  },
  device: {
    os: "iOS",
    browser: "Safari"
  }
}
```

### Collection Flow

```
Client (web/mobile)
    ↓
Event API (high throughput)
    ↓
Message Queue (Kafka)
    ├─ Buffer events
    └─ Decouple producer/consumer
    ↓
Stream Processor (Spark)
    ├─ Validate
    ├─ Enrich
    └─ Transform
    ↓
Data Warehouse (BigQuery/Redshift)
    ├─ Store
    ├─ Index
    └─ Query
    ↓
BI Tools (Tableau/Looker)
    └─ Dashboards & reports
```

## Scale: Events Per Second

```
1M events/second typical
Peak: 10M events/second

Challenges:
├─ Ingestion bottleneck
├─ Storage explosion
└─ Query latency
```

## Data Warehouse Architecture

### Batch Processing

```
Daily job (2am):
1. Read raw events (all day's data)
2. Deduplicate (same event twice)
3. Aggregate: views by page, revenue by country, etc
4. Store aggregates in data warehouse
5. Ready for queries by morning

Latency: 24 hours (events from yesterday)
Efficiency: Can aggregate terabytes
```

### Lambda Architecture

```
Speed layer (real-time):
├─ Stream processor (Spark Streaming)
├─ Aggregate last 1 hour
└─ Serve from memory (fast)

Batch layer (comprehensive):
├─ Process all historical data daily
├─ Accurate aggregates
└─ Serve from warehouse

Query layer:
├─ Check speed layer first
├─ If stale: Query batch layer
└─ Combine for complete view
```

## Storage: Columnar Databases

### Row Store (OLTP)

```
Traditional database:
Row 1: [1, "Alice", 30, 50000]
Row 2: [2, "Bob", 25, 60000]
Row 3: [3, "Charlie", 35, 70000]

Query: "Get all ages"
└─ Read entire rows, extract age column

Inefficient for analytics
```

### Column Store (OLAP)

```
Columnar database:
ID: [1, 2, 3, ...]
Name: ["Alice", "Bob", "Charlie", ...]
Age: [30, 25, 35, ...]
Salary: [50000, 60000, 70000, ...]

Query: "Get all ages"
└─ Read only age column

Much faster for analytics!
```

### Examples

```
BigQuery (Google):
├─ Serverless (auto-scale)
├─ $6.25 per TB scanned
└─ Fast queries

Redshift (AWS):
├─ Managed data warehouse
├─ Clusters of nodes
└─ Good for large companies

ClickHouse:
├─ Open source
├─ Very fast
└─ Self-hosted
```

## Data Schema: Star Schema

```
Central fact table:
fact_sales:
├─ transaction_id (PK)
├─ user_id (FK)
├─ product_id (FK)
├─ date_id (FK)
├─ amount
└─ quantity

Dimension tables:
dim_user: id, name, country, ...
dim_product: id, name, category, ...
dim_date: id, day, month, year, ...

Query: "Sales by country in Jan 2023"
1. Join fact_sales with dim_user (country)
2. Filter dim_date (Jan 2023)
3. Sum amounts
```

## Real-time Dashboards

### Update Strategy

```
Option 1: Pre-computed (Fast)
├─ Background job computes every hour
├─ Dashboard shows cached result
└─ Latency: Up to 1 hour

Option 2: Real-time (Slow)
├─ Query warehouse on-demand
├─ Return latest data
└─ Latency: Seconds (slow for dashboard)

Hybrid:
├─ Show pre-computed hourly data
├─ Highlight "Last updated 5 min ago"
├─ Allow manual refresh
```

### Caching

```
Frequently viewed dashboards:
├─ Cache aggregates (Redis)
├─ Cache partial results
└─ Serve from memory (fast)

Rarely viewed reports:
├─ Query on-demand
└─ Slower response acceptable
```

## Data Quality

### Deduplication

```
Same event sent twice (network retry)
    ↓
Solution: Idempotency key
event_id: "uuid_123"

Check: Already processed event_id?
├─ Yes: Skip
└─ No: Process

Result: No duplicates
```

### Validation

```
Rules:
├─ Required fields present
├─ Data types correct
├─ Values in valid range
├─ Timestamps realistic

Schema enforcement:
└─ Reject invalid events
```

### Late Arrivals

```
Event created: 2023-01-15 10:00:00
Event received: 2023-01-15 10:05:00 (5 min late)

Late window: 24 hours
    ├─ Events > 24h late: drop
    └─ Events < 24h late: include in previous day's batch

Result: Handle network delays
```

## SQL Queries

### Common Analytics Queries

```sql
-- Daily active users
SELECT DATE(timestamp), COUNT(DISTINCT user_id)
FROM events
GROUP BY DATE(timestamp);

-- Retention cohort
SELECT
  DATE(first_seen) as cohort,
  DATE(event_timestamp) as event_date,
  COUNT(DISTINCT user_id) as users
FROM events
WHERE first_seen >= '2023-01-01'
GROUP BY cohort, event_date;

-- Funnel analysis
WITH funnel AS (
  SELECT 1 as step WHERE event = 'page_view'
  UNION ALL
  SELECT 2 as step WHERE event = 'add_to_cart'
  UNION ALL
  SELECT 3 as step WHERE event = 'purchase'
)
SELECT step, COUNT(DISTINCT user_id)
FROM funnel
GROUP BY step;
```

## Performance Optimization

### Partitioning

```
Table: events (1TB)

Partition by: Date
events_2023_01_15: 3GB
events_2023_01_16: 3GB
events_2023_01_17: 3GB

Query: "Jan 15 data"
└─ Scan only events_2023_01_15 (3GB)
└─ Skip other dates
```

### Indexing

```
Index on frequently filtered columns:
├─ user_id (many queries filter by user)
├─ timestamp (range queries)
└─ event_type (aggregations)

Index on rarely used columns:
└─ Waste of space/time
```

### Materialized Views

```
Pre-computed aggregates:
view_hourly_revenue:
├─ Computed hourly
├─ Sum(revenue) by country, hour
└─ Queries read from view (fast)

Trade-off: Storage vs query speed
```

## Challenges at Scale

### Storage Cost

```
100M users × 100 events/user/day = 10B events/day
10B × 1KB per event = 10TB/day

Annual: 3.6PB
Cost: $0.023/GB/month = $83M/year

Optimization:
├─ Compression: Reduce 50%
├─ Sampling: Store 10% for rare analyses
└─ TTL: Delete old data
```

### Query Latency

```
Warehouse has 1PB data
Query: "All revenue last year"
└─ Scan 365TB
└─ Takes minutes (unacceptable for dashboard)

Solution:
├─ Aggregate daily (store 365 rows, not 365TB)
├─ Pre-aggregate by hour/day/week
└─ Users query aggregates, not raw data
```

## Interview Tips

✓ Discuss batch vs real-time trade-offs
✓ Explain lambda architecture
✓ Address columnar storage benefits
✓ Discuss data quality issues
✓ Explain star schema design
✓ Mention partitioning and indexing
✓ Address scalability challenges
✓ Discuss cost optimization

❌ Don't ignore data quality
❌ Don't forget deduplication
❌ Don't skip partitioning
❌ Don't ignore late arrivals
❌ Don't underestimate storage costs

---

**Complete!** 65 comprehensive articles covering DSA and system design.

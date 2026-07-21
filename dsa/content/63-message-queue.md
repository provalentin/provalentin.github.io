# System Design: Message Queue (Kafka-like)

**Read time:** 11 min | **Difficulty:** Medium-Hard

## Problem Statement

Design a distributed message queue for asynchronous processing.

### Requirements

- Producers send messages
- Consumers receive and process messages
- Handle millions of messages per second
- Durability (don't lose messages)
- Scalability via partitioning

## Message Queue Pattern

```
Producer (Sender)
    ↓
Message Queue
    ├─ Store messages temporarily
    └─ Guarantee delivery
    ↓
Consumer (Receiver)

Decoupling:
├─ Producer doesn't wait for consumer
├─ Consumer processes at own pace
└─ Resilient to failures
```

## Use Cases

```
Order placement:
User places order → Produced to queue
Order service consumes → Processes
Payment service consumes → Charges card
Notification service → Sends confirmation

Benefits:
├─ User sees instant confirmation
├─ Services process independently
└─ Survives service failures
```

## Architecture

```
Producer
    ↓
Broker Cluster (replicated)
├─ Node 1
├─ Node 2
└─ Node 3

All messages replicated across brokers
    ↓
Consumer Group
├─ Consumer 1 (partition 1)
├─ Consumer 2 (partition 2)
└─ Consumer 3 (partition 3)

Parallel processing
```

## Partitioning

### Topic Structure

```
Topic: "orders"
    ├─ Partition 0: [msg1, msg2, msg3, ...]
    ├─ Partition 1: [msg4, msg5, msg6, ...]
    └─ Partition 2: [msg7, msg8, msg9, ...]

Benefits:
├─ Parallel consumption (3 consumers)
├─ Ordering within partition
└─ Horizontal scalability
```

### Partition Selection

```
Producer sends message:
{
  topic: "orders",
  key: "customer_123",
  value: {order_id: 456, amount: 99.99}
}

Partition selection:
hash(key) % num_partitions = partition_id
hash("customer_123") % 3 = 1

→ Send to partition 1

Benefit: Same customer always → same partition
└─ Ordered processing per customer
```

## Consumer Groups

```
Consumer group "order-processors":
├─ Consumer A: Listens to partition 0
├─ Consumer B: Listens to partition 1
└─ Consumer C: Listens to partition 2

Each partition has only 1 consumer
(from group)

Parallel processing:
3 messages processed simultaneously
```

### Rebalancing

```
Add Consumer D:
├─ Old: A→P0, B→P1, C→P2
├─ New: A→P0, B→P1, C→P2, D→(?)
└─ Rebalance needed!

New assignment:
├─ A→P0
├─ B→P1
├─ C→P2
└─ D→P3 (if added) or rotate

During rebalance:
└─ Consumers pause, rejoin, resume
└─ Temporary latency spike
```

## Offset Management

### Offset Tracking

```
Consumer reads from partition:
Message 1 (offset 0)
Message 2 (offset 1)
Message 3 (offset 2)

Consumer processed up to offset 2
Commits offset 2 to broker:
"I've processed up to message 2"

If consumer crashes:
└─ Restart from offset 3 (skip 1-2, avoid reprocessing)
```

### Offset Storage

```
Modern approach: Store in __consumer_offsets topic
├─ Partitioned like other topics
├─ Replicated for durability
└─ Each consumer group has offset per partition

Query: "consumer_group_1:partition_1" → offset 1234
```

## Message Durability

### Replication Factor

```
Replication factor: 3

Produce message:
├─ Write to Leader (broker 1)
├─ Replicate to Follower (broker 2)
├─ Replicate to Follower (broker 3)
├─ After all replicate: acknowledge
└─ Message safe (survives 2 broker failures)
```

### Persistence

```
Each broker writes to disk:
Write-Ahead Log (WAL):
├─ Message appended to log
├─ Acknowledged to client
└─ Synced to disk periodically

Durability: Messages survive restarts
```

## Database Schema

```sql
-- Topics
CREATE TABLE topics (
  name VARCHAR(100) PRIMARY KEY,
  num_partitions INT,
  replication_factor INT,
  retention_ms BIGINT,
  created_at TIMESTAMP
);

-- Partitions (on disk)
CREATE TABLE partitions (
  topic VARCHAR(100),
  partition_id INT,
  leader_broker INT,
  replicas JSON,  -- [1, 2, 3]
  isr JSON,       -- In-Sync Replicas
  PRIMARY KEY (topic, partition_id)
);

-- Consumer offsets
CREATE TABLE consumer_offsets (
  group_id VARCHAR(100),
  topic VARCHAR(100),
  partition_id INT,
  offset BIGINT,
  timestamp TIMESTAMP,
  PRIMARY KEY (group_id, topic, partition_id)
);
```

## Ordering Guarantees

### Within Partition (Guaranteed)

```
Producer sends:
1. Message A
2. Message B
3. Message C

All routed to partition 1 (same key)
Consumer reads:
1. A
2. B
3. C

Order preserved!
```

### Across Partitions (Not Guaranteed)

```
Producer sends:
1. Message A → Partition 0
2. Message B → Partition 1
3. Message C → Partition 0

Consumers read:
Consumer 1: A, C
Consumer 2: B
Parallel reading → order not guaranteed

Solution: Use same key/partition if order critical
```

## Exactly-Once Processing

```
Challenge:
Message processed
Commit offset fails
Restart → reprocess message twice
```

### Solution: Idempotency

```
Message: {id: 123, action: deduct_credit, amount: $100}

Idempotent processing:
1. Check: Already processed message 123?
2. If yes: Skip (return previous result)
3. If no: Process and commit id
4. Deduct credit once, not twice

Requires: Client-side idempotency tracking
```

## Throughput Optimization

```
Single message:
└─ Network latency ~1ms

Batching:
├─ Collect 1000 messages
├─ Send in 1 batch
├─ Throughput: 1000 msg/batch ÷ 1ms = 1M msg/sec

Compression:
├─ Compress batch before sending
├─ Reduce network overhead
└─ Further increase throughput
```

## Failure Scenarios

### Broker Failure

```
Leader broker dies
    ↓
Controller (another broker):
1. Detect leader failure (no heartbeat)
2. Elect new leader from ISR
3. Notify producers/consumers
4. Rebalance if needed

Downtime: ~5 seconds (automated)
```

### Consumer Failure

```
Consumer dies
    ↓
Group coordinator:
1. Notice consumer offline (heartbeat timeout)
2. Trigger rebalance
3. Reassign partitions
4. Other consumers take over
5. Restart from committed offset

Recovery: Automatic
```

## Interview Tips

✓ Discuss partitioning strategy
✓ Explain consumer groups and rebalancing
✓ Address ordering guarantees
✓ Discuss offset management
✓ Explain durability (replication)
✓ Address idempotent processing
✓ Mention throughput optimization
✓ Discuss failure scenarios

❌ Don't ignore ordering guarantees
❌ Don't forget offset commits
❌ Don't skip durability
❌ Don't ignore exactly-once challenge

---

**Next:** Distributed cache design.

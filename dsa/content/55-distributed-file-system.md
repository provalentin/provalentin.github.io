# System Design Case Study: Distributed File System

**Read time:** 13 min | **Difficulty:** Hard

## Problem Statement

Design a distributed file system (like HDFS) for big data processing.

### Requirements

**Functional:**
- Store massive files (TBs)
- Replicate data (fault tolerance)
- Read/write operations
- Directory structure
- Access control

**Non-Functional:**
- Store petabytes of data
- High throughput (batch processing)
- Fault tolerance (tolerate node failures)
- Auto-replication and recovery
- Simple programming model

## HDFS (Hadoop Distributed File System)

### Architecture

```
Master-Slave architecture

NameNode (Master)
├─ File system namespace
├─ File system tree
├─ Metadata for files/dirs
├─ Does NOT store actual data
└─ Single point of failure (mitigated with HA)

DataNodes (Slaves)
├─ Perform actual storage
├─ Block creation, deletion, replication
├─ Send heartbeats (3 seconds)
├─ Send block reports (hourly)
└─ 1000s of machines

Client
├─ Communicates with NameNode for metadata
├─ Communicates with DataNodes for data
└─ Can read/write files
```

## File Storage: Block Model

### Why Blocks?

```
Traditional FS:
└─ Allocate disk space in small units (4KB blocks)
└─ Problem: Millions of blocks in memory overhead

Distributed FS:
└─ Large blocks: 64MB or 128MB
└─ Fewer block objects
└─ Fit more data per machine

File: 500MB
├─ Traditional: 125,000 × 4KB blocks
└─ HDFS: 4 × 128MB blocks + 1 × 12MB block
```

### Block Replication

```
File: input.txt (256MB)
    ↓
Split into blocks:
├─ Block 1: 128MB
├─ Block 2: 128MB
└─ Block 3: (remainder)

Replicate each block:
Block 1 → [DataNode 1, DataNode 2, DataNode 3]
Block 2 → [DataNode 2, DataNode 3, DataNode 4]
Block 3 → [DataNode 3, DataNode 4, DataNode 5]

Replication factor: 3 (default)
Result: 3 copies of each block
```

### Rack Awareness

```
DataNodes organized in racks:
Rack A: [DataNode 1, DataNode 2, DataNode 3]
Rack B: [DataNode 4, DataNode 5, DataNode 6]
Rack C: [DataNode 7, DataNode 8, DataNode 9]

Replica placement:
Block 1 → [Rack A Node 1, Rack A Node 2, Rack B Node 1]
└─ 2 replicas in Rack A (fast local access)
└─ 1 replica in Rack B (fault tolerance across racks)
```

## Write Process

### Step 1: Client Initiates Write

```
Client wants to write file
    ↓
Contact NameNode:
├─ Request permission to write
├─ NameNode creates record
└─ Return list of DataNodes for first block
```

### Step 2: Write to First DataNode

```
Client writes data to DataNode 1
    ↓
DataNode 1 receives data
├─ Write to disk
├─ Create replica pipeline
└─ Forward to DataNode 2
```

### Step 3: Pipeline Replication

```
Client → DataNode 1 → DataNode 2 → DataNode 3
         (writes)      (queues)      (writes)

DataNode 1 ✓
    ↓
DataNode 2 ✓
    ↓
DataNode 3 ✓
    ↓
Acknowledge back through pipeline
```

### Step 4: Block Completion

```
File complete:
├─ Client notifies NameNode
├─ NameNode records file as complete
└─ Blocks can be released

Actual:
├─ Data written to disk
├─ Replicas created
└─ Persisted
```

## Read Process

### Step 1: Locate Blocks

```
Client reads file
    ↓
Contact NameNode:
├─ Request block locations
    ↓
NameNode returns:
[
  {
    block_id: 1,
    locations: [DataNode1, DataNode2, DataNode3],
    size: 128MB
  },
  ...
]
```

### Step 2: Read from Nearest DataNode

```
For each block:
1. Try DataNode 1 (closest)
   ├─ If available: read from it
   └─ If down: try DataNode 2

2. Client reads data from chosen DataNode
   ├─ Establish connection
   ├─ Stream block data
   └─ Verify checksum

3. Move to next block
```

## Fault Tolerance

### DataNode Failure

```
DataNode 1 goes down
    ↓
NameNode:
├─ Heartbeat missed (3 × 3s = 9s)
├─ Mark DataNode 1 as dead
└─ Rebalance replicas

Blocks on DataNode 1:
├─ Replica on DataNode 2: OK
├─ Replica on DataNode 3: OK
└─ But below replication factor

Rebalance:
├─ Copy block from DataNode 2 to DataNode 4
└─ Replication restored
```

### Rack Failure

```
Rack A loses power
    ↓
All DataNodes in Rack A down
    ↓
NameNode detects multiple failures
    ↓
Blocks affected:
├─ Were replicated to Racks A, B, C
├─ Rack A replicas lost
└─ Still have replicas in B, C (available)

But below replication factor:
├─ Rebalance to other racks
└─ Restore replication factor
```

## Rack Topology

NameNode maintains:
```
/default-rack/
  ├─ DataNode1
  ├─ DataNode2
  └─ DataNode3
/rack1/
  ├─ DataNode4
  ├─ DataNode5
  └─ DataNode6
```

Distance metric:
```
Same node: 0
Same rack: 2
Different racks: 4

Closest replica preferred (distance 0)
Second closest (distance 2)
Third closest (distance 4)
```

## NameNode Metadata

### In-Memory Structure

```
Namespace tree:
/ (root)
├─ home/
│  ├─ alice/
│  │  ├─ file1.txt → [Block1, Block2]
│  │  └─ file2.txt → [Block3]
│  └─ bob/
│     └─ data.csv → [Block4, Block5, Block6]
└─ data/
   └─ input.txt → [Block7, Block8]
```

### Block Map

```
Block1: [DataNode1, DataNode2, DataNode3]
Block2: [DataNode2, DataNode3, DataNode4]
Block3: [DataNode1, DataNode4]
Block4: [DataNode3, DataNode5, DataNode6]
...

All in memory for fast lookup
```

### Checkpoint Mechanism

```
FSImage: Complete state at point in time
EditLog: Incremental changes since FSImage

Restart process:
1. Load FSImage into memory
2. Replay EditLog
3. Rebuild in-memory state

Checkpoint:
1. NameNode saves FSImage
2. Clear EditLog
3. Reduce restart time
```

## Data Integrity

### Checksums

```
When block written:
├─ Compute checksum (e.g., CRC-32)
├─ Store with block
└─ Verify on read

On read:
├─ Compute checksum again
├─ Compare stored checksum
├─ If mismatch: block corrupted
   └─ Try next replica

Block scanner (periodic):
├─ Verify all stored blocks
├─ Report corrupted blocks
└─ Trigger re-replication
```

## MapReduce Integration

HDFS works with MapReduce:

```
Input: Large file (100GB)
MapReduce job:
├─ Split file into blocks
├─ Schedule mapper on DataNode containing block
├─ Local computation (reduce network traffic)
└─ Parallelism: one mapper per block

Data locality:
└─ Computation moves to data (not vice versa)
```

## Limitations & Design Trade-offs

### NameNode SPOF (Single Point of Failure)

```
Problem: NameNode failure = entire system down

Solutions:
1. Secondary NameNode (not backup, confusing name)
   ├─ Manages checkpointing
   └─ Manually configured as primary on failure

2. HA NameNode (Hadoop 2.0+)
   ├─ Active-Passive setup
   ├─ ZooKeeper for coordination
   └─ Automatic failover
```

### Not Suitable for Low-Latency

```
HDFS optimized for:
├─ High throughput (batch)
└─ Fault tolerance

Not suitable for:
├─ Real-time data (latency > 100ms)
├─ Lots of small files (NameNode memory)
└─ Multiple writers
```

### Write-Once Semantics

```
File can be created, appended, deleted
But cannot:
├─ Edit existing blocks
└─ Multiple writers

Design choice:
├─ Simplifies consistency
├─ MapReduce produces immutable outputs
└─ Works for batch processing
```

## Deployment

### Cluster Architecture

```
NameNode (dedicated machine)
├─ 32GB+ RAM (for metadata)
├─ SSD for edit logs
└─ Secondary NameNode (separate machine)

DataNodes (commodity hardware)
├─ 1000s of machines
├─ 64GB+ RAM, many disks
├─ Rack-aware deployment
└─ Monitoring/monitoring agents
```

### Rebalancing

```
Cluster becomes unbalanced:
├─ Node A: 90% full
├─ Node B: 10% full

Rebalancer:
├─ Moves blocks from A to B
├─ Maintains rack awareness
├─ Background job (low priority)
```

## Interview Tips

✓ Explain block model and replication
✓ Discuss rack awareness and placement policy
✓ Address fault tolerance mechanisms
✓ Explain write and read pipelines
✓ Discuss NameNode role and limitations
✓ Mention data integrity (checksums)
✓ Address data locality
✓ Discuss rebalancing

❌ Don't ignore rack awareness
❌ Don't forget NameNode SPOF
❌ Don't skip fault tolerance
❌ Don't ignore data integrity

---

**Complete System Design Case Studies Ready!**

You now have 55 articles covering:
- 35 DSA articles (fundamentals through advanced)
- 6 system design fundamentals
- 14 system design case studies

Total: ~500 minutes of comprehensive interview prep content!

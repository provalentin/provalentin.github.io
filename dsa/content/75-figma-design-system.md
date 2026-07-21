# System Design Case Study: Figma (Real-Time Collaborative Design)

**Read time:** 12 min | **Difficulty:** Hard

## Problem Statement

Design a real-time collaborative design tool like Figma.

### Requirements

- Multiple users edit simultaneously
- Real-time updates (< 100ms)
- Undo/redo across sessions
- Version history
- Comments and @mentions
- Persist designs indefinitely
- High-fidelity rendering

### Scale

```
10M users
1M concurrent sessions
100K files open simultaneously
Real-time updates: O(ms) latency
Designs range: 50KB to 500MB
```

## Document Model

### Structured Data

```
File: {
  id: "file_abc123",
  name: "Homepage Design",
  pages: [
    {
      id: "page_1",
      name: "Desktop",
      layers: [
        {
          id: "rect_1",
          type: "rectangle",
          x: 100, y: 200,
          width: 300, height: 400,
          fill: "#FF0000"
        },
        {
          id: "text_1",
          type: "text",
          x: 150, y: 250,
          content: "Hello World",
          fontSize: 24
        }
      ]
    }
  ]
}
```

## Operational Transformation (OT) or CRDT

Same as Google Docs, but for graphics:

```
User A: Draw rectangle at (100, 200)
User B: Draw circle at (300, 300)

Simultaneous operations:
Operation A: {type: "add", id: "rect_1", ...}
Operation B: {type: "add", id: "circle_1", ...}

Apply both → Both shapes appear
Order preserved globally
```

### Conflict Resolution

```
User A: Move rectangle from x=100 to x=150
User B: Move rectangle from x=100 to x=200

No conflict! Each object modified once
Result: Rectangle at x=200 (B's operation later)

Conflict (same property):
User A: Change color to RED
User B: Change color to BLUE

Solution:
├─ Last write wins (simple)
├─ Ask user (complex)
└─ Merge (show both)
```

## Canvas Rendering

### Viewport Strategy

```
Design canvas: 10,000 × 10,000 pixels
User viewport: 1920 × 1080 (visible area)

Only render visible + buffer zone:
├─ Visible: 1920 × 1080
├─ Buffer: Extend by 20% in all directions
└─ Total render: ~2,400 × 1,350

Render only ~3M pixels
vs 100M for entire canvas
```

### Level of Detail (LOD)

```
Zoom level 25% (zoomed out):
├─ Render simplified shapes
├─ Skip small details
└─ Faster rendering

Zoom level 100% (normal):
├─ Render all details
├─ Show text, effects
└─ Full quality

Zoom level 200% (zoomed in):
├─ Render with higher resolution
├─ Show blur, shadow details
└─ Peak quality
```

## Real-time Synchronization

### Operation Log

```
File history:
1. User A: Add rectangle → {type: "add", id: "r1"}
2. User B: Move rectangle → {type: "move", id: "r1", x: 150}
3. User A: Delete circle → {type: "delete", id: "c1"}
4. User B: Change color → {type: "update", id: "r1", fill: "blue"}

Current state: Apply all operations in order

Undo operation 4: Remove "change color" operation
Redo operation 4: Re-apply "change color"

Send updates only to affected users
```

### WebSocket Broadcasting

```
User A makes change
    ↓
Send operation to server
    ↓
Server broadcasts to all connected users:
├─ User B
├─ User C
├─ User D
└─ (except originator, they already applied)

Latency: < 100ms for all users to see change
```

## Version Control & History

### Snapshot-based

```
Save snapshot every N operations:
├─ Version 1: Initial state
├─ Version 2: After 100 operations
├─ Version 3: After 200 operations
└─ Latest: Current state (may have 50 more ops)

Rebuild any version:
1. Load snapshot closest to version
2. Apply operations since snapshot
3. Reconstruct state
```

### Branching

```
Main branch:
v1 → v2 → v3 → v4 → v5

Designer creates new branch at v3:
Feature branch:
v3 → v3a → v3b → v3c

Modifications independent
Can merge v3c back to main later
```

## Comments & Collaboration

### Comment System

```
Comment:
{
  id: "comment_1",
  author_id: 123,
  text: "Change this color to blue",
  timestamp: 1234567890,
  resolved: false,
  threads: [
    {
      author_id: 456,
      text: "Already changed to blue!",
      timestamp: 1234567891
    }
  ],
  location: {
    page_id: "page_1",
    x: 300,
    y: 400,  // Pinned to this canvas location
    object_id: "rect_1"  // Or specific object
  }
}
```

### Mentions

```
Type "@alice" in comment
    ↓
Auto-complete shows "alice"
    ↓
Send notification to Alice:
"You were mentioned in design: Homepage v3.2"
    ↓
Click → Jump to exact comment location
```

## Performance Optimization

### Delta Sync

```
Instead of sending full file state (100MB):
Send only changes:
{
  operations: [
    {type: "update", id: "r1", fill: "blue"},
    {type: "move", id: "r2", x: 200, y: 300}
  ]
}

Size: 1KB instead of 100MB
Bandwidth: 10,000x reduction!
```

### Throttling

```
User drags rectangle quickly (1000 updates/sec):
Don't send all 1000!

Instead:
├─ Buffer updates
├─ Send batch every 100ms
└─ Server applies all atomically

Typical result: 10 batches/sec instead of 1000
User sees smooth motion on screen
```

### Selective Sync

```
File has 1000 objects
User is only viewing page 1 (50 objects)

Only sync operations affecting page 1:
└─ Skip operations on pages 2, 3, etc

Bandwidth: 5x reduction
Latency: Faster propagation
```

## Database Schema

```sql
-- Files
CREATE TABLE files (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255),
  owner_id INT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  version INT
);

-- Operations log
CREATE TABLE operations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  file_id VARCHAR(50),
  operation JSON,  -- {type, id, data...}
  user_id INT,
  timestamp TIMESTAMP,
  version INT,
  FOREIGN KEY (file_id) REFERENCES files(id)
);

CREATE INDEX idx_file_version 
  ON operations(file_id, version);

-- Snapshots (periodic)
CREATE TABLE snapshots (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  file_id VARCHAR(50),
  version INT,
  state MEDIUMBLOB,  -- Full file state
  created_at TIMESTAMP,
  FOREIGN KEY (file_id) REFERENCES files(id)
);

-- Comments
CREATE TABLE comments (
  id VARCHAR(50) PRIMARY KEY,
  file_id VARCHAR(50),
  author_id INT,
  text TEXT,
  created_at TIMESTAMP,
  resolved BOOLEAN
);
```

## Scalability

### File Sharding

```
File_id hash determines shard:
hash(file_id) % 1000 = shard

Each shard:
├─ Own WebSocket servers
├─ Own database
└─ Own cache

Keeps related data together
```

### Session Management

```
User in file "design_abc":
Connected to server pool: S1, S2, S3

Session hash:
hash(user_id, file_id) % 3 = 1

Always connects to S1
S1 knows all users viewing "design_abc"
Easy broadcasting
```

## Offline Support

### Local State

```
User loses internet while editing:
├─ Continue editing (app offline)
├─ Apply operations locally
└─ Store in localStorage

When reconnected:
├─ Send buffered operations
├─ Server merges with remote changes
└─ Resolve conflicts
└─ Sync complete
```

## Interview Tips

✓ Discuss OT/CRDT for concurrent edits
✓ Explain real-time sync via WebSocket
✓ Address viewport culling
✓ Discuss delta sync for bandwidth
✓ Mention operation logging for undo/redo
✓ Explain conflict resolution
✓ Address offline support
✓ Discuss version history and snapshots

❌ Don't ignore ordering guarantees
❌ Don't forget conflict resolution
❌ Don't skip viewport optimization
❌ Don't ignore offline editing

---

**Complete!** 75 comprehensive articles covering DSA + system design!

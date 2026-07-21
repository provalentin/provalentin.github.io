# System Design Case Study: Real-Time Collaboration Tool

**Read time:** 13 min | **Difficulty:** Hard

## Problem Statement

Design a real-time collaboration platform like Google Docs, Figma.

### Requirements

**Functional:**
- Multiple users edit simultaneously
- See changes in real-time (< 100ms)
- Undo/redo
- Comments and mentions
- Version history
- Access control

**Non-Functional:**
- 1M concurrent users
- 100 users editing same document
- Conflict-free collaboration
- Persistence
- 99.99% availability

## Core Challenge: Operational Transformation (OT)

### Problem: Simultaneous Edits

```
Document initial: "Hello"

User A deletes "H":         → "ello"
User B inserts "y" at end: → "Helloy"

Both changes happen simultaneously
Result must be: "elloy"

But simple merge might give:
├─ "yello" (wrong)
├─ "elloy" (wrong)
└─ Or conflict

Need conflict resolution!
```

### Operational Transformation (OT)

Algorithms ensure correct final state:

```
Operation A: Delete position 0
Operation B: Insert position 5

Apply A then B:
1. "Hello" → A → "ello"
2. "ello" → B (transform) → "ellog" (wrong!)

Transform B based on A:
└─ Position 5 doesn't exist, adjust to position 4
1. "Hello" → A → "ello"
2. "ello" → B' → "elloy" (correct!)

Both users converge to same state
```

## Alternative: CRDT (Conflict-free Replicated Data Type)

```
Each operation has unique ID:
Insert: (ID, position, char, user)

User A: (1, 3, "x", user_a)
User B: (2, 3, "y", user_b)

Sort by ID:
└─ (1, 3, "x") comes before (2, 3, "y")
└─ Both users converge without explicit conflict resolution

Benefits:
├─ Simpler than OT
├─ Works offline
└─ No central server needed
```

## Architecture

```
       Web/Desktop clients
       ↙      ↓      ↘
   Client  Client  Client
   (CRDT)  (CRDT)  (CRDT)
      ↓      ↓      ↓
   Websocket
      ↓
   Collaboration Server
   ├─ Receive operations
   ├─ Apply transforms
   ├─ Broadcast to others
   └─ Persist to DB
      ↓
   Database (MongoDB)
   └─ Store document + operations
```

## Local vs Server State

### Local (Client)

```
User's view (optimistic):
├─ Their own edits: applied immediately
├─ Remote edits: reflected in real-time
└─ Always responsive to user

Local state:
Document + local operations queue
```

### Server (Source of Truth)

```
Central authority:
├─ Merge conflicting operations
├─ Apply operational transform
├─ Store final state
└─ Broadcast to all clients

Server state:
Master document version + all operations
```

## Operation Types

```
Insert:
{
  type: "insert",
  position: 5,
  content: "world",
  user_id: 123,
  client_id: "abc",
  timestamp: 1234567890,
  operation_id: "unique_id"
}

Delete:
{
  type: "delete",
  position: 0,
  length: 5,
  user_id: 456,
  client_id: "def",
  timestamp: 1234567891,
  operation_id: "unique_id"
}

Formatted:
{
  type: "format",
  position: 0,
  length: 5,
  format: "bold",
  user_id: 123,
  operation_id: "unique_id"
}
```

## Collaboration Flow

### Step 1: User Edit

```
User types "h" in document
    ↓
Client receives keystroke
    ↓
Apply locally (immediately):
└─ "Hello" → "Hh|ello" (cursor after 'h')
    ↓
Create operation:
{
  type: "insert",
  position: 1,
  content: "h"
}
    ↓
Send to server via WebSocket
```

### Step 2: Server Processing

```
Server receives operation
    ↓
Transform against pending operations:
├─ Other edits received before this one
├─ May need to adjust position
└─ Apply transformed operation
    ↓
Update master document
    ↓
Broadcast transformed operation to all clients
    ↓
Store operation in history (MongoDB)
```

### Step 3: Client Receives

```
Client receives transformed operation:
{
  type: "insert",
  position: 1,
  content: "h",
  user_id: 456  (other user)
}
    ↓
Apply to local document
    ↓
Update view:
└─ Show other user's edit in real-time
    ↓
No conflict: users' views remain synchronized
```

## Version History

### Operation Log

```
Store all operations sequentially:
Operation 1: Insert "H" at 0
Operation 2: Insert "e" at 1
Operation 3: Insert "l" at 2
Operation 4: Insert "l" at 3
Operation 5: Insert "o" at 4

Rebuild any version:
├─ Version 1: Apply ops 1
├─ Version 2: Apply ops 1-2
├─ Version 3: Apply ops 1-3
└─ ...
└─ Latest: Apply ops 1-5
```

### Snapshots

```
For efficiency, create snapshots:

Snapshot (every 1000 ops):
└─ Save full document state

Rebuild:
├─ Load snapshot
├─ Apply ops since snapshot
└─ Get any version instantly
```

## Undo/Redo

### Undo Implementation

```
User presses Ctrl+Z
    ↓
Find last operation by this user
    ↓
Create inverse operation:
Insert "hello" → Delete "hello"
Delete "x" → Insert "x"
    ↓
Apply inverse to document
    ↓
Broadcast to other users
```

### Challenge: Collaborative Undo

```
User A types "A" → "A"
User B types "B" → "AB"
User A presses Undo → Should be "B"?

Solution:
├─ Each user has undo stack
├─ Undo only affects their own ops
├─ Other users' changes preserved
```

## Comments & Mentions

### Comments

```
User selects text, adds comment:
{
  type: "comment",
  range: [5, 10],  // character positions
  content: "Fix grammar here",
  user_id: 123,
  timestamp: ...
}

Comments stored separately from document:
├─ Document: content
├─ Comments: metadata (position, content)
└─ Link via position range
```

### Mentions

```
Type "@alice" in comment
    ↓
Autocomplete shows "alice"
    ↓
Tag inserted: @alice (clickable)
    ↓
Alice notified (push notification, email)
```

## Access Control

### Permissions

```
Document: {
  id: "doc_123",
  owner: user_1,
  collaborators: [
    {user_id: 2, role: "edit"},
    {user_id: 3, role: "comment"},
    {user_id: 4, role: "view"}
  ]
}

Roles:
├─ Owner: Full control
├─ Editor: Can edit, comment
├─ Commenter: Can only comment
└─ Viewer: Read-only
```

### Enforcement

```
User sends operation
    ↓
Server checks:
├─ Is user in collaborators?
├─ Does role allow edit? (or just comment/view)
└─ If no permission: reject operation

Prevent:
├─ Unauthorized edits
├─ Viewers from modifying
└─ Commenters from editing
```

## Offline Support

### Offline Edits

```
User loses internet connection
    ↓
Client continues accepting edits
    ↓
Store operations locally (IndexedDB)
    ↓
User returns online
    ↓
Client:
├─ Fetches latest server version
├─ Transforms local ops against server ops
├─ Uploads local ops
└─ Merges all changes

Result: No data loss, conflict-free merge
```

## Performance Optimization

### Debouncing

```
User types continuously:
h → he → hel → hell → hello

Send all to server? Too many!

Instead: Batch after 500ms of inactivity
├─ User types "hello" in 2 seconds
├─ Send 1 operation: "insert 'hello'" at position 0
└─ Reduce network traffic 5x
```

### Compression

```
Send only changes, not full document:
Operation: {type: "insert", pos: 5, content: "x"}
Size: ~50 bytes

vs. Sending full document:
Content: "Hello world and more..."
Size: 10KB+

Bandwidth savings: 200x
```

## Scalability

### Sharding by Document

```
Document 1 → Server A
Document 2 → Server B
Document 3 → Server C

Each server handles:
├─ Receive operations
├─ Transform and apply
├─ Broadcast to clients
└─ Persist to DB

Users editing same doc → Same server
Different docs → Different servers
```

### Crash Recovery

```
Server crashes
    ↓
Operations in memory lost
    ↓
Clients have operations in local queue
    ↓
On reconnect:
├─ Client sends queued operations
├─ Server applies and broadcasts
└─ Convergence restored
```

## Interview Tips

✓ Discuss OT vs CRDT trade-offs
✓ Explain operation transformation
✓ Address conflict resolution
✓ Discuss version history & snapshots
✓ Address offline support
✓ Mention access control
✓ Discuss scalability via sharding
✓ Address real-time synchronization

❌ Don't ignore conflict resolution
❌ Don't underestimate consistency challenges
❌ Don't forget offline editing
❌ Don't ignore access control

---

**Next:** Design a payment system.

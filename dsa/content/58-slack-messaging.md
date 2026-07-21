# System Design Case Study: Slack (Enterprise Messaging)

**Read time:** 12 min | **Difficulty:** Hard

## Problem Statement

Design an enterprise messaging platform like Slack, Microsoft Teams.

### Requirements

**Functional:**
- Direct messages (1:1)
- Group channels
- Message threading (replies)
- Mentions and notifications
- File sharing
- Search messages
- Message history

**Non-Functional:**
- 1M teams, 10M daily active users
- 10M concurrent connections
- Message delivery < 100ms
- 99.99% availability
- Persist all messages indefinitely

## Architecture

```
         Users (Desktop, Mobile, Web)
         ↙        ↓        ↘
    Client    Client    Client
    (WebSocket + REST)
       ↓        ↓        ↓
    Load Balancer
       ↓
    Message Service
    ├─ Receive messages
    ├─ Store in DB
    └─ Fanout to recipients
       ↓
    Cache (Redis)
    ├─ Active channels
    ├─ Message history
    └─ User presence
       ↓
    Database (PostgreSQL)
    ├─ Messages
    ├─ Channels
    └─ Users
```

## Message Flow

### 1. User Sends Message

```
User types in #general channel
Clicks send
    ↓
Client:
└─ POST /channels/general/messages
   {
     "content": "Hello team!",
     "thread_ts": null  // top-level, not reply
   }
```

### 2. Server Receives & Stores

```
Message Service:
1. Validate:
   ├─ User in channel?
   ├─ Message valid (not empty)?
   └─ Not spam?

2. Create message record:
   {
     message_id: "ts_1234567890.001",
     channel_id: "C123",
     user_id: 456,
     content: "Hello team!",
     timestamp: 1234567890,
     thread_ts: null
   }

3. Store in DB:
   INSERT INTO messages (...)

4. Cache in Redis:
   key: channel:C123:messages
   append message_id
   TTL: 24 hours
```

### 3. Fanout to Recipients

```
Get channel members:
SELECT * FROM channel_members WHERE channel_id = 'C123'
Result: [user_1, user_2, user_3, ...]

For each online user:
├─ Send WebSocket message
├─ Format: {type: "message", data: {...}}
└─ Deliver immediately

For each offline user:
├─ Store in unread messages cache
├─ Show unread badge when they return
```

### 4. Receiving User

```
WebSocket message received:
{
  type: "message",
  channel_id: "C123",
  user_id: 456,
  content: "Hello team!",
  timestamp: 1234567890
}

Update local view:
├─ Add message to channel conversation
├─ Play notification sound (if enabled)
└─ Update last_read timestamp
```

## Threading (Replies)

### Thread Structure

```
Message with thread:
main_message (timestamp: 1234567890)
├─ reply 1 (thread_ts: 1234567890)
├─ reply 2 (thread_ts: 1234567890)
└─ reply 3 (thread_ts: 1234567890)

Database:
messages table:
├─ id, content, channel_id, user_id, timestamp
├─ thread_ts (reference to parent)
└─ reply_count (cached, updated on each reply)
```

### Viewing Threads

```
User clicks "2 replies" on message
    ↓
Query:
SELECT * FROM messages
WHERE thread_ts = parent_timestamp
ORDER BY timestamp ASC

Display:
Original message
└─ Reply 1
   └─ Reply 2
   └─ Reply 3

Reply box to add new reply
```

## Direct Messages (1:1)

### Conversation History

```
DM between User A and User B:
Stored as special "DM channel"
channel_id: "dm_A_B" or hash

Display:
Chronological conversation
All messages between A and B
```

### Privacy

```
DM is private:
├─ Only participants see
├─ Not indexed in channel search
├─ Workspace admin can audit (legal)

Access control:
└─ Message.recipient_ids must include user
```

## Search

### Full-Text Search

```
Query: "machine learning"
    ↓
Elasticsearch index all messages:
├─ Content
├─ Files shared
├─ User who posted
└─ Channel name

Results:
Messages containing "machine learning"
Sorted by: Recency, relevance
```

### Advanced Filters

```
Search: "from:@alice in:#general since:2023-01-15"

Parsed:
├─ From: User "alice"
├─ In: Channel "general"
├─ Since: Date 2023-01-15

Query Elasticsearch with filters
Return matching messages
```

## Notifications

### Mention Notifications

```
User types: "Hey @bob, can you review this?"
    ↓
Parse mentions: ["bob"]
    ↓
For mentioned user (bob):
├─ Create notification
├─ Send push notification
├─ Highlight in channel
└─ Show in mentions tab
```

### Threading Notifications

```
You post in #general
Other user replies (creates thread)
    ↓
You get notification:
"User replied to your message in #general"
    ↓
Click → Jump to thread
```

### Customizable Alerts

```
User settings:
├─ Mute channel (no notifications)
├─ Mute thread (no replies notification)
├─ Only mentions (only @mentions alert)
├─ All messages (all notifications)
└─ Quiet hours (22:00 - 08:00)
```

## Presence & Status

### User Status

```
User comes online:
1. WebSocket connected
2. Send presence update:
   {
     user_id: 123,
     status: "active",
     timestamp: now
   }
3. Redis cache updated:
   key: presence:user:123
   value: {status: "active", timestamp}

Broadcast to contacts:
└─ "@alice just came online"

User goes away:
└─ Idle after 5 min inactivity
└─ Status: "away"
```

### Status Indicators

```
Online (green dot): Actively using Slack
Away (yellow dot): Inactive for 5+ min
Offline (gray dot): Not connected
Custom: "In a meeting", "Focused", etc.
```

## File Sharing

### Upload Flow

```
User drags file to channel
    ↓
Client:
├─ Compress (if image)
├─ Generate preview
└─ Upload to file service

File Service:
├─ Validate file (type, size)
├─ Store in blob storage (S3)
├─ Generate thumbnails
└─ Return file URL

Create message:
{
  type: "file_share",
  file_id: "F123",
  file_name: "presentation.pdf",
  file_size: 2000000,
  file_url: "s3://slack/..."
}
```

### Access Control

```
File in public channel:
└─ All channel members can access

File in private channel:
└─ Only channel members

File in DM:
└─ Only participants
```

## Scalability

### WebSocket Server Sharding

```
User connects to WebSocket server
Connection load-balanced to server X

Max connections per server: 100K
1M concurrent users:
└─ Need 10 servers minimum

Sharding by user_id:
hash(user_id) % 10 = server
└─ User 1 → Server 1
└─ User 2 → Server 2
```

### Message Database Sharding

```
Shard by channel_id:
hash(channel_id) % 1000 = shard

Channel C1 → Shard 1
Channel C2 → Shard 2

Benefits:
├─ Channel queries (same shard)
├─ Parallel inserts (different shards)
└─ Independent backups
```

### Caching Strategy

```
Cache Layer 1: Active channels (Redis)
├─ Last 100 messages per channel
├─ TTL: 24 hours
└─ Used for: Most common queries

Cache Layer 2: User presence (Redis)
├─ Online/offline status
├─ Custom status
└─ TTL: Real-time

Cache Layer 3: Channel metadata (Redis)
├─ Channel name, description
├─ Member count
└─ TTL: 1 hour
```

## Database Schema

```sql
-- Channels
CREATE TABLE channels (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100),
  description TEXT,
  workspace_id INT,
  is_private BOOLEAN,
  created_at TIMESTAMP
);

-- Messages
CREATE TABLE messages (
  id VARCHAR(50) PRIMARY KEY,
  channel_id VARCHAR(50),
  user_id INT,
  content TEXT,
  thread_ts VARCHAR(50),  -- NULL if top-level
  reply_count INT DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  FOREIGN KEY (channel_id) REFERENCES channels(id)
);

CREATE INDEX idx_channel_time 
  ON messages(channel_id, created_at DESC);
CREATE INDEX idx_thread 
  ON messages(thread_ts, created_at ASC);

-- Channel members
CREATE TABLE channel_members (
  channel_id VARCHAR(50),
  user_id INT,
  joined_at TIMESTAMP,
  PRIMARY KEY (channel_id, user_id)
);

-- Reactions (emoji)
CREATE TABLE reactions (
  message_id VARCHAR(50),
  user_id INT,
  emoji VARCHAR(50),
  PRIMARY KEY (message_id, user_id, emoji)
);
```

## Edge Cases

### Duplicate Messages

```
Network timeout:
├─ User sends message
├─ Network fails
└─ Client retries

Idempotency key:
├─ Client generates unique key
├─ Server de-dupes (prevent duplicate)
└─ Return original result
```

### Message Ordering

```
Two messages sent nearly simultaneously
Need consistent ordering for all users

Solution:
├─ Use server timestamp (not client)
├─ Server assigns order
└─ All users see same order
```

## Interview Tips

✓ Discuss WebSocket for real-time
✓ Explain threading architecture
✓ Address notification system
✓ Discuss message persistence
✓ Mention search with Elasticsearch
✓ Address scalability via sharding
✓ Discuss presence tracking
✓ Explain de-duplication

❌ Don't ignore ordering guarantees
❌ Don't forget notifications
❌ Don't skip threading design
❌ Don't ignore offline handling

---

**Next:** Live streaming service.

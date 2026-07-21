# System Design Case Study: Chat System

**Read time:** 14 min | **Difficulty:** Hard

## Problem Statement

Design a real-time chat system like WhatsApp, Facebook Messenger, Slack.

### Requirements

**Functional:**
- 1:1 messaging
- Group chat
- Real-time message delivery
- Message history
- Typing indicators (optional)
- Read receipts (optional)
- Emoji support

**Non-Functional:**
- 500M active users
- 1M concurrent users
- Message delivery latency < 100ms
- 99.99% availability
- Handle large groups (1000+ members)

## Back-of-Envelope Calculation

```
1M concurrent users
Average session duration: 30 minutes
Messages per user per minute: 1
→ 1M messages/minute = 16,667 messages/second

Storage (5 years):
1M concurrent users × 30 messages/day × 365 × 5 years
= 54.75B messages
Average message: 200 bytes
= 54.75B × 200B = ~11TB
```

## Communication Protocol

### HTTP (Pull)
```
Client polls server every 1 second
"Any new messages?"
Server responds with all new messages

Problem: Latency (up to 1 second delay)
Problem: Wasted requests (mostly "no new messages")
```

### WebSocket (Full-duplex)
```
Client connects to server (persistent connection)
Server can push messages to client immediately
Client can send messages anytime

Advantage: Real-time, low latency
Advantage: Bidirectional
Problem: Server needs to maintain connections
```

### Recommendation: WebSocket

## Architecture

```
         Clients
    ↙       ↓       ↘
  Mobile  Browser  Web
     ↓       ↓       ↓
    LB (Load Balancer)
    ↙       ↓       ↘
  Chat1   Chat2   Chat3 (WebSocket servers)
    ↓       ↓       ↓
    Message Queue (Kafka)
    ↓
[Message Store]
(Database)
```

## Component Details

### Chat Server (WebSocket)

```
Responsibilities:
- Accept WebSocket connections
- Handle incoming messages
- Broadcast to recipients
- Track online users
- Handle disconnects

Stateful (maintains connections)
Must be sticky (client connects to specific server)
```

### Connection Handler

```
When client connects:
├─ user_id: 123
├─ server: chat-server-1
├─ connection_id: conn_abc123
└─ timestamp: 2023-01-15 10:30:45

Store in cache (Redis)
key: user:123
value: {server: chat-server-1, conn_id: conn_abc123}
```

### Message Queue (Kafka)

```
Purpose: Decouple message sending from delivery
Chat server produces messages to Kafka
Delivery service consumes and forwards

Flow:
User A sends message → Chat server
                    → Kafka (async)
                    → Delivery service
                    → Recipient (if online)
                    → Message store (DB)
```

### Message Delivery Service

```
Reads from Kafka queue
For each message:
├─ Check if recipient online
│  ├─ Yes → Send via WebSocket
│  └─ No → Store for later delivery
└─ Send delivery confirmation
```

## Data Schema

```sql
-- Messages
CREATE TABLE messages (
  id BIGINT PRIMARY KEY,
  sender_id INT NOT NULL,
  recipient_id INT NOT NULL,  -- NULL for group
  group_id INT,               -- NULL for 1:1
  content VARCHAR(4096) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP,
  read_at TIMESTAMP
);

CREATE INDEX idx_recipient_time 
  ON messages(recipient_id, created_at DESC);

CREATE INDEX idx_group_time 
  ON messages(group_id, created_at DESC);

-- Groups
CREATE TABLE groups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  owner_id INT NOT NULL
);

-- Group members
CREATE TABLE group_members (
  group_id INT NOT NULL,
  user_id INT NOT NULL,
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);
```

## Message Flow: Sending

```
1. Sender connects to chat-server-1
   → WebSocket connection established

2. Sender sends message
   {
     "to": 456,
     "content": "Hello!",
     "type": "text"
   }

3. Chat server
   ├─ Validate message
   ├─ Generate message ID
   ├─ Publish to Kafka queue
   ├─ Return ACK to sender
   └─ (async) Store in DB

4. Delivery service
   ├─ Read from Kafka
   ├─ Lookup recipient (Redis)
   │  ├─ Online on chat-server-2
   │  └─ Send via WebSocket
   ├─ If offline, mark pending
   └─ Send delivery confirmation
```

## Online Status

### Track User Presence

```
User connects: chat-server-1
Redis:
  key: user:123:presence
  value: {
    server: chat-server-1,
    status: online,
    last_seen: timestamp
  }

User disconnects or idle > 5 min:
  status: offline
```

### Notify Friends

```
User comes online
→ Chat server publishes to Kafka
→ Notification service sends "User online" to friends
→ Friends' apps show user as online
```

## Handling Group Messages

```
User sends message to group (100 members)

Option 1: Fan-out on write
├─ Create 100 messages in DB
├─ Send 100 WebSocket messages
└─ Slow for large groups

Option 2: Fan-out on read (Better)
├─ Store 1 message
├─ When client loads group
├─ Query: "messages where group_id=X"
├─ Deliver to all
└─ Faster, scalable
```

## Typing Indicators

Show "user is typing..." indicator:

```
User starts typing
→ WebSocket message: {type: "typing"}
→ Broadcast to other group members
→ Their app shows indicator

After 3 seconds of no typing:
→ WebSocket message: {type: "stopped_typing"}
→ Indicator disappears
```

Note: Don't store typing indicators, only broadcast.

## Message History

### Pagination

```
GET /api/messages?with=123&limit=50&offset=0

Response:
{
  "messages": [...50 messages...],
  "has_more": true,
  "oldest_id": 12345
}
```

### Efficient Querying

```
Query: Latest 50 messages with user 123

CREATE INDEX idx_conversation 
  ON messages(
    LEAST(sender_id, recipient_id),
    GREATEST(sender_id, recipient_id),
    created_at DESC
  );
```

## Read Receipts

```
Message sent at: 10:30:00
Message received at: 10:30:05 (delivered)
Message read at: 10:30:15 (user opened chat)

Store:
message_id: 123
delivered_at: 10:30:05
read_at: 10:30:15
```

### Async Updates

```
User opens chat with 100 unread messages
Don't update 100 rows immediately
Async job updates read status
Notify sender via Kafka/WebSocket
```

## Handling Offline Messages

```
User was offline, 50 new messages arrived

Option 1: Store all, send on reconnect
├─ Can be slow if many messages
├─ User waits

Option 2: Sync recent messages, load history
├─ On reconnect: send last 50 messages
├─ Older messages loaded on demand
├─ Fast reconnection
```

## Scalability

### WebSocket Server Limitations

```
Each connection uses resources
1 chat server can handle ~100K connections
Need 10,000 servers for 1M concurrent
```

### Horizontal Scaling

```
User connects
├─ Load balancer routes to chat-server-X
└─ Server maintains connection
   
Problem: If server crashes, connection lost
Solution: Sticky sessions + reconnect logic
```

### Multi-Datacenter

```
Regional servers for latency
User connects to nearest region
Messages flow through global message queue
All regions see same messages
```

## Interview Tips

✓ Explain WebSocket vs HTTP trade-offs
✓ Discuss message queue architecture
✓ Address online status tracking
✓ Mention group message optimization
✓ Discuss read receipts and delivery
✓ Address reconnection strategy
✓ Explain multi-region setup
✓ Discuss scalability limits

❌ Don't ignore latency requirements
❌ Don't forget about offline users
❌ Don't ignore message ordering
❌ Don't forget reconnection logic

---

**Next:** Design a video streaming service with adaptive bitrate.

# System Design Case Study: Social Media Feed

**Read time:** 14 min | **Difficulty:** Hard

## Problem Statement

Design a social media feed system like Facebook, Twitter, Instagram.

### Requirements

**Functional:**
- Post creation and deletion
- Feed generation (personalized)
- Liking/commenting
- Following/followers
- Trending posts
- Search

**Non-Functional:**
- 1B users, 100M active daily
- Each user has 200 connections average
- 500M posts per day
- Feed latency < 100ms
- 99.9% availability

## Back-of-Envelope Calculation

```
500M posts/day = ~5,787 posts/second

Feed generation:
100M active users × 200 connections × scroll 3 times/day
= 60B feed queries/day
= ~694K queries/second

Storage (5 years):
500M posts × 365 × 5 = 912.5B posts
Each post: 500 bytes = 456TB
```

## Core Concepts

### Write vs Read Heavy

```
Writes: 5,787 posts/second
Reads: 694K queries/second

Read-heavy system (120x more reads)
→ Optimize for reading
→ Accept more write latency
```

### Friends/Followers Graph

```
User A follows: User B, C, D (3 following)
User A has followers: User X, Y, Z (3 followers)

Feed for A = posts from B, C, D + own posts
→ Personalized to A's connections
```

## Architecture Option 1: Fanout on Read

```
User scrolls feed
← Query: "posts from users I follow"
    ↓
Database
├─ Get my following list
├─ Query posts from each
├─ Rank and return top 10
    
Advantage: Low write latency (just store post)
Disadvantage: High read latency (~1 second)
```

## Architecture Option 2: Fanout on Write

```
User posts
← Write to DB
    ↓
Fanout service
├─ Get all followers of user
├─ For each follower:
│  └─ Add post to their feed cache
    
Advantage: Feed reads fast (~10ms)
Disadvantage: High write latency, hard for celebrities
```

### Celebrity Problem

```
Celebrity: 10M followers
Posts 1 tweet
Fanout service must update 10M feed caches
= 10 seconds latency (bad!)

Solution: Hybrid approach
├─ Normal users: fanout on write
└─ Celebrities: fanout on read
```

## Recommended Approach: Hybrid

```
Fanout on Write (for normal users):
├─ User posts
├─ Immediately add to followers' feed cache
└─ Feed read is instant

Fanout on Read (for celebrities):
├─ User posts (low latency write)
├─ Followers query feed with special logic
│  ├─ Include celebrity's recent posts
│  └─ Rank together
└─ Feed read has longer latency
```

## Database Schema

```sql
-- Users
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Posts
CREATE TABLE posts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  content VARCHAR(280),  -- Twitter limit
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

CREATE INDEX idx_user_time 
  ON posts(user_id, created_at DESC);

-- Follows relationship
CREATE TABLE follows (
  follower_id INT NOT NULL,
  following_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (follower_id, following_id)
);

-- Feed cache (Redis)
user_feed:123 = [
  {post_id: 999, user_id: 456, timestamp: ...},
  {post_id: 998, user_id: 789, timestamp: ...},
  ...
]

-- Likes
CREATE TABLE likes (
  post_id BIGINT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

-- Comments
CREATE TABLE comments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  post_id BIGINT NOT NULL,
  user_id INT NOT NULL,
  content VARCHAR(280),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Feed Generation Flow

### Hybrid Approach Implementation

```
1. User scrolls feed
   GET /api/feed?limit=10

2. Feed service
   ├─ Get cached feed from Redis
   │  (prepared by fanout on write)
   ├─ Get recent posts from celebrities
   │  (fanout on read)
   ├─ Merge and rank posts
   ├─ Return top 10
   └─ Cache in Redis for next scroll

3. Return to user
   {
     "posts": [
       {
         "id": 123,
         "author": "alice",
         "content": "...",
         "likes": 5000,
         "comments": 200,
         "timestamp": "..."
       },
       ...
     ]
   }
```

## Ranking Algorithm

Determine post order in feed:

### Simple: Recency

```
Sort by created_at DESC
Newest first
Problem: Popular posts buried quickly
```

### Better: Engagement-Based Ranking

```
score = (likes × 0.5) + (comments × 1.0) + (shares × 2.0)
Combine with recency:
score *= decay_factor(age_minutes)

Result: Balance recency with engagement
```

### Machine Learning Ranking

```
Factors:
├─ Recency (posted < 1 hour: high score)
├─ Engagement (likes, comments, shares)
├─ Author popularity
├─ User's interaction history with author
├─ Content similarity to user's interests
├─ Timing (post when user usually online)

ML model predicts: "Will user like this post?"
Sort by prediction score
```

## Fanout on Write Implementation

```
User 123 posts: "Hello world!"

Fanout service:
├─ Query: SELECT follower_id FROM follows 
│         WHERE following_id = 123
├─ For each follower in result:
│  ├─ Add post to Redis feed cache
│  │  LPUSH user_feed:follower_id post_data
│  └─ Keep only latest 1000 posts (LTRIM)
└─ Mark user as having new posts
```

### Asynchronous Fanout

```
User posts (write to DB immediately)
    ↓
Send to message queue (Kafka)
    ↓
Fanout service (async, from queue)
├─ Process in parallel
├─ Update followers' feeds
└─ Handle failures with retry

Result: User sees confirmation fast
Feed updates propagate seconds later
```

## Scaling Concerns

### Feed Cache Size

```
1B users × 1000 posts per feed = 1T entries
Each entry: 100 bytes = 100TB

Distribute across shards:
hash(user_id) % num_shards = shard_index

With 100 shards: 1TB each (manageable)
With 1000 shards: 100GB each (very manageable)
```

### Hot Users (Trending Users)

```
User trending: 100K new followers/hour
Too many updates to their feed cache
→ Use consistent hashing for cache
→ Distribute load across multiple shards
```

### Comments & Likes

Store separately from posts:

```
Post: {id, content, timestamp}
Comments: {post_id, user_id, content}
Likes: {post_id, user_id}

Benefits:
├─ Separate scaling for comments
├─ Can update likes without loading full post
└─ Efficient pagination
```

## Feed Refresh Strategy

### Pull Model

```
User opens app
→ Fetch feed from server
→ Display posts
```

### Push Model

```
Server maintains connection
→ When new posts arrive, push to client
→ Client app updates automatically
```

### Hybrid Model

```
Initial load: pull from server
New posts: push to app
User scrolls up: refresh (pull)
```

## Notifications

When users interact with your posts:

```
User A likes your post
→ Notification service
→ Send push notification to User A
→ "UserB liked your post"
→ Mark as read when user taps

Also track:
├─ Follows you
├─ Comments on your post
├─ Replies to your comment
└─ Mentions @yourname
```

## Trending Posts

### Trending Algorithm

```
For each time window (1 hour):
├─ Count posts in each topic/hashtag
├─ Calculate growth rate
├─ Rank by engagement velocity
└─ Return top 10

Velocity = (current_likes - last_likes) / time_delta
High velocity = trending
```

### Implementation

```
Time-series database tracks metrics:
timestamp | hashtag | likes | comments

Query: "What's trending in last 1 hour?"
→ Sort by engagement growth
→ Return top 10
```

## Search

### Index Full-Text Search

```
Elasticsearch index all posts
├─ Content
├─ Author
├─ Hashtags
└─ Timestamp

User searches: "machine learning"
→ Elasticsearch returns matching posts
→ Rank by relevance + recency
```

## Interview Tips

✓ Discuss fanout on write vs read trade-offs
✓ Explain hybrid approach for celebrities
✓ Address feed ranking algorithm
✓ Mention caching strategy
✓ Discuss database schema and indexing
✓ Address notification system
✓ Explain trending algorithm
✓ Discuss search/discovery

❌ Don't ignore celebrity problem
❌ Don't forget notification system
❌ Don't ignore feed staleness
❌ Don't underestimate storage requirements

---

**Complete:** System design fundamentals and case studies ready for interview prep!

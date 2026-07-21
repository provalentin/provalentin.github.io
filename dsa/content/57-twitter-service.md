# System Design Case Study: Twitter (Distributed Tweet Service)

**Read time:** 12 min | **Difficulty:** Hard

## Problem Statement

Design a distributed tweet/post service like Twitter, X.

### Requirements

**Functional:**
- Post tweets (text + media)
- Timeline (tweets from followed users)
- Retweet, reply, like
- Search tweets
- Trending topics
- Direct messages

**Non-Functional:**
- 500M users, 150M daily active
- 500K new tweets per second
- Timeline query < 100ms
- Maintain historical data (archive)
- Real-time trending (5 minute window)

## Back-of-Envelope Calculation

```
500K tweets/second × 280 bytes = 140MB/sec

Per day: 140MB/sec × 86,400 = 12TB/day
Per year: 12TB × 365 = 4.38PB/year

Search index: Need to index all tweets (billions)
Elasticsearch: ~1 index server per 1B tweets
```

## Tweet Storage

### Tweet Structure

```
Tweet:
{
  id: "1234567890",           // Snowflake ID
  user_id: 123,
  content: "Hello world!",
  timestamp: 1234567890,
  retweet_count: 100,
  like_count: 500,
  reply_count: 20,
  media: [img_url, video_url],
  hashtags: ["tech", "ai"],
  mentions: ["@alice", "@bob"]
}

Primary storage: Database (PostgreSQL)
Hot cache: Redis (recent tweets)
Search: Elasticsearch
Archive: S3 (old tweets)
```

### ID Generation: Snowflake

```
Snowflake ID structure:
[Timestamp (41 bits)][Datacenter (5 bits)][Machine (5 bits)][Sequence (12 bits)]

Advantage:
├─ Sortable by creation time
├─ Distributed generation (no central DB)
├─ Globally unique
└─ 12 bits sequence = 4096 IDs per millisecond

Example:
ID: 1234567890123456789
└─ Decoding: Created at timestamp, machine 1, sequence 5
```

## Timeline (Feed) Generation

### Fanout on Write

```
User posts tweet:
    ↓
Tweet Service:
1. Store in DB
2. Add to own timeline (cache)
3. Get followers list
4. For each follower:
   └─ Add tweet_id to their timeline cache

Follower loads feed:
├─ Fetch from timeline cache (Redis)
├─ Get tweet details (from DB or cache)
└─ Display

Latency:
├─ Write: Slow (fanout to millions of followers)
├─ Read: Fast (< 100ms from cache)
```

### Fanout on Read

```
User A posts tweet
    ↓
Just store in DB
No fanout

Follower loads feed:
├─ Query: tweets from users I follow
├─ Join with followers table
├─ Get last 20 tweets
└─ Display

Latency:
├─ Write: Fast (just store)
├─ Read: Slow (query multiple users)
```

### Hybrid (Recommended for Twitter)

```
Normal users (< 100K followers):
└─ Fanout on write (timeline push)

Celebrities (> 100K followers):
└─ Fanout on read (special query)

Example:
Timeline includes:
├─ Pushed tweets (normal users)
├─ Celebrity tweets (queried on-demand)
└─ Merged, ranked, returned to user
```

## Tweet Search

### Inverted Index (Elasticsearch)

```
Index all tweets:
"hello world" → [tweet1, tweet3, tweet5]
"world" → [tweet2, tweet3, tweet5]

Query: "hello world"
Result: tweets containing both words
Rank by: relevance + recency
```

### Real-time Indexing

```
Tweet posted
    ↓
Store in DB
    ↓
Async indexing via Kafka:
├─ Tweet Service → Kafka queue
├─ Indexer consumes → Elasticsearch
└─ Index updated (lag: few seconds)

Result:
├─ Fast tweet creation (DB write only)
├─ Eventual consistency (index updates async)
```

### Search Features

```
Advanced search:
├─ From: @alice (tweets by alice)
├─ Since: 2023-01-15 (after date)
├─ Until: 2023-01-20 (before date)
├─ Has: links (tweets with links)
├─ Min_faves: 100 (at least 100 likes)

Query expansion:
"machine learning" → expand to synonyms
├─ "ML"
├─ "deep learning"
└─ "neural networks"
```

## Trending Topics

### Algorithm

```
Rolling time window: 5 minutes

Every minute:
├─ Count tweets for each hashtag (last 5 min)
├─ Calculate growth vs 5 min before
├─ Sort by growth rate (momentum)
└─ Update trending cache

Trending ranks by: New momentum, not total volume

Example:
#AI:      1000 → 1500 = 50% growth
#Love:   50000 → 50100 = 0.2% growth
#AI ranks higher (trending)
```

### Implementation

```
Redis:
key: trending:hash:<interval>
value: [
  {tag: "AI", count: 1500, growth: 0.5},
  {tag: "Bitcoin", count: 800, growth: 0.3},
  ...
]

Background job every minute:
├─ Query tweets last 5 minutes
├─ Count hashtags
├─ Compute growth
├─ Update Redis
└─ Cache updated (< 1 second delay)

User sees trending:
├─ Load from Redis cache
└─ Always fresh (updated every minute)
```

## Retweet & Like System

### Retweet

```
User retweets tweet X:
    ↓
Create new tweet:
{
  id: new_tweet_id,
  user_id: retweeter_id,
  content: null,  // No original content
  retweet_of: original_tweet_id,
  timestamp: now
}

Display:
"Alice retweeted Bob's tweet"
[Original tweet content shown]

Retweet count:
SELECT COUNT(*) FROM tweets WHERE retweet_of = original_tweet_id
```

### Like

```
User likes tweet X:
    ↓
INSERT INTO likes (user_id, tweet_id, timestamp)

Like count (cached):
Redis: likes:tweet:X → 5000
Update immediately on new like

Query tweet details:
Include like_count from cache
Show if current user liked
```

## Database Schema

```sql
-- Tweets
CREATE TABLE tweets (
  id BIGINT PRIMARY KEY,        -- Snowflake ID
  user_id INT NOT NULL,
  content VARCHAR(280),
  retweet_of BIGINT,            -- NULL if original
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE INDEX idx_user_time 
  ON tweets(user_id, created_at DESC);
CREATE INDEX idx_retweet_time 
  ON tweets(created_at DESC) WHERE retweet_of IS NULL;

-- Likes
CREATE TABLE likes (
  user_id INT NOT NULL,
  tweet_id BIGINT NOT NULL,
  created_at TIMESTAMP,
  PRIMARY KEY (user_id, tweet_id)
);

-- Hashtags
CREATE TABLE tweet_hashtags (
  tweet_id BIGINT NOT NULL,
  hashtag VARCHAR(100) NOT NULL,
  PRIMARY KEY (tweet_id, hashtag)
);

-- Mentions
CREATE TABLE tweet_mentions (
  tweet_id BIGINT NOT NULL,
  mentioned_user_id INT NOT NULL,
  PRIMARY KEY (tweet_id, mentioned_user_id)
);
```

## Notifications

### Tweet Interactions

```
When someone likes your tweet:
├─ Create notification
├─ Send push (if user subscribed)
└─ Show in notifications tab

When someone replies to your tweet:
├─ Notification
├─ Show reply in thread
└─ Mention them if they replied

When someone you follow posts:
├─ Add to timeline (via fanout)
└─ No explicit notification (too noisy)

When someone mentions you (@username):
├─ Notification
├─ Show in @mentions tab
└─ Alert immediately
```

## Scalability

### Tweet Sharding

```
Shard by user_id:
hash(user_id) % 1000 = shard

User 123 → Shard 1 (all their tweets)
User 456 → Shard 2

Benefits:
├─ Timeline queries (same shard)
├─ Individual scale
└─ No cross-shard joins
```

### Timeline Caching

```
Pre-compute timelines:
key: timeline:user:123
value: [tweet_id_1, tweet_id_2, ..., tweet_id_N]

Fetch tweet details separately:
For each tweet_id:
├─ Check cache: tweets:<tweet_id>
├─ If miss: Query DB
└─ Build full tweet objects
```

### Search at Scale

```
Elasticsearch cluster:
├─ Shard 1: tweets 0-10B
├─ Shard 2: tweets 10B-20B
├─ ...
├─ Shard N: tweets (N-1)*10B-N*10B

Query hits multiple shards in parallel
Merge results
Return top 20
```

## Real-time Updates

### WebSocket for Live Timeline

```
User A follows User B

User B posts new tweet
    ↓
WebSocket event pushed to User A
    ↓
User A's app:
├─ Receives event
├─ Updates timeline (add new tweet)
└─ Shows "1 new tweet" banner

Optional: Auto-refresh or require user click
```

## Interview Tips

✓ Discuss Snowflake ID generation
✓ Explain fanout strategy for celebrities
✓ Address timeline ranking
✓ Discuss trending algorithm
✓ Explain search with Elasticsearch
✓ Address real-time updates
✓ Mention caching strategy
✓ Discuss sharding by user

❌ Don't ignore celebrity problem
❌ Don't forget notification system
❌ Don't skip trending algorithm
❌ Don't ignore search latency

---

**Next:** Design Slack/enterprise messaging.

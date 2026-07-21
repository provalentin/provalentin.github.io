# System Design Case Study: Instagram (Photo Sharing & Timeline)

**Read time:** 14 min | **Difficulty:** Hard

## Problem Statement

Design a photo sharing service like Instagram, Pinterest.

### Requirements

**Functional:**
- Upload photos with metadata
- Create timelines (followers' posts)
- Like, comment on photos
- Follow/unfollow users
- Search by hashtags
- Trending photos

**Non-Functional:**
- 1B users, 100M daily active
- 1M uploads per day
- Timeline generation < 100ms
- Persist all photos indefinitely
- Global reach (CDN needed)

## Back-of-Envelope Calculation

```
1M photo uploads per day
Average photo size: 2MB (after compression)

Storage per day: 2TB
Storage per year: 730TB
Storage per 10 years: 7.3PB

Cost: $0.023/GB/month on S3 = $172M/year for storage
```

## Photo Storage & Processing

### Photo Upload Flow

```
1. User selects photo
   ↓
2. Client compresses:
   ├─ Resize to standard sizes
   ├─ Generate thumbnails
   └─ Optimize for web (JPEG compression)
   ↓
3. Upload to blob storage (S3):
   ├─ Original: 2MB
   ├─ Medium (500px): 400KB
   ├─ Thumbnail (100px): 50KB
   └─ Total: 2.45MB
   ↓
4. Async processing:
   ├─ Generate more thumbnails
   ├─ Apply filters
   ├─ Detect objects/tags
   └─ Extract metadata
   ↓
5. Store metadata in DB:
   ├─ photo_id, user_id, caption, timestamp
   ├─ hashtags: [#nature, #sunset]
   ├─ location: lat/lng
   └─ Image URLs (S3 links)
```

### Photo Formats

```
Original (uploaded): 2MB (full resolution)
Display (feed): 500px wide (400KB)
Thumbnail (profile): 100px (50KB)
Square (search): 200px (100KB)

Generate multiple sizes:
├─ Reduces bandwidth (serve appropriate size)
├─ Faster downloads
└─ Client-side optimization
```

## Timeline Generation

### Feed Strategy: Fanout on Write (Most common)

```
User A posts photo
    ↓
Fanout Service:
├─ Get all followers of User A
├─ For each follower: add photo to their timeline cache
└─ Timeline immediately includes new photo

Follower opens app:
├─ Load timeline from cache (fast)
└─ See User A's photo
```

### Timeline Storage

```
Redis (cache per user):
key: timeline:user:123
value: [
  {photo_id: 1, user_id: 456, timestamp: ...},
  {photo_id: 2, user_id: 789, timestamp: ...},
  ...
]
TTL: 1 day (pre-computed)

Max timeline size: 1000 photos
(older posts cleared)
```

### Celebrity Problem

```
User with 10M followers posts
    ↓
Fanout: Update 10M timelines = 10 seconds (slow!)

Solution: Hybrid
├─ Celebrities: Fanout on read
│  (followers query with special logic)
├─ Normal users: Fanout on write
│  (add to followers' caches immediately)
└─ Threshold: > 1M followers = celebrity
```

## Like & Comment System

### Like Storage

```
Table: likes
user_id | photo_id | timestamp
123     | 456      | 2023-01-15 10:30:45
789     | 456      | 2023-01-15 10:31:12
...

Index: (photo_id, timestamp DESC) for fast count

Like count query:
SELECT COUNT(*) FROM likes WHERE photo_id = 456
Cache in Redis for fast access
```

### Comment Threads

```
Table: comments
id | photo_id | user_id | content | timestamp | parent_id

Hierarchy:
Root comment (parent_id = NULL)
└─ Reply 1 (parent_id = comment_id)
└─ Reply 2 (parent_id = comment_id)

Fetch comments:
SELECT * FROM comments 
WHERE photo_id = 456 AND parent_id IS NULL
ORDER BY timestamp DESC
LIMIT 10

Replies fetched on-demand (click "View replies")
```

## Hashtag Search & Trending

### Hashtag Index

```
Table: hashtags
id | tag | count | updated_at

When photo tagged with #sunset:
├─ Check if hashtag exists
├─ If not: INSERT
├─ If exists: UPDATE count += 1

Query: Find all photos with #sunset
SELECT photo_id FROM photo_hashtags
WHERE hashtag_id = (SELECT id FROM hashtags WHERE tag='sunset')
LIMIT 50
ORDER BY timestamp DESC
```

### Trending Algorithm

```
For each hashtag:
├─ Count photos in last 24 hours
├─ Calculate growth rate
├─ Rank by momentum (not total count)

Growth = (count_today - count_yesterday) / count_yesterday

Trending:
├─ #NewYearResolution (10K → 50K = 5x growth)
├─ #MondayMotivation (100K → 200K = 2x growth)
└─ #Photography (5M → 5.1M = 2% growth, not trending)

Sort by growth rate
Show top 50
```

## Database Schema

```sql
-- Photos
CREATE TABLE photos (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  caption VARCHAR(2200),
  location_lat FLOAT,
  location_lng FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Photo metadata (URLs, sizes)
CREATE TABLE photo_metadata (
  photo_id BIGINT PRIMARY KEY,
  original_url VARCHAR(500),
  display_url VARCHAR(500),   -- 500px
  thumbnail_url VARCHAR(500),
  square_url VARCHAR(500),
  FOREIGN KEY (photo_id) REFERENCES photos(id)
);

-- Hashtags
CREATE TABLE photo_hashtags (
  photo_id BIGINT NOT NULL,
  hashtag_id INT NOT NULL,
  PRIMARY KEY (photo_id, hashtag_id)
);

CREATE TABLE hashtags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tag VARCHAR(100) UNIQUE,
  count INT DEFAULT 1,
  updated_at TIMESTAMP DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
);

-- Likes
CREATE TABLE likes (
  user_id INT NOT NULL,
  photo_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, photo_id)
);

-- Comments
CREATE TABLE comments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  photo_id BIGINT NOT NULL,
  user_id INT NOT NULL,
  content VARCHAR(500),
  parent_id BIGINT,  -- for nested comments
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_photo_parent 
  ON comments(photo_id, parent_id, created_at DESC);
```

## Timeline Ranking

### Algorithm

```
score = recency + engagement

Recency:
├─ Posted < 1 hour: max score
├─ 1-6 hours: high score
├─ 6-24 hours: medium score
└─ > 24 hours: low score

Engagement:
├─ Likes (weight: 1x)
├─ Comments (weight: 2x)
├─ Shares (weight: 3x)

Score = likes + 2*comments + 3*shares
Decay: score *= (1 / (hours_ago + 1))

Sort by score, show top 20 on first scroll
```

## Notifications

```
When someone likes your photo:
├─ Create notification record
├─ Send push notification
├─ Show in notification feed

When someone comments:
├─ Same as above
├─ If mentioned (@username): tag them

When someone follows you:
├─ Notification
└─ But less critical (batch in digest)
```

## Search & Discovery

### Content Discovery

```
Explore tab recommendations:
├─ Photos you might like (based on follows)
├─ Trending photos (most liked/shared)
├─ Popular hashtags
├─ Suggested users to follow

Algorithm:
├─ Collaborative filtering (users like you liked X)
├─ Content-based (similar to your posts)
└─ Popularity (trending content)
```

### Search Index

```
Elasticsearch for full-text search:
├─ Photo caption
├─ Hashtags
├─ User names
└─ Location names

Query: "beach sunset"
Results: Photos with caption, hashtags matching
Sort by: Relevance + recency
```

## Scalability

### Sharding by User

```
Timeline:
hash(user_id) % 1000 = shard
Each shard stores timelines for ~1M users

Photos:
hash(photo_id) % 1000 = shard
Each shard stores photos and metadata
```

### CDN for Images

```
Original photos stored in S3 (expensive)
Copies cached at CDN edge servers (cheap)

User in Tokyo:
├─ Request photo
├─ CDN Tokyo serves (fast, < 50ms)
└─ Saved bandwidth to origin

CDN saves 90% bandwidth costs!
```

### Caching Strategy

```
Cache Layer 1: Timeline (Redis)
├─ Pre-computed per user
├─ 1000 most recent photos
└─ TTL: 1 day

Cache Layer 2: Photo details
├─ Photo metadata (caption, likes)
├─ TTL: 1 hour
└─ Refresh on like/comment

Cache Layer 3: Trending tags
├─ Top 100 hashtags
├─ TTL: 1 hour
└─ Refresh hourly
```

## Interview Tips

✓ Discuss fanout strategy (write vs read)
✓ Address celebrity problem
✓ Explain timeline ranking algorithm
✓ Discuss hashtag indexing and trending
✓ Address photo storage optimization
✓ Mention CDN for image delivery
✓ Discuss cache hierarchy
✓ Address scalability via sharding

❌ Don't ignore image compression
❌ Don't forget notification system
❌ Don't skip trending algorithm
❌ Don't ignore search indexing

---

**Next:** Twitter/distributed tweet service.

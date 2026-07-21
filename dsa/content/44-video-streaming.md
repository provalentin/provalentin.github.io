# System Design Case Study: Video Streaming Service

**Read time:** 14 min | **Difficulty:** Hard

## Problem Statement

Design a video streaming service like Netflix, YouTube.

### Requirements

**Functional:**
- Upload videos
- Stream to users (playback)
- Search/browse videos
- Recommendations
- Pause/resume/seek
- Different video qualities
- Subtitle support

**Non-Functional:**
- 1B users, 100M creators
- 500M video views per day
- 99.9% availability
- Support 4K, 1080p, 720p, 480p, 360p
- Streaming latency < 1 second
- Video encoded within 1 hour of upload

## Back-of-Envelope Calculation

```
500M views/day
Average watch time: 30 minutes
Average video bitrate: 1.5 Mbps

Bandwidth per day:
500M × 30 min × 1.5 Mbps = 11.25 Pbps × minutes
≈ 3.75 PB/day
```

## Architecture Overview

```
        Upload         Watch
        ↓              ↓
    Encoder      CDN/Cache
        ↓              ↓
   Storage      Users
     (S3)
        ↑
      DB
   (metadata)
```

## Video Upload & Encoding

### Upload Process

```
1. User selects video file
   └─ Client uploads to blob storage (S3)

2. Upload service
   ├─ Stores video metadata (DB)
   ├─ Creates task in encoding queue
   └─ Returns video ID to user

3. Video status: "Processing"
   └─ User sees "Your video is being processed"
```

### Encoding/Transcoding

Convert video to multiple formats and bitrates:

```
Original video (2GB, 4K)
        ↓
Encoder service
├─ 4K (25 Mbps) → 2GB
├─ 1080p (10 Mbps) → 800MB
├─ 720p (5 Mbps) → 400MB
├─ 480p (2.5 Mbps) → 200MB
└─ 360p (1 Mbps) → 100MB
        ↓
   Store in S3
   (each version separate file)
```

### Encoding Queue

Use message queue (Kafka/RabbitMQ) for encoding tasks:

```
Upload → Queue: {video_id: 123, status: pending}
            ↓
Encoder service reads queue
├─ Encode video
├─ Upload to S3
├─ Update DB: status = ready
└─ Publish: "video:123:encoded"
            ↓
Notification service
└─ Send email: "Your video is ready!"
```

### Progressive Encoding

```
Priority queue based on video views:
HIGH: Recently uploaded videos (fast encoding)
MEDIUM: Older videos
LOW: Rarely watched videos

Reduces latency for popular videos
```

## Video Playback

### Adaptive Bitrate Streaming (ABR)

Adjust quality based on network speed:

```
User has 5 Mbps internet
├─ Start with 720p (5 Mbps)
├─ Monitor: buffer time, latency
├─ If buffer low: switch to 480p (2.5 Mbps)
├─ If buffer high: switch to 1080p (10 Mbps)
└─ Seamless quality switches
```

### Streaming Protocols

**HLS (HTTP Live Streaming)**
```
Divide video into 10-second chunks
Client downloads chunks in sequence
Quality can change between chunks

Good for: Mobile, varying bandwidth
```

**DASH (Dynamic Adaptive Streaming)**
```
Similar to HLS, more flexible
Server provides manifest with available qualities
Client chooses quality

Good for: Web, consistent performance
```

### CDN Caching

```
Videos cached at edge servers globally
User requests → nearest CDN node (cached)
vs. requesting from origin (far away)

Bandwidth: $0.02/GB from origin
CDN: $0.01/GB (50% savings on bandwidth costs!)
```

## Database Schema

```sql
-- Videos
CREATE TABLE videos (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration_seconds INT,
  view_count BIGINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  status ENUM('processing', 'ready', 'failed')
);

CREATE INDEX idx_user_created 
  ON videos(user_id, created_at DESC);

-- Encoding Tasks
CREATE TABLE encoding_tasks (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  video_id BIGINT NOT NULL,
  quality ENUM('4K', '1080p', '720p', '480p', '360p'),
  status ENUM('pending', 'encoding', 'done', 'failed'),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Watch History
CREATE TABLE watch_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  video_id BIGINT NOT NULL,
  watched_seconds INT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_time 
  ON watch_history(user_id, created_at DESC);
```

## Playback Architecture

```
         User
         ↓
    Playback service
    ├─ Get video metadata
    ├─ Choose CDN/origin
    └─ Provide manifest + chunks
         ↓
    CDN or origin server
    ├─ Deliver video chunks
    ├─ Log playback metrics
    └─ Support seek/pause
         ↓
    Analytics
    ├─ Track watch time
    ├─ Quality switches
    └─ Buffer events
```

## Content Delivery Network (CDN)

### How CDN Works

```
Origin server (one location)
        ↑
      
        ← Replicate to edge servers
        
Edge servers (distributed globally)
├─ US-West (user in LA) → nearest node
├─ EU-North (user in London) → nearest node
├─ APAC (user in Tokyo) → nearest node
└─ All serve same content, different speeds
```

### Cache Invalidation

```
Video updated
→ Invalidate cache at all edge servers
→ New version downloaded from origin
→ Users get latest version

Delay: ~30 seconds to propagate
```

## Seeking/Resuming

### Store Progress

```
User watches 20 minutes, pauses
→ Save: {user_id, video_id, progress: 20:00}
→ Store in database

Next day, user resumes
← Load saved progress
← Jump to 20:00 (seek)
← Continue from there
```

### Seek Efficiency

```
User seeks to 1 hour in 2-hour video
Don't download first hour!

Manifest shows chunk boundaries:
Chunk 1: 0:00-0:10
Chunk 2: 0:10-0:20
...
Chunk 360: 1:00:00-1:00:10

Seek to 1:00:00 → start from chunk 360
```

## Analytics & Recommendations

### View Analytics

```
Every playback event:
├─ user_id, video_id, timestamp
├─ Quality, bitrate, buffer events
├─ Pause/resume, seek points
└─ Watch time

Store in time-series DB (fast writes)
Query: Top 100 videos today → recommend
```

### Recommendation Algorithm

```
Collaborative filtering:
Users who watched video A also watched B
→ Recommend B to you if you watched A

Content-based:
Similar metadata (category, tags, duration)
→ Recommend if similar to videos you liked
```

## Live Streaming Support

```
Live stream (e.g., sports event)
└─ Different architecture:

Encoder captures video in real-time
     ↓
   Transcoder (multiple qualities)
     ↓
   CDN (broadcast to viewers)
     ↓
   Viewers see live (latency ~10-20s)
```

## Monetization: Ads

```
Free tier: Show ads
Premium tier: No ads

Ad insertion:
├─ Before video (pre-roll)
├─ During video (mid-roll)
└─ After video (post-roll)
```

## Scaling Challenges

### Huge Dataset

```
1B users × 100 items recommended = 100B records
Can't store all in DB

Solution: Compute on-demand
├─ User views video X
├─ Query: "Users like X → videos to recommend"
├─ Return top 10 in seconds
└─ Cache hot recommendations
```

### Real-time Encoding

```
100K videos uploaded daily
Want encoding < 1 hour

Resources: 10,000 encoding cores
All running 24/7
Cost: $millions/month
```

### Bandwidth Costs

```
500M views × 30 min × 1.5 Mbps = 11.25 PB/month
CDN cost: $0.01/GB = $112.5M/month

Optimize:
├─ Reduce bitrate via better codec
├─ Aggressive caching
├─ CDN compression
```

## Interview Tips

✓ Discuss encoding strategy and formats
✓ Explain CDN for content delivery
✓ Address adaptive bitrate streaming
✓ Discuss database schema for metadata
✓ Mention seek efficiency (byte ranges)
✓ Address real-time encoding queue
✓ Discuss analytics and recommendations
✓ Address bandwidth optimization

❌ Don't ignore encoding delays
❌ Don't forget about cache invalidation
❌ Don't ignore CDN topology
❌ Don't forget analytics at scale

---

**Next:** Design a social media feed with ranking algorithm.

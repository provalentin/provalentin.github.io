# System Design Case Study: Live Streaming Service

**Read time:** 13 min | **Difficulty:** Hard

## Problem Statement

Design a live streaming platform like Twitch, YouTube Live.

### Requirements

**Functional:**
- Stream video in real-time
- Watch live streams
- Chat during stream
- Viewers count
- Monetization (ads, subscriptions)
- VOD (save stream as video on demand)

**Non-Functional:**
- 10M concurrent streams
- 100M concurrent viewers at peak
- Latency: < 10 seconds (acceptable for live)
- 99.9% availability
- Adaptive quality (adjusts to bandwidth)

## Back-of-Envelope Calculation

```
10M concurrent streams
Average bitrate: 5 Mbps (high quality)
Peak bandwidth: 50 Pbps (petabits/sec)

Cost: $10/Pbps/month = $500M/month (!)
Must optimize heavily

Solution:
├─ Adaptive quality (lower bitrate if network slow)
├─ Aggregation (ISP caching)
└─ CDN optimization
```

## Live Streaming Architecture

```
Streamer
├─ OBS (Open Broadcaster Software)
├─ RTMP protocol
└─ Encode video in real-time

         ↓

Ingestion Server
├─ Receive RTMP stream
├─ Validate encoder
├─ Transcode to multiple bitrates
└─ Package as HLS/DASH

         ↓

Origin Server
├─ Store stream segments
├─ Provide manifest
└─ Health monitoring

         ↓

CDN (Edge Servers)
├─ Cache segments from origin
├─ Serve viewers from nearest edge
└─ Low latency, high bandwidth

         ↓

Viewers (App/Browser)
├─ Load manifest (HLS/DASH)
├─ Download segments
├─ Play video
└─ Adapt quality
```

## Live Streaming Protocols

### RTMP (Real-time Messaging Protocol)

```
Streamer → Ingestion server
├─ Used for: Streaming TO Twitch
├─ Latency: < 1 second
├─ Encoder sends chunks

Why RTMP for ingest?
├─ Optimized for encoder-to-server
├─ Handles network issues
└─ Server can re-encode
```

### HLS (HTTP Live Streaming)

```
Streamer uploads to origin
Origin transcodes to HLS
    ↓
Manifest file (playlist.m3u8):
#EXTM3U
#EXT-X-TARGETDURATION:10
#EXTINF:10.0,
segment-1.ts
#EXTINF:10.0,
segment-2.ts
...

Viewer:
1. Download manifest
2. Request segment-1.ts
3. Request segment-2.ts
4. Play segments sequentially
5. Refresh manifest (get new segments)

Latency: 20-30 seconds (3 segments × 10s)
```

### DASH (Dynamic Adaptive Streaming)

```
Similar to HLS but:
├─ MPD (Media Presentation Description)
├─ Can embed multiple bitrates
└─ Better for adaptive quality

Both used:
├─ HLS: Apple/iOS preference
└─ DASH: Android/browsers
```

## Transcoding

### Multiple Bitrates

```
Streamer uploads: 4K video at 15 Mbps

Transcode to:
├─ 4K (15 Mbps) - high bandwidth
├─ 1080p (8 Mbps) - medium
├─ 720p (4 Mbps) - standard
├─ 480p (2 Mbps) - low
└─ 360p (1 Mbps) - very low

Each as separate stream segments
All accessible via same manifest
Player chooses based on bandwidth
```

### Adaptive Bitrate (ABR)

```
Viewer starts playback at 720p (4 Mbps)
    ↓
Monitor:
├─ Buffer time (how much video ahead)
├─ Download speed
└─ Packet loss

If buffer low:
└─ Switch to 480p (less data)

If buffer high:
└─ Switch to 1080p (more quality)

Result: Smooth playback, automatic quality
```

## Live Chat During Stream

### Chat Service (Same as Slack)

```
Streamer starts stream (stream_id: "live_123")
    ↓
Chat channel created: "stream_live_123"
    ↓
Viewers connect to chat:
├─ WebSocket to chat server
├─ Join channel
└─ Start receiving messages

Viewer sends message:
├─ Message added to chat
├─ Broadcast to all viewers
└─ Appear in real-time (< 100ms)

Chat history:
└─ Persist in DB (searchable later)
```

## Monetization

### Ads

```
Before stream: Pre-roll ad
During stream: Mid-roll ads
After stream: Post-roll ad

Ad insertion:
├─ Ad server chooses ad based on viewer
├─ Server returns ad manifest
├─ Player plays ad
└─ Payment: $1-10 per 1000 impressions
```

### Subscriptions

```
Viewer subscribes to streamer:
├─ Tier 1: $4.99/month
├─ Tier 2: $9.99/month
├─ Tier 3: $24.99/month

Benefits:
├─ Ad-free viewing
├─ Exclusive emotes
├─ Custom badge
└─ Support creator

Split: 50% to streamer, 50% to platform
```

## Viewer Analytics

### Stream Stats

```
Dashboard shows:
├─ Live viewers (concurrent count)
├─ Peak viewers (all-time high)
├─ Unique viewers (today/week)
├─ Watch time (total hours)
├─ Chat messages (per minute)
├─ Bitrate (average quality)

Used for:
├─ Insights (who watches when)
├─ Recommendations (suggest streams)
└─ Analytics (dashboard)
```

## VOD (Video on Demand)

### Recording Live Stream

```
Streamer finishes live stream
Ingestion server saved all segments
    ↓
VOD Service:
1. Combine all segments into single file
2. Create metadata (title, description, thumbnail)
3. Store in blob storage (S3)
4. Generate playable VOD URL
5. Add to VOD library

VOD becomes "on demand" video:
└─ Same as pre-recorded video
└─ Viewers can watch anytime
```

### VOD Playback

```
Viewer selects VOD
    ↓
Playback service:
├─ Fetch VOD file
├─ Serve via HTTP (not live)
├─ Adaptive quality (same as live)
└─ Faster CDN cache (pre-computed)

VOD experience:
├─ Can seek instantly
├─ Can pause/resume
└─ Better quality (more time to encode)
```

## Database Schema

```sql
-- Streams (live)
CREATE TABLE streams (
  id VARCHAR(50) PRIMARY KEY,
  streamer_id INT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  peak_viewers INT,
  total_views INT,
  duration_seconds INT
);

-- Stream segments (actual video data)
CREATE TABLE stream_segments (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  stream_id VARCHAR(50),
  segment_number INT,
  bitrate INT,  -- 1000, 2500, 4000, 8000, 15000
  duration_seconds INT,
  segment_url VARCHAR(500),
  FOREIGN KEY (stream_id) REFERENCES streams(id)
);

-- VODs (recorded streams)
CREATE TABLE vods (
  id VARCHAR(50) PRIMARY KEY,
  stream_id VARCHAR(50),  -- reference to original stream
  title VARCHAR(255),
  thumbnail_url VARCHAR(500),
  duration_seconds INT,
  views INT,
  created_at TIMESTAMP,
  FOREIGN KEY (stream_id) REFERENCES streams(id)
);

-- Stream subscriptions
CREATE TABLE subscriptions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  subscriber_id INT,
  streamer_id INT,
  tier ENUM('tier1', 'tier2', 'tier3'),
  started_at TIMESTAMP,
  expires_at TIMESTAMP
);
```

## Scalability

### Ingestion Cluster

```
100K concurrent streamers
Each needs: ingestion server instance

Solution: Ingestion pool
├─ 100K instances ready to receive
├─ Streamer connects to nearest
├─ Transcode to multiple bitrates
└─ Push to origin
```

### Origin Servers

```
Store live segments
Serve to CDN

Scale:
├─ 100 origin servers (with replication)
├─ Each handles ~100K viewers
└─ Rebalance on failure
```

### CDN

```
10M concurrent viewers
Distributed across CDN:
├─ US: 3M viewers (CDN US)
├─ EU: 2M viewers (CDN EU)
├─ APAC: 5M viewers (CDN APAC)

Each edge server:
└─ Handles 1K-10K concurrent viewers
```

## Streaming Quality

### Bandwidth Adaptation

```
Viewer's network: 5 Mbps
Available bitrates: 1, 2, 4, 8, 15 Mbps

ABR algorithm:
1. Start at 2 Mbps (safe)
2. Monitor buffer (target: 20-30 seconds ahead)
3. If buffer increasing: try higher bitrate
4. If buffer decreasing: try lower bitrate
5. Switch quality between segments

Result: Smooth playback, automatic quality
```

## Interview Tips

✓ Discuss RTMP for ingest, HLS/DASH for delivery
✓ Explain transcoding to multiple bitrates
✓ Address adaptive bitrate streaming
✓ Discuss chat integration
✓ Explain monetization (ads, subs)
✓ Address VOD recording and playback
✓ Discuss scalability (ingestion, CDN)
✓ Mention latency trade-offs

❌ Don't ignore transcoding cost
❌ Don't forget chat service
❌ Don't skip adaptive quality
❌ Don't ignore CDN optimization

---

**Next:** System design interview guide.

# System Design Case Study: File Sharing System

**Read time:** 12 min | **Difficulty:** Medium-Hard

## Problem Statement

Design a file sharing system like Dropbox, Google Drive.

### Requirements

**Functional:**
- Upload files
- Download files
- Share files/folders
- Sync across devices
- Version history
- Trash/recovery

**Non-Functional:**
- 1B users, 100PB storage
- 1M concurrent uploads
- Fast upload/download (< 1 second)
- Efficient storage (deduplication)
- Sync within 5 seconds

## Back-of-Envelope Calculation

```
1B users × 2GB average storage = 2 exabytes
AWS S3 cost: $0.023/GB/month
Total: $46B/month (too expensive!)

Solution: Compression, deduplication
Reduce 2EB → 100PB (20x reduction)
Cost: $2.3B/month (still high, but manageable)
```

## Architecture

```
         User devices
    ↙        ↓        ↘
 Desktop   Mobile    Web
    ↓        ↓        ↓
 Sync Client (local versioning)
    ↓        ↓        ↓
 Load Balancer
    ↓
File Service (handles uploads/downloads)
 ├─ Chunk file
 ├─ Compress
 ├─ Upload chunks in parallel
 └─ Handle resume
 ↓
Block Storage Service
 ├─ Deduplicate blocks
 ├─ Handle references
 └─ Cleanup orphaned blocks
 ↓
Blob Storage (S3)
 ├─ Store actual file blocks
 ├─ Replicate for durability
 └─ Long-term storage
```

## File Upload

### Chunking

```
File: 1GB
Chunk size: 4MB

Split into: 256 chunks
Upload in parallel (not sequentially)

Benefits:
├─ Faster (parallel transfer)
├─ Resumable (resume from failed chunk)
├─ Deduplication (same chunks across files)
```

### Upload Flow

```
1. User selects file (1GB)
   ↓
2. Client:
   ├─ Hash file (SHA-256) → unique ID
   ├─ Split into 256 × 4MB chunks
   ├─ Hash each chunk
   └─ Check if chunks exist server-side

3. For each chunk:
   Upload in parallel
   ├─ Chunk 1
   ├─ Chunk 2
   ├─ ...
   └─ Chunk 256

4. Server:
   ├─ Receive chunk
   ├─ Verify hash (prevent corruption)
   ├─ Store in blob store
   ├─ Create chunk reference
   └─ Acknowledge

5. Client:
   All chunks uploaded
   ├─ Send complete signal
   ├─ List all chunk hashes
   └─ File finalized
```

### Deduplication

```
User A uploads: video.mp4 (1GB)
    ↓
Chunks stored: [chunk1, chunk2, ..., chunk256]
Hash DB: chunk1_hash → chunk1_id

User B uploads: Same video.mp4
    ↓
Client hashes: Gets same chunk hashes
    ↓
Server:
├─ Check hash DB
├─ All chunks exist!
└─ Just create pointers to same chunks

Result:
├─ 1GB stored once (not twice)
├─ Both users can access
├─ Massive storage savings
```

## File Download

### Resume Support

```
User downloads 1GB file
    ↓
Network disconnects at 500MB
    ↓
Client knows: Downloaded bytes 0-500MB
    ↓
Resume download:
├─ Tell server: Resume from byte 500M
├─ Range request: bytes 500M-1GB
└─ Download remaining 500MB
```

### Streaming

```
Don't download entire file before playing
Instead: Stream chunks
├─ Chunk 1 → user can play
├─ Chunk 2 → queue
├─ Chunk 3 → queue
└─ Continue downloading while playing
```

## Sync

### Local Sync Client

```
Runs on user's device
Monitors: ~/Dropbox folder

User adds file: video.mp4
    ↓
Sync client:
├─ Detect change (file watcher)
├─ Hash file
├─ Upload in background
├─ Show progress bar

User deletes file: old_doc.txt
    ↓
Sync client:
├─ Detect deletion
├─ Mark in sync log
├─ Upload deletion record
├─ Delete local copy
```

### Multi-Device Sync

```
Device A (Desktop):
├─ User creates file.txt
├─ Uploads to server
└─ Records: version 1

Server:
├─ Stores file version 1
├─ Notifies other devices
└─ Stores version history

Device B (Mobile):
├─ Receives notification
├─ Downloads file.txt (version 1)
└─ Syncs local folder
```

### Conflict Resolution

```
Device A (offline):
├─ Edits file.txt
└─ Creates version 1 (local)

Device B (offline):
├─ Edits file.txt
└─ Creates version 1 (local)

Both go online:
    ↓
Server receives both changes
    ↓
Conflict detected!
    ↓
Solution:
├─ Create both versions:
│  ├─ file.txt (version from A)
│  └─ file (B's conflicted copy).txt (version from B)
└─ User resolves manually
```

## Database Schema

```sql
-- Files metadata
CREATE TABLE files (
  id VARCHAR(50) PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  size BIGINT,
  mime_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP,
  deleted BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_user_created 
  ON files(user_id, created_at DESC);

-- File versions
CREATE TABLE file_versions (
  id VARCHAR(50) PRIMARY KEY,
  file_id VARCHAR(50) NOT NULL,
  version INT,
  size BIGINT,
  created_at TIMESTAMP,
  created_by INT,  -- which device
  FOREIGN KEY (file_id) REFERENCES files(id)
);

-- Chunks (blocks)
CREATE TABLE chunks (
  id VARCHAR(50) PRIMARY KEY,  -- hash
  size INT,
  hash_value VARCHAR(64),  -- SHA-256
  created_at TIMESTAMP DEFAULT NOW()
);

-- File-Chunk mapping
CREATE TABLE file_chunks (
  file_id VARCHAR(50) NOT NULL,
  chunk_id VARCHAR(50) NOT NULL,
  chunk_index INT,  -- order
  PRIMARY KEY (file_id, chunk_index),
  FOREIGN KEY (file_id) REFERENCES files(id),
  FOREIGN KEY (chunk_id) REFERENCES chunks(id)
);

-- Sharing
CREATE TABLE file_shares (
  id INT PRIMARY KEY AUTO_INCREMENT,
  file_id VARCHAR(50) NOT NULL,
  shared_by INT,
  shared_with INT,  -- NULL for public link
  permission ENUM('view', 'comment', 'edit'),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (file_id) REFERENCES files(id)
);
```

## Version History

```
File created: "doc.txt" version 1
    ↓
Edit at 10:30 AM: version 2
    ↓
Edit at 11:15 AM: version 3
    ↓
Edit at 2:45 PM: version 4

User wants to restore:
└─ Select version 2
└─ Download version 2
└─ Replaces current with version 2 (v5 is old v2)

Keep versions: 30 days
Delete old versions to save space
```

## Sharing

### Share Link

```
File: report.pdf
User creates share link:
├─ Generate unique token: abc123xyz
├─ Set permissions: "view only"
├─ Create share record
└─ Return link: dropbox.com/s/abc123xyz/report.pdf

Anyone with link:
├─ Can view/download file
├─ Cannot edit
├─ Cannot see other files
```

### Folder Sharing

```
Folder: /Projects/2023
User shares with: alice@example.com
Permission: "edit"

Alice:
├─ Can view all files in folder
├─ Can edit files
├─ Can add new files
├─ Changes sync to all other users
└─ See alice's edits in real-time
```

## Trash & Recovery

### Soft Delete

```
User deletes file.txt
    ↓
Not actually deleted:
├─ Mark as deleted in DB
├─ Move to trash folder
└─ Don't delete chunks

Still accessible:
└─ Via trash folder (30 days)
```

### Recovery

```
User recovers file from trash
    ↓
Restore:
├─ Unmark as deleted
├─ Move back to original folder
└─ Sync to all devices
```

### Permanent Delete

```
After 30 days in trash:
├─ Delete metadata
├─ Check: no other files reference these chunks
├─ If safe: delete chunks
└─ Free up storage
```

## Storage Optimization

### Compression

```
File: 100MB text file
    ↓
Compress: GZIP, Brotli
    ↓
Result: 10MB
    ↓
Save: 90MB per user!

Trade-off: CPU to compress/decompress
```

### Deduplication

```
100 users upload: "template.pptx"
    ↓
Without dedup: 100 copies × 10MB = 1GB
With dedup: 1 copy × 10MB = 10MB

Savings: 99%
```

## Scalability

### Sharding by User

```
User ID determines shard:
hash(user_id) % 1000 = shard

User 123 → Shard 1
User 456 → Shard 2
User 789 → Shard 3

Each shard has:
├─ Database replica
├─ Blob storage
└─ Sync servers
```

### CDN for Downloads

```
Files cached at edge servers
Users download from nearest edge
Reduces latency, origin load
```

## Interview Tips

✓ Discuss chunking and parallel upload
✓ Explain deduplication strategy
✓ Address sync conflict resolution
✓ Discuss version history
✓ Mention sharing and permissions
✓ Address soft delete recovery
✓ Discuss compression/deduplication savings
✓ Address trash retention

❌ Don't ignore resume capability
❌ Don't forget conflict resolution
❌ Don't skip version history
❌ Don't ignore storage costs

---

**Next:** Design a booking system (Airbnb).

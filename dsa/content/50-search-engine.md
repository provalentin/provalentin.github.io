# System Design Case Study: Search Engine

**Read time:** 14 min | **Difficulty:** Hard

## Problem Statement

Design a web search engine like Google Search.

### Requirements

**Functional:**
- Index web pages
- Search with ranking
- Auto-complete suggestions
- Spell correction
- Ads integration (monetization)

**Non-Functional:**
- Index billions of web pages
- Search latency < 100ms
- Handle 5.6B searches per day
- 99.9% availability
- Relevance is critical

## Components

### 1. Crawler (Web Scraper)

```
Responsibilities:
├─ Visit web pages
├─ Extract content
├─ Follow links
├─ Respect robots.txt
└─ Detect spam/duplicates

Scale: 1000s of crawlers in parallel
```

### 2. Indexer

```
Responsibilities:
├─ Parse HTML
├─ Extract text/title/metadata
├─ Build inverted index
├─ Handle duplicates
└─ Update rankings

Inverted Index:
"machine learning" → [page1, page2, page3, ...]
"algorithm" → [page2, page4, page5, ...]
```

### 3. Query Engine

```
Responsibilities:
├─ Parse query
├─ Expand (synonyms)
├─ Query index
├─ Rank results
└─ Return top 10
```

### 4. Ranking Algorithm

```
Responsibilities:
├─ PageRank (link structure)
├─ Relevance (keyword matching)
├─ Freshness (date)
├─ User signals (CTR, dwell time)
└─ Domain authority
```

## Architecture

```
         Web Pages (Billions)
              ↓
         Web Crawlers (1000s)
              ↓
       Crawler Output (URLs, content)
              ↓
       Distributed File System
       (Store all content)
              ↓
         Indexer (Batch)
         ├─ Parse HTML
         ├─ Extract keywords
         └─ Build inverted index
              ↓
       Inverted Index Store
       (Fast lookup)
              ↓
       Query Engine
       ├─ Parse query
       ├─ Find matching docs
       └─ Rank results
              ↓
         Search Results
         (to user)
```

## Web Crawler

### Crawling Strategy

```
URL frontier: URLs to visit
    ↓
Priority queue:
├─ Popular sites (high priority)
├─ Fresh content (medium)
└─ Old content (low)
    ↓
Fetch URL
    ↓
Check for changes
    ├─ If changed: re-index
    └─ If same: skip
    ↓
Add new URLs to frontier
    (follow links)
```

### Politeness

```
Respect robots.txt:
User-agent: *
Disallow: /private/
Disallow: /admin/

Don't overload servers:
├─ Crawl delay: 1 request per 5 seconds
├─ Max crawl rate: 100 requests/second
└─ User-Agent header
```

### Deduplication

```
Same content, different URLs:
example.com/page.html
example.com/page.html?ref=google
    ↓
Content hash: SHA-256
"abc123" → both have same hash
    ↓
Keep only one, discard duplicate
```

## Indexing

### Inverted Index

```
Traditional index (DB):
Page1 → "machine", "learning", "algorithm"
Page2 → "machine", "deep", "learning"

Inverted index (fast search):
"machine" → [Page1, Page2]
"learning" → [Page1, Page2]
"algorithm" → [Page1]
"deep" → [Page2]

Query "machine learning":
├─ Look up "machine" → [Page1, Page2]
├─ Look up "learning" → [Page1, Page2]
├─ Intersect → [Page1, Page2]
└─ Rank and return
```

### Index Building (Offline)

```
Batch job (daily):
1. Read all crawled content from HDFS
2. Parse HTML (extract text, title, metadata)
3. Build inverted index
4. Sort by key
5. Store in distributed index
6. Deploy to query servers

Time: Several hours
Result: Fresh index with latest content
```

## PageRank Algorithm

Links = votes for importance:

```
Page A has links from B, C, D
→ Page A has 3 votes
→ Page A is more important

But vote weight depends on page authority:
├─ Vote from high-authority page = more weight
├─ Vote from low-authority page = less weight

PageRank(A) = 0.15 + 0.85 × 
  (PageRank(B)/outgoing_links(B) +
   PageRank(C)/outgoing_links(C) +
   PageRank(D)/outgoing_links(D))

Compute iteratively until convergence
```

### Calculating PageRank at Scale

```
Algorithm:
1. Initialize all pages: PR = 1.0
2. Iterate 30 times:
   ├─ For each page: compute new PR from inlinks
   ├─ Use MapReduce for parallel computation
   └─ Distribute across cluster
3. Store final PR in index

Time: Days for billions of pages
Result: PR score for each page
```

## Query Processing

### Step 1: Parse Query

```
Query: "machine learning algorithms"
    ↓
Tokenize: ["machine", "learning", "algorithms"]
    ↓
Normalize: lowercase, remove stop words
    ↓
Spell check: "algoritms" → "algorithms"
    ↓
Query: ["machine", "learning", "algorithms"]
```

### Step 2: Find Matching Pages

```
Query index (in-memory):
"machine" → [page1, page2, page5, ...]
"learning" → [page1, page3, page4, ...]
"algorithms" → [page2, page4, page8, ...]

Intersect (AND):
[page1, page2, page5, ...] ∩ [page1, page3, page4, ...] ∩ [page2, page4, page8, ...]
= [pages containing ALL keywords]

Or union (OR) for flexibility
```

### Step 3: Rank Results

```
Score = Relevance(query, page) × PageRank(page) × Freshness(page) × ...

Relevance:
├─ Keyword in title (high weight)
├─ Keyword in URL (high weight)
├─ Keyword in content (medium weight)
├─ Keyword near start (higher weight)
└─ Term frequency / document frequency (TF-IDF)

PageRank: Authority of page

Freshness: Recently updated pages boost

User signals: CTR, dwell time
```

### Step 4: Return Results

```
Top 10 results:
├─ Rank 1: 0.95 score (Google example)
├─ Rank 2: 0.92 score
├─ Rank 3: 0.89 score
├─ ...
└─ Rank 10: 0.75 score
```

## Search Features

### Auto-complete

```
User types: "machine"
    ↓
Query index: top completions
├─ "machine learning" (1M searches)
├─ "machine learning course" (500K)
├─ "machine vision" (200K)
└─ Show top 5
    ↓
Freshness: boost trending queries
```

### Spell Correction

```
Query: "algoritm"
    ↓
Similarity check:
├─ Edit distance: 2 changes (add 'm', move)
├─ Phonetic similarity (sounds like)
└─ n-gram overlap
    ↓
Suggest: "algorithm"
    ↓
Did you mean: "algorithm" (link)
```

### Snippets

```
Query: "machine learning"
Page: "Machine learning is a field of AI..."
    ↓
Extract snippet:
"Machine learning is a field of AI that focuses on..."

Highlight keywords:
"Machine learning is a field of AI that focuses on..."
              ↑↑↑↑↑↑↑       ↑↑↑↑↑↑↑↑↑
```

## Advertisements

### Ad Serving

```
Search result page:
Top 2-3 results: ads (sponsored)
Remaining 7-8: organic results

Ad auction (real-time):
1. Advertisers bid on keywords
2. Highest bidder gets slot
3. Cost-per-click model
4. Generate revenue
```

### Revenue Model

```
Advertiser: $1 per click
User clicks ad
Google gets: $1
Google profit: significant
```

## Scale & Performance

### Distributed Query Processing

```
Query hits load balancer
    ↓
Route to query server (1000s available)
    ↓
Query server:
├─ Splits query
├─ Queries multiple index shards
├─ Merges results
├─ Ranks and returns
    ↓
Latency: < 100ms
```

### Index Sharding

```
Index too large for one server
Split by:
├─ Range sharding: keywords A-M on shard1, N-Z on shard2
├─ Hash sharding: hash(keyword) % num_shards
└─ Directory sharding: lookup table
```

### Caching

```
Cache layer 1: Query cache
├─ Popular queries cached
├─ "machine learning" → pre-computed results
└─ TTL: 1 hour

Cache layer 2: Index cache
├─ Popular keyword lists
└─ TTL: 1 day
```

## Freshness Strategy

### Crawl Frequency

```
Popular sites: daily
Fresh content: real-time
Old pages: weekly

Update index:
├─ Real-time index (new content)
├─ Main index (refreshed daily)
└─ Archive (old content, low priority)
```

## Interview Tips

✓ Discuss crawler architecture and politeness
✓ Explain inverted index construction
✓ Address PageRank algorithm
✓ Discuss query processing pipeline
✓ Mention ranking factors
✓ Address scalability (sharding, caching)
✓ Discuss freshness requirements
✓ Address monetization (ads)

❌ Don't ignore crawl politeness
❌ Don't underestimate scale
❌ Don't forget index updates
❌ Don't ignore ranking quality

---

**Next:** Design a real-time collaboration tool.

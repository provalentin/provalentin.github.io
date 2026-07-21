# System Design Case Study: Recommendation System

**Read time:** 13 min | **Difficulty:** Hard

## Problem Statement

Design a recommendation system like Netflix, Amazon, Spotify recommendations.

### Requirements

**Functional:**
- Recommend items (movies, products, songs)
- Personalized to each user
- Fresh/trending items
- Handle new users (cold start)
- Explain recommendations

**Non-Functional:**
- 1B users, 1M items
- Generate 10 recommendations per user
- Latency < 100ms
- Can re-rank in real-time
- Update daily with new items

## Recommendation Approaches

### 1. Collaborative Filtering

Find users similar to you, recommend what they liked:

```
User A watched: [Movie1, Movie2, Movie3]
User B watched: [Movie1, Movie2, Movie5]
Similarity(A, B) = 2/3 = 66%

User A likes Movie5?
→ Yes, recommend it
```

**Implementation:**
```
User-item matrix:
        Movie1  Movie2  Movie3  Movie4
User1   1       1       0       0
User2   1       1       1       0
User3   0       1       1       1
User4   1       0       1       1

Similarity: cosine distance
Recommendation: weighted sum of similar users' ratings
```

**Pros:** Works well, captures preferences
**Cons:** Cold start (new users), sparse data

### 2. Content-Based Filtering

Recommend items similar to what you liked:

```
User liked: Action movie (2020, directors: A, B)
Recommend: Similar action movies (2018-2021)

Features:
├─ Genre: Action, Thriller, Drama
├─ Director
├─ Release date
├─ Length
└─ Language
```

**Pros:** Works for new items, no cold start
**Cons:** May lack discovery (recommend only similar items)

### 3. Hybrid Approach (Recommended)

Combine both methods:

```
Step 1: Content-based
└─ Initial recommendations based on attributes

Step 2: Collaborative filtering
└─ Refine with user similarity

Step 3: Popularity/Trending
└─ Add emerging popular items

Step 4: Re-rank
└─ Consider business logic (ads, promotions)
```

### 4. Deep Learning (Advanced)

Train neural network on user-item interactions:

```
Input: User embedding + Item embedding
Hidden layers: Learn interaction patterns
Output: Predicted rating/likelihood

Benefits:
├─ Captures complex patterns
├─ Personalized to each user
└─ Works with new items (if embedded)
```

## Architecture

```
        User Behavior Data
        ↙       ↓       ↘
   Clicks   Watches  Purchases
      ↓        ↓        ↓
   Log Stream (Kafka)
         ↓
  Recommendation Engine
  ├─ Collaborative filtering
  ├─ Content-based filtering
  ├─ Ranking model
  └─ Blending
         ↓
  Cache (Redis)
         ↓
  API → Serve to clients
```

## Data Pipeline

### Collection

```
User action: watches movie
        ↓
Log event: {user_id, movie_id, duration, timestamp}
        ↓
Kafka (message queue)
        ↓
Real-time & Batch processing
```

### Processing

**Batch (Offline)**
```
Daily job (2am):
├─ Read all events from past 7 days
├─ Build similarity matrix
├─ Train recommendation models
├─ Pre-compute top 100 recommendations per user
└─ Store in cache

Time: 1-2 hours
Accuracy: High (lots of data)
Latency: Updates daily
```

**Real-time (Online)**
```
User requests recommendations:
├─ Fetch pre-computed from cache
├─ Re-rank based on user's last actions
├─ Add trending items
└─ Return top 10

Time: < 100ms
Accuracy: Medium (real-time signals)
Latency: Immediate
```

## Cold Start Problem

### New User (No history)

```
Solution 1: Popular items
└─ Recommend most viewed/liked items (everyone)

Solution 2: Onboarding
├─ Ask: "What genres do you like?"
├─ Ask: "Rate these 10 sample items"
└─ Build initial preference profile

Solution 3: Hybrid
├─ Show popular + trending
├─ Improve as they interact
```

### New Item (No interactions)

```
Solution 1: Content-based
└─ Recommend to users who liked similar items

Solution 2: Metadata-based
├─ Use genre, director, actor
├─ Recommend to users interested in these

Solution 3: Explore-exploit
├─ 10% exploration (show new items)
├─ 90% exploitation (show proven items)
```

## Recommendation Flow

### Generating Recommendations

```
1. Collaborative Filtering
   Find similar users → their top items
   Score: 0.8, 0.75, 0.70, ...

2. Content-Based
   Items similar to user's likes
   Score: 0.85, 0.80, 0.75, ...

3. Trending/Popular
   Top items today
   Score: 0.9, 0.88, 0.86, ...

4. Blend Scores
   Final = 0.4 × CF + 0.3 × CB + 0.3 × Trending
         = 0.79, 0.76, 0.74, ...

5. Rank & Return
   Top 10 recommendations
```

### Real-time Re-ranking

```
Pre-computed recommendations:
[Movie A (0.85), Movie B (0.80), Movie C (0.75)]

User watching in real-time:
├─ They're watching Movie B
└─ Re-rank: Remove B, push C up
   Result: [Movie A, Movie C, Movie D]
```

## Infrastructure

### Database Schema

```sql
-- User interactions
CREATE TABLE interactions (
  user_id INT NOT NULL,
  item_id INT NOT NULL,
  interaction_type ENUM('view', 'click', 'like', 'purchase'),
  timestamp TIMESTAMP DEFAULT NOW(),
  duration_sec INT
);

CREATE INDEX idx_user_time 
  ON interactions(user_id, timestamp DESC);
CREATE INDEX idx_item_time 
  ON interactions(item_id, timestamp DESC);

-- Pre-computed recommendations
CREATE TABLE recommendations (
  user_id INT NOT NULL,
  recommended_item_id INT NOT NULL,
  score FLOAT NOT NULL,
  rank INT NOT NULL,
  computed_at TIMESTAMP,
  PRIMARY KEY (user_id, recommended_item_id)
);

CREATE INDEX idx_user_rank 
  ON recommendations(user_id, rank);
```

### Caching Strategy

```
Cache Layer 1: User Recommendations
Key: recommendations:user:123
Value: [Movie1, Movie2, ... Movie10]
TTL: 1 day (updated daily)

Cache Layer 2: Item Embeddings
Key: embedding:item:456
Value: [0.1, 0.2, -0.3, ...]
TTL: 7 days

Cache Layer 3: User Embeddings
Key: embedding:user:123
Value: [0.2, -0.1, 0.4, ...]
TTL: 1 day
```

## Metrics to Optimize

### Offline Metrics

```
Precision: % of recommended items user liked
Recall: % of items user liked in recommendations
NDCG: Ranking quality (top items matter most)
```

### Online Metrics

```
Click-through rate (CTR): % who click recommendation
Conversion rate: % who buy/use item
Diversity: How different are recommendations
Serendipity: How surprising/novel are recommendations
```

### Business Metrics

```
Revenue: Items recommended → purchased
Engagement: Time spent on recommended items
Retention: Users return more with better recommendations
```

## Diversity & Serendipity

Problem: All recommendations similar (boring)

```
Solution 1: Post-process
├─ Generate 100 candidates
├─ Select top 10 with diversity constraint
└─ Ensure genre/type variety

Solution 2: In-model
├─ Add diversity loss to training
├─ Model learns to balance accuracy + diversity
```

## A/B Testing

Test new recommendation algorithm:

```
Group A (10%): New algorithm
├─ Recommendations: [Movie X, ...]
└─ Track: CTR, engagement, revenue

Group B (90%): Old algorithm
├─ Recommendations: [Movie Y, ...]
└─ Track: CTR, engagement, revenue

After 1 week:
├─ New: CTR = 12.5%, Revenue = $50K
├─ Old: CTR = 12.0%, Revenue = $48K
└─ New is better → roll out to all
```

## Scalability

### User Count Scaling

```
1M users × 10 recommendations = 10M rows
Each row: 50 bytes = 500MB
Easily fits in cache

But re-computing daily is intensive:
├─ Matrix factorization: O(users × items)
├─ Distributed ML job (Spark, Hadoop)
└─ Parallel processing across clusters
```

### Real-time Personalization

```
For hot users (high traffic):
├─ Cache personalized recommendations
└─ Update more frequently

For cold users (low traffic):
├─ Use pre-computed generic recommendations
└─ Update less frequently
```

## Interview Tips

✓ Discuss collaborative vs content-based filtering
✓ Address cold start problem
✓ Explain ranking/blending strategy
✓ Mention offline vs online serving
✓ Discuss A/B testing approach
✓ Address diversity requirements
✓ Mention pre-computation for scale
✓ Discuss metrics (offline and online)

❌ Don't ignore cold start
❌ Don't over-optimize for single metric
❌ Don't forget diversity
❌ Don't ignore computational cost

---

**Next:** Design a notification system.

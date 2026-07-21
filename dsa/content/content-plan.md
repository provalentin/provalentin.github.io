# Extended Content Plan: DSA + System Design

---

## PART 1: DATA STRUCTURES & ALGORITHMS (48 Articles)

### TIER 1: FUNDAMENTALS (12 articles, 4-6 weeks)

#### 1. **Arrays & Strings Fundamentals**
**Read time:** 12 min | **Difficulty:** Easy | **Video:** 15 min

*Sections:*
- What are arrays? (memory layout, indexing)
- String basics (immutability, operations)
- Common patterns (iteration, reversal, searching)
- Interview tip: "Array questions are 50% of all DSA interviews"

*Problems:*
- Two Sum
- Valid Palindrome
- Reverse String
- Contains Duplicate
- Best Time to Buy/Sell Stock

*Video script outline:*
- Visual: Show memory layout of array in RAM
- Show string immutability gotcha in Python/JavaScript
- Walk through two-pointer technique on whiteboard
- Code up solution with explanations

---

#### 2. **Array Manipulation Patterns**
**Read time:** 14 min | **Difficulty:** Easy | **Video:** 18 min

*Sections:*
- Sliding window (moving average, max subarray)
- Two pointers (sorting, container water)
- Prefix sum (range queries)
- Examples & visualizations for each

*Problems:*
- Sliding Window Maximum
- Move Zeroes
- Container With Most Water
- Trapping Rain Water
- Subarray Sum Equals K

*Integration note:* "Sliding window used in system design for rate limiting & load balancing"

---

#### 3. **Linked Lists Fundamentals**
**Read time:** 11 min | **Difficulty:** Easy | **Video:** 16 min

*Sections:*
- Singly vs doubly linked lists (node structure)
- Traversal, insertion, deletion
- Why linked lists? (when to use, trade-offs vs arrays)
- Common gotcha: null pointer handling

*Problems:*
- Reverse Linked List
- Merge Two Sorted Lists
- Linked List Cycle
- Palindrome Linked List
- Remove Duplicates

*Interview tips:* "Always think about edge cases: empty list, single node, cycle"

---

#### 4. **Stacks & Queues**
**Read time:** 12 min | **Difficulty:** Easy | **Video:** 17 min

*Sections:*
- Stack (LIFO) — use cases, implementation
- Queue (FIFO) — use cases, implementation
- Deque (double-ended queue)
- Real-world examples (browser history, printing queue)

*Problems:*
- Valid Parentheses
- Min Stack
- Implement Queue Using Stacks
- Trapping Rain Water II
- Daily Temperatures

*System Design connection:* "Queues are fundamental to system design — message queues, job processing"

---

#### 5. **Hash Maps & Hash Sets**
**Read time:** 13 min | **Difficulty:** Easy | **Video:** 18 min

*Sections:*
- Hash function and collisions (linear probing, chaining)
- O(1) average lookup, trade-offs
- When to use hash map vs other structures
- Common collision resolution strategies

*Problems:*
- Two Sum (using hash map)
- Majority Element
- First Unique Character
- Happy Number
- Isomorphic Strings

*Video content:*
- Animate hash collision handling
- Show time complexity difference (array vs hash map)
- Explain why it's O(1) on average

---

#### 6. **Binary Trees Fundamentals**
**Read time:** 15 min | **Difficulty:** Easy | **Video:** 20 min

*Sections:*
- Tree structure (parent, child, root, leaf)
- Terminology (height, depth, balance)
- Binary tree properties
- Full, complete, perfect trees

*Problems:*
- Inorder/Preorder/Postorder Traversal
- Level Order Traversal
- Maximum Depth
- Same Tree
- Symmetric Tree

*Interactive element:* Include tree visualization where users can click to traverse

---

#### 7. **Tree Traversal Patterns**
**Read time:** 14 min | **Difficulty:** Easy-Medium | **Video:** 19 min

*Sections:*
- DFS (recursion vs iterative)
- BFS (level-order with queue)
- When to use each
- Space complexity analysis

*Problems:*
- Path Sum
- Lowest Common Ancestor
- Right Side View
- Vertical Order Traversal
- Diameter of Binary Tree

*Complexity analysis:* Show big-O for both time and space

---

#### 8. **Graph Fundamentals**
**Read time:** 13 min | **Difficulty:** Medium | **Video:** 18 min

*Sections:*
- Directed vs undirected graphs
- Adjacency list vs adjacency matrix
- Dense vs sparse graphs
- Graph representation trade-offs

*Problems:*
- Graph Valid Tree
- Number of Connected Components
- Course Schedule (topological sort intro)
- Clone Graph
- Number of Islands

*Visualization:* Interactive graph editor showing adjacency list/matrix

---

#### 9. **Depth-First Search (DFS)**
**Read time:** 12 min | **Difficulty:** Medium | **Video:** 17 min

*Sections:*
- Recursive DFS implementation
- Iterative DFS with stack
- Use cases (topological sort, cycle detection)
- Time/space complexity

*Problems:*
- Invert Binary Tree
- Flood Fill
- Word Search
- Course Schedule II
- Surrounded Regions

*Common mistakes:* "Forgetting to mark visited nodes → infinite loops"

---

#### 10. **Breadth-First Search (BFS)**
**Read time:** 12 min | **Difficulty:** Medium | **Video:** 17 min

*Sections:*
- BFS with queue implementation
- Level-order traversal applications
- Shortest path in unweighted graphs
- When BFS vs DFS

*Problems:*
- Binary Tree Level Order Traversal
- Shortest Path in Grid
- Word Ladder
- All Paths From Source to Target
- Minimum Knight Moves

*Code template:* Provide reusable BFS template

---

#### 11. **Complexity Analysis Deep Dive**
**Read time:** 16 min | **Difficulty:** Medium | **Video:** 20 min

*Sections:*
- Big O notation (O(1), O(n), O(n²), O(log n), O(n log n))
- Amortized complexity
- Space complexity vs time trade-offs
- How to calculate complexity

*Examples for each:*
- O(1): Hash map lookup
- O(log n): Binary search
- O(n): Linear search
- O(n log n): Merge sort
- O(n²): Bubble sort
- O(2^n): Fibonacci recursive

*Interview communication:* "How to explain complexity to interviewer"

---

#### 12. **Interview Patterns & Cheat Sheet**
**Read time:** 18 min | **Difficulty:** Medium | **Video:** 15 min (quick reference)

*Sections:*
- Two pointers pattern
- Sliding window pattern
- Prefix sum pattern
- When to use each
- Common interview gotchas

*Cheat sheet to download:*
- 1-page quick reference
- Common patterns with templates
- Complexity cheat sheet
- Edge cases checklist

---

### TIER 2: INTERMEDIATE (10 articles, 3-4 weeks)

#### 13. **Binary Search Trees (BST)**
**Read time:** 13 min | **Difficulty:** Medium | **Video:** 18 min

*Sections:*
- BST property and invariants
- Search, insert, delete operations
- In-order traversal gives sorted order
- Self-balancing trees intro

*Problems:*
- Validate Binary Search Tree
- Kth Smallest Element
- LCA of BST
- BST Iterator
- Serialize/Deserialize BST

*System Design:* "Databases use BST-like structures for indexing"

---

#### 14. **Heaps & Priority Queues**
**Read time:** 14 min | **Difficulty:** Medium | **Video:** 19 min

*Sections:*
- Min heap vs max heap
- Heap properties (complete binary tree)
- Heapify, push, pop operations
- Array-based heap implementation

*Problems:*
- Kth Largest Element
- Top K Frequent Elements
- Merge K Sorted Lists
- Find Median from Stream
- Reorganize String

*Use cases:* Priority queues, Dijkstra's algorithm, task scheduling

*System Design connection:* "Used in load balancing, job scheduling in distributed systems"

---

#### 15. **Dynamic Programming Fundamentals**
**Read time:** 15 min | **Difficulty:** Medium | **Video:** 22 min

*Sections:*
- Overlapping subproblems
- Optimal substructure
- Memoization vs tabulation
- DP reasoning process

*Problems:*
- Fibonacci (comparing recursive, memo, DP)
- Climbing Stairs
- House Robber
- Coin Change
- Longest Increasing Subsequence

*Video content:*
- Side-by-side comparison: recursive vs DP
- Show memo table being filled
- Explain state transitions

---

#### 16. **Dynamic Programming Patterns**
**Read time:** 16 min | **Difficulty:** Medium-Hard | **Video:** 20 min

*Sections:*
- 1D DP (single dimension)
- 2D DP (grid problems)
- DP state definition tips
- Transition function design

*Problems:*
- Longest Common Subsequence
- Edit Distance
- Unique Paths
- Word Break
- Burst Balloons

*Common mistake:* "Incorrectly defining DP state — leads to wrong solution"

---

#### 17. **Greedy Algorithms**
**Read time:** 12 min | **Difficulty:** Medium | **Video:** 16 min

*Sections:*
- Greedy choice property
- Optimal substructure
- When greedy fails
- Proving greedy correctness

*Problems:*
- Jump Game
- Interval Scheduling
- Rearrange String K Distance Apart
- Maximum Subarray (Kadane's)
- Gas Station

*Interview tip:* "Explain why greedy works before coding"

---

#### 18. **Sorting & Comparison**
**Read time:** 14 min | **Difficulty:** Medium | **Video:** 18 min

*Sections:*
- Bubble, selection, insertion sort (O(n²))
- Merge sort, quick sort (O(n log n))
- Counting sort, radix sort (linear)
- When to use each

*Complexity comparison table:*
| Algorithm | Best | Average | Worst | Space |
|-----------|------|---------|-------|-------|
| Bubble | O(n) | O(n²) | O(n²) | O(1) |
| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) |
| Quick | O(n log n) | O(n log n) | O(n²) | O(log n) |

*Problems:*
- Sort Array (using different algorithms)
- Merge Sorted Array
- Largest Number
- Wiggle Sort
- First Missing Positive

---

#### 19. **Graph Algorithms: Shortest Path**
**Read time:** 13 min | **Difficulty:** Hard | **Video:** 20 min

*Sections:*
- Dijkstra's algorithm (weighted graphs, non-negative)
- Bellman-Ford (negative weights)
- Floyd-Warshall (all pairs)
- A* algorithm intro

*Problems:*
- Cheapest Flights Within K Stops
- Network Delay Time
- Swim in Rising Water
- Path With Minimum Effort
- Reachable Nodes in Subdivided Graph

*System Design connection:* "Route optimization in ride-sharing, network routing"

*Video:* Animate Dijkstra's algorithm step-by-step

---

#### 20. **Graph Algorithms: Cycles & Topological Sort**
**Read time:** 13 min | **Difficulty:** Hard | **Video:** 19 min

*Sections:*
- Cycle detection (directed & undirected)
- Topological sort (DFS-based, Kahn's algorithm)
- Use cases (dependency resolution)
- Detecting DAGs

*Problems:*
- Course Schedule (II & III variations)
- Alien Dictionary
- Minimum Height Trees
- Sequence Reconstruction
- Build Order (from Cracking the Coding Interview)

*System Design:* "Task scheduling, dependency management in build systems"

---

#### 21. **Trie (Prefix Tree)**
**Read time:** 12 min | **Difficulty:** Medium | **Video:** 16 min

*Sections:*
- Trie structure (children nodes)
- Insertion, search, deletion
- Space vs time trade-offs
- Use cases (autocomplete, IP routing)

*Problems:*
- Implement Trie
- Word Search II
- Autocomplete System
- Longest Word in Dictionary
- Prefix and Suffix Search

*System Design:* "Autocomplete in search engines, IP routing tables"

---

#### 22. **Union-Find (Disjoint Set Union)**
**Read time:** 11 min | **Difficulty:** Medium | **Video:** 15 min

*Sections:*
- Union-find data structure
- Path compression and union by rank
- Time complexity with optimizations
- Detecting connected components

*Problems:*
- Number of Connected Components
- Accounts Merge
- Surrounded Regions (alternative approach)
- Redundant Connection
- Earliest Ancestor

*Optimization:* Show how path compression improves performance

---

### TIER 3: ADVANCED (8 articles, 2-3 weeks)

#### 23. **Advanced DP: State Machine**
**Read time:** 14 min | **Difficulty:** Hard | **Video:** 20 min

*Sections:*
- DP with multiple states
- State transitions
- Examples: stock trading with limits, cooldown
- Building intuition for complex states

*Problems:*
- Best Time to Buy/Sell Stock IV
- Best Time to Buy/Sell Stock with Cooldown
- Longest Palindromic Subsequence
- Distinct Subsequences
- Concatenated Words

---

#### 24. **Advanced DP: Game Theory**
**Read time:** 13 min | **Difficulty:** Hard | **Video:** 18 min

*Sections:*
- Minimax in game theory
- DP for two-player games
- Optimal play assumptions
- Predicting game outcomes

*Problems:*
- Predict the Winner
- Burst Balloons (game theory view)
- Zuma Game
- Stone Game Series
- Can I Win

---

#### 25. **Segment Trees & Fenwick Trees**
**Read time:** 15 min | **Difficulty:** Hard | **Video:** 22 min

*Sections:*
- Segment tree construction & queries
- Range sum queries, point updates
- Fenwick tree (Binary Indexed Tree)
- When segment vs Fenwick
- Lazy propagation

*Problems:*
- Range Sum Query
- Count of Smaller Numbers After Self
- Merge Stones
- Rectangle Area II
- Falling Squares

*Use case:* Range queries with updates, competitive programming

---

#### 26. **String Matching Algorithms**
**Read time:** 12 min | **Difficulty:** Hard | **Video:** 18 min

*Sections:*
- KMP (Knuth-Morris-Pratt)
- Boyer-Moore algorithm
- Rabin-Karp (rolling hash)
- When each is useful

*Problems:*
- Implement strStr()
- Shortest Palindrome
- Repeated String Match
- Minimum Window Substring
- Wildcard Matching

*System Design:* "Text search in databases, plagiarism detection"

---

#### 27. **Bit Manipulation**
**Read time:** 13 min | **Difficulty:** Hard | **Video:** 17 min

*Sections:*
- Bitwise operations (AND, OR, XOR, NOT)
- Bit shifting (left, right)
- Common tricks (check power of 2, swap, etc.)
- Interview gotchas

*Problems:*
- Single Number
- Hamming Distance
- Number of 1 Bits
- Reverse Bits
- Power of Four

*Cheat sheet:* Common bit tricks with explanations

---

#### 28. **Recursion & Backtracking**
**Read time:** 14 min | **Difficulty:** Hard | **Video:** 21 min

*Sections:*
- Recursion basics (base case, recursive case)
- Call stack visualization
- Backtracking pattern (try, undo)
- Time complexity of recursive algorithms

*Problems:*
- Permutations & Combinations
- N-Queens
- Sudoku Solver
- Word Search
- Generate Parentheses

*Video:* Animate call stack during recursion

---

#### 29. **Sliding Window Advanced**
**Read time:** 12 min | **Difficulty:** Hard | **Video:** 16 min

*Sections:*
- Multi-pointer sliding window
- Optimal window size problems
- Monotonic deque optimization
- Beyond 2-pointer approach

*Problems:*
- Longest Substring Without Repeating Characters
- Minimum Window Substring
- Sliding Window Maximum (with deque)
- Longest Repeating Character Replacement
- At Most K Distinct Characters

---

#### 30. **Graph Coloring & Bipartite**
**Read time:** 11 min | **Difficulty:** Hard | **Video:** 15 min

*Sections:*
- Graph coloring problem
- Bipartite graph detection
- Chromatic number
- Applications (scheduling, map coloring)

*Problems:*
- Is Graph Bipartite?
- Possible Bipartition
- Course Schedule (bipartite view)
- Pattern Matching (advanced)

---

### REFERENCE ARTICLES (8 articles)

#### 31. **Complexity Analysis Cheat Sheet**
**Read time:** 8 min | **Printable:** Yes

Common operations complexity table with examples

#### 32. **Algorithm Selection Guide**
**Read time:** 10 min | **Interactive:** Yes

Decision tree: "Given problem X, which algorithm to use?"

#### 33. **Common Mistakes in Interviews**
**Read time:** 9 min | **Video:** 10 min

- Off-by-one errors
- Forgetting base cases
- Not handling edge cases
- Not validating inputs

#### 34. **How to Explain Your Solution**
**Read time:** 8 min | **Video:** 12 min

Communication frameworks for interviews

#### 35-40. **Language-Specific Deep Dives** (6 articles)

Quick templates for Python, JavaScript, Java, C++, Go, Rust:
- Common library functions
- Performance characteristics
- Interview best practices

---

## PART 2: SYSTEM DESIGN (25 Articles)

### FUNDAMENTALS (6 articles, 2-3 weeks)

#### 1. **System Design Basics**
**Read time:** 16 min | **Difficulty:** Medium | **Video:** 20 min

*Sections:*
- Scalability (horizontal vs vertical)
- Availability vs consistency
- Load balancing basics
- Caching basics
- Interview approach (ask clarifications first)

*Key metrics:* QPS, latency, storage, bandwidth

*Problem estimation:* "5M users = ? QPS"

---

#### 2. **Databases: SQL vs NoSQL**
**Read time:** 15 min | **Difficulty:** Medium | **Video:** 18 min

*Sections:*
- Relational databases (ACID properties)
- NoSQL types (document, key-value, column-family, graph)
- SQL vs NoSQL trade-offs
- Sharding strategies
- Replication (master-slave, master-master)

*Table: When to use which*
| Need | SQL | NoSQL |
|------|-----|-------|
| Complex queries | ✓ | ✗ |
| Horizontal scaling | ✗ | ✓ |
| Transactions | ✓ | Limited |
| Flexibility | ✗ | ✓ |

*Real examples:* Facebook (Cassandra), Instagram (Postgres), MongoDB use cases

---

#### 3. **Caching & CDN**
**Read time:** 14 min | **Difficulty:** Medium | **Video:** 17 min

*Sections:*
- In-memory caching (Redis, Memcached)
- Cache invalidation strategies (LRU, TTL)
- Cache-aside, write-through, write-behind patterns
- Content Delivery Networks (CDN)
- Cache coherence

*Visualization:* Show cache hit/miss with real numbers

*System Design connection:* "LRU cache implement problem ↔ cache eviction policies"

---

#### 4. **Message Queues & Event Streaming**
**Read time:** 13 min | **Difficulty:** Medium | **Video:** 16 min

*Sections:*
- Asynchronous processing
- Message queue patterns (producer-consumer)
- At-least-once vs exactly-once delivery
- Kafka, RabbitMQ, AWS SQS concepts
- Event sourcing intro

*Use cases:*
- Decoupling services
- Rate limiting
- Email notifications
- Heavy computations

*DSA connection:* "Queue data structure ↔ message queue internals"

---

#### 5. **Load Balancing & API Design**
**Read time:** 14 min | **Difficulty:** Medium | **Video:** 18 min

*Sections:*
- Load balancer types (round-robin, least connections, IP hash)
- Session persistence
- Health checks
- Rate limiting & throttling
- REST vs RPC vs GraphQL
- API versioning

*Rate limiting algorithms:*
- Token bucket
- Leaky bucket
- Sliding window log

*DSA connection:* "Heap for load balancing, hash for rate limiting"

---

#### 6. **Search & Indexing**
**Read time:** 15 min | **Difficulty:** Medium-Hard | **Video:** 20 min

*Sections:*
- Full-text search basics
- Inverted index
- B-tree vs LSM tree for indexing
- Elasticsearch architecture
- Ranking algorithms (TF-IDF, BM25)

*Real examples:* How Google search indexes billions of pages

*DSA connection:* "Trie for prefix search, B-tree for indexing"

---

### CASE STUDIES (18 articles, 6-8 weeks)

#### 7. **Design URL Shortener**
**Read time:** 10 min | **Difficulty:** Easy | **Video:** 18 min | **Estimated Time:** ~45 min interview

*Sections:*
1. Requirements clarification
   - Functional: shorten URL, retrieve URL
   - Non-functional: 100M URLs/month, fast retrieval
2. Capacity estimation
   - QPS calculation
   - Storage requirements
3. High-level design
   - Simple approach (diagram: client → API → DB)
4. Deep dives
   - Encoding: base62 vs MD5 hash collision handling
   - Database design: which DB, indexing strategy
5. Trade-offs
   - QPS vs storage optimization
6. Follow-ups
   - Add analytics? Custom URLs? Expiration?

*DSA problems to review:*
- Hash map design
- Encoding/decoding

*Video walkthrough:* Live coding the API

---

#### 8. **Design Social Network Feed**
**Read time:** 13 min | **Difficulty:** Medium | **Video:** 22 min | **Estimated Time:** ~60 min

*Sections:*
1. Requirements
   - Users post, others see feed
   - Real-time updates
   - 1B users, 1k QPS read
2. Capacity estimation
   - Feed size, storage for posts
3. High-level design
   - Push vs pull model
   - Feed ranking
4. Deep dives
   - Timeline generation (database + cache)
   - Real-time updates (WebSocket vs polling)
   - Ranking algorithm (timestamp, engagement)
5. Trade-offs
   - Fanout push (high write) vs pull (high read)
   - Consistency vs availability
6. Follow-ups
   - Stories (disappear after 24h)?
   - Notifications?
   - Trending posts?

*DSA problems:*
- Heap (top K posts)
- LRU cache (feed caching)
- Sorting with custom comparators

*Real system:* Twitter's timeline architecture

---

#### 9. **Design Search Engine (Google-like)**
**Read time:** 14 min | **Difficulty:** Hard | **Video:** 25 min | **Estimated Time:** ~60-75 min

*Sections:*
1. Requirements
   - Index billions of pages
   - Return results in <100ms
   - Rank by relevance
2. Capacity estimation
   - Web size, QPS, index size
3. High-level design
   - Crawler, indexer, ranker, search API
4. Deep dives
   - Web crawling (distributed, politeness)
   - Indexing (inverted index, compression)
   - Ranking (PageRank, TF-IDF, ML)
   - Query processing
5. Trade-offs
   - Fresh index vs large index
   - Recall vs precision
6. Follow-ups
   - Autocomplete?
   - Spell checker?
   - Personalization?

*DSA problems:*
- Trie (autocomplete)
- Graph (PageRank)
- Inverted index (full-text search)

---

#### 10. **Design Ride-Sharing System (Uber-like)**
**Read time:** 14 min | **Difficulty:** Hard | **Video:** 23 min | **Estimated Time:** ~60-75 min

*Sections:*
1. Requirements
   - Match drivers ↔ riders
   - Real-time location tracking
   - 10M+ users, millions of concurrent requests
2. Capacity estimation
   - Concurrent drivers/riders, location updates
3. High-level design
   - Location service, matching service, notification service
4. Deep dives
   - Geospatial indexing (quadtree, geohash)
   - Matching algorithm (distance + driver rating)
   - Real-time location updates
   - Surge pricing
5. Trade-offs
   - Consistency vs availability
   - Search radius vs matching time
6. Follow-ups
   - Surge pricing formula?
   - Payment reconciliation?
   - Driver ratings reliability?

*DSA problems:*
- Quadtree / Geohash
- Heap (nearest drivers)
- Consistent hashing (location servers)

*Real system:* Uber's system, Lyft's approach

---

#### 11. **Design Video Streaming Service (Netflix-like)**
**Read time:** 15 min | **Difficulty:** Hard | **Video:** 25 min | **Estimated Time:** ~60-75 min

*Sections:*
1. Requirements
   - Stream video globally
   - Multiple qualities (adaptive bitrate)
   - 1B users, millions concurrent
2. Capacity estimation
   - Bandwidth, storage, concurrent users
3. High-level design
   - Video ingestion, storage, CDN, player
4. Deep dives
   - Video encoding (adaptive bitrate streaming)
   - CDN placement
   - Caching strategy
   - Buffering & playback optimization
5. Trade-offs
   - Quality vs bandwidth
   - Redundancy vs cost
6. Follow-ups
   - Live streaming?
   - Recommendations?
   - Offline downloads?

*DSA problems:*
- Consistent hashing (CDN nodes)
- DP (bitrate selection)
- Heap (load balancing)

*Real systems:* Netflix's architecture, YouTube

---

#### 12. **Design Messaging App (WhatsApp/Telegram-like)**
**Read time:** 13 min | **Difficulty:** Hard | **Video:** 22 min | **Estimated Time:** ~60-75 min

*Sections:*
1. Requirements
   - Send/receive messages in real-time
   - Group messaging
   - Encryption
   - 100M+ users, billions of messages/day
2. Capacity estimation
   - Message throughput, storage
3. High-level design
   - Message service, chat service, notification service
4. Deep dives
   - WebSocket for real-time communication
   - Message persistence & ordering
   - Delivery guarantees (sent, delivered, read)
   - End-to-end encryption basics
5. Trade-offs
   - Delivery guarantee vs latency
   - Storage vs retrieval speed
6. Follow-ups
   - End-to-end encryption architecture?
   - Read receipts reliability?
   - Group chat scaling?

*DSA problems:*
- Queue (message ordering)
- Consistent hashing (message routing)
- Timestamp ordering

*Real systems:* WhatsApp's architecture, Signal protocol

---

#### 13. **Design E-Commerce Platform (Amazon-like)**
**Read time:** 14 min | **Difficulty:** Hard | **Video:** 24 min | **Estimated Time:** ~60-75 min

*Sections:*
1. Requirements
   - Browse products, place orders, payment
   - Millions of products, millions of users
   - High availability (downtime = money loss)
2. Capacity estimation
   - Concurrent users, product catalog size
3. High-level design
   - Product service, order service, payment service, inventory
4. Deep dives
   - Product search & recommendations
   - Inventory management (overselling protection)
   - Payment processing (3rd party integration)
   - Order tracking
5. Trade-offs
   - Strong vs eventual consistency (inventory)
   - Search latency vs accuracy
6. Follow-ups
   - Flash sales? (inventory burst)
   - Recommendation engine?
   - Multi-currency?

*DSA problems:*
- Trie (product search)
- Consistent hashing (inventory service)
- DP (pricing optimization)

---

#### 14. **Design Analytics Platform (Google Analytics-like)**
**Read time:** 12 min | **Difficulty:** Hard | **Video:** 20 min | **Estimated Time:** ~60 min

*Sections:*
1. Requirements
   - Track user events (millions/day)
   - Real-time dashboards
   - Historical queries (aggregate data)
2. Capacity estimation
   - Events per second, retention period
3. High-level design
   - Event collection, processing, storage, query
4. Deep dives
   - Event batching & buffering
   - Data warehousing (column-oriented storage)
   - Real-time aggregation vs batch processing
   - Query optimization
5. Trade-offs
   - Real-time vs accuracy
   - Storage vs query speed (denormalization)
6. Follow-ups
   - Anomaly detection?
   - Custom metrics?
   - Data retention policy?

*DSA problems:*
- Heap (top-K queries)
- Consistent hashing (log distribution)

---

#### 15. **Design Recommendation System**
**Read time:** 13 min | **Difficulty:** Hard | **Video:** 21 min | **Estimated Time:** ~60 min

*Sections:*
1. Requirements
   - Recommend products/content to users
   - Millions of users & items
   - Fast serving (< 100ms)
2. Capacity estimation
   - User-item interactions, model size
3. High-level design
   - Offline ML training, online serving, feedback loop
4. Deep dives
   - Collaborative filtering basics
   - Content-based filtering
   - Hybrid approaches
   - Model serving (inference optimization)
   - A/B testing
5. Trade-offs
   - Model accuracy vs latency
   - Cold start problem
6. Follow-ups
   - Personalization vs privacy?
   - Diversity in recommendations?
   - Serendipity?

*DSA connection:* "Matrix operations, nearest neighbor search"

---

#### 16. **Design Rate Limiter**
**Read time:** 11 min | **Difficulty:** Medium | **Video:** 17 min | **Estimated Time:** ~45-60 min

*Sections:*
1. Requirements
   - Limit requests per user (100/minute)
   - Global or per-server?
2. Capacity estimation
   - Unique users, states to track
3. Algorithms
   - Token bucket
   - Leaky bucket
   - Sliding window log
   - Sliding window counter
4. Implementation details
   - In-memory storage vs Redis
   - Distributed rate limiting
5. Trade-offs
   - Precision vs memory
   - Real-time vs eventual consistency
6. Follow-ups
   - Burst handling?
   - Different limits for different endpoints?

*DSA problems:*
- Heap (sliding window)
- Queue (token bucket)

*Real example:* Twitter's rate limiting API

---

#### 17. **Design Distributed Cache (Redis-like)**
**Read time:** 12 min | **Difficulty:** Hard | **Video:** 19 min | **Estimated Time:** ~60 min

*Sections:*
1. Requirements
   - In-memory key-value store
   - High throughput, low latency
   - Persistence option
2. Capacity estimation
   - Keys, value size, memory limits
3. High-level design
   - Hash table core, eviction policy, persistence
4. Deep dives
   - Data structures (strings, lists, sets, hashes)
   - Eviction policies (LRU, LFU)
   - Persistence (RDB, AOF)
   - Replication & clustering
5. Trade-offs
   - Speed vs persistence
   - Memory vs features
6. Follow-ups
   - Transactions? (MULTI/EXEC)
   - Pub/Sub?

*DSA problems:*
- Hash table
- LRU cache (eviction)
- Doubly linked list (LRU ordering)

*Real system:* Redis architecture

---

#### 18. **Design Web Crawler**
**Read time:** 11 min | **Difficulty:** Hard | **Video:** 18 min | **Estimated Time:** ~60 min

*Sections:*
1. Requirements
   - Crawl the web at scale (billions of pages)
   - Avoid duplicate URLs
   - Respect robots.txt
2. Capacity estimation
   - Crawling rate, storage, time to re-crawl
3. High-level design
   - URL frontier, fetcher, parser, storage
4. Deep dives
   - URL deduplication (bloom filter, hash set)
   - Crawling politeness (delay, user-agent)
   - Link prioritization
   - Distributed crawling
5. Trade-offs
   - Freshness vs crawl speed
   - Politeness vs coverage
6. Follow-ups
   - Duplicate content detection?
   - Page importance ranking (PageRank)?

*DSA problems:*
- Bloom filter (deduplication)
- BFS/DFS (link traversal)
- Consistent hashing (distributed crawling)

---

#### 19. **Design Payment System**
**Read time:** 13 min | **Difficulty:** Hard | **Video:** 20 min | **Estimated Time:** ~60-75 min

*Sections:*
1. Requirements
   - Process millions of transactions/day
   - Reliability (no money loss)
   - PCI-DSS compliance
2. Capacity estimation
   - Transaction throughput, latency SLAs
3. High-level design
   - Payment API, wallet service, transaction ledger
4. Deep dives
   - Transaction states (pending, completed, failed)
   - Idempotency (duplicate request handling)
   - Reconciliation
   - Fraud detection
5. Trade-offs
   - Consistency vs availability (ACID vs BASE)
   - Real-time vs batch settlement
6. Follow-ups
   - Refunds?
   - Currency conversion?
   - Chargeback handling?

*Critical:* "Idempotency keys prevent double-charging"

---

#### 20. **Design File Storage System (Dropbox-like)**
**Read time:** 12 min | **Difficulty:** Hard | **Video:** 19 min | **Estimated Time:** ~60 min

*Sections:*
1. Requirements
   - Store & sync files across devices
   - Handle large files efficiently
   - Version control
2. Capacity estimation
   - Storage, bandwidth, concurrent users
3. High-level design
   - Upload/download service, sync service, metadata service
4. Deep dives
   - Chunking large files (efficient uploads)
   - Delta sync (only changed parts)
   - Consistency across devices
   - Conflict resolution
5. Trade-offs
   - Sync speed vs storage efficiency
   - Immediate vs eventual consistency
6. Follow-ups
   - Trash/recovery?
   - Sharing permissions?
   - Real-time collaboration?

*DSA problems:*
- Hash (file deduplication)
- Merkle tree (delta sync)
- Trie (file paths)

---

#### 21. **Design Distributed Lock Service**
**Read time:** 11 min | **Difficulty:** Hard | **Video:** 17 min | **Estimated Time:** ~45-60 min

*Sections:*
1. Requirements
   - Distributed mutex for multi-server coordination
   - Deadlock prevention
2. Capacity estimation
   - Lock requests/second, hold duration
3. Solutions
   - Database locks (pessimistic)
   - Redis-based locks
   - Consensus algorithms (Raft, Paxos)
4. Deep dives
   - Lock expiration & renewal
   - Fairness (FIFO vs priority)
   - Deadlock detection
5. Trade-offs
   - Performance vs correctness
   - Complexity vs reliability
6. Follow-ups
   - Upgrade locks (read → write)?
   - Priority inheritance?

*Real system:* Zookeeper, etcd

---

#### 22. **Design Distributed Key-Value Store**
**Read time:** 13 min | **Difficulty:** Hard | **Video:** 21 min | **Estimated Time:** ~75 min

*Sections:*
1. Requirements
   - Consistent hashing for scalability
   - Replication for availability
   - Millions of keys, petabytes of data
2. High-level design
   - Hash ring, replicas, versioning
3. Deep dives
   - Data partitioning (consistent hashing)
   - Replica placement (anti-entropy)
   - Conflict resolution (vector clocks)
   - Node failures & recovery
4. Trade-offs
   - Consistency vs availability (CAP theorem)
   - Replica count vs storage
5. Follow-ups
   - Write amplification?
   - Geographic distribution?

*DSA problems:*
- Consistent hashing
- Vector clocks (ordering)

*Real system:* Dynamo, Cassandra

---

#### 23. **Design API Rate Limiter (Advanced)**
**Read time:** 12 min | **Difficulty:** Hard | **Video:** 18 min | **Estimated Time:** ~60 min

*Sections:*
- Extending from rate limiter design
- Multi-level rate limiting (IP, user, app)
- Distributed rate limiting across servers
- Handling clock skew
- Advanced algorithms
- Real-time feedback

---

#### 24. **Design Monitoring & Alerting System**
**Read time:** 12 min | **Difficulty:** Hard | **Video:** 19 min | **Estimated Time:** ~60 min

*Sections:*
1. Requirements
   - Collect metrics from millions of services
   - Detect anomalies
   - Send alerts in real-time
2. High-level design
   - Metric collection, storage, querying, alerting
3. Deep dives
   - Time-series database
   - Anomaly detection algorithms
   - Alert routing & escalation
4. Trade-offs
   - Precision vs false positives
   - Real-time vs batch analysis
5. Follow-ups
   - Correlation detection?
   - Root cause analysis?

*Real systems:* Prometheus, Datadog

---

#### 25. **Design Auto-Scaling System**
**Read time:** 11 min | **Difficulty:** Hard | **Video:** 17 min | **Estimated Time:** ~45-60 min

*Sections:*
1. Requirements
   - Automatically add/remove servers based on load
   - Handle traffic spikes
   - Cost optimization
2. Metrics
   - CPU, memory, request queue length
3. Scaling algorithms
   - Threshold-based
   - Predictive
   - Target tracking
4. Trade-offs
   - Scaling speed vs cost
   - False positive scale-ups
5. Follow-ups
   - Zone-aware scaling?
   - Graceful shutdown?

---

### INTEGRATION GUIDES (3 articles)

#### 1. **DSA ↔ System Design: Connections**
**Read time:** 12 min | **Interactive:** Yes

Map each DSA concept to system design applications:
- Hash table → URL shortener, caching
- Heap → load balancing, priority queues
- Consistent hashing → distributed systems
- B-tree → database indexing
- Trie → autocomplete, search
- Bloom filter → deduplication
- etc.

---

#### 2. **System Design Interview Communication Checklist**
**Read time:** 10 min | **Printable:** Yes

- [ ] Clarify requirements (ask 5 clarifying questions)
- [ ] Capacity estimation (show calculations)
- [ ] High-level design (draw simple diagram)
- [ ] Deep dive (pick 2-3 components)
- [ ] Trade-offs (discuss alternatives)
- [ ] Handle follow-ups (be flexible)
- [ ] Discuss monitoring (how do you know it works?)

---

#### 3. **From LeetCode to System Design: Growth Path**
**Read time:** 11 min | **Actionable:** Yes

How each LeetCode problem type scales to system design:
- Two-pointer → distributed systems coordination
- Sliding window → rate limiting
- Graph problems → service dependency graphs
- Sorting → data warehouse optimization
- etc.

---

## SUMMARY

**Total DSA Content:** 48 articles
- 12 fundamentals
- 10 intermediate
- 8 advanced
- 8 reference & language-specific

**Total System Design Content:** 25 articles
- 6 fundamentals
- 18 case studies (range: easy to very hard)
- 1 integration guide

**Total Content:** 73+ articles

**Estimated Reading/Video Time:**
- DSA: 20-25 hours (fundamentals + intermediate)
- System Design: 15-20 hours (case studies)
- Total: 35-45 hours of core content

**Supporting Materials:**
- 100+ problem solutions with walkthroughs
- 50+ video explanations
- 20+ interactive visualizations
- Downloadable cheat sheets
- Code templates for multiple languages

---

## CONTENT CREATION PRIORITY

**MVP Launch (Weeks 1-8):** Focus on highest-demand topics

### Phase 1 (Weeks 1-4):
- DSA fundamentals (arrays, linked lists, stacks, queues, hash maps)
- System design fundamentals (databases, caching, load balancing)
- 3 case studies (URL shortener, feed, search)

### Phase 2 (Weeks 5-8):
- DSA intermediate (BST, heaps, DP basics, graphs)
- 5 more case studies (ride-sharing, video streaming, messaging, e-commerce, analytics)

### Phase 3 (Months 3-6):
- DSA advanced topics
- Remaining case studies
- Integration guides
- Reference materials

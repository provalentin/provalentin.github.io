# Problem Type Recognition Guide

**Read time:** 11 min | **Interactive:** Yes

## Array Problems

| Keywords | Algorithm | Complexity |
|----------|-----------|-----------|
| Subarray, sum, range | Sliding window, prefix sum | O(n) |
| Duplicates, frequency | Hash set, hash map | O(n) |
| Sorted, search | Binary search | O(log n) |
| Pairs, triplets | Two pointers, hash map | O(n) |
| Max/min subarray | Kadane's, DP | O(n) |

## String Problems

| Keywords | Algorithm | Complexity |
|----------|-----------|-----------|
| Pattern match | KMP, Rabin-Karp | O(n+m) |
| Substring | Sliding window, hash | O(n) |
| Anagram, frequency | Hash map, sorting | O(n log n) |
| Palindrome | Expand center, DP | O(n²) |
| Edit distance | DP | O(m*n) |

## Tree Problems

| Keywords | Algorithm | Complexity |
|----------|-----------|-----------|
| Traverse, order | DFS, BFS | O(n) |
| Path, LCA | Recursion, DFS | O(n) |
| Balanced, valid | Recursion | O(n) |
| Serialize | DFS, BFS | O(n) |

## Graph Problems

| Keywords | Algorithm | Complexity |
|----------|-----------|-----------|
| Connected, component | Union-Find, DFS | O(V+E) |
| Shortest path | BFS, Dijkstra | O(V+E) or O((V+E)logV) |
| Cycle detection | DFS | O(V+E) |
| Topological sort | Kahn, DFS | O(V+E) |
| MST | Kruskal, Prim | O(E log V) |

## DP Problems

| Keywords | Algorithm | Complexity |
|----------|-----------|-----------|
| Optimize, max/min | DP | O(n²) typical |
| Count ways | DP | O(n²) typical |
| Unbounded knapsack | DP | O(n*W) |
| Sequence match | DP | O(m*n) |

## Decision Flow

```
Problem has:
├─ Sorted array? → Binary search
├─ Subarray? → Sliding window / prefix sum
├─ Pairs/triplets? → Two pointers / hash map
├─ Pattern matching? → String algorithms
├─ Paths/connectivity? → Graph algorithms
├─ Optimize value? → DP
├─ Tree structure? → Recursion / DFS
└─ Network flow? → Max flow algorithm
```

---

**Key:** First identify the problem type, then apply the right algorithm.**

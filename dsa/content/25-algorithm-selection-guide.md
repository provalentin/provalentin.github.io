# Algorithm Selection Guide

**Read time:** 10 min | **Interactive:** Yes

## Decision Tree

### Sorting

**Need to sort?**
- **Stable + general:** Merge Sort O(n log n)
- **In-place + average:** Quick Sort O(n log n)
- **No comparisons:** Counting/Radix Sort O(n)
- **Almost sorted:** Insertion Sort O(n)
- **Online (as arrives):** Min-Heap O(n log n)

### Searching

**Need to find element?**
- **Unsorted:** Hash Map O(1)
- **Sorted:** Binary Search O(log n)
- **In tree:** BST O(log n) balanced
- **In graph:** BFS/DFS O(V+E)
- **Substring:** KMP O(n+m)

### Paths

**Find path in graph?**
- **Shortest (unweighted):** BFS O(V+E)
- **Shortest (weighted):** Dijkstra O((V+E) log V)
- **All pairs:** Floyd-Warshall O(V³)
- **Any path exists:** DFS O(V+E)
- **Negative weights:** Bellman-Ford O(VE)

### Optimization

**Maximize/minimize?**
- **Independent choices:** Greedy
- **Overlapping subproblems:** Dynamic Programming
- **Tree structure:** Tree DP or Greedy
- **Game-like:** Minimax DP
- **Constraint satisfaction:** Backtracking

### Data Structures

**Which to use?**
- **Fast lookup:** Hash Map O(1)
- **Ordered access:** Balanced BST O(log n)
- **Priority access:** Heap O(log n)
- **Hierarchy:** Tree/Graph
- **Range queries:** Segment Tree O(log n)

## Problem Type Mappings

| Problem Type | Algorithm | Complexity |
|--------------|-----------|-----------|
| Find Kth element | Heap/Quickselect | O(n) avg |
| LCA in tree | Tarjan/Binary Lifting | O(log n) |
| Component count | Union-Find/DFS | O(V+E) |
| Cycle detection | DFS/BFS | O(V+E) |
| Topological sort | Kahn/DFS | O(V+E) |
| Matching in graph | Hopcroft-Karp | O(E√V) |
| Min spanning tree | Kruskal/Prim | O(E log V) |
| Longest path | DAG DP/DFS | O(V+E) |
| Subarray problems | Sliding window/Prefix | O(n) |
| Substring problems | String matching | O(n+m) |

## Quick Decision Chart

```
Problem involves: ...
│
├─ Sorting
│  └─ Use Merge/Quick Sort
│
├─ Searching
│  ├─ Sorted? → Binary Search
│  └─ Not sorted? → Hash Map
│
├─ Paths in Graph
│  ├─ Weighted? → Dijkstra
│  └─ Unweighted? → BFS
│
├─ Optimization
│  ├─ Greedy works? → Greedy
│  └─ Need DP? → Dynamic Programming
│
├─ Matching/Flow
│  └─ Max Flow algorithm
│
└─ Tree problems
   └─ Recursion or DP
```

## Common Pitfalls

❌ Using O(n²) when O(n) exists  
❌ Sorting when not needed  
❌ Over-engineering simple problem  
❌ Wrong algorithm for constraints  
❌ Not considering space limits  

## Verification Steps

1. **Does algorithm solve problem?** ✓
2. **Is complexity acceptable?** ✓
3. **Handles edge cases?** ✓
4. **Any simpler approach?** ✓
5. **Implemented correctly?** ✓

---

**Key:** Know trade-offs. Choose simplest that works in time limit.

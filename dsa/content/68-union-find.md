# Advanced DSA: Union-Find (Disjoint Set Union)

**Read time:** 10 min | **Difficulty:** Medium-Hard

## Union-Find Data Structure

Efficient solution for:
- Connected components
- Cycle detection
- Network connectivity

## Basic Idea

```
Elements: [1, 2, 3, 4, 5]

Union(1, 2): Connect 1 and 2
Union(3, 4): Connect 3 and 4
Union(2, 3): Connect {1,2} and {3,4}

Result: {1,2,3,4}, {5}

Find(1) = Find(4)? YES (same set)
Find(1) = Find(5)? NO (different sets)
```

## Simple Implementation (Array)

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))  # Initially each element is own parent
    
    def find(self, x):
        # Find root of x
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])  # Path compression
        return self.parent[x]
    
    def union(self, x, y):
        root_x = self.find(x)
        root_y = self.find(y)
        
        if root_x != root_y:
            self.parent[root_x] = root_y  # Merge sets
            return True
        return False  # Already in same set
```

## Optimization 1: Union by Rank

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n
    
    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]
    
    def union(self, x, y):
        root_x = self.find(x)
        root_y = self.find(y)
        
        if root_x == root_y:
            return False
        
        # Attach smaller tree to larger tree
        if self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
        elif self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
        else:
            self.parent[root_y] = root_x
            self.rank[root_x] += 1
        
        return True
```

Benefits:
```
Without rank:
Path can be deep: 1 ← 2 ← 3 ← 4 ← 5
Find(1) takes O(n) time

With rank:
Trees stay shallow:
    5
   / \
  3   4
 /
1 2

Find(1) takes O(log n) time
```

## Optimization 2: Path Compression

```python
def find(self, x):
    if self.parent[x] != x:
        self.parent[x] = self.find(self.parent[x])  # Compress path
    return self.parent[x]
```

Effect:
```
Before:
1 ← 2 ← 3 ← 4 ← 5

After find(1):
1 → 5 ← 2 → 5
    ↓
    3 → 5
    ↓
    4 → 5

All point directly to root!
```

## Applications

### Cycle Detection in Undirected Graph

```python
def has_cycle(edges):
    n = len(edges)
    uf = UnionFind(n)
    
    for u, v in edges:
        if not uf.union(u, v):  # Already connected
            return True  # Cycle found
    
    return False
```

### Connected Components

```python
def count_components(edges, n):
    uf = UnionFind(n)
    
    for u, v in edges:
        uf.union(u, v)
    
    # Count unique parents
    return len(set(uf.find(i) for i in range(n)))
```

### Kruskal's MST Algorithm

```python
def kruskal_mst(edges, vertices):
    # edges = [(weight, u, v), ...]
    edges.sort()  # Sort by weight
    
    uf = UnionFind(vertices)
    mst_weight = 0
    mst_edges = []
    
    for weight, u, v in edges:
        if uf.union(u, v):  # Not in same component
            mst_weight += weight
            mst_edges.append((u, v))
            
            if len(mst_edges) == vertices - 1:
                break
    
    return mst_edges, mst_weight
```

### Friend Circles

```
Friends matrix:
  0 1 2
0 1 1 0
1 1 1 1
2 0 1 1

Friendships: (0,1), (1,2), (2,1)
Union(0, 1), Union(1, 2)
Result: One group {0, 1, 2}
```

## Complexity Analysis

```
Time complexity:
- find(x): O(α(n)) ≈ O(1) with path compression + union by rank
- union(x, y): O(α(n)) ≈ O(1)
- m operations: O(m × α(n))

Where α(n) is inverse Ackermann function (incredibly small)

Practically: O(1) per operation
```

## Practice Problems

```
1. Is graph bipartite?
2. Find number of provinces
3. Accounts merge (find all accounts of same person)
4. Minimum spanning tree
5. Detect cycle in graph
6. Redundant connections
```

## Interview Tips

✓ Explain union by rank optimization
✓ Explain path compression
✓ Implement efficiently
✓ Identify when to use Union-Find
✓ Trace through example
✓ Analyze time complexity

❌ Don't forget path compression
❌ Don't skip union by rank
❌ Don't use without optimization
❌ Don't confuse with adjacency list

---

**Next:** Suffix arrays and advanced string algorithms.

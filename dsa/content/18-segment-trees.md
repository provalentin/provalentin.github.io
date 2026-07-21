# Segment Trees & Fenwick Trees

**Read time:** 15 min | **Difficulty:** Hard | **Video:** 22 min

## Segment Tree

Store aggregate (sum, min, max) over ranges.

```python
class SegmentTree:
    def __init__(self, arr):
        self.n = len(arr)
        self.tree = [0] * (4 * self.n)
        self.build(arr, 0, 0, self.n - 1)
    
    def build(self, arr, node, start, end):
        if start == end:
            self.tree[node] = arr[start]
        else:
            mid = (start + end) // 2
            self.build(arr, 2*node+1, start, mid)
            self.build(arr, 2*node+2, mid+1, end)
            self.tree[node] = (self.tree[2*node+1] + 
                              self.tree[2*node+2])
    
    def query(self, node, start, end, l, r):
        if r < start or end < l:
            return 0
        if l <= start and end <= r:
            return self.tree[node]
        
        mid = (start + end) // 2
        p1 = self.query(2*node+1, start, mid, l, r)
        p2 = self.query(2*node+2, mid+1, end, l, r)
        return p1 + p2
    
    def update(self, node, start, end, idx, val):
        if start == end:
            self.tree[node] = val
        else:
            mid = (start + end) // 2
            if idx <= mid:
                self.update(2*node+1, start, mid, idx, val)
            else:
                self.update(2*node+2, mid+1, end, idx, val)
            self.tree[node] = (self.tree[2*node+1] + 
                              self.tree[2*node+2])

# Time: O(log n) for both query and update
# Space: O(n)
```

## Fenwick Tree (Binary Indexed Tree)

More space-efficient for simple range queries.

```python
class FenwickTree:
    def __init__(self, n):
        self.n = n
        self.tree = [0] * (n + 1)
    
    def update(self, i, delta):
        while i <= self.n:
            self.tree[i] += delta
            i += i & (-i)  # Add last set bit
    
    def query(self, i):
        s = 0
        while i > 0:
            s += self.tree[i]
            i -= i & (-i)  # Remove last set bit
        return s
    
    def range_query(self, l, r):
        return self.query(r) - self.query(l - 1)

# Time: O(log n) for both
# Space: O(n)
```

## Use Cases

1. **Range sum queries with updates**
2. **Count inversions** in array
3. **Coordinate compression** problems
4. **Competitive programming** for efficiency

## Segment Tree vs Fenwick

| Aspect | Segment Tree | Fenwick Tree |
|--------|-------------|-------------|
| Query | O(log n) | O(log n) |
| Update | O(log n) | O(log n) |
| Space | O(4n) | O(n) |
| Flexibility | High | Limited |

---

**Key:** Segment trees for complex queries, Fenwick for simple range sums.

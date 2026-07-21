# Interview Patterns & Cheat Sheet

**Read time:** 18 min | **Difficulty:** Medium | **Video:** 15 min (reference)

## Essential Patterns

### 1. Two Pointers

**When:** Pairs, reversals, partitions

```python
def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1
    
    while left < right:
        current_sum = arr[left] + arr[right]
        if current_sum == target:
            return [left, right]
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    return []
```

### 2. Sliding Window

**When:** Subarray/substring problems

```python
def longest_substring(s):
    char_index = {}
    left = 0
    max_length = 0
    
    for right in range(len(s)):
        if s[right] in char_index and char_index[s[right]] >= left:
            left = char_index[s[right]] + 1
        
        char_index[s[right]] = right
        max_length = max(max_length, right - left + 1)
    
    return max_length
```

### 3. Prefix Sum

**When:** Range queries

```python
def range_sum_query(arr):
    prefix = [0]
    for num in arr:
        prefix.append(prefix[-1] + num)
    
    def query(i, j):
        return prefix[j + 1] - prefix[i]
    
    return query
```

### 4. Hash Map / Set

**When:** Frequency, mapping, deduplication

```python
def majority_element(arr):
    count = {}
    for num in arr:
        count[num] = count.get(num, 0) + 1
    
    for num, freq in count.items():
        if freq > len(arr) // 2:
            return num
```

### 5. DFS Recursion

**When:** Trees, graphs, backtracking

```python
def dfs_template(node):
    if not node:
        return base_case
    
    # Process current node
    result = node.value
    
    # Recurse on children
    left = dfs_template(node.left)
    right = dfs_template(node.right)
    
    # Combine results
    return combine(result, left, right)
```

### 6. BFS Level Order

**When:** Shortest path, level-order

```python
from collections import deque

def bfs_template(root):
    queue = deque([root])
    visited = set([root])
    
    while queue:
        node = queue.popleft()
        process(node)
        
        for neighbor in node.neighbors:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
```

### 7. Dynamic Programming

**When:** Optimization problems

```python
def dp_template(n):
    dp = [0] * (n + 1)
    dp[0] = base_case
    
    for i in range(1, n + 1):
        dp[i] = f(dp[i-1], dp[i-2], ...)
    
    return dp[n]
```

### 8. Greedy

**When:** Selection problems

```python
def greedy_template(items):
    items.sort(key=lambda x: x.priority)
    
    result = []
    for item in items:
        if can_select(item):
            result.append(item)
    
    return result
```

### 9. Union-Find

**When:** Connected components

```python
class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
    
    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]
    
    def union(self, x, y):
        px, py = self.find(x), self.find(y)
        if px != py:
            self.parent[px] = py
```

### 10. Binary Search

**When:** Sorted array, searching

```python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return -1
```

---

## Quick Reference Table

| Pattern | Time | Space | Best For |
|---------|------|-------|----------|
| Two Pointers | O(n) | O(1) | Pairs, reversals |
| Sliding Window | O(n) | O(k) | Substring |
| Prefix Sum | O(n) | O(n) | Range queries |
| Hash Map | O(1)avg | O(n) | Frequency |
| DFS | O(n) | O(h) | Trees, paths |
| BFS | O(n) | O(w) | Shortest path |
| DP | Varies | Varies | Optimization |
| Greedy | O(n log n) | O(1) | Selection |
| Union-Find | O(α(n)) | O(n) | Components |
| Binary Search | O(log n) | O(1) | Sorted array |

---

## Interview Checklist

Before coding:
- [ ] Understood problem statement
- [ ] Asked clarifying questions
- [ ] Identified pattern (two pointers? DP?)
- [ ] Explained approach (before coding!)
- [ ] Calculated complexity (time & space)

While coding:
- [ ] Clean, readable code
- [ ] Proper variable names
- [ ] Handle edge cases
- [ ] No off-by-one errors

After coding:
- [ ] Walk through example
- [ ] Verify complexity
- [ ] Ask: "Can we optimize?"
- [ ] Discuss trade-offs

---

## Edge Cases Checklist

- [ ] Empty input (null, [], "")
- [ ] Single element
- [ ] Duplicates
- [ ] Sorted vs unsorted
- [ ] Negative numbers
- [ ] Very large numbers
- [ ] All same elements
- [ ] Boundary values

---

## Communication Tips

1. **Think out loud:** Explain your approach
2. **Ask questions:** "Is the array sorted?"
3. **Simplify first:** Brute force → optimize
4. **Justify choices:** "I chose X because..."
5. **Discuss trade-offs:** "This is faster but uses more space"

---

**Master these patterns. They cover 80% of interview problems.**

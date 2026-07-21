# Data Structure Operations Reference

**Read time:** 8 min | **Printable:** Yes

## Array Operations

```python
arr = [1, 2, 3]
arr.append(4)           # O(1) amortized
arr.insert(0, 0)        # O(n)
arr.pop()               # O(1)
arr.pop(0)              # O(n)
arr.remove(2)           # O(n)
arr[i]                  # O(1)
arr[i:j]                # O(j-i)
```

## String Operations

```python
s = "hello"
s[i]                    # O(1)
s[i:j]                  # O(j-i)
s + s2                  # O(n+m)
s.split()               # O(n)
s.replace(old, new)     # O(n)
s.upper()               # O(n)
```

## List/Deque Operations

```python
from collections import deque

lst = [1, 2, 3]
lst.append(4)           # O(1)
lst.pop()               # O(1)
lst.pop(0)              # O(n)
lst.insert(0, 0)        # O(n)

dq = deque([1, 2, 3])
dq.append(4)            # O(1)
dq.appendleft(0)        # O(1)
dq.pop()                # O(1)
dq.popleft()            # O(1)
```

## Dictionary/Hash Map

```python
d = {'a': 1}
d['a']                  # O(1)
d['a'] = 2              # O(1)
del d['a']              # O(1)
'a' in d                # O(1)
d.get('b', 0)           # O(1)
d.keys()                # O(n)
d.values()              # O(n)
```

## Set Operations

```python
s = {1, 2, 3}
s.add(4)                # O(1)
s.remove(1)             # O(1)
1 in s                  # O(1)
s.union(s2)             # O(n+m)
s.intersection(s2)      # O(min(n,m))
s.difference(s2)        # O(n)
```

## Heap Operations

```python
import heapq

heap = []
heapq.heappush(heap, 5) # O(log n)
heapq.heappop(heap)     # O(log n)
heap[0]                 # O(1)
heapq.heapify(arr)      # O(n)
```

## Tree Operations

```python
# BST, Balanced Tree
search(tree, val)       # O(log n) balanced, O(n) unbalanced
insert(tree, val)       # O(log n) balanced, O(n) unbalanced
delete(tree, val)       # O(log n) balanced, O(n) unbalanced
```

---

**Use as quick reference during interviews.**

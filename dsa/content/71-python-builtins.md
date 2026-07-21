# Language Guide: Python Built-ins for Interviews

**Read time:** 10 min | **Reference:** Yes

## Essential Data Structures

### List

```python
lst = [1, 2, 3]
lst.append(4)                # O(1) amortized
lst.insert(0, 0)             # O(n) - shift needed
lst[0]                       # O(1) - indexing
lst.pop()                    # O(1) - remove last
lst.pop(0)                   # O(n) - remove first
lst.remove(2)                # O(n) - find and remove
```

### Dictionary

```python
d = {}
d['key'] = 'value'           # O(1)
d.get('key')                 # O(1), returns None if missing
d.get('key', 'default')      # O(1) with default
'key' in d                   # O(1)
del d['key']                 # O(1)
d.keys()                     # View of keys
d.values()                   # View of values
d.items()                    # View of (key, value) pairs
```

### Set

```python
s = {1, 2, 3}
s.add(4)                     # O(1)
s.discard(2)                 # O(1) - no error if missing
s.remove(2)                  # O(1) - error if missing
2 in s                       # O(1)
s1 & s2                      # Intersection, O(min(len(s1), len(s2)))
s1 | s2                      # Union
s1 - s2                       # Difference
```

### Deque (Double-ended queue)

```python
from collections import deque
dq = deque([1, 2, 3])
dq.append(4)                 # O(1) - add right
dq.appendleft(0)             # O(1) - add left
dq.pop()                     # O(1) - remove right
dq.popleft()                 # O(1) - remove left
dq[0]                        # O(1) - indexing
```

### HeapQ (Priority Queue / Min Heap)

```python
import heapq
heap = []
heapq.heappush(heap, 5)      # O(log n)
heapq.heappush(heap, 3)
heapq.heappush(heap, 7)
heapq.heappop(heap)          # 3 (smallest) in O(log n)
heap[0]                      # 5 (smallest without removing)

# Max heap (negate values)
heapq.heappush(heap, -5)     # Negate to get max behavior
-heapq.heappop(heap)         # Negate back: 5
```

### Sorted Dict (TreeMap equivalent)

```python
from sortedcontainers import SortedDict
d = SortedDict()
d[5] = 'five'
d[3] = 'three'
d[7] = 'seven'

d.keys()                     # [3, 5, 7] - sorted
d.bisect_left(5)             # Index of 5
```

## String Operations

```python
s = "hello"
s.upper()                    # O(n)
s.lower()                    # O(n)
s.split()                    # O(n) - split by whitespace
s.split(',')                 # O(n) - split by delimiter
','.join(['a', 'b', 'c'])    # O(n) - joins with delimiter
s.replace('e', 'E')          # O(n) - replace all occurrences
s.find('ll')                 # O(n) - return index or -1
s.startswith('he')           # O(m) - m = prefix length
s.endswith('lo')             # O(m)
s[1:3]                       # 'el' - slicing is O(k) where k = length
s[::-1]                      # 'olleh' - reverse in O(n)
```

## Sorting & Ordering

### Sort Lists

```python
lst = [3, 1, 4, 1, 5]
sorted(lst)                  # [1, 1, 3, 4, 5], returns new list
lst.sort()                   # Sorts in-place

# Descending
sorted(lst, reverse=True)    # [5, 4, 3, 1, 1]

# Custom key
sorted(lst, key=lambda x: -x)  # Descending by negating

# Sort by second element of tuples
data = [(3, 'c'), (1, 'a'), (2, 'b')]
sorted(data, key=lambda x: x[1])  # [(1, 'a'), (2, 'b'), (3, 'c')]
```

### Collections Counter

```python
from collections import Counter
s = "aabbcc"
counter = Counter(s)         # {'a': 2, 'b': 2, 'c': 2}
counter.most_common(2)       # [('a', 2), ('b', 2)]
counter['a']                 # 2
counter.get('d', 0)          # 0 (default)
```

### DefaultDict

```python
from collections import defaultdict
d = defaultdict(int)         # Default value: 0
d['count'] += 1              # No KeyError
d['count'] += 1              # Works! Value: 2

d_list = defaultdict(list)
d_list['items'].append(1)    # Works! Creates [] if missing
```

## Iteration Tools

```python
# Enumerate (index + value)
for idx, val in enumerate(['a', 'b', 'c']):
    print(idx, val)          # 0 a, 1 b, 2 c

# Zip (parallel iteration)
for a, b in zip([1, 2, 3], ['a', 'b', 'c']):
    print(a, b)              # 1 a, 2 b, 3 c

# Range
for i in range(5):           # 0, 1, 2, 3, 4
    pass

# Reversed
for x in reversed([1, 2, 3]):  # 3, 2, 1
    pass
```

## Quick Checks

```python
isinstance(x, int)           # Type checking
len(lst)                     # Length in O(1)
sum(lst)                     # Sum all elements
max(lst)                     # Maximum value
min(lst)                     # Minimum value
any([False, False, True])    # Any True? O(n)
all([True, True, False])     # All True? O(n)
```

## Common Patterns

### Counting Frequencies

```python
# Using Counter
freq = Counter(s)

# Manual with defaultdict
from collections import defaultdict
freq = defaultdict(int)
for char in s:
    freq[char] += 1

# Manual with dict
freq = {}
for char in s:
    freq[char] = freq.get(char, 0) + 1
```

### Two-pointer Pattern

```python
left, right = 0, len(arr) - 1
while left < right:
    if arr[left] + arr[right] == target:
        return (left, right)
    elif arr[left] + arr[right] < target:
        left += 1
    else:
        right -= 1
```

### Sliding Window

```python
left = 0
for right in range(len(s)):
    # Expand window
    while condition_violated:
        # Shrink window
        left += 1
    # Process window [left, right]
```

## Interview Tips

✓ Use dict for key-value lookups
✓ Use set for uniqueness
✓ Use list for sequences (ArrayList equivalent)
✓ Use deque for both ends access
✓ Use Counter for frequencies
✓ Use defaultdict to avoid key errors
✓ Use sorted() or .sort()
✓ Use heapq for heap operations

❌ Don't modify list while iterating (except with list comprehension)
❌ Don't confuse dict.get() with dict[]
❌ Don't forget O(n) for list.insert(0, x)
❌ Don't use + for string concatenation in loops

## Quick Reference

```python
List:        O(1) append, O(n) insert at start
Dict:        O(1) all operations
Set:         O(1) all operations
Deque:       O(1) both ends
Counter:     O(n) to build, O(1) lookups
HeapQ:       O(log n) push/pop, O(1) peek
```

---

**Next:** C++ STL cheat sheet.

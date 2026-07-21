# Hash Maps & Hash Sets

**Read time:** 13 min | **Difficulty:** Easy-Medium | **Video:** 18 min

## Introduction

Hash tables are the **secret weapon** for O(1) lookups.

Need to find an element? O(n) linear search is too slow. Need fast lookups? Use a hash map.

This single concept opens up entire categories of problems.

---

## Part 1: Hash Map Basics

### The Core Idea

A hash map uses a **hash function** to map keys to array indices.

```
Keys: "apple", "banana", "cherry"
Hash Function: sum of ASCII values % array_size

"apple" -> hash -> index 2 -> value: "fruit1"
"banana" -> hash -> index 0 -> value: "fruit2"
"cherry" -> hash -> index 5 -> value: "fruit3"

Internal array: [fruit2, _, fruit1, _, _, fruit3, ...]
                  0      1   2    3  4   5
```

### Time Complexity (Average Case)

| Operation | Complexity | Reason |
|-----------|-----------|--------|
| Insert | O(1) | Direct index calculation |
| Delete | O(1) | Hash once, delete |
| Search/Lookup | O(1) | Hash once, access |
| Space | O(n) | Store n key-value pairs |

**Important:** O(1) is **average case**. Worst case is O(n) if all keys hash to same index.

### Python Implementation

```python
# Hash map (dictionary)
d = {}
d["apple"] = 5          # Insert
d["banana"] = 3

print(d["apple"])       # 5 (O(1) lookup)
print("apple" in d)     # True (O(1) check)

d.pop("apple")          # Delete (O(1))

# Iterate
for key in d:           # O(n)
    print(key, d[key])

# Methods
d.get("cherry", 0)      # Get with default (O(1))
d.keys()                # Get all keys (O(n))
d.values()              # Get all values (O(n))
d.items()               # Get key-value pairs (O(n))
```

---

## Part 2: Collisions & Resolution

### What's a Collision?

Two different keys hash to the same index.

```
Hash function: key % 10

key=5 -> hash=5
key=15 -> hash=5  (COLLISION!)
key=25 -> hash=5  (COLLISION!)
```

### Resolution Strategy 1: Chaining

Store a linked list at each index. If collision, add to list.

```
Index 0: []
Index 1: [5, 15, 25]  <- 5, 15, 25 all hash to 1
Index 2: []
...
```

**Lookup for 15:**
1. Hash 15 -> index 1
2. Scan linked list at index 1
3. Find 15 in list

**Complexity with chaining:**
- Average: O(1)
- Worst (all collisions): O(n)
- Typical: O(1 + load_factor) where load_factor = n/capacity

**Code:**
```python
class HashMapChaining:
    def __init__(self, capacity=10):
        self.capacity = capacity
        self.table = [[] for _ in range(capacity)]
    
    def hash(self, key):
        return hash(key) % self.capacity
    
    def insert(self, key, value):
        idx = self.hash(key)
        
        # Check if key exists and update
        for i, (k, v) in enumerate(self.table[idx]):
            if k == key:
                self.table[idx][i] = (key, value)
                return
        
        # New key, append
        self.table[idx].append((key, value))
    
    def get(self, key):
        idx = self.hash(key)
        
        for k, v in self.table[idx]:
            if k == key:
                return v
        
        return None
```

### Resolution Strategy 2: Linear Probing

If index occupied, try next index sequentially.

```
key=5 -> hash=1 -> occupied -> try 2 -> occupied -> try 3 -> free -> store at 3

Lookup for 5: hash=1 -> not found -> check 2 -> not found -> check 3 -> found!
```

**Complexity:**
- Good distribution: O(1)
- Bad distribution (clustering): Can degrade to O(n)

**Code:**
```python
class HashMapLinearProbing:
    def __init__(self, capacity=10):
        self.capacity = capacity
        self.table = [None] * capacity
    
    def hash(self, key):
        return hash(key) % self.capacity
    
    def insert(self, key, value):
        idx = self.hash(key)
        
        # Linear probing
        while self.table[idx] is not None:
            k, v = self.table[idx]
            if k == key:
                self.table[idx] = (key, value)
                return
            idx = (idx + 1) % self.capacity
        
        self.table[idx] = (key, value)
    
    def get(self, key):
        idx = self.hash(key)
        
        while self.table[idx] is not None:
            k, v = self.table[idx]
            if k == key:
                return v
            idx = (idx + 1) % self.capacity
        
        return None
```

### Comparison

| Strategy | Average | Worst | Space | Implementation |
|----------|---------|-------|-------|-----------------|
| Chaining | O(1) | O(n) | More flexible | Linked lists |
| Linear Probing | O(1) | O(n) | Fixed size | Simple array |

**For interviews:** Don't worry about collision handling. Use language's built-in hash map.

---

## Part 3: Hash Set Basics

### The Idea

Like hash map, but only stores **keys** (no values).

```python
s = set()
s.add(1)
s.add(2)
s.add(3)

print(2 in s)       # True (O(1))
print(4 in s)       # False (O(1))

s.remove(2)         # O(1)

for item in s:      # O(n)
    print(item)

s.union({3, 4, 5})  # {1, 2, 3, 4, 5}
s.intersection({2, 3})  # {3}
```

**vs Hash Map:**
- Hash map: key -> value (O(1) lookup)
- Hash set: just keys (O(1) membership check)

---

## Part 4: Key Problems

### 1. Two Sum

**Problem:** Find two numbers that sum to target (unsorted array).

**Brute force (O(n²)):**
```python
def twoSum_brute(arr, target):
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            if arr[i] + arr[j] == target:
                return [i, j]
    return []
```

**Optimized with hash map (O(n)):**
```python
def twoSum(arr, target):
    seen = {}  # value -> index
    
    for i, num in enumerate(arr):
        complement = target - num
        
        if complement in seen:
            return [seen[complement], i]
        
        seen[num] = i
    
    return []

# Example: arr = [2, 7, 11, 15], target = 9
# i=0, num=2: complement=7, not seen yet, seen={2: 0}
# i=1, num=7: complement=2, FOUND in seen! return [0, 1]
```

**Time:** O(n) — single pass
**Space:** O(n) — hash map

### 2. Contains Duplicate

**Problem:** Check if array has duplicates.

**Hash set solution:**
```python
def hasDuplicate(arr):
    seen = set()
    
    for num in arr:
        if num in seen:     # O(1) check
            return True
        seen.add(num)       # O(1) add
    
    return False

# Example: [1, 2, 3, 1]
# i=0: 1 not in set, add it. seen={1}
# i=1: 2 not in set, add it. seen={1, 2}
# i=2: 3 not in set, add it. seen={1, 2, 3}
# i=3: 1 IN set -> return True
```

**Time:** O(n)
**Space:** O(n)

### 3. Majority Element

**Problem:** Find element appearing more than n/2 times (guaranteed to exist).

**Hash map approach:**
```python
def majorityElement(arr):
    count = {}
    
    for num in arr:
        count[num] = count.get(num, 0) + 1
    
    # Find element with count > n/2
    for num, freq in count.items():
        if freq > len(arr) // 2:
            return num

# Example: [3, 2, 3]
# count = {3: 2, 2: 1}
# 3 appears 2 times > 3/2=1.5 -> return 3
```

**Time:** O(n)
**Space:** O(n)

**Boyer-Moore Voting (O(1) space):**
```python
def majorityElement_optimized(arr):
    candidate = None
    count = 0
    
    # Find candidate
    for num in arr:
        if count == 0:
            candidate = num
        count += (1 if num == candidate else -1)
    
    return candidate

# Cancels out pairs with different values
# Majority element survives
```

### 4. First Unique Character in String

**Problem:** Find first character that appears only once.

```python
def firstUniqChar(s):
    count = {}
    
    # Count occurrences
    for char in s:
        count[char] = count.get(char, 0) + 1
    
    # Find first with count 1
    for i, char in enumerate(s):
        if count[char] == 1:
            return i
    
    return -1

# Example: "leetcode"
# count = {'l': 1, 'e': 3, 't': 1, 'c': 1, 'o': 1, 'd': 1}
# First pass: 'l' has count 1 -> return 0
```

**Time:** O(n)
**Space:** O(1) — at most 26 letters (or 128 ASCII)

### 5. Valid Anagram

**Problem:** Check if two strings are anagrams (same characters, different order).

**Hash map approach:**
```python
def isAnagram(s, t):
    if len(s) != len(t):
        return False
    
    count = {}
    
    # Count characters in s
    for char in s:
        count[char] = count.get(char, 0) + 1
    
    # Decrement for characters in t
    for char in t:
        if char not in count:
            return False
        count[char] -= 1
        if count[char] < 0:
            return False
    
    return True

# Example: s = "listen", t = "silent"
# count from s: {'l': 1, 'i': 1, 's': 1, 't': 1, 'e': 1, 'n': 1}
# Process t: decrement each character
# All counts end at 0 -> return True
```

**Time:** O(n)
**Space:** O(1) — at most 26 letters

---

## Part 5: Hash Map Patterns

### Pattern 1: Counting Elements
```python
count = {}
for item in array:
    count[item] = count.get(item, 0) + 1
```

### Pattern 2: Mapping Values
```python
mapping = {}
for key, value in relationships:
    mapping[key] = value

# Lookup: O(1)
result = mapping[some_key]
```

### Pattern 3: Two-Pass Solution
**Pass 1:** Build hash map
**Pass 2:** Use hash map to answer queries

```python
def example(arr):
    # Pass 1: Build map
    map_data = {}
    for num in arr:
        map_data[num] = True
    
    # Pass 2: Query
    result = []
    for num in arr:
        if (num * 2) in map_data:
            result.append(num * 2)
    
    return result
```

### Pattern 4: Tracking Indices
```python
index_map = {}
for i, value in enumerate(array):
    if value in index_map:
        # Found value at previous index
        prev_index = index_map[value]
    index_map[value] = i
```

---

## Part 6: When to Use

### Use Hash Map When
- Need O(1) lookup by key
- Counting frequencies
- Mapping values
- Caching results (memoization)

### Use Hash Set When
- Need O(1) membership check
- Removing duplicates
- Finding common/unique elements

### Avoid When
- Order matters (use sorted map/set)
- Range queries (use tree)
- Frequent iterations with insertion (consider other structures)

---

## Interview Checklist

- [ ] Identified the need for O(1) lookup
- [ ] Chose hash map vs hash set correctly
- [ ] Handled collisions (basic understanding)
- [ ] Used `.get()` with default for safe lookup
- [ ] Considered space trade-off (O(n) extra space for O(1) time)
- [ ] Tested with duplicates
- [ ] Explained hash function concept
- [ ] Discussed time/space complexity

---

## Problems to Practice

### Easy
1. Two Sum
2. Contains Duplicate
3. Valid Anagram
4. Majority Element
5. First Unique Character

### Medium
1. Group Anagrams
2. Top K Frequent Elements
3. Longest Substring Without Repeating Characters (with sliding window)
4. Design HashMap
5. Ransom Note

### Hard
1. LRU Cache (hash map + doubly linked list)
2. Word Pattern
3. Isomorphic Strings

---

## Key Takeaways

1. **Hash map:** O(1) average lookup with key -> value
2. **Hash set:** O(1) membership check on keys only
3. **Collisions:** Chaining or probing strategies handle them
4. **Pattern:** Use hash map for counting, mapping, caching
5. **Trade-off:** O(n) space for O(1) time

---

## Common Pitfalls

### 1. Key Error
```python
# WRONG
count[key] += 1  # May crash if key doesn't exist

# RIGHT
count[key] = count.get(key, 0) + 1
```

### 2. Unhashable Types
```python
# WRONG - lists can't be keys (unhashable)
d = {[1, 2]: "value"}

# RIGHT - use tuples
d = {(1, 2): "value"}
```

### 3. Modifying While Iterating
```python
# WRONG
for key in d:
    if condition:
        del d[key]  # May skip elements

# RIGHT - iterate over copy
for key in list(d.keys()):
    if condition:
        del d[key]
```

---

## Next Steps

Hash maps are fundamental. Master them, and you'll solve 30%+ of interview problems.

Next: **Binary Trees** — hierarchical data with O(log n) operations.

**Video walkthrough:** 18-min video showing hash function concept, collision handling, and live trace of two-sum and anagram problems.

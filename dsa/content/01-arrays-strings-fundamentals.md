# Arrays & Strings Fundamentals

**Read time:** 12 min | **Difficulty:** Easy | **Video:** 15 min

## Introduction

Arrays and strings are the foundation of data structures. You'll encounter array/string problems in ~50% of all DSA interviews. The good news? They're intuitive to understand and solve once you master the patterns.

**Why master this first?**
- Simplest mental model (sequential storage)
- Builds intuition for indexing and iteration
- Most interview problems start here
- Foundation for all other data structures

---

## Part 1: What Are Arrays?

### Memory Layout

An array is a **contiguous block of memory** storing elements of the same type.

```
Array: [10, 20, 30, 40, 50]
Index:  0   1   2   3   4
```

Each element occupies the same amount of memory. If each element takes 4 bytes (like an integer), and the array starts at address 1000:

```
Element 10: Address 1000 (bytes 1000-1003)
Element 20: Address 1004 (bytes 1004-1007)
Element 30: Address 1008 (bytes 1008-1011)
...
```

**Key insight:** This contiguous layout is why arrays have O(1) access time. Given any index, we can calculate the exact memory address instantly.

### 1D vs 2D Arrays

**1D Array:**
```python
arr = [1, 2, 3, 4, 5]  # One dimension
```

**2D Array (Matrix):**
```python
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
# Access: matrix[row][col]
# matrix[0][1] = 2
```

In memory, 2D arrays are flattened to 1D. Row-major order (used in most languages):
```
[1, 2, 3, 4, 5, 6, 7, 8, 9]
```

---

## Part 2: String Basics

### Strings Are Special Arrays

A string is essentially an **array of characters**.

```python
s = "hello"
# Equivalent to: ['h', 'e', 'l', 'l', 'o']
# Access: s[0] = 'h', s[1] = 'e', etc.
```

**Important distinction: Immutability**

In Python and Java, strings are **immutable** — you cannot change a character once created.

```python
s = "hello"
s[0] = 'x'  # ERROR! This won't work in Python

# Instead, you create a new string:
s = 'x' + s[1:]  # "xello"
```

In JavaScript and C++, strings can be modified (mutable).

**Interview tip:** When modifying strings, be aware of the cost. Creating a new string costs O(n) time. This matters when you're doing many modifications.

### Character Properties

```python
char = 'A'

char.isalpha()      # True (is letter)
char.isdigit()      # False (is digit)
char.isupper()      # True (is uppercase)
char.islower()      # False (is lowercase)
char.isalnum()      # True (is letter or digit)

ord('A')            # 65 (ASCII value)
chr(65)             # 'A' (character from ASCII)
```

**Common ASCII values:**
- 'A' to 'Z': 65 to 90
- 'a' to 'z': 97 to 122
- '0' to '9': 48 to 57

---

## Part 3: Basic Operations

### Access & Search

```python
arr = [10, 20, 30, 40, 50]

# Access by index
value = arr[0]      # 10 (O(1))
value = arr[2]      # 30 (O(1))

# Search for value
index = arr.index(30)  # 2 (O(n) - must check each element)

# Check if exists
if 30 in arr:       # O(n) - linear search
    print("Found")
```

### Iteration

```python
arr = [10, 20, 30, 40, 50]

# Forward iteration (O(n))
for num in arr:
    print(num)

# Backward iteration (O(n))
for num in reversed(arr):
    print(num)

# With index (O(n))
for i, num in enumerate(arr):
    print(f"Index {i}: {num}")

# Range iteration (O(n))
for i in range(len(arr)):
    print(arr[i])
```

### Insertion & Deletion

```python
arr = [10, 20, 30, 40, 50]

# Insert at index (O(n) - must shift elements)
arr.insert(2, 25)   # arr = [10, 20, 25, 30, 40, 50]

# Remove by value (O(n))
arr.remove(25)      # arr = [10, 20, 30, 40, 50]

# Remove by index (O(n))
arr.pop(2)          # arr = [10, 20, 40, 50]

# Append to end (O(1) amortized)
arr.append(60)      # arr = [10, 20, 40, 50, 60]
```

**Why insertion/deletion is O(n):** When you insert at index 2, all elements after it must shift right (or left for deletion).

---

## Part 4: Common Patterns

### 1. Forward Traversal

Visit each element once from start to end.

```python
def sum_array(arr):
    total = 0
    for num in arr:           # O(n)
        total += num
    return total

# Example: arr = [1, 2, 3, 4, 5]
# Result: 15
```

**Use case:** Summing, searching, transforming all elements.

### 2. Backward Traversal

Visit each element once from end to start.

```python
def print_reversed(arr):
    for i in range(len(arr) - 1, -1, -1):  # O(n)
        print(arr[i])

# Example: arr = [1, 2, 3, 4, 5]
# Prints: 5, 4, 3, 2, 1
```

**Use case:** Reversing strings, processing in reverse order.

### 3. Checking Palindromes

A palindrome reads the same forward and backward.

```python
def is_palindrome(s):
    # Remove spaces and convert to lowercase
    cleaned = s.replace(" ", "").lower()
    
    # Compare with reverse
    return cleaned == cleaned[::-1]  # O(n)

# Example
is_palindrome("racecar")      # True
is_palindrome("hello")        # False
is_palindrome("A man a plan a canal Panama")  # True
```

**Time complexity:** O(n) — one pass to clean, one pass to compare.

### 4. Two-Pointer Technique

Use two pointers moving in opposite directions. Often used for palindromes, reversals, or two-sum.

```python
def is_palindrome_two_pointer(s):
    left, right = 0, len(s) - 1
    
    while left < right:
        if s[left] != s[right]:      # Mismatch found
            return False
        left += 1
        right -= 1
    
    return True

# Time: O(n), Space: O(1)
```

**Why better than `s == s[::-1]`?**
- Creates a reversed copy: O(n) space
- Two-pointer: O(1) space (only two variables)

---

## Part 5: Array vs String Trade-offs

| Operation | Array | String |
|-----------|-------|--------|
| Access element | O(1) | O(1) |
| Search | O(n) | O(n) |
| Modify element | O(1) | O(n)* |
| Concatenate | N/A | O(n)* |
| Find substring | O(n*m) | O(n*m) |

*In Python/Java (immutable strings)

---

## Part 6: Complexity Analysis

### Time Complexity

| Operation | Complexity | Reason |
|-----------|-----------|--------|
| Access by index | O(1) | Direct memory lookup |
| Search (unsorted) | O(n) | Check each element |
| Iterate | O(n) | Visit each element |
| Insert (middle) | O(n) | Shift remaining elements |
| Delete (middle) | O(n) | Shift remaining elements |
| Append (end) | O(1)* | Direct assignment |

*Amortized O(1) for dynamic arrays

### Space Complexity

| Operation | Space | Reason |
|-----------|-------|--------|
| Create array | O(n) | Store n elements |
| Reverse string | O(n) | New string created |
| Two-pointer traverse | O(1) | Only pointers, no extra space |

---

## Interview Tips

### 1. Clarify Index Boundaries

Always confirm: Does the array include index 0? Is it 0-indexed or 1-indexed?

```python
# Common source of off-by-one errors
arr = [1, 2, 3, 4, 5]
print(arr[5])  # ERROR! Index out of bounds
print(arr[4])  # Correct: last element is at index len-1
```

### 2. Handle Edge Cases

Always test:
- Empty array: `[]`
- Single element: `[5]`
- Duplicates: `[1, 1, 1]`

```python
def find_max(arr):
    if not arr:           # Edge case: empty
        return None
    
    max_val = arr[0]
    for num in arr[1:]:
        if num > max_val:
            max_val = num
    return max_val
```

### 3. String Immutability

Be aware of language differences:

**Python (immutable):**
```python
s = "hello"
s[0] = 'x'  # ERROR
```

**JavaScript (mutable):**
```javascript
let s = "hello";
s = s[0] = 'x';  // Works with conversion to array
```

### 4. ASCII Value Tricks

Convert character to number for calculations:

```python
def count_char(s, c):
    return s.count(c)

# Or using ASCII
def is_letter(c):
    return ord('a') <= ord(c) <= ord('z')
```

### 5. Slicing Costs

In Python, slicing creates a copy (O(n)):

```python
arr = [1, 2, 3, 4, 5]
copy = arr[:]           # O(n) - creates new array
subset = arr[1:3]       # O(n) - creates new array

# Better: use indices instead
for i in range(1, 3):
    print(arr[i])       # O(1) per access
```

---

## Problems to Practice

### Easy
1. **Two Sum** - Find two numbers that add to target
2. **Valid Palindrome** - Check if string is palindrome
3. **Reverse String** - Reverse array in-place
4. **Contains Duplicate** - Check for duplicates
5. **Best Time to Buy/Sell Stock** - Max profit from prices

### How to Approach
1. **Brute force first:** Understand the problem with a simple solution
2. **Optimize:** Can you use two pointers? Sliding window? Skip unnecessary work?
3. **Code:** Write clean, readable code
4. **Test:** Run through examples and edge cases

### Example: Two Sum

**Problem:** Given array and target, find two numbers that sum to target.

```python
# Brute force: O(n²)
def twoSum_brute(arr, target):
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            if arr[i] + arr[j] == target:
                return [arr[i], arr[j]]
    return []

# Optimized: O(n)
def twoSum_optimized(arr, target):
    seen = set()
    for num in arr:
        complement = target - num
        if complement in seen:
            return [complement, num]
        seen.add(num)
    return []
```

---

## Key Takeaways

1. **Arrays:** O(1) access, O(n) insertion/deletion
2. **Strings:** Same as arrays, but immutable (in Python/Java)
3. **Two pointers:** Powerful technique for pairs, palindromes, reversals
4. **Edge cases:** Always test empty, single element, duplicates
5. **Space trade-offs:** Use hash maps for O(1) lookup at O(n) space cost

---

## Interview Checklist

- [ ] Clarified index boundaries (0-indexed?)
- [ ] Tested with empty array
- [ ] Tested with single element
- [ ] Explained time and space complexity
- [ ] Considered string immutability in your language
- [ ] Handled duplicates correctly
- [ ] Avoided off-by-one errors in loops

---

## Next Steps

Master these fundamentals, then move to **Array Manipulation Patterns** to learn:
- Sliding window
- Two pointers (advanced)
- Prefix sums
- In-place modifications

**Video walkthrough:** 15-min video showing array memory layout, string operations, and two-pointer technique in action.

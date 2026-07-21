# Array Manipulation Patterns

**Read time:** 14 min | **Difficulty:** Easy-Medium | **Video:** 18 min

## Introduction

You know arrays. Now learn the **patterns** that solve 80% of array interview questions.

Three patterns will transform your problem-solving:
1. **Sliding window** — optimal subarray problems
2. **Two pointers** — pairs, reversals, partitioning
3. **Prefix sum** — range sum queries

Master these and array problems become routine.

---

## Pattern 1: Sliding Window

### The Idea

Use a "window" of fixed or variable size that **slides across the array**. Instead of recalculating everything when the window moves, update incrementally.

**Why it works:** O(n) instead of O(n²) brute force.

### Fixed Window Size

**Problem:** Find maximum sum of any 3 consecutive elements.

**Brute force (O(n²)):**
```python
def max_sum_brute(arr, k=3):
    max_sum = float('-inf')
    
    # Try all windows
    for i in range(len(arr) - k + 1):  # O(n)
        current_sum = 0
        for j in range(i, i + k):      # O(k)
            current_sum += arr[j]
        max_sum = max(max_sum, current_sum)
    
    return max_sum

# Example: [1, 4, 2, 10, 2, 3, 1, 0, 20], k=3
# Windows: [1,4,2]=7, [4,2,10]=16, [2,10,2]=14, ...
# Answer: 20
```

**Sliding window (O(n)):**
```python
def max_sum_sliding(arr, k=3):
    # Calculate first window
    current_sum = sum(arr[:k])  # [1, 4, 2] = 7
    max_sum = current_sum
    
    # Slide the window
    for i in range(k, len(arr)):
        # Remove left element, add new right element
        current_sum = current_sum - arr[i - k] + arr[i]
        max_sum = max(max_sum, current_sum)
    
    return max_sum

# Visual:
# [1, 4, 2] | 10  2  3  1  0  20    sum=7
#  1 [4, 2, 10]|  2  3  1  0  20    sum=16 (remove 1, add 10)
#  1  4 [2, 10, 2]| 3  1  0  20    sum=14 (remove 4, add 2)
# ... continues
```

**Time:** O(n) — each element enters and exits window once
**Space:** O(1) — only storing sum, k

### Variable Window Size

**Problem:** Find longest substring without repeating characters.

Window expands and contracts based on the problem constraint.

```python
def longest_substring_without_repeating(s):
    left = 0                    # Left pointer
    char_index = {}             # Map: char -> last seen index
    max_length = 0
    
    for right in range(len(s)):  # Right pointer expands
        char = s[right]
        
        # If character seen before and in current window
        if char in char_index and char_index[char] >= left:
            # Move left pointer past the previous occurrence
            left = char_index[char] + 1
        
        # Update last seen position
        char_index[char] = right
        
        # Track maximum window size
        max_length = max(max_length, right - left + 1)
    
    return max_length

# Example: "abcabcbb"
# Window expands: a, ab, abc, ab (contract when 'a' repeats), abc, abcb (contract), bcb, bcb
# Max length: 3 ("abc")
```

**Visual trace:**
```
s = "abcabcbb"
     ^           left=0, right=0, window="a"
       ^         left=0, right=1, window="ab"
         ^       left=0, right=2, window="abc" (max=3)
           ^     left=1, right=3, window="bca" (found 'a' at index 0)
             ^   left=1, right=4, window="bcab"
               ^ left=2, right=5, window="cab"
                ^left=3, right=6, window="abb" (contract: 'b' at index 1)
                 (left=4, right=7, window="bb" (contract: 'b' at index 3)
```

**Time:** O(n) — each character visited twice (right and left pointers)
**Space:** O(min(n, charset)) — hash map stores characters

### Common Sliding Window Problems

| Problem | Window Type | Use Case |
|---------|-------------|----------|
| Maximum subarray sum | Fixed | Known window size |
| Longest substring without repeating | Variable | Constraint-based |
| Minimum window substring | Variable | Find optimal range |
| Max consecutive ones | Variable | Conditional |
| Permutation in string | Fixed | Exact length match |

---

## Pattern 2: Two Pointers

### Same Direction (Slow & Fast)

**Problem:** Remove duplicates from sorted array in-place.

**Approach:** Use two pointers in the same direction.

```python
def removeDuplicates(arr):
    # arr is sorted: [0, 0, 1, 1, 2, 2, 3]
    
    if not arr:
        return 0
    
    # i: pointer to write position
    # j: pointer scanning array
    i = 0
    
    for j in range(1, len(arr)):
        if arr[j] != arr[i]:  # Found new unique element
            i += 1
            arr[i] = arr[j]   # Write it
    
    return i + 1  # Length of unique elements

# Visual:
# arr = [0, 0, 1, 1, 2, 2, 3]
# i=0, j=1: arr[1]=0 equals arr[0]=0, no change
# i=0, j=2: arr[2]=1 differs, i=1, arr[1]=1
# i=1, j=3: arr[3]=1 equals arr[1]=1, no change
# i=1, j=4: arr[4]=2 differs, i=2, arr[2]=2
# ... result: [0, 1, 2, 3, ...]
```

**Time:** O(n) — single pass
**Space:** O(1) — in-place

### Opposite Direction (Meet in Middle)

**Problem:** Two Sum (find two numbers summing to target).

**Approach:** Sort array, use two pointers from both ends.

```python
def twoSum_sorted(arr, target):
    # Assume arr is sorted
    left, right = 0, len(arr) - 1
    
    while left < right:
        current_sum = arr[left] + arr[right]
        
        if current_sum == target:
            return [arr[left], arr[right]]
        elif current_sum < target:
            left += 1   # Need bigger sum
        else:
            right -= 1  # Need smaller sum
    
    return []

# Example: arr = [2, 3, 5, 7, 11], target = 9
# left=0 (2), right=4 (11): sum=13 > 9, move right
# left=0 (2), right=3 (7):  sum=9, found! return [2, 7]
```

**Time:** O(n) if sorted, or O(n log n) with sorting
**Space:** O(1) — pointers only

### Reverse Array In-Place

**Problem:** Reverse an array without extra space.

```python
def reverse(arr):
    left, right = 0, len(arr) - 1
    
    while left < right:
        # Swap
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1

# Example: arr = [1, 2, 3, 4, 5]
# After: [5, 4, 3, 2, 1]
```

**Time:** O(n) — each element touched once
**Space:** O(1) — in-place

### Container With Most Water

**Problem:** Given heights array, find two lines forming max water area.

```python
def maxArea(heights):
    # Visual: find pair of lines with max area = min(h[i], h[j]) * (j - i)
    # [1, 8, 6, 2, 5, 4, 8, 3, 7]
    #  ^                 ^           area = min(1,8) * (8-0) = 8
    #      ^           ^             area = min(8,8) * (7-1) = 48
    
    left, right = 0, len(heights) - 1
    max_area = 0
    
    while left < right:
        # Current area
        height = min(heights[left], heights[right])
        width = right - left
        area = height * width
        max_area = max(max_area, area)
        
        # Move pointer with smaller height (might find taller line)
        if heights[left] < heights[right]:
            left += 1
        else:
            right -= 1
    
    return max_area

# Time: O(n), Space: O(1)
```

**Key insight:** Only move the pointer with smaller height. Moving the larger pointer can't help (limited by smaller height anyway).

---

## Pattern 3: Prefix Sum

### The Idea

Precompute cumulative sums to answer range queries in O(1).

**Without prefix sum (O(n)):**
```python
arr = [1, 2, 3, 4, 5]

# What's the sum from index 1 to 3?
sum(arr[1:4])  # 2+3+4 = 9
```

**With prefix sum (O(1) query):**
```python
arr = [1, 2, 3, 4, 5]
prefix = [0, 1, 3, 6, 10, 15]
#         0  1  1+2  1+2+3  1+2+3+4  1+2+3+4+5

# Sum from index 1 to 3: prefix[4] - prefix[1] = 10 - 1 = 9
```

### Building Prefix Sum

```python
def build_prefix_sum(arr):
    prefix = [0]  # prefix[0] = 0
    
    for num in arr:
        prefix.append(prefix[-1] + num)
    
    return prefix

# Example:
arr = [1, 2, 3, 4, 5]
prefix = build_prefix_sum(arr)
# prefix = [0, 1, 3, 6, 10, 15]

# Query: sum from index i to j (inclusive)
def range_sum(prefix, i, j):
    return prefix[j + 1] - prefix[i]

range_sum(prefix, 1, 3)  # 10 - 1 = 9 ✓
```

### Subarray Sum Equals K

**Problem:** Count subarrays with sum equal to target.

**Approach:** Use prefix sum with hash map.

```python
def subarraySum(arr, k):
    # prefix_sum -> count
    sum_count = {0: 1}  # Initialize: sum 0 seen once
    current_sum = 0
    result = 0
    
    for num in arr:
        current_sum += num
        
        # If (current_sum - k) exists, we found subarrays summing to k
        if current_sum - k in sum_count:
            result += sum_count[current_sum - k]
        
        # Add current sum to map
        sum_count[current_sum] = sum_count.get(current_sum, 0) + 1
    
    return result

# Example: arr = [1, 1, 1], k = 2
# Subarrays: [1,1], [1,1] -> count = 2

# Trace:
# num=1: current_sum=1, check 1-2=-1 (not found), sum_count={0:1, 1:1}
# num=1: current_sum=2, check 2-2=0 (found 1 time), result=1, sum_count={0:1, 1:2, 2:1}
# num=1: current_sum=3, check 3-2=1 (found 2 times), result=3, sum_count={0:1, 1:2, 2:1, 3:1}
# Answer: 3 (subarrays: [1,1] at 0-1, [1,1] at 1-2, [1,1,1] at 0-2)
```

**Time:** O(n) — single pass
**Space:** O(n) — hash map

### 2D Prefix Sum (Matrix)

**Problem:** Sum of elements in rectangle (r1, c1) to (r2, c2).

```python
class Matrix2D:
    def __init__(self, matrix):
        m, n = len(matrix), len(matrix[0])
        self.prefix = [[0] * (n + 1) for _ in range(m + 1)]
        
        # Build 2D prefix sum
        for i in range(1, m + 1):
            for j in range(1, n + 1):
                self.prefix[i][j] = (
                    self.prefix[i-1][j] +      # Top
                    self.prefix[i][j-1] -      # Left
                    self.prefix[i-1][j-1] +    # Top-left (subtract duplicate)
                    matrix[i-1][j-1]           # Current
                )
    
    def sumRegion(self, r1, c1, r2, c2):
        # Convert to 1-indexed
        r1, c1, r2, c2 = r1 + 1, c1 + 1, r2 + 1, c2 + 1
        
        return (
            self.prefix[r2][c2] -
            self.prefix[r1-1][c2] -
            self.prefix[r2][c1-1] +
            self.prefix[r1-1][c1-1]
        )

# Visual:
# Matrix:          Prefix sum:
# [1, 2]           [0, 0, 0]
# [3, 4]           [0, 1, 3]
#                  [0, 3, 9]
#
# Query (0,0) to (1,1) = prefix[2][2] = 1+2+3+4 = 10 ✓
```

**Time:** O(mn) preprocessing, O(1) query
**Space:** O(mn)

---

## Pattern Comparison

| Pattern | Best For | Time | Space |
|---------|----------|------|-------|
| Sliding window | Subarrays, substrings | O(n) | O(1) or O(k) |
| Two pointers | Pairs, reversals | O(n) | O(1) |
| Prefix sum | Range queries | O(n) build, O(1) query | O(n) |

---

## Interview Strategy

### Step 1: Identify the Pattern
- **"Maximum/minimum subarray/substring?"** → Sliding window
- **"Two numbers/pairs?"** → Two pointers
- **"Sum of range?"** → Prefix sum
- **"In-place modification?"** → Two pointers (same direction)

### Step 2: Clarify Constraints
- Is array sorted?
- Can I modify the array?
- What's the space constraint?

### Step 3: Start Simple
```python
# Brute force first (understand the problem)
def solve_brute(arr):
    result = 0
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            # Process all pairs
            result = max(result, arr[i] + arr[j])
    return result

# Then optimize (identify pattern)
def solve_optimized(arr):
    # ... apply sliding window / two pointers / prefix sum
    pass
```

### Step 4: Complexity Analysis
- Always state time and space complexity
- Justify why your approach is optimal

---

## Problems to Practice

### Sliding Window (Easy to Medium)
1. Maximum Subarray Sum (fixed window)
2. Longest Substring Without Repeating Characters
3. Minimum Window Substring
4. Permutation in String
5. Max Consecutive Ones

### Two Pointers (Easy to Medium)
1. Two Sum (sorted array)
2. Remove Duplicates From Sorted Array
3. Container With Most Water
4. Valid Palindrome
5. Reverse String

### Prefix Sum (Medium)
1. Subarray Sum Equals K
2. Contiguous Array (equal 0s and 1s)
3. Range Sum Query
4. Product of Array Except Self
5. Maximum Subarray (Kadane's variant)

---

## Key Takeaways

1. **Sliding window:** Expand/contract window, update incrementally → O(n)
2. **Two pointers:** From opposite ends or same direction → O(n)
3. **Prefix sum:** Precompute cumulative sums for O(1) range queries
4. **Pattern recognition:** Practice identifying which applies to each problem
5. **Communication:** Explain your approach before coding

---

## Interview Checklist

- [ ] Clarified constraints (sorted? in-place? space limit?)
- [ ] Showed brute force approach first
- [ ] Identified which pattern applies
- [ ] Explained time and space complexity
- [ ] Coded cleanly with variable names
- [ ] Tested with edge cases (empty, single element, duplicates)
- [ ] Discussed trade-offs

---

## Next Steps

You now have the tools for 80% of array problems. Practice problems from each category until pattern recognition becomes automatic.

**Video walkthrough:** 18-min video with animated sliding window, two-pointer cross-over, and prefix sum calculation.

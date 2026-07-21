# Advanced DSA: Binary Search Comprehensive Guide

**Read time:** 10 min | **Reference:** Yes

## Classic Binary Search

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
    
    return -1  # Not found

Time: O(log n)
Space: O(1)
Requirement: Sorted array
```

## Variations

### Find First Occurrence

```python
def find_first(arr, target):
    left, right = 0, len(arr) - 1
    result = -1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            result = mid
            right = mid - 1  # Keep searching left
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return result

Or use bisect_left (Python)
```

### Find Last Occurrence

```python
def find_last(arr, target):
    left, right = 0, len(arr) - 1
    result = -1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            result = mid
            left = mid + 1  # Keep searching right
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    
    return result

Or use bisect_right (Python)
```

### Find >= target (Lower Bound)

```python
def lower_bound(arr, target):
    left, right = 0, len(arr)
    
    while left < right:
        mid = (left + right) // 2
        if arr[mid] < target:
            left = mid + 1
        else:
            right = mid
    
    return left
```

### Find > target (Upper Bound)

```python
def upper_bound(arr, target):
    left, right = 0, len(arr)
    
    while left < right:
        mid = (left + right) // 2
        if arr[mid] <= target:
            left = mid + 1
        else:
            right = mid
    
    return left
```

## Common Patterns

### Answer Search (Find Minimum/Maximum)

```
Problem: Minimum time to cook all dishes

Brute force: Try all times 1, 2, 3, ...
Binary search: Try mid, check if possible

def can_cook(time, dishes):
    # Check if all dishes can be cooked in 'time'
    return time >= max_time_needed

left, right = 1, 10**9
while left < right:
    mid = (left + right) // 2
    if can_cook(mid, dishes):
        right = mid  # Try smaller
    else:
        left = mid + 1  # Need more time

return left
```

### Peak Element

```python
def find_peak(arr):
    left, right = 0, len(arr) - 1
    
    while left < right:
        mid = (left + right) // 2
        if arr[mid] < arr[mid + 1]:
            left = mid + 1  # Peak is on right
        else:
            right = mid  # Peak is on left or mid
    
    return left

Array: [1, 3, 5, 4, 2]
Peak at index 2 (value 5)
```

### Rotated Sorted Array

```python
def search_rotated(arr, target):
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        
        # Determine which half is sorted
        if arr[left] <= arr[mid]:  # Left half sorted
            if arr[left] <= target < arr[mid]:
                right = mid - 1  # Target in left
            else:
                left = mid + 1  # Target in right
        else:  # Right half sorted
            if arr[mid] < target <= arr[right]:
                left = mid + 1  # Target in right
            else:
                right = mid - 1  # Target in left
    
    return -1
```

## Common Mistakes

### ❌ Integer Overflow

```python
# Bad (can overflow in some languages)
mid = (left + right) // 2

# Good
mid = left + (right - left) // 2
```

### ❌ Infinite Loop

```python
# Bad (left = mid when not found)
while left <= right:
    mid = (left + right) // 2
    if arr[mid] < target:
        left = mid  # INFINITE LOOP!

# Good
left = mid + 1  # Always move left
```

### ❌ Off-by-one Errors

```python
# Careful with array bounds
# Is it < or <= for right boundary?
# Is it + 1 or + 0 when moving left?

Use consistent patterns:
- left = 0, right = len(arr) - 1, while left <= right
- left = 0, right = len(arr), while left < right
```

## Python Built-in

```python
import bisect

# Find leftmost position to insert (lower bound)
bisect.bisect_left(arr, target)

# Find rightmost position to insert (upper bound)
bisect.bisect_right(arr, target)

# Insert and maintain order
bisect.insort(arr, target)
```

## When to Use Binary Search

```
✓ Sorted array or sorted condition
✓ Find specific element
✓ Find first/last occurrence
✓ Answer minimization problem
✓ Answer maximization problem
✓ Range queries on sorted data

❌ Unsorted array (not directly applicable)
❌ Need all occurrences (use linear scan after finding)
```

## Template (Most Reliable)

```python
def binary_search_answer(predicate):
    """
    predicate(x): returns True if condition met, False otherwise
    Assumes: All True values come after all False values (or vice versa)
    """
    left, right = 0, 10**9  # Adjust bounds
    
    while left < right:
        mid = (left + right) // 2
        if predicate(mid):
            right = mid  # Found answer, try smaller
        else:
            left = mid + 1  # Need larger
    
    return left
```

## Interview Checklist

```
✓ Understand if array is sorted
✓ Clarify what to find (value, index, count)
✓ Handle edge cases (empty, single, duplicates)
✓ Avoid integer overflow
✓ Use consistent left/right update
✓ Test with examples
✓ Analyze time/space complexity
```

---

**Next:** Interview preparation guides (behavioral, negotiation, etc).

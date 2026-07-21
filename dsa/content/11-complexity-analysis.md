# Complexity Analysis Deep Dive

**Read time:** 16 min | **Difficulty:** Medium | **Video:** 20 min

## Big O Notation

Describes how algorithm grows with input size n.

```
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2ⁿ) < O(n!)
```

## Common Complexities

### O(1) - Constant

```python
def first_element(arr):
    return arr[0]  # Always 1 operation
```

- Hash map lookup
- Array access by index
- Variable assignment

### O(log n) - Logarithmic

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

- Binary search
- Balanced tree search
- Divide and conquer

### O(n) - Linear

```python
def linear_search(arr, target):
    for num in arr:
        if num == target:
            return True
    return False
```

- Single loop through array
- Linear scan

### O(n log n) - Linearithmic

```python
def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])      # T(n/2)
    right = merge_sort(arr[mid:])     # T(n/2)
    return merge(left, right)          # O(n)
    
# T(n) = 2*T(n/2) + O(n) = O(n log n)
```

- Merge sort, Quick sort (avg)
- Heap sort
- Most efficient comparison sorts

### O(n²) - Quadratic

```python
def bubble_sort(arr):
    for i in range(len(arr)):
        for j in range(i + 1, len(arr)):
            if arr[j] < arr[i]:
                arr[i], arr[j] = arr[j], arr[i]
```

- Nested loops
- Bubble sort, Selection sort
- Some dynamic programming

### O(2ⁿ) - Exponential

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
    # Exponential without memoization
```

- Recursive without memoization
- Subset generation
- NP-complete problems

### O(n!) - Factorial

```python
def permutations(arr):
    if len(arr) <= 1:
        return [arr]
    
    result = []
    for perm in permutations(arr[1:]):
        for i in range(len(arr)):
            result.append(perm[:i] + arr[:1] + perm[i:])
    return result
```

- Generating all permutations
- Traveling salesman (brute force)

## Master Theorem

For recurrences: T(n) = a*T(n/b) + f(n)

```
If f(n) = O(n^d):
- If d < log_b(a): T(n) = O(n^(log_b a))
- If d = log_b(a): T(n) = O(n^d * log n)
- If d > log_b(a): T(n) = O(f(n))
```

**Example:** Merge sort: a=2, b=2, d=1
- log_2(2) = 1
- d = log_b(a), so T(n) = O(n log n)

## Complexity Analysis Tips

### 1. Count Operations

```python
def analyze(arr):
    # 1 operation
    x = 0
    
    # n operations
    for num in arr:
        x += num
    
    # 1 operation
    return x
    
# Total: 1 + n + 1 = n + 2 = O(n)
```

### 2. Drop Constants

```python
O(2n) → O(n)
O(n/2) → O(n)
O(3n²) → O(n²)
```

### 3. Drop Lower Order Terms

```python
O(n² + n) → O(n²)
O(n log n + n) → O(n log n)
O(2ⁿ + n³) → O(2ⁿ)
```

### 4. Nested Loops Multiply

```python
for i in range(n):       # O(n)
    for j in range(n):   # O(n)
        print(i, j)      # O(1)
        
# Total: O(n) * O(n) = O(n²)
```

### 5. Sequential Statements Add

```python
for i in range(n):       # O(n)
    x += i

for i in range(n):       # O(n)
    y += i
    
# Total: O(n) + O(n) = O(n)
```

## Space Complexity

Think about extra memory used (not input).

```python
# O(1) space - only variables
def sum_array(arr):
    total = 0
    for num in arr:
        total += num
    return total

# O(n) space - creates new array
def double_array(arr):
    result = []
    for num in arr:
        result.append(num * 2)
    return result

# O(n) space - recursion stack
def sum_recursive(arr, i=0):
    if i == len(arr):
        return 0
    return arr[i] + sum_recursive(arr, i+1)
```

## Amortized Complexity

Average cost over sequence of operations.

**Example:** Dynamic array append
```python
# Adding to array
arr = []
for i in range(n):
    arr.append(i)  # O(1) amortized
    
# First append: O(1)
# At size 4→8: O(4) to copy, but amortized O(1)
# Overall: O(n) for n appends = O(1) per append amortized
```

## Common Mistakes

1. **Counting array creation cost:** Creating array is O(n)
2. **String concatenation:** O(n) per concatenation, O(n²) in loop
3. **Forgetting space:** Only count extra space, not input
4. **Worst vs Average:** State which you're analyzing

## Practical Limits

```
n = 10⁶
O(n) = 10⁶ operations ✓ Fast
O(n log n) = 2*10⁷ ✓ OK
O(n²) = 10¹² ✗ Too slow
O(2ⁿ) = ∞ ✗ Impossible
```

---

**Key takeaway:** Always communicate time AND space complexity. Understand trade-offs.

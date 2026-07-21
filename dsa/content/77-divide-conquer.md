# Advanced DSA: Divide & Conquer Deep Dive

**Read time:** 11 min | **Difficulty:** Hard

## Divide & Conquer Paradigm

```
Divide: Break problem into subproblems
Conquer: Solve subproblems recursively
Combine: Merge solutions
```

## Classic Examples

### Merge Sort

```
Array: [38, 27, 43, 3, 9, 82, 10]

Divide:
[38, 27, 43, 3] | [9, 82, 10]

Divide further:
[38, 27] | [43, 3] | [9, 82] | [10]

Divide to single elements:
[38] [27] [43] [3] [9] [82] [10]

Conquer (merge sorted arrays):
[27, 38] [3, 43] [9, 82] [10]
[3, 27, 38, 43] [9, 10, 82]
[3, 9, 10, 27, 38, 43, 82]

Time: O(n log n)
```

### Quick Sort

```
Array: [38, 27, 43, 3, 9, 82, 10]
Pivot: 38

Divide:
[27, 3, 9, 10] | 38 | [43, 82]

Divide [27, 3, 9, 10], pivot 27:
[3, 9, 10] | 27 | []

Continue until sorted

Time: O(n log n) average, O(n²) worst
Space: O(log n) for recursion
```

### Binary Search

```
Array: [1, 3, 5, 7, 9, 11, 13]
Target: 7

Divide: Check middle element (7)
Found! Return index 3

Time: O(log n)
```

## Advanced Divide & Conquer

### Closest Pair of Points

```
Points: [(0,0), (1,1), (2,2), (100,100)]

Divide: Split by x-coordinate into 2 halves

Conquer: Find closest pair in each half
Left: distance 1.41
Right: distance 1.41

Combine: Check distance between halves
No point from left is < 1.41 from right

Result: Minimum = 1.41

Time: O(n log n)
```

### Inversion Count

```
Array: [1, 3, 5, 2, 4, 6]
Inversions: (3,2), (5,2), (5,4)
Count: 3

Merge sort approach:
While merging, count inversions
If element from right half < left half:
└─ It's an inversion with all remaining in left

Time: O(n log n)
```

### Power Function

```
Compute x^n efficiently:

Naive: x × x × x × ... (n times) = O(n)

Divide & Conquer:
x^8 = (x^4)^2
x^4 = (x^2)^2
x^2 = x × x
x^1 = x

Recursion tree depth: O(log n)
Time: O(log n)

Formula:
x^n = (x^(n/2))^2 if n even
x^n = x × x^(n-1) if n odd
```

### Matrix Multiplication (Strassen's)

```
Standard: O(n³)

Strassen's (Divide & Conquer):
Divide matrices into 4 quadrants
Perform 7 multiplications (vs 8)
Combine

Time: O(n^2.81)

Trade-off: Complex, large constants
```

## Master Theorem

Analyze recurrence relations:

```
T(n) = a·T(n/b) + f(n)

a = subproblems
b = reduction factor
f(n) = combine cost

Cases:
1. If f(n) = O(n^(log_b(a) - ε))
   → T(n) = Θ(n^log_b(a))

2. If f(n) = Θ(n^log_b(a))
   → T(n) = Θ(n^log_b(a) × log(n))

3. If f(n) = Ω(n^(log_b(a) + ε))
   → T(n) = Θ(f(n))
```

### Examples

```
Merge Sort: T(n) = 2T(n/2) + n
a=2, b=2, f(n)=n
log_b(a) = 1
f(n) = n = Θ(n^1)
→ Case 2: T(n) = Θ(n log n)

Binary Search: T(n) = T(n/2) + 1
a=1, b=2, f(n)=1
log_b(a) = 0
f(n) = 1 = Θ(1) > n^0? No, equals
→ Case 2: T(n) = Θ(log n)
```

## Key Insights

### When to Use

```
✓ Problems with optimal substructure
✓ Independent subproblems
✓ Can combine solutions efficiently
✓ Natural recursive structure

❌ Overlapping subproblems (use DP)
❌ Exponential subproblems (use memoization)
```

### Complexity Analysis

```
Balanced tree:
Depth: log n
Work per level: n
Total: O(n log n)

Unbalanced tree (Quick Sort worst):
Depth: n
Work per level: n
Total: O(n²)
```

## Common Pitfalls

```
❌ Forget base case → infinite recursion
❌ Inefficient combine → poor overall complexity
❌ Don't identify subproblem independence
❌ Fail to analyze recurrence relation
```

## Interview Tips

✓ Recognize divide & conquer problems
✓ Identify division point
✓ Analyze subproblem size
✓ Design efficient combine step
✓ Use Master Theorem for analysis
✓ Implement base cases carefully
✓ Consider space (recursion stack)

❌ Don't confuse with DP
❌ Don't have expensive combines
❌ Don't forget base cases
❌ Don't analyze casually (use Master Theorem)

---

**Next:** Graph algorithms cheat sheet.

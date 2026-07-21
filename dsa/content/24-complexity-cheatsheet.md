# Complexity Analysis Cheat Sheet

**Read time:** 8 min | **Printable:** Yes

## Quick Reference

```
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2ⁿ) < O(n!)
```

## Common Operations

| Operation | Complexity | Example |
|-----------|-----------|---------|
| Access array[i] | O(1) | Direct lookup |
| Hash map get/set | O(1) | dict[key] |
| Linear search | O(n) | for loop |
| Binary search | O(log n) | Divide by 2 |
| Merge sort | O(n log n) | Two-phase sort |
| Bubble sort | O(n²) | Nested loops |
| Nested loops | O(n²) | for i: for j |
| Triple nested | O(n³) | for i: for j: for k |
| Fibonacci (no memo) | O(2ⁿ) | Exponential calls |
| Permutations | O(n!) | All orderings |

## Data Structure Operations

| DS | Access | Search | Insert | Delete |
|----|--------|--------|--------|--------|
| Array | O(1) | O(n) | O(n) | O(n) |
| Hash Map | N/A | O(1) | O(1) | O(1) |
| Linked List | O(n) | O(n) | O(1)* | O(1)* |
| Tree (balanced) | N/A | O(log n) | O(log n) | O(log n) |
| BST (unbalanced) | N/A | O(n) | O(n) | O(n) |
| Heap | N/A | O(n) | O(log n) | O(log n) |
| Graph (adj list) | N/A | O(V+E) | O(1) | O(V) |

*With pointer to node

## Algorithm Complexities

| Algorithm | Time | Space |
|-----------|------|-------|
| Binary Search | O(log n) | O(1) |
| Merge Sort | O(n log n) | O(n) |
| Quick Sort | O(n log n) avg | O(log n) |
| Heap Sort | O(n log n) | O(1) |
| Counting Sort | O(n + k) | O(k) |
| Radix Sort | O(n*d) | O(n+k) |
| DFS | O(V + E) | O(V) |
| BFS | O(V + E) | O(V) |
| Dijkstra | O((V+E)log V) | O(V) |
| Floyd-Warshall | O(V³) | O(V²) |

## Practical Limits

```
n = 10⁶
- O(n): 10⁶ operations ✓ Fast
- O(n log n): 2×10⁷ ✓ OK
- O(n√n): 10⁹ ~ Slow
- O(n²): 10¹² ✗ Too slow
- O(n³): 10¹⁸ ✗ Impossible
```

## Master Theorem

T(n) = a·T(n/b) + f(n)

```
d = log_b(a)

If f(n) = O(n^d):
  - d < log_b(a): T(n) = O(n^(log_b a))
  - d = log_b(a): T(n) = O(n^d · log n)
  - d > log_b(a): T(n) = O(f(n))
```

## Amortized Complexity

| Operation | Amortized | Worst |
|-----------|-----------|-------|
| Dynamic array append | O(1) | O(n) |
| Hash table insert | O(1) | O(n) |
| Union-Find | O(α(n)) | O(log n) |

## Space Complexity Guide

- O(1): Few variables
- O(log n): Recursion depth
- O(n): Linear structures
- O(n log n): Sorting algorithms
- O(n²): 2D arrays
- O(2ⁿ): Exponential search

## Interview Tips

- Always state both time AND space
- Consider best/average/worst case
- Explain constant factors briefly
- Discuss trade-offs
- Know practical limits for n

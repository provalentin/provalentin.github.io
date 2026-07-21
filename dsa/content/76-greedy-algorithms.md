# Advanced DSA: Greedy Algorithms Masterclass

**Read time:** 12 min | **Difficulty:** Hard

## Greedy Approach

Make locally optimal choices, hope for global optimum.

```
Problem: Make change with minimum coins
Coins: [1, 5, 10, 25]
Amount: 41

Greedy: Take largest coin first
41 = 25 + 10 + 5 + 1 (4 coins)

Optimal: Same! 4 coins

But doesn't always work:
Coins: [1, 3, 4]
Amount: 6
Greedy: 4 + 1 + 1 = 3 coins
Optimal: 3 + 3 = 2 coins
```

## When Greedy Works

### Optimal Substructure

```
If optimal solution contains subproblem:
└─ Subproblem must also be optimal

Example: Dijkstra's shortest path
If A→B→C is shortest A to C:
└─ A→B must be shortest A to B
```

### Greedy Choice Property

```
Making locally optimal choice:
└─ Leads to globally optimal solution

Example: Activity selection
Always pick activity that ends earliest
└─ Leaves maximum time for others
```

## Classic Greedy Problems

### Activity Selection

```
Activities: (start, end)
(1,3), (2,5), (3,6), (5,7), (6,9)

Sort by end time:
(1,3), (2,5), (3,6), (5,7), (6,9)

Greedy: Pick earliest ending
1. (1,3) ✓
2. (2,5) ✗ (overlaps)
3. (3,6) ✓
4. (5,7) ✗ (overlaps)
5. (6,9) ✓

Result: 3 non-overlapping activities
```

### Huffman Coding

```
Frequencies: A=5, B=9, C=12, D=13, E=16, F=45

Build tree bottom-up (greedy):
1. Combine 2 smallest: A(5) + B(9) = 14
2. Combine 2 smallest: C(12) + D(13) = 25
3. Combine 2 smallest: AB(14) + E(16) = 30
4. Combine 2 smallest: CD(25) + F(45) = 70
5. Combine 2 smallest: ABCDE(30) + F(70) = 100

Result: Optimal prefix code
```

### Fractional Knapsack

```
Items: (value, weight)
(60, 10), (100, 20), (120, 30)
Capacity: 50

Sort by value/weight ratio:
(60, 10): 6.0
(120, 30): 4.0
(100, 20): 5.0

Greedy order: (60,10), (100,20), (120,30)
1. Take (60, 10): weight=10, value=60
2. Take (100, 20): weight=30, value=160
3. Take 10/30 of (120, 30): weight=40, value=200

Total: value=220, weight=50
```

### Job Sequencing with Deadlines

```
Jobs: (profit, deadline)
(35, 3), (30, 4), (25, 4), (20, 2), (15, 3), (12, 1)

Sort by profit (descending):
(35, 3), (30, 4), (25, 4), (20, 2), (15, 3), (12, 1)

Schedule greedily:
1. (35, 3): Slot 3 ✓
2. (30, 4): Slot 4 ✓
3. (25, 4): Slot 4 occupied, try 3 ✗, try 2 ✗, try 1 ✗
4. (20, 2): Slot 2 ✓
5. (15, 3): Slot 3 occupied, try 2 ✗, try 1 ✓
6. (12, 1): Slot 1 occupied ✗

Result: 4 jobs, profit=100
```

### Minimum Spanning Tree (Kruskal's)

```
Sort edges by weight (greedy):
Pick edge if it doesn't create cycle

Result: Minimum total weight tree
```

### Interval Scheduling

```
Intervals: [1,3], [2,5], [4,6], [6,8]

Greedy: Sort by start time, pick non-overlapping
[1,3], [4,6], [6,8]
```

## Proving Greedy Correctness

### Exchange Argument

```
Assume greedy solution ≠ optimal

Show: Can swap greedy choice with optimal:
1. They differ at some point
2. Swap doesn't make solution worse
3. Repeat until greedy = optimal

Therefore: Greedy is optimal
```

### Counterexample Method

```
If you suspect greedy doesn't work:
Find counterexample

Coin change with [1, 3, 4]:
Amount 6:
Greedy: 4 + 1 + 1 = 3 coins
Optimal: 3 + 3 = 2 coins

Counterexample proves greedy fails!
```

## Tricky Greedy Problems

### Problem: Meeting Rooms

```
Meetings: [[0,30], [5,10], [15,20]]

Greedy: Sort by start time
Count overlaps: 2 rooms

Better: Sort by end time
1. [5,10] (ends 10)
2. [15,20] (starts 15, no overlap)
Only 1 room needed!

Lesson: Sort carefully, pick right property
```

### Problem: Jump Game

```
Array: [2, 3, 1, 1, 4]
Can jump at most array[i] steps from position i

Greedy: From each position, try to go furthest

Position 0: Can jump 1 or 2 steps
Greedy: Jump 2 (furthest)
Position 2: Can jump 1 step
Position 3: Can reach end ✓

Result: Reachable in 2 jumps
```

## When Greedy Fails

```
❌ 0/1 Knapsack (need DP)
❌ Longest Increasing Subsequence (need DP)
❌ Coin change with arbitrary denominations (need DP)
✓ Fractional Knapsack (greedy works)
✓ Huffman Coding (greedy works)
✓ Activity Selection (greedy works)
```

## Interview Tips

✓ Recognize greedy problems (optimization with choices)
✓ Prove greedy works (exchange argument)
✓ Find counterexample if not obvious
✓ Implement efficient sort
✓ Handle edge cases (empty, single element)
✓ Consider alternative sorting orders
✓ Analyze time complexity

❌ Don't assume greedy always works
❌ Don't skip the proof
❌ Don't forget to handle ties
❌ Don't ignore corner cases

---

**Next:** Divide and conquer algorithms.

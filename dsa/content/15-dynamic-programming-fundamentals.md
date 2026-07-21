# Dynamic Programming Fundamentals

**Read time:** 15 min | **Difficulty:** Medium | **Video:** 22 min

## Core Concepts

Dynamic Programming = Memoization + Recursion

Two key properties:
1. **Overlapping subproblems** - Same subproblem solved multiple times
2. **Optimal substructure** - Optimal solution uses optimal subsolutions

## Fibonacci: The Classic

**Without DP (Exponential):**
```python
def fib_recursive(n):
    if n <= 1:
        return n
    return fib_recursive(n-1) + fib_recursive(n-2)
    # fib(5) calls fib(3) twice, fib(2) thrice, etc.
    # Time: O(2^n) ✗
```

**With Memoization (Top-Down):**
```python
def fib_memo(n, memo=None):
    if memo is None:
        memo = {}
    
    if n in memo:
        return memo[n]
    
    if n <= 1:
        return n
    
    memo[n] = fib_memo(n-1, memo) + fib_memo(n-2, memo)
    return memo[n]
    
# Time: O(n) ✓
# Space: O(n)
```

**With Tabulation (Bottom-Up):**
```python
def fib_dp(n):
    if n <= 1:
        return n
    
    dp = [0] * (n + 1)
    dp[1] = 1
    
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    
    return dp[n]
    
# Time: O(n) ✓
# Space: O(n)

# Space optimized:
def fib_optimized(n):
    if n <= 1:
        return n
    
    prev, curr = 0, 1
    for _ in range(2, n + 1):
        prev, curr = curr, prev + curr
    
    return curr
    # Space: O(1) ✓
```

## DP Template

```python
def dp_solve(n):
    # 1. Define DP table
    dp = [0] * (n + 1)
    
    # 2. Base cases
    dp[0] = base_case_0
    dp[1] = base_case_1
    
    # 3. Fill table
    for i in range(2, n + 1):
        dp[i] = f(dp[i-1], dp[i-2], ...)
    
    # 4. Return result
    return dp[n]
```

## Classic Problems

### 1. Coin Change

Minimum coins to make amount.

```python
def coin_change(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    
    for i in range(1, amount + 1):
        for coin in coins:
            if coin <= i:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    
    return dp[amount] if dp[amount] != float('inf') else -1

# Time: O(amount * len(coins))
# Space: O(amount)
```

### 2. House Robber

Maximum money robbing non-adjacent houses.

```python
def rob(nums):
    if not nums:
        return 0
    
    dp = [0] * len(nums)
    dp[0] = nums[0]
    
    if len(nums) > 1:
        dp[1] = max(nums[0], nums[1])
    
    for i in range(2, len(nums)):
        # Rob current + skip previous, OR skip current + rob previous
        dp[i] = max(dp[i-1], dp[i-2] + nums[i])
    
    return dp[-1]

# Time: O(n)
# Space: O(n) or O(1) with space optimization
```

### 3. Longest Increasing Subsequence

```python
def lis(nums):
    if not nums:
        return 0
    
    dp = [1] * len(nums)
    
    for i in range(1, len(nums)):
        for j in range(i):
            if nums[j] < nums[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    
    return max(dp)

# Time: O(n²)
# Space: O(n)
```

## 2D DP: Grid Problems

```python
def unique_paths(m, n):
    # Paths from (0,0) to (m-1, n-1)
    dp = [[1] * n for _ in range(m)]
    
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i-1][j] + dp[i][j-1]
    
    return dp[-1][-1]

# Time: O(m*n)
# Space: O(m*n)
```

## When to Use DP

✓ Optimization problems (min/max)
✓ Counting problems
✓ Existence problems
✗ When no overlapping subproblems
✗ When no optimal substructure

## DP vs Recursion vs Greedy

| Approach | When | Complexity |
|----------|------|-----------|
| DP | Optimize with subproblems | Varies |
| Recursion | Explore all paths | Exponential |
| Greedy | Local choices work globally | Linear/NlogN |

## Common Mistakes

1. **Wrong base case:** Breaks entire solution
2. **Forgot memoization:** Exponential instead of polynomial
3. **Wrong state definition:** Leads to incorrect answer
4. **Off-by-one:** Array bounds issues

## Problems to Practice

1. Climbing Stairs
2. House Robber
3. Coin Change
4. Longest Increasing Subsequence
5. Edit Distance

---

**Key:** DP = Recursion + Memoization. Define state correctly, fill table systematically.

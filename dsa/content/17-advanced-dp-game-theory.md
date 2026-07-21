# Advanced DP: Game Theory

**Read time:** 13 min | **Difficulty:** Hard | **Video:** 18 min

## Minimax DP

Model two-player games where both play optimally.

## Can I Win (Nim Game Variant)

**Problem:** Given numbers, players take turns subtracting. First unable to move loses.

```python
def canWin(numbers):
    memo = {}
    
    def canWinHelper(remaining):
        if sum(remaining) == 0:
            return False  # No moves, current player loses
        
        key = tuple(sorted(remaining))
        if key in memo:
            return memo[key]
        
        # Try each move
        for i in range(len(remaining)):
            new_remaining = remaining[:i] + remaining[i+1:]
            
            # If opponent loses after my move, I win
            if not canWinHelper(new_remaining):
                memo[key] = True
                return True
        
        # All moves lead to opponent winning
        memo[key] = False
        return False
    
    return canWinHelper(numbers)

# Time: O(2^n)
# Space: O(2^n) memo
```

## Predict the Winner

**Problem:** Two players pick from array ends. Who gets max sum?

```python
def predictTheWinner(nums):
    memo = {}
    
    def maxDiff(i, j):
        # Max profit difference for current player
        if i > j:
            return 0
        
        if (i, j) in memo:
            return memo[(i, j)]
        
        # Pick left
        take_left = nums[i] - maxDiff(i+1, j)
        
        # Pick right
        take_right = nums[j] - maxDiff(i, j-1)
        
        # Pick best
        result = max(take_left, take_right)
        memo[(i, j)] = result
        return result
    
    return maxDiff(0, len(nums)-1) >= 0

# Time: O(n²)
# Space: O(n²)
```

## Key Idea

- **Recursive thinking:** Each state represents one player's turn
- **Opponent optimality:** Assume opponent plays perfectly
- **Memoization:** Cache results to avoid recomputation
- **Base case:** When no moves possible, return losing state

## Common Game Theory Problems

1. Can I Win
2. Predict the Winner
3. Burst Balloons (game view)
4. Stone Game series
5. Nim game variants

---

**Key:** Model opponent as playing optimally. Use recursion + memoization for efficiency.

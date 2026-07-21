# Recursion & Backtracking

**Read time:** 14 min | **Difficulty:** Hard | **Video:** 21 min

## Backtracking Template

```python
def backtrack(candidates, path, result, target):
    # Base case: found solution
    if target == 0:
        result.append(path[:])
        return
    
    # Prune: no solution possible
    if target < 0:
        return
    
    # Try each candidate
    for i in range(len(candidates)):
        # Choose
        path.append(candidates[i])
        
        # Explore
        backtrack(candidates[i:], path, result, target - candidates[i])
        
        # Unchoose (backtrack)
        path.pop()
```

## Permutations

Generate all orderings.

```python
def permute(nums):
    result = []
    def backtrack(path):
        if len(path) == len(nums):
            result.append(path[:])
            return
        for num in nums:
            if num not in path:
                path.append(num)
                backtrack(path)
                path.pop()
    backtrack([])
    return result

# Time: O(n!)
# Space: O(n)
```

## Combinations

Generate subsets of size k.

```python
def combine(n, k):
    result = []
    def backtrack(start, path):
        if len(path) == k:
            result.append(path[:])
            return
        for i in range(start, n + 1):
            path.append(i)
            backtrack(i + 1, path)
            path.pop()
    backtrack(1, [])
    return result

# Time: O(C(n,k))
# Space: O(k)
```

## N-Queens

```python
def solve_n_queens(n):
    result = []
    board = ['.' * n for _ in range(n)]
    
    def is_safe(row, col, board):
        # Check column
        for i in range(row):
            if board[i][col] == 'Q':
                return False
        # Check diagonals
        for i, j in zip(range(row-1, -1, -1), range(col-1, -1, -1)):
            if board[i][j] == 'Q':
                return False
        for i, j in zip(range(row-1, -1, -1), range(col+1, n)):
            if board[i][j] == 'Q':
                return False
        return True
    
    def backtrack(row):
        if row == n:
            result.append(board[:])
            return
        for col in range(n):
            if is_safe(row, col, board):
                board[row] = board[row][:col] + 'Q' + board[row][col+1:]
                backtrack(row + 1)
                board[row] = board[row][:col] + '.' + board[row][col+1:]
    
    backtrack(0)
    return result

# Time: O(n!)
# Space: O(n)
```

## Key Points

1. **Choose** - Add candidate to path
2. **Explore** - Recurse with updated state
3. **Unchoose** - Remove candidate (backtrack)
4. **Base case** - When to stop
5. **Pruning** - Cut impossible branches early

---

**Key:** Backtracking = DFS + undo. Try, explore, undo systematically.

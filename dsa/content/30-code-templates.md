# Code Templates for Interviews

**Read time:** 12 min | **Reference:** Yes

## Binary Search Template

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

## DFS Template

```python
def dfs(node, visited, result):
    visited.add(node)
    result.append(node)
    
    for neighbor in node.neighbors:
        if neighbor not in visited:
            dfs(neighbor, visited, result)

visited = set()
result = []
dfs(start, visited, result)
```

## BFS Template

```python
from collections import deque

def bfs(start):
    visited = set([start])
    queue = deque([start])
    result = []
    
    while queue:
        node = queue.popleft()
        result.append(node)
        
        for neighbor in node.neighbors:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    
    return result
```

## DP Template

```python
def dp_solve(n):
    dp = [0] * (n + 1)
    dp[0] = base_case
    dp[1] = base_case
    
    for i in range(2, n + 1):
        dp[i] = f(dp[i-1], dp[i-2], ...)
    
    return dp[n]
```

## Backtracking Template

```python
def backtrack(candidates, path, result):
    if is_solution(path):
        result.append(path[:])
        return
    
    for candidate in candidates:
        path.append(candidate)
        if is_valid(path):
            backtrack(candidates, path, result)
        path.pop()
```

## Two Pointers Template

```python
def two_pointers(arr, target):
    left, right = 0, len(arr) - 1
    
    while left < right:
        current_sum = arr[left] + arr[right]
        if current_sum == target:
            return [left, right]
        elif current_sum < target:
            left += 1
        else:
            right -= 1
    
    return []
```

---

**Use these as starting points for common problem types.**

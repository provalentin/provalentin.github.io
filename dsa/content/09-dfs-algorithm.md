# Depth-First Search (DFS)

**Read time:** 12 min | **Difficulty:** Medium | **Video:** 17 min

## Core Concept

DFS explores as far as possible along each branch before backtracking. Like maze solving - follow one path to the end, then backtrack.

## Implementation

**Recursive (Elegant):**
```python
def dfs(node, visited=None):
    if visited is None:
        visited = set()
    
    visited.add(node)
    process(node)
    
    for neighbor in node.neighbors:
        if neighbor not in visited:
            dfs(neighbor, visited)
    
    return visited
```

**Iterative (Stack):**
```python
def dfs_iterative(start):
    stack = [start]
    visited = set()
    
    while stack:
        node = stack.pop()
        
        if node in visited:
            continue
        
        visited.add(node)
        process(node)
        
        for neighbor in node.neighbors:
            if neighbor not in visited:
                stack.append(neighbor)
    
    return visited
```

**Time:** O(V + E) - visit each vertex and edge once
**Space:** O(V) - recursion/stack depth

## Common Patterns

### 1. Find Path

```python
def find_path(start, end, graph):
    def dfs(current, path):
        if current == end:
            return path
        
        visited.add(current)
        
        for neighbor in graph[current]:
            if neighbor not in visited:
                result = dfs(neighbor, path + [neighbor])
                if result:
                    return result
        
        return None
    
    visited = set()
    return dfs(start, [start])
```

### 2. Check Connectivity

```python
def is_connected(node, target, visited=None):
    if visited is None:
        visited = set()
    
    if node == target:
        return True
    
    visited.add(node)
    
    for neighbor in node.neighbors:
        if neighbor not in visited:
            if is_connected(neighbor, target, visited):
                return True
    
    return False
```

### 3. Count Paths

```python
def count_paths(node, target, visited=None):
    if visited is None:
        visited = set()
    
    if node == target:
        return 1
    
    visited.add(node)
    count = 0
    
    for neighbor in node.neighbors:
        if neighbor not in visited:
            count += count_paths(neighbor, target, visited.copy())
    
    return count
```

## Use Cases

- Topological sorting (DAG)
- Cycle detection
- Connected components
- Path finding in maze
- Backtracking problems (N-Queens, permutations)
- Evaluate expressions

## DFS vs BFS

| Aspect | DFS | BFS |
|--------|-----|-----|
| Traversal | Deep first | Level by level |
| Data structure | Stack (recursion) | Queue |
| Memory | Less for sparse | May use more |
| Shortest path | ✗ | ✓ |
| Path exists | ✓ | ✓ |
| Space | O(h) | O(w) |

## Common Interview Mistakes

1. **Forgetting visited set:** Infinite loops
2. **Wrong base case:** Returns before exploring
3. **Modifying input:** Don't change graph during traversal

## Problems to Practice

1. Number of Islands (DFS variant)
2. Word Search
3. Generate Permutations
4. N-Queens
5. Course Schedule II (topological sort)

---

**Key takeaway:** DFS explores deeply - perfect for paths, backtracking, and connectivity.

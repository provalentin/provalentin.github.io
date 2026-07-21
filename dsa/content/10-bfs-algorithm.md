# Breadth-First Search (BFS)

**Read time:** 12 min | **Difficulty:** Medium | **Video:** 17 min

## Core Concept

BFS explores level-by-level. Explores all neighbors before going deeper. Like ripples in water - expanding from center outward.

## Implementation

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

**Time:** O(V + E)
**Space:** O(V) - queue can hold max V nodes

## Key Strength: Shortest Path

```python
def shortest_path(start, end, graph):
    queue = deque([(start, [start])])
    visited = set([start])
    
    while queue:
        node, path = queue.popleft()
        
        if node == end:
            return path
        
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
    
    return []
```

**Why BFS for shortest path?** First path found is shortest (in unweighted graphs).

## Common Patterns

### 1. Level Order Traversal

```python
def level_order(root):
    if not root:
        return []
    
    result = []
    queue = deque([root])
    
    while queue:
        level_size = len(queue)
        level = []
        
        for _ in range(level_size):
            node = queue.popleft()
            level.append(node.value)
            
            if node.left:
                queue.append(node.left)
            if node.right:
                queue.append(node.right)
        
        result.append(level)
    
    return result
```

### 2. Distance from Source

```python
def distances(start, graph):
    distances = {start: 0}
    queue = deque([start])
    
    while queue:
        node = queue.popleft()
        
        for neighbor in graph[node]:
            if neighbor not in distances:
                distances[neighbor] = distances[node] + 1
                queue.append(neighbor)
    
    return distances
```

### 3. Connected Components (Count)

```python
def count_components(graph, n):
    visited = [False] * n
    count = 0
    
    def bfs(start):
        queue = deque([start])
        visited[start] = True
        
        while queue:
            node = queue.popleft()
            for neighbor in graph[node]:
                if not visited[neighbor]:
                    visited[neighbor] = True
                    queue.append(neighbor)
    
    for i in range(n):
        if not visited[i]:
            bfs(i)
            count += 1
    
    return count
```

## When to Use BFS

✓ Shortest path (unweighted)
✓ Level-order traversal
✓ Distance from source
✓ Bipartite check
✓ Friend suggestions (k-hops)

## BFS vs DFS

| Aspect | BFS | DFS |
|--------|-----|-----|
| Order | Level-by-level | Deep first |
| Shortest path | ✓ | ✗ |
| Memory | Queue | Stack |
| Space | O(w) | O(h) |

## Problems to Practice

1. Number of Islands (BFS variant)
2. Binary Tree Level Order Traversal
3. Word Ladder
4. Pacific Atlantic Water Flow
5. All Paths From Source to Target

---

**Key takeaway:** BFS guarantees shortest path first. Best for level-order and distance queries.

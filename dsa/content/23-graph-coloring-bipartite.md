# Graph Coloring & Bipartite

**Read time:** 11 min | **Difficulty:** Hard | **Video:** 15 min

## Bipartite Graph

Graph colorable with 2 colors (no adjacent same color).

```python
def is_bipartite(graph):
    color = {}
    
    def dfs(node, c):
        color[node] = c
        for neighbor in graph[node]:
            if neighbor not in color:
                if not dfs(neighbor, 1 - c):
                    return False
            elif color[neighbor] == c:
                return False
        return True
    
    for i in range(len(graph)):
        if i not in color:
            if not dfs(i, 0):
                return False
    
    return True

# Time: O(V + E)
# Space: O(V)
```

## BFS Coloring

```python
def is_bipartite_bfs(graph):
    color = {}
    
    for start in range(len(graph)):
        if start in color:
            continue
        
        queue = [start]
        color[start] = 0
        
        while queue:
            node = queue.pop(0)
            for neighbor in graph[node]:
                if neighbor not in color:
                    color[neighbor] = 1 - color[node]
                    queue.append(neighbor)
                elif color[neighbor] == color[node]:
                    return False
    
    return True

# Time: O(V + E)
# Space: O(V)
```

## Graph Coloring (k colors)

NP-complete in general, but solvable for small graphs.

```python
def graph_coloring(graph, k):
    color = [-1] * len(graph)
    
    def is_safe(node, c):
        for neighbor in graph[node]:
            if color[neighbor] == c:
                return False
        return True
    
    def solve(node):
        if node == len(graph):
            return True
        
        for c in range(k):
            if is_safe(node, c):
                color[node] = c
                if solve(node + 1):
                    return True
                color[node] = -1
        
        return False
    
    return solve(0)

# Time: O(k^V)
# Space: O(V)
```

## Applications

1. **Bipartite check** - Matching, flow problems
2. **Course scheduling** - Avoid conflicts
3. **Register allocation** - Compiler optimization
4. **Sudoku** - Constraint satisfaction
5. **Map coloring** - Geography problem

---

**Key:** Bipartite = 2-colorable with BFS/DFS. Graph coloring harder (NP-complete).

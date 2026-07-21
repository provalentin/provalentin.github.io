# Graph Fundamentals

**Read time:** 13 min | **Difficulty:** Medium | **Video:** 18 min

## Introduction

Graphs represent networks: social networks, maps, dependencies. Essential for interviews.

**Graph = Nodes (vertices) + Edges (connections)**

---

## Part 1: Graph Types

### Directed vs Undirected

**Directed:** Edges have direction (A → B)
```
    A → B
    ↓ ↗
    C
```

**Undirected:** Edges bidirectional (A — B)
```
    A — B
    | X |
    C — D
```

### Weighted vs Unweighted

**Weighted:** Edges have costs/distances
```
    A -5→ B
    2 ↘ ↙ 3
       C
```

**Unweighted:** All edges equal
```
    A → B
    ↓ ↗
    C
```

### Cyclic vs Acyclic

**Cyclic:** Has cycles (A→B→C→A)
**Acyclic:** No cycles (DAG = Directed Acyclic Graph)

---

## Part 2: Representation

### Adjacency List (Space-efficient)

```python
# Dictionary of lists
graph = {
    'A': ['B', 'C'],
    'B': ['C', 'D'],
    'C': ['D'],
    'D': []
}

# Access neighbors of A
neighbors = graph['A']  # ['B', 'C']
```

**Space:** O(V + E) where V=vertices, E=edges
**Time (get neighbors):** O(degree)

### Adjacency Matrix (Dense graphs)

```python
# 2D array: matrix[i][j] = 1 if edge exists
graph = [
    [0, 1, 1, 0],  # A→B, A→C
    [0, 0, 1, 1],  # B→C, B→D
    [0, 0, 0, 1],  # C→D
    [0, 0, 0, 0]   # D: no edges
]

# Check if A→B exists
has_edge = graph[0][1]  # 1 (true)
```

**Space:** O(V²)
**Time (get neighbors):** O(V)

### Edge List

```python
# List of edges
edges = [
    ('A', 'B'),
    ('A', 'C'),
    ('B', 'C'),
    ('B', 'D'),
    ('C', 'D')
]
```

**Space:** O(E)

---

## Part 3: Graph Traversal

### Depth-First Search (DFS)

```python
def dfs(graph, start):
    visited = set()
    result = []
    
    def explore(node):
        visited.add(node)
        result.append(node)
        
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                explore(neighbor)
    
    explore(start)
    return result

# Example
graph = {'A': ['B', 'C'], 'B': ['D'], 'C': [], 'D': []}
dfs(graph, 'A')  # ['A', 'B', 'D', 'C']
```

**Time:** O(V + E)
**Space:** O(V) for visited set

### Breadth-First Search (BFS)

```python
from collections import deque

def bfs(graph, start):
    visited = set([start])
    queue = deque([start])
    result = []
    
    while queue:
        node = queue.popleft()
        result.append(node)
        
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    
    return result

# Example
bfs(graph, 'A')  # ['A', 'B', 'C', 'D']
```

**Time:** O(V + E)
**Space:** O(V) for queue

---

## Part 4: Common Problems

### Connected Components

Count number of separate components.

```python
def count_components(graph, n):
    visited = set()
    count = 0
    
    def dfs(node):
        visited.add(node)
        for neighbor in graph.get(node, []):
            if neighbor not in visited:
                dfs(neighbor)
    
    for i in range(n):
        if i not in visited:
            dfs(i)
            count += 1
    
    return count
```

### Cycle Detection

```python
def has_cycle_directed(graph):
    # 0: unvisited, 1: visiting, 2: visited
    state = {}
    
    def dfs(node):
        state[node] = 1
        
        for neighbor in graph.get(node, []):
            if neighbor not in state:
                if dfs(neighbor):
                    return True
            elif state[neighbor] == 1:  # Back edge
                return True
        
        state[node] = 2
        return False
    
    for node in graph:
        if node not in state:
            if dfs(node):
                return True
    
    return False
```

### Topological Sort

Order nodes so dependencies come first (for DAGs only).

```python
def topo_sort(graph, n):
    in_degree = [0] * n
    adj = [[] for _ in range(n)]
    
    # Build graph
    for u in graph:
        for v in graph[u]:
            adj[u].append(v)
            in_degree[v] += 1
    
    # Find nodes with no dependencies
    queue = deque([i for i in range(n) if in_degree[i] == 0])
    result = []
    
    while queue:
        node = queue.popleft()
        result.append(node)
        
        for neighbor in adj[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    
    return result if len(result) == n else []  # [] if cycle exists
```

---

## When to Use

| Type | Best For |
|------|----------|
| Adjacency List | Sparse graphs, most problems |
| Adjacency Matrix | Dense graphs, checking edges |
| DFS | Path finding, cycle detection |
| BFS | Shortest path, level-order |

---

## Common Mistakes

1. **Forgetting visited set:** Creates infinite loops
2. **Wrong traversal:** DFS for shortest path won't work
3. **Graph representation mismatch:** Choose right representation

---

## Problems to Practice

1. Number of Islands
2. Course Schedule (topological sort)
3. Clone Graph
4. Alien Dictionary
5. Reconstruct Itinerary

---

**Key takeaway:** Graphs are trees + cycles. Master traversal, cycle detection, and topological sort.

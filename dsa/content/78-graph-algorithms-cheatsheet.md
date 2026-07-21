# Advanced DSA: Graph Algorithms Cheat Sheet

**Read time:** 10 min | **Reference:** Yes

## Graph Representations

### Adjacency List (Most Common)

```python
graph = {
    0: [1, 2],
    1: [0, 3],
    2: [0, 3],
    3: [1, 2]
}

Space: O(V + E)
Time to check edge (0,1): O(degree)
```

### Adjacency Matrix

```python
graph = [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [1, 0, 0, 1],
    [0, 1, 1, 0]
]

Space: O(V²)
Time to check edge (0,1): O(1)
```

## Traversals

### DFS (Depth-First Search)

```python
def dfs(node, visited, graph):
    visited.add(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(neighbor, visited, graph)

# Usage
visited = set()
dfs(0, visited, graph)

Time: O(V + E)
Space: O(V) for recursion stack
```

### BFS (Breadth-First Search)

```python
from collections import deque

def bfs(start, graph):
    visited = {start}
    queue = deque([start])
    
    while queue:
        node = queue.popleft()
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)

Time: O(V + E)
Space: O(V) for queue
```

## Shortest Path

### Dijkstra's Algorithm (Weighted, Non-negative)

```python
import heapq

def dijkstra(start, graph):
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    pq = [(0, start)]  # (distance, node)
    
    while pq:
        current_dist, current = heapq.heappop(pq)
        
        if current_dist > distances[current]:
            continue
        
        for neighbor, weight in graph[current]:
            distance = current_dist + weight
            
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(pq, (distance, neighbor))
    
    return distances

Time: O((V + E) log V) with min-heap
Space: O(V)
```

### Bellman-Ford (Weighted, Can have negative)

```python
def bellman_ford(start, edges, vertices):
    distances = {v: float('inf') for v in vertices}
    distances[start] = 0
    
    # Relax edges V-1 times
    for _ in range(vertices - 1):
        for u, v, weight in edges:
            if distances[u] + weight < distances[v]:
                distances[v] = distances[u] + weight
    
    # Check for negative cycle
    for u, v, weight in edges:
        if distances[u] + weight < distances[v]:
            return None  # Negative cycle detected
    
    return distances

Time: O(VE)
Space: O(V)
Use when: Negative weights possible
```

### BFS for Unweighted

```python
def bfs_shortest(start, graph):
    distances = {start: 0}
    queue = deque([start])
    
    while queue:
        node = queue.popleft()
        for neighbor in graph[node]:
            if neighbor not in distances:
                distances[neighbor] = distances[node] + 1
                queue.append(neighbor)
    
    return distances

Time: O(V + E)
Space: O(V)
```

## Minimum Spanning Tree

### Kruskal's (Edge-based, with Union-Find)

```python
def kruskal(edges, vertices):
    uf = UnionFind(vertices)
    edges.sort(key=lambda x: x[2])  # Sort by weight
    mst = []
    
    for u, v, weight in edges:
        if uf.union(u, v):  # Not in same component
            mst.append((u, v, weight))
            if len(mst) == vertices - 1:
                break
    
    return mst

Time: O(E log E) for sorting
Space: O(V)
```

### Prim's (Vertex-based, with Priority Queue)

```python
def prim(start, graph):
    visited = {start}
    edges = [(weight, start, neighbor) 
             for neighbor, weight in graph[start]]
    heapq.heapify(edges)
    mst_weight = 0
    mst_edges = []
    
    while edges:
        weight, u, v = heapq.heappop(edges)
        
        if v in visited:
            continue
        
        visited.add(v)
        mst_weight += weight
        mst_edges.append((u, v, weight))
        
        for neighbor, w in graph[v]:
            if neighbor not in visited:
                heapq.heappush(edges, (w, v, neighbor))
    
    return mst_edges, mst_weight

Time: O((V + E) log V)
Space: O(V)
```

## Cycle Detection

### Undirected Graph (DFS)

```python
def has_cycle(graph, n):
    visited = [False] * n
    
    def dfs(node, parent):
        visited[node] = True
        for neighbor in graph[node]:
            if not visited[neighbor]:
                if dfs(neighbor, node):
                    return True
            elif neighbor != parent:  # Back edge
                return True
        return False
    
    for i in range(n):
        if not visited[i]:
            if dfs(i, -1):
                return True
    return False

Time: O(V + E)
```

### Directed Graph (DFS with Colors)

```python
def has_cycle_directed(graph, n):
    colors = [0] * n  # 0=white, 1=gray, 2=black
    
    def dfs(node):
        colors[node] = 1  # Gray (visiting)
        for neighbor in graph[node]:
            if colors[neighbor] == 1:  # Back edge
                return True
            if colors[neighbor] == 0:
                if dfs(neighbor):
                    return True
        colors[node] = 2  # Black (visited)
        return False
    
    for i in range(n):
        if colors[i] == 0:
            if dfs(i):
                return True
    return False

Time: O(V + E)
```

## Topological Sort

```python
def topological_sort(graph, vertices):
    in_degree = [0] * vertices
    adj = [[] for _ in range(vertices)]
    
    for u in graph:
        for v in graph[u]:
            adj[u].append(v)
            in_degree[v] += 1
    
    queue = [i for i in range(vertices) if in_degree[i] == 0]
    result = []
    
    while queue:
        u = queue.pop(0)
        result.append(u)
        for v in adj[u]:
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)
    
    return result if len(result) == vertices else []

Time: O(V + E)
Space: O(V)
```

## Graph Search Comparison

| Algorithm | Best Use | Time | Space |
|-----------|----------|------|-------|
| DFS | All paths, topological | O(V+E) | O(V) |
| BFS | Shortest path (unweighted) | O(V+E) | O(V) |
| Dijkstra | Shortest path (non-negative) | O((V+E)logV) | O(V) |
| Bellman-Ford | Shortest path (negative ok) | O(VE) | O(V) |
| Kruskal | MST | O(ElogE) | O(V) |
| Prim | MST | O((V+E)logV) | O(V) |

## Interview Checklist

```
✓ Identify graph type (directed, weighted, etc)
✓ Choose representation (adjacency list vs matrix)
✓ Pick appropriate algorithm
✓ Implement efficiently
✓ Handle edge cases (disconnected, cycles, etc)
✓ Analyze time and space complexity
✓ Test with examples
```

---

**Next:** Math and number theory for interviews.

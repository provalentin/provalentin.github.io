# Advanced DSA: Topological Sort & DFS Applications

**Read time:** 11 min | **Difficulty:** Hard

## Topological Sort

Ordering for directed acyclic graph (DAG):

```
Dependency graph:
A → B → D
A → C → D

Topological order:
[A, B, C, D] or [A, C, B, D]

Property: Every edge goes left to right
```

### Applications

```
Task scheduling:
├─ Task A before Task B
├─ Task B before Task D
└─ Find valid order

Course prerequisites:
├─ Must take CS101 before CS201
├─ Must take CS201 before CS301
└─ Schedule courses

Compiler dependency resolution:
└─ Include files in correct order
```

### Kahn's Algorithm (BFS)

```python
def topological_sort(graph, vertices):
    in_degree = [0] * vertices
    adj = [[] for _ in range(vertices)]
    
    # Build graph
    for u in graph:
        for v in graph[u]:
            adj[u].append(v)
            in_degree[v] += 1
    
    # Find vertices with no incoming edges
    queue = [i for i in range(vertices) if in_degree[i] == 0]
    result = []
    
    while queue:
        u = queue.pop(0)
        result.append(u)
        
        # Remove edges from u
        for v in adj[u]:
            in_degree[v] -= 1
            if in_degree[v] == 0:
                queue.append(v)
    
    return result if len(result) == vertices else []  # [] if cycle
```

### DFS-Based Approach

```python
def topological_sort_dfs(graph, vertices):
    visited = [False] * vertices
    stack = []
    
    def dfs(v):
        visited[v] = True
        for u in graph.get(v, []):
            if not visited[u]:
                dfs(u)
        stack.append(v)  # Add after visiting all descendants
    
    for i in range(vertices):
        if not visited[i]:
            dfs(i)
    
    return stack[::-1]  # Reverse to get topological order
```

## Cycle Detection

```
Graph:
A → B → C
    ↑   ↓
    ←←←

Cycle detected: A → B → C → B

Algorithm:
During DFS, track:
├─ WHITE (unvisited)
├─ GRAY (visiting, in current path)
└─ BLACK (visited)

If visit GRAY node: Cycle!
```

### Implementation

```python
def has_cycle(graph, vertices):
    color = [0] * vertices  # 0=white, 1=gray, 2=black
    
    def dfs(v):
        color[v] = 1  # Mark gray (visiting)
        
        for u in graph.get(v, []):
            if color[u] == 1:  # Back edge (cycle)
                return True
            if color[u] == 0 and dfs(u):  # Recursively check
                return True
        
        color[v] = 2  # Mark black (visited)
        return False
    
    for i in range(vertices):
        if color[i] == 0:
            if dfs(i):
                return True
    
    return False
```

## Strongly Connected Components (SCC)

Connected subset where every vertex reachable from every other:

```
Graph:
A ← → B
↓     ↓
C ← → D

SCCs:
{A, B, D, C}  (all connected)

Or:
A → B ← C
↓   ↓   ↑
D ←→ E

SCCs:
{A}, {B}, {C}, {D, E}
```

### Kosaraju's Algorithm

```python
def kosaraju(graph, vertices):
    # Step 1: Fill stack by finish time
    visited = [False] * vertices
    stack = []
    
    def dfs1(v):
        visited[v] = True
        for u in graph.get(v, []):
            if not visited[u]:
                dfs1(u)
        stack.append(v)
    
    for i in range(vertices):
        if not visited[i]:
            dfs1(i)
    
    # Step 2: Create transpose graph
    transpose = [[] for _ in range(vertices)]
    for u in graph:
        for v in graph[u]:
            transpose[v].append(u)
    
    # Step 3: DFS on transpose in reverse stack order
    visited = [False] * vertices
    sccs = []
    
    def dfs2(v, component):
        visited[v] = True
        component.append(v)
        for u in transpose[v]:
            if not visited[u]:
                dfs2(u, component)
    
    while stack:
        v = stack.pop()
        if not visited[v]:
            component = []
            dfs2(v, component)
            sccs.append(component)
    
    return sccs
```

## DFS Applications

### Finding Path

```python
def find_path(graph, start, end):
    visited = set()
    path = []
    
    def dfs(v):
        if v in visited:
            return False
        visited.add(v)
        path.append(v)
        
        if v == end:
            return True
        
        for u in graph.get(v, []):
            if dfs(u):
                return True
        
        path.pop()  # Backtrack
        return False
    
    if dfs(start):
        return path
    return None
```

### All Paths

```python
def all_paths(graph, start, end):
    paths = []
    path = []
    visited = set()
    
    def dfs(v):
        visited.add(v)
        path.append(v)
        
        if v == end:
            paths.append(path[:])
        else:
            for u in graph.get(v, []):
                if u not in visited:
                    dfs(u)
        
        path.pop()
        visited.remove(v)
    
    dfs(start)
    return paths
```

### Connected Components

```python
def connected_components(graph, vertices):
    visited = [False] * vertices
    components = []
    
    def dfs(v, component):
        visited[v] = True
        component.append(v)
        for u in graph.get(v, []):
            if not visited[u]:
                dfs(u, component)
    
    for i in range(vertices):
        if not visited[i]:
            component = []
            dfs(i, component)
            components.append(component)
    
    return components
```

## Interview Tips

✓ Explain topological sort use cases
✓ Implement both Kahn's and DFS versions
✓ Detect cycles in directed graph
✓ Find SCCs when asked
✓ Trace through example
✓ Discuss time complexity O(V+E)

❌ Don't confuse with undirected graphs
❌ Don't forget cycle detection
❌ Don't skip backtracking in path finding
❌ Don't confuse BFS and DFS use cases

---

**Next:** Union-Find (Disjoint Set Union).

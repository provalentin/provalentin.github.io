# Advanced Graph Algorithms

**Read time:** 14 min | **Difficulty:** Hard | **Video:** 20 min

## Tarjan's Algorithm (Strongly Connected Components)

Find groups of nodes that reach each other.

```python
def tarjan_scc(graph):
    index_counter = [0]
    stack = []
    lowlink = {}
    index = {}
    on_stack = set()
    sccs = []
    
    def strongconnect(node):
        index[node] = index_counter[0]
        lowlink[node] = index_counter[0]
        index_counter[0] += 1
        stack.append(node)
        on_stack.add(node)
        
        for neighbor in graph[node]:
            if neighbor not in index:
                strongconnect(neighbor)
                lowlink[node] = min(lowlink[node], lowlink[neighbor])
            elif neighbor in on_stack:
                lowlink[node] = min(lowlink[node], index[neighbor])
        
        if lowlink[node] == index[node]:
            scc = []
            while True:
                w = stack.pop()
                on_stack.discard(w)
                scc.append(w)
                if w == node:
                    break
            sccs.append(scc)
    
    for node in graph:
        if node not in index:
            strongconnect(node)
    
    return sccs

# Time: O(V + E)
# Space: O(V)
```

## Kruskal's Algorithm (Minimum Spanning Tree)

```python
def kruskal(edges, n):
    uf = UnionFind(n)
    edges.sort(key=lambda x: x[2])  # Sort by weight
    
    mst = []
    for u, v, w in edges:
        if uf.find(u) != uf.find(v):
            uf.union(u, v)
            mst.append((u, v, w))
    
    return mst

# Time: O(E log E)
# Space: O(V)
```

## Prim's Algorithm (MST)

```python
def prim(graph, start):
    visited = set([start])
    edges = []
    mst = []
    
    for neighbor, weight in graph[start]:
        edges.append((weight, start, neighbor))
    
    heapq.heapify(edges)
    
    while edges and len(visited) < len(graph):
        weight, u, v = heapq.heappop(edges)
        if v not in visited:
            visited.add(v)
            mst.append((u, v, weight))
            
            for neighbor, w in graph[v]:
                if neighbor not in visited:
                    heapq.heappush(edges, (w, v, neighbor))
    
    return mst

# Time: O(E log V)
# Space: O(V)
```

---

**Key:** SCC for directed graphs, MST with Kruskal or Prim.

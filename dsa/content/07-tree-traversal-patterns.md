# Tree Traversal Patterns

**Read time:** 14 min | **Difficulty:** Easy-Medium | **Video:** 19 min

## Advanced Traversal Techniques

### DFS (Depth-First Search)

**Recursive (Cleaner):**
```python
def dfs(node, target, path=[]):
    if not node:
        return None
    
    path.append(node.value)
    
    if node.value == target:
        return path
    
    left = dfs(node.left, target, path[:])
    if left:
        return left
    
    return dfs(node.right, target, path[:])
```

**Iterative (Stack-based):**
```python
def dfs_iterative(root, target):
    stack = [(root, [root.value])]
    
    while stack:
        node, path = stack.pop()
        
        if node.value == target:
            return path
        
        if node.right:
            stack.append((node.right, path + [node.right.value]))
        if node.left:
            stack.append((node.left, path + [node.left.value]))
    
    return []
```

**Time:** O(n) | **Space:** O(h) recursive, O(n) iterative

### BFS (Breadth-First Search)

```python
from collections import deque

def bfs(root, target):
    queue = deque([(root, [root.value])])
    
    while queue:
        node, path = queue.popleft()
        
        if node.value == target:
            return path
        
        if node.left:
            queue.append((node.left, path + [node.left.value]))
        if node.right:
            queue.append((node.right, path + [node.right.value]))
    
    return []
```

**Time:** O(n) | **Space:** O(w) where w = max width

## Pattern 1: Path Finding

Find path from root to target node.

```python
def path_to_node(root, target):
    if not root:
        return None
    
    if root.value == target:
        return [root.value]
    
    left_path = path_to_node(root.left, target)
    if left_path:
        return [root.value] + left_path
    
    right_path = path_to_node(root.right, target)
    if right_path:
        return [root.value] + right_path
    
    return None
```

## Pattern 2: Range Sum Queries

Sum all nodes within value range.

```python
def range_sum(node, low, high):
    if not node:
        return 0
    
    # Prune: node outside range
    if node.value < low or node.value > high:
        if node.value < low:
            return range_sum(node.right, low, high)
        else:
            return range_sum(node.left, low, high)
    
    # Node in range
    return (node.value + 
            range_sum(node.left, low, high) + 
            range_sum(node.right, low, high))
```

## Pattern 3: Vertical Order

Get nodes in vertical order (column-wise).

```python
def vertical_order(root):
    if not root:
        return []
    
    columns = defaultdict(list)
    queue = deque([(root, 0)])  # (node, column)
    
    while queue:
        node, col = queue.popleft()
        columns[col].append(node.value)
        
        if node.left:
            queue.append((node.left, col - 1))
        if node.right:
            queue.append((node.right, col + 1))
    
    return [columns[col] for col in sorted(columns)]
```

## Key Interview Tips

1. **Choose traversal wisely:**
   - DFS: Find path, check if exists
   - BFS: Shortest path, level-order

2. **Track state in recursion:**
   - Path to current node
   - Constraints (min/max values)
   - Parent node reference

3. **Common patterns:**
   - Validate subtree property
   - Find LCA efficiently
   - Reconstruct tree from traversals

## Problems to Practice

### Easy
1. Path Sum
2. Find Leaves of Binary Tree
3. Same Tree Pair

### Medium
1. Vertical Order Traversal
2. Path Sum II
3. Inorder Successor

### Hard
1. Binary Tree Maximum Path Sum
2. Serialize/Deserialize Binary Tree
3. Maximum Sum of Subarray with Boundary

---

**Key takeaway:** Most tree problems use DFS with recursion. Master the pattern, adapt to problem needs.

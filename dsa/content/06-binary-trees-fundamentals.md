# Binary Trees Fundamentals

**Read time:** 15 min | **Difficulty:** Easy-Medium | **Video:** 20 min

## Introduction

Trees are hierarchical data structures. Binary trees are the foundation for interviews.

Unlike arrays (linear) or linked lists (sequential), trees organize data hierarchically. This enables:
- O(log n) searching (vs O(n) arrays)
- Efficient hierarchical data modeling
- Interview gold (20% of problems)

---

## Part 1: Tree Basics

### Terminology

```
        1 (root)
       / \
      2   3 (children of 1)
     / \   \
    4   5   6 (leaf nodes)
    
- Root: Top node (1)
- Parent: Node with children (1 is parent of 2,3)
- Child: Node with parent (2 is child of 1)
- Leaf: Node with no children (4, 5, 6)
- Height: Longest path from node to leaf
- Depth: Distance from root to node
- Subtree: Tree formed by a node and descendants
```

### Binary Tree Definition

```python
class TreeNode:
    def __init__(self, value):
        self.value = value
        self.left = None      # Left child
        self.right = None     # Right child
```

### Types of Binary Trees

**Full Binary Tree:** Every node has 0 or 2 children
```
      1
     / \
    2   3
   / \
  4   5
```

**Complete Binary Tree:** All levels filled except last (left-aligned)
```
      1
     / \
    2   3
   / \ /
  4  5 6
```

**Perfect Binary Tree:** All internal nodes have 2 children, all leaves at same level
```
      1
     / \
    2   3
   / \ / \
  4  5 6  7
```

**Balanced Binary Tree:** Height difference between left/right ≤ 1
```
      1
     / \
    2   3
   / \
  4   5
  
Height from 2: 2 (to 4 or 5)
Height from 3: 1 (leaf)
Difference: 1 → Balanced ✓
```

---

## Part 2: Traversal Techniques

### 1. Inorder (Left → Root → Right)

```python
def inorder(node):
    if not node:
        return []
    
    result = []
    result.extend(inorder(node.left))    # Go left
    result.append(node.value)             # Process root
    result.extend(inorder(node.right))   # Go right
    
    return result

# Tree:   1
#        / \
#       2   3
#
# Inorder: [2, 1, 3]
```

**Property:** For BST, inorder gives sorted order!

### 2. Preorder (Root → Left → Right)

```python
def preorder(node):
    if not node:
        return []
    
    result = []
    result.append(node.value)              # Process root
    result.extend(preorder(node.left))    # Go left
    result.extend(preorder(node.right))   # Go right
    
    return result

# Tree:   1
#        / \
#       2   3
#
# Preorder: [1, 2, 3]
```

**Use case:** Copying tree, evaluating expression

### 3. Postorder (Left → Right → Root)

```python
def postorder(node):
    if not node:
        return []
    
    result = []
    result.extend(postorder(node.left))   # Go left
    result.extend(postorder(node.right))  # Go right
    result.append(node.value)              # Process root
    
    return result

# Tree:   1
#        / \
#       2   3
#
# Postorder: [2, 3, 1]
```

**Use case:** Deleting tree, postfix evaluation

### 4. Level Order (BFS)

```python
from collections import deque

def level_order(root):
    if not root:
        return []
    
    result = []
    queue = deque([root])
    
    while queue:
        node = queue.popleft()
        result.append(node.value)
        
        if node.left:
            queue.append(node.left)
        if node.right:
            queue.append(node.right)
    
    return result

# Tree:   1
#        / \
#       2   3
#      / \
#     4   5
#
# Level order: [1, 2, 3, 4, 5]
```

---

## Part 3: Common Properties

### Tree Height

```python
def height(node):
    if not node:
        return 0
    
    return 1 + max(height(node.left), height(node.right))

# Returns: 1 (leaf) + longest subtree
```

### Tree Diameter

Distance between two farthest nodes.

```python
def diameter(node):
    # Returns (height, diameter)
    if not node:
        return 0, 0
    
    left_height, left_diameter = diameter(node.left)
    right_height, right_diameter = diameter(node.right)
    
    # Diameter at current node
    current_diameter = left_height + right_height
    
    # Overall diameter
    overall_diameter = max(left_diameter, right_diameter, current_diameter)
    
    return 1 + max(left_height, right_height), overall_diameter
```

### Is Balanced

```python
def is_balanced(node):
    if not node:
        return True, 0  # (balanced, height)
    
    left_balanced, left_height = is_balanced(node.left)
    if not left_balanced:
        return False, 0
    
    right_balanced, right_height = is_balanced(node.right)
    if not right_balanced:
        return False, 0
    
    # Check height difference
    if abs(left_height - right_height) > 1:
        return False, 0
    
    height = 1 + max(left_height, right_height)
    return True, height
```

---

## Part 4: Key Problems

### 1. Maximum Path Sum

**Problem:** Find maximum sum of path (can go through any nodes).

```python
def max_path_sum(node):
    def helper(node):
        if not node:
            return float('-inf'), float('-inf')
        
        if not node.left and not node.right:
            return node.value, node.value
        
        left_max, left_path = helper(node.left)
        right_max, right_path = helper(node.right)
        
        # Max path ending at this node
        current_path = node.value + max(0, left_path) + max(0, right_path)
        
        # Max so far
        current_max = max(left_max, right_max, current_path)
        
        # Max path starting from this node (for parent)
        extend_path = node.value + max(0, left_path, right_path)
        
        return current_max, extend_path
    
    return helper(node)[0]
```

**Time:** O(n) — visit each node once
**Space:** O(h) — recursion depth

### 2. Lowest Common Ancestor (LCA)

**Problem:** Find lowest node that's ancestor of both p and q.

```python
def lca(node, p, q):
    if not node or node == p or node == q:
        return node
    
    left = lca(node.left, p, q)
    right = lca(node.right, p, q)
    
    if left and right:
        return node  # Both in different subtrees
    
    return left if left else right  # Both in same subtree
```

**Time:** O(n)
**Space:** O(h)

---

## Part 5: Complexity Analysis

| Operation | Time | Space |
|-----------|------|-------|
| Search (unbalanced) | O(n) | O(h) |
| Search (balanced) | O(log n) | O(log n) |
| Insert | O(n) → O(log n) | O(h) |
| Delete | O(n) → O(log n) | O(h) |
| Traversal | O(n) | O(h) |
| Build tree | O(n) | O(n) |

**h = height, n = number of nodes**

---

## Interview Tips

### 1. Clarify Tree Type
- Is it a BST? (affects solution)
- Is it balanced? (affects complexity)
- Parent pointers available? (affects LCA)

### 2. Test Edge Cases
- Empty tree (null root)
- Single node
- Skewed tree (like linked list)
- Perfect vs unbalanced

### 3. Recursion is Your Friend

Most tree problems use recursion:
```python
def solve(node):
    if not node:
        return base_case
    
    left_result = solve(node.left)
    right_result = solve(node.right)
    
    return combine(left_result, right_result, node.value)
```

### 4. Think in Terms of Subtrees

Don't think "global" — think "what does this node know about its subtrees?"

---

## Common Mistakes

1. **Forgetting base case:** Always check `if not node`
2. **Modifying tree during traversal:** Creates bugs
3. **Wrong return value:** Return height or diameter from recursion
4. **Not handling skewed trees:** Worst case is O(n)

---

## Problems to Practice

### Easy
1. Maximum Depth
2. Invert Binary Tree
3. Same Tree
4. Symmetric Tree
5. Path Sum

### Medium
1. Binary Tree Level Order Traversal
2. Lowest Common Ancestor
3. Maximum Path Sum
4. Diameter of Binary Tree
5. Balanced Binary Tree

### Hard
1. Serialize/Deserialize BST
2. Maximum Path Sum
3. Vertical Order Traversal

---

## Key Takeaways

1. **Four traversals:** Inorder, preorder, postorder, level-order
2. **Recursion power:** Most tree problems solved recursively
3. **Heights matter:** Track heights for diameter, balance checks
4. **BST property:** Inorder gives sorted order
5. **Balance critical:** Affects search time O(n) vs O(log n)

---

## Next Steps

Master tree traversals, then move to **Tree Traversal Patterns** for advanced techniques.

**Video:** 20-min walkthrough of tree structure, all four traversals, and common problems.

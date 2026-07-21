# Binary Search Trees (BST)

**Read time:** 13 min | **Difficulty:** Medium | **Video:** 18 min

## BST Property

Left subtree < Node < Right subtree

```
      5
     / \
    3   7
   / \ / \
  2  4 6  8
  
BST: 2 < 3 < 4 < 5 < 6 < 7 < 8 (inorder is sorted!)
```

## Search

```python
def search_bst(node, val):
    if not node:
        return None
    
    if val == node.val:
        return node
    elif val < node.val:
        return search_bst(node.left, val)
    else:
        return search_bst(node.right, val)
        
# Time: O(log n) avg, O(n) worst
```

## Insert

```python
def insert_bst(node, val):
    if not node:
        return TreeNode(val)
    
    if val < node.val:
        node.left = insert_bst(node.left, val)
    else:
        node.right = insert_bst(node.right, val)
    
    return node
```

## Delete

Most complex operation:

```python
def delete_bst(node, val):
    if not node:
        return None
    
    if val < node.val:
        node.left = delete_bst(node.left, val)
    elif val > node.val:
        node.right = delete_bst(node.right, val)
    else:
        # Found node to delete
        if not node.left:
            return node.right
        if not node.right:
            return node.left
        
        # Both children exist
        # Find inorder successor (smallest in right subtree)
        min_node = find_min(node.right)
        node.val = min_node.val
        node.right = delete_bst(node.right, min_node.val)
    
    return node
```

## Validate BST

```python
def is_valid_bst(node, min_val=float('-inf'), max_val=float('inf')):
    if not node:
        return True
    
    if node.val <= min_val or node.val >= max_val:
        return False
    
    return (is_valid_bst(node.left, min_val, node.val) and
            is_valid_bst(node.right, node.val, max_val))
```

## Key Operations

| Operation | Balanced | Unbalanced |
|-----------|----------|-----------|
| Search | O(log n) | O(n) |
| Insert | O(log n) | O(n) |
| Delete | O(log n) | O(n) |
| Inorder | O(n) | O(n) |

## Common Problems

1. Validate Binary Search Tree
2. Kth Smallest Element in BST
3. Lowest Common Ancestor
4. BST Iterator
5. Serialize/Deserialize BST

---

**Key:** Inorder traversal gives sorted order!

# Linked Lists Fundamentals

**Read time:** 11 min | **Difficulty:** Easy | **Video:** 16 min

## Introduction

Arrays are contiguous. Linked lists are not.

Instead of storing elements next to each other in memory, linked lists use **pointers** to chain elements together. This fundamental difference creates different trade-offs.

**When to use linked lists:**
- Don't know size beforehand
- Frequent insertions/deletions at beginning
- Don't need random access

**When arrays are better:**
- Need O(1) access by index
- Memory efficiency matters
- Simple iteration preferred

---

## Part 1: Linked List Structure

### Node Definition

A linked list is made of **nodes**. Each node has:
- **Data:** The value stored
- **Next pointer:** Reference to next node

```python
class Node:
    def __init__(self, value):
        self.value = value      # Data
        self.next = None        # Pointer to next node
```

### Singly Linked List

Each node points to the next node. Last node points to `None`.

```
1 -> 2 -> 3 -> 4 -> None
^                     
head (entry point)
```

```python
class LinkedList:
    def __init__(self):
        self.head = None

# Create a simple list: 1 -> 2 -> 3
head = Node(1)
head.next = Node(2)
head.next.next = Node(3)
head.next.next.next = None

# Visual:
# head -> [1|next] -> [2|next] -> [3|None]
```

### Doubly Linked List

Each node has **two pointers:** to next and previous nodes.

```python
class DNode:
    def __init__(self, value):
        self.value = value
        self.next = None
        self.prev = None
```

```
None <- 1 <-> 2 <-> 3 -> None
        ^              
        head
```

**When to use:**
- Need backward traversal
- LRU cache (O(1) removal requires prev pointer)
- Playlist (next/previous track)

---

## Part 2: Basic Operations

### 1. Traversal

Visit each node from head to end.

```python
def traverse(head):
    current = head
    
    while current is not None:  # O(n)
        print(current.value)    # Process node
        current = current.next
    
    return

# Example: 1 -> 2 -> 3 -> None
# Output:
# 1
# 2
# 3
```

**Time:** O(n) — visit each node once
**Space:** O(1) — only use one pointer

### 2. Search

Find node with specific value.

```python
def search(head, target):
    current = head
    
    while current is not None:  # O(n)
        if current.value == target:
            return current      # Found
        current = current.next
    
    return None                 # Not found

# Example: search(head, 2) in 1 -> 2 -> 3
# Returns node with value 2
```

**Time:** O(n) — worst case check all nodes
**Space:** O(1)

### 3. Insertion at Beginning

Add new node at the start. Most efficient operation for linked lists.

```python
def insert_at_beginning(head, value):
    new_node = Node(value)
    new_node.next = head        # Point new node to old head
    return new_node             # New node becomes head

# Example: Insert 0 into 1 -> 2 -> 3
# Before: 1 -> 2 -> 3 -> None
# After:  0 -> 1 -> 2 -> 3 -> None
#         ^
#         new_head
```

**Time:** O(1) — constant operations
**Space:** O(1)

**Key difference from arrays:** Inserting at beginning of array is O(n) (shift all). Linked list is O(1)!

### 4. Insertion at Position

Insert node at specific index.

```python
def insert_at_position(head, value, position):
    if position == 0:
        return insert_at_beginning(head, value)
    
    current = head
    
    # Navigate to position - 1
    for _ in range(position - 1):
        if current is None:
            return head  # Invalid position
        current = current.next
    
    if current is None:
        return head  # Invalid position
    
    # Insert: new_node.next -> current.next
    #         current.next -> new_node
    new_node = Node(value)
    new_node.next = current.next
    current.next = new_node
    
    return head

# Example: Insert 2.5 at position 2 into 1 -> 2 -> 3 -> None
# Navigate to position 1 (node with value 2)
# Relink: 2.next -> 2.5, 2.5.next -> 3
# Result: 1 -> 2 -> 2.5 -> 3 -> None
```

**Time:** O(n) — need to traverse to position
**Space:** O(1)

### 5. Deletion

Remove node with specific value.

```python
def delete_node(head, value):
    # Special case: deleting head
    if head is not None and head.value == value:
        return head.next
    
    current = head
    
    while current is not None and current.next is not None:
        if current.next.value == value:
            current.next = current.next.next  # Skip deleted node
            return head
        current = current.next
    
    return head  # Not found

# Example: Delete 2 from 1 -> 2 -> 3 -> None
# Find node before 2 (node 1)
# Relink: 1.next -> 3
# Result: 1 -> 3 -> None
```

**Time:** O(n) — may need to search entire list
**Space:** O(1)

**Visual:**
```
Before:  1 -> 2 -> 3 -> None
                ^
            current.next (to be deleted)
                   |
                   v
After:   1 -----> 3 -> None
         (2 is unreachable, garbage collected)
```

### 6. Reverse

Reverse the entire linked list.

```python
def reverse(head):
    prev = None
    current = head
    
    while current is not None:
        # Store next node before changing pointers
        next_temp = current.next
        
        # Reverse the link: current.next -> prev instead of next
        current.next = prev
        
        # Move pointers forward
        prev = current
        current = next_temp
    
    return prev  # New head

# Visual trace: 1 -> 2 -> 3 -> None
# Step 1: None <- 1   2 -> 3 -> None
# Step 2: None <- 1 <- 2   3 -> None
# Step 3: None <- 1 <- 2 <- 3
# Result: 3 -> 2 -> 1 -> None (prev points to 3)
```

**Time:** O(n) — visit each node once
**Space:** O(1) — only three pointers

---

## Part 3: Important Problems

### Detect Cycle

**Problem:** Determine if linked list has a cycle.

**Approach:** Floyd's cycle detection (slow and fast pointers).

```python
def has_cycle(head):
    slow = head       # Move 1 step at a time
    fast = head       # Move 2 steps at a time
    
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
        
        if slow == fast:  # They met -> cycle detected
            return True
    
    return False  # Reached end without meeting

# Visual:
# Cycle:    1 -> 2 -> 3
#           ^         |
#           |_________|
#
# slow starts at 1
# fast starts at 1
# fast reaches 3, slow at 2
# fast reaches 2, slow at 1
# fast reaches 3, slow at 2
# fast reaches 2, slow at 3
# fast reaches 3, slow at 2
# ...eventually they meet
```

**Time:** O(n) — fast pointer covers distance in at most n/2 moves
**Space:** O(1) — no extra space

**Why this works:** In a cycle, fast pointer will eventually "lap" slow pointer. They'll meet before fast completes full cycle.

### Merge Two Sorted Lists

**Problem:** Merge two sorted linked lists into one sorted list.

```python
def merge_sorted_lists(l1, l2):
    dummy = Node(0)  # Dummy node simplifies logic
    current = dummy
    
    # Compare nodes from each list
    while l1 is not None and l2 is not None:
        if l1.value <= l2.value:
            current.next = l1
            l1 = l1.next
        else:
            current.next = l2
            l2 = l2.next
        current = current.next
    
    # Attach remaining nodes
    if l1 is not None:
        current.next = l1
    else:
        current.next = l2
    
    return dummy.next  # Skip dummy

# Example:
# l1: 1 -> 3 -> 5 -> None
# l2: 2 -> 4 -> 6 -> None
# Result: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> None
```

**Time:** O(n + m) — visit each node once
**Space:** O(1) — rearrange pointers, no new nodes

### Find Middle of Linked List

**Problem:** Find middle node of linked list.

**Approach:** Slow and fast pointers again.

```python
def find_middle(head):
    slow = head
    fast = head
    
    # Move fast by 2, slow by 1
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
    
    return slow  # Middle node

# Example: 1 -> 2 -> 3 -> 4 -> 5 -> None
# Iteration 1: slow=1, fast=3
# Iteration 2: slow=2, fast=5
# Iteration 3: fast=None, stop
# slow at 3 (middle)
#
# For even length: 1 -> 2 -> 3 -> 4 -> None
# slow stops at 3 (just after middle)
```

**Time:** O(n) — fast covers in n/2 moves
**Space:** O(1)

### Palindrome Linked List

**Problem:** Check if linked list is palindrome.

```python
def is_palindrome(head):
    # Step 1: Find middle using slow/fast pointers
    slow = head
    fast = head
    
    while fast is not None and fast.next is not None:
        slow = slow.next
        fast = fast.next.next
    
    # Step 2: Reverse second half
    second_half = reverse(slow)
    
    # Step 3: Compare first half and reversed second half
    first = head
    second = second_half
    
    while second is not None:  # second is shorter or equal
        if first.value != second.value:
            return False
        first = first.next
        second = second.next
    
    return True

# Example: 1 -> 2 -> 3 -> 2 -> 1 -> None
# Middle at 3
# Reverse second half: 3 -> 2 -> 1 -> None -> 1 -> 2 -> 3 -> None
# Compare: 1==1, 2==2, 3==3 -> True
```

**Time:** O(n) — find middle O(n), reverse O(n), compare O(n)
**Space:** O(1) — only pointers

---

## Part 4: Linked List vs Array

| Operation | Linked List | Array |
|-----------|------------|-------|
| Access by index | O(n) | O(1) |
| Insert at start | O(1) | O(n) |
| Insert at position | O(n) | O(n) |
| Delete at start | O(1) | O(n) |
| Delete at position | O(n) | O(n) |
| Search | O(n) | O(n) |
| Space | O(n) + pointer overhead | O(n) |

**When linked list wins:** Insertion/deletion at beginning (O(1) vs O(n)).
**When array wins:** Random access (O(1) vs O(n)).

---

## Part 5: Common Pitfalls

### 1. Null Pointer Errors

Most common mistake: accessing `.next` on None.

```python
# WRONG
current = head
print(current.next.value)  # ERROR if current is None

# RIGHT
if current is not None:
    print(current.next.value)

# Or in loops
while current is not None and current.next is not None:
    # Safe to access current.next.next
```

### 2. Lost References

Creating cycles accidentally:

```python
# WRONG: Creates cycle
node1 = Node(1)
node2 = Node(2)
node1.next = node2
node2.next = node1  # node1 and node2 point to each other -> infinite cycle

# RIGHT: Linear list
node1.next = node2
node2.next = None
```

### 3. Forgetting to Update Head

When inserting at beginning, return new head:

```python
# WRONG: head doesn't change
def insert_beginning(head, value):
    new_node = Node(value)
    new_node.next = head
    # BUG: forgot to return new_node

# RIGHT
def insert_beginning(head, value):
    new_node = Node(value)
    new_node.next = head
    return new_node  # Important!
```

### 4. Dangling Pointers

After deletion, other references to deleted node become invalid:

```python
# Example: If other code holds reference to deleted node
current = head
to_delete = current.next
current.next = current.next.next  # Delete node

# If someone else still has reference to to_delete,
# it's now orphaned (though still in memory until garbage collected)
```

---

## Interview Patterns

### Pattern 1: Two Pointers (Slow/Fast)
- Cycle detection
- Find middle
- Start of cycle
- Remove Nth from end

### Pattern 2: Dummy Node
- Merge lists
- Reverse lists
- Remove nodes
- (Simplifies edge cases)

### Pattern 3: Reversal
- Check palindrome
- Reverse pairs
- Reorder list

---

## Interview Checklist

- [ ] Drew the linked list structure (boxes and arrows)
- [ ] Tested with empty list (head=None)
- [ ] Tested with single node
- [ ] Handled null pointers correctly
- [ ] Updated head when needed
- [ ] Used dummy node for edge cases
- [ ] Explained time and space complexity
- [ ] Discussed trade-offs vs arrays

---

## Problems to Practice

### Easy
1. Reverse Linked List
2. Merge Two Sorted Lists
3. Linked List Cycle
4. Find Middle of Linked List
5. Remove Duplicates From Sorted List

### Medium
1. Palindrome Linked List
2. Remove Nth Node From End
3. Reorder List
4. Flatten Multilevel Doubly Linked List
5. Rotate List

### Hard
1. LRU Cache (uses doubly linked list + hash map)
2. Copy List With Random Pointer
3. Reverse Nodes In K Group

---

## Key Takeaways

1. **Structure:** Nodes with value and next pointer
2. **Operations:** O(1) insertion/deletion at beginning, O(n) elsewhere
3. **Two pointers:** Powerful for cycle detection, finding middle
4. **Dummy node:** Simplifies edge cases (head manipulation)
5. **Reversal:** Common pattern, practice the algorithm

---

## Next Steps

You now understand linked lists. Practice deletion, insertion, and reversal until they're automatic.

Then move to **Stacks & Queues** — both built on linked lists!

**Video walkthrough:** 16-min video showing list operations, visual trace of cycle detection, and middle finding.

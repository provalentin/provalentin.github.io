# Stacks & Queues

**Read time:** 12 min | **Difficulty:** Easy-Medium | **Video:** 17 min

## Introduction

Stacks and queues are **linear data structures** with restricted access patterns.

- **Stack:** LIFO (Last-In-First-Out) — like a plate stack
- **Queue:** FIFO (First-In-First-Out) — like a line at checkout

You've likely used these without realizing: browser history (stack), task scheduling (queue).

---

## Part 1: Stacks (LIFO)

### The Idea

Insert and remove from the **same end** (top).

```
Stack:  [1, 2, 3]
              ^
              top (push/pop here)
```

**Real-world examples:**
- Browser back button (LIFO)
- Function call stack (execution)
- Undo/redo (LIFO)
- Expression evaluation (1 + 2) * 3)

### Implementation

**Option 1: Using List (Simple)**

```python
class Stack:
    def __init__(self):
        self.items = []
    
    def push(self, value):
        """Add to top"""
        self.items.append(value)           # O(1) amortized
    
    def pop(self):
        """Remove from top"""
        if not self.is_empty():
            return self.items.pop()         # O(1)
        return None
    
    def peek(self):
        """View top without removing"""
        if not self.is_empty():
            return self.items[-1]           # O(1)
        return None
    
    def is_empty(self):
        return len(self.items) == 0         # O(1)
    
    def size(self):
        return len(self.items)              # O(1)

# Usage
stack = Stack()
stack.push(1)       # [1]
stack.push(2)       # [1, 2]
stack.push(3)       # [1, 2, 3]
print(stack.pop())  # 3, stack now [1, 2]
print(stack.peek()) # 2
```

**Option 2: Using Linked List (Also O(1))**

```python
class StackNode:
    def __init__(self, value):
        self.value = value
        self.next = None

class Stack:
    def __init__(self):
        self.top = None
    
    def push(self, value):
        new_node = StackNode(value)
        new_node.next = self.top
        self.top = new_node                 # O(1)
    
    def pop(self):
        if self.top is None:
            return None
        value = self.top.value
        self.top = self.top.next             # O(1)
        return value
```

**Comparison:**
| Operation | List | Linked List |
|-----------|------|-------------|
| Push | O(1) amortized | O(1) |
| Pop | O(1) | O(1) |
| Peek | O(1) | O(1) |
| Space | n + extra capacity | n + pointers |

For interviews: Use list (simpler). Both are O(1).

### Key Problems

#### 1. Valid Parentheses

**Problem:** Check if brackets are balanced and properly nested.

```
"()" -> True
"()[]{}" -> True
"(]" -> False
"([)]" -> False (wrong nesting order)
```

**Approach:** Use stack to track opening brackets.

```python
def is_valid(s):
    stack = []
    matching = {'(': ')', '[': ']', '{': '}'}
    
    for char in s:
        if char in matching:           # Opening bracket
            stack.append(char)          # Push to stack
        else:                          # Closing bracket
            if not stack:               # No matching opening
                return False
            if matching[stack.pop()] != char:  # Check match
                return False
    
    return len(stack) == 0              # All opened brackets closed

# Example: "()"
# char='(': stack=['(']
# char=')': pop '(', matching['(']=')', ')' == ')' ✓
# stack empty -> True

# Example: "([)]"
# char='(': stack=['(']
# char='[': stack=['(', '[']
# char=')': pop '[', matching['[']=']}', ')' != ']' ✗ -> False
```

**Time:** O(n) — single pass
**Space:** O(n) — stack holds up to n characters

#### 2. Min Stack

**Problem:** Implement stack that supports O(1) min query.

**Naive approach:** O(n) to find min.

**Smart approach:** Maintain second stack of minimums.

```python
class MinStack:
    def __init__(self):
        self.stack = []          # Main stack
        self.min_stack = []      # Track minimums
    
    def push(self, value):
        self.stack.append(value)
        
        # If new minimum, add to min_stack
        if not self.min_stack or value <= self.min_stack[-1]:
            self.min_stack.append(value)
    
    def pop(self):
        value = self.stack.pop()
        
        # If popped value is current minimum, pop from min_stack
        if value == self.min_stack[-1]:
            self.min_stack.pop()
        
        return value
    
    def get_min(self):
        return self.min_stack[-1] if self.min_stack else None

# Example: push 3, 1, 4, 1, 5
# stack: [3, 1, 4, 1, 5]
# min_stack: [3, 1, 1]
# After pop(): stack [3, 1, 4, 1], min_stack [3, 1]
# get_min() -> 1
```

**Time:** O(1) for all operations
**Space:** O(n) for both stacks

**Key insight:** Don't need to store every element in min_stack, only when it's a new minimum.

---

## Part 2: Queues (FIFO)

### The Idea

Insert at **rear**, remove from **front**.

```
Queue: [1, 2, 3]
       ^      ^
     front   rear
     (remove) (add)
```

**Real-world examples:**
- Checkout line (first person served first)
- Print queue (first job printed first)
- Message processing (handle in order)

### Implementation

**Option 1: Using List (Inefficient)**

```python
from collections import deque

class Queue:
    def __init__(self):
        self.items = []
    
    def enqueue(self, value):
        self.items.append(value)            # O(1)
    
    def dequeue(self):
        if not self.is_empty():
            return self.items.pop(0)        # O(n) - shift all!
        return None
    
    def peek(self):
        if not self.is_empty():
            return self.items[0]            # O(1)
        return None

# Problem: pop(0) shifts all elements O(n)!
```

**Option 2: Using Deque (Better)**

Python's `deque` (double-ended queue) is optimized for O(1) removal from front.

```python
from collections import deque

class Queue:
    def __init__(self):
        self.items = deque()
    
    def enqueue(self, value):
        self.items.append(value)            # O(1)
    
    def dequeue(self):
        if self.items:
            return self.items.popleft()     # O(1)
        return None
    
    def peek(self):
        if self.items:
            return self.items[0]            # O(1)
        return None
    
    def is_empty(self):
        return len(self.items) == 0

# Usage
q = Queue()
q.enqueue(1)
q.enqueue(2)
q.enqueue(3)
print(q.dequeue())  # 1
print(q.peek())     # 2
```

**Option 3: Using Linked List**

```python
class QueueNode:
    def __init__(self, value):
        self.value = value
        self.next = None

class Queue:
    def __init__(self):
        self.front = None
        self.rear = None
    
    def enqueue(self, value):
        new_node = QueueNode(value)
        
        if not self.rear:           # Empty queue
            self.front = self.rear = new_node
        else:
            self.rear.next = new_node
            self.rear = new_node                # O(1)
    
    def dequeue(self):
        if not self.front:
            return None
        
        value = self.front.value
        self.front = self.front.next
        
        if not self.front:          # Queue now empty
            self.rear = None
        
        return value                            # O(1)
```

**Comparison:**
| Operation | List | Deque | Linked List |
|-----------|------|-------|-------------|
| Enqueue | O(1) | O(1) | O(1) |
| Dequeue | O(n) | O(1) | O(1) |
| Space | n | n | n + pointers |

**For interviews:** Use `deque` (simple and O(1)). Or use linked list if they ask to implement from scratch.

### Key Problems

#### 1. Moving Average from Data Stream

**Problem:** Calculate moving average of last k elements as new elements arrive.

```python
from collections import deque

class MovingAverage:
    def __init__(self, size):
        self.size = size
        self.queue = deque()
        self.sum = 0
    
    def next(self, val):
        # Add new value
        self.queue.append(val)
        self.sum += val
        
        # Remove oldest if window full
        if len(self.queue) > self.size:
            self.sum -= self.queue.popleft()
        
        # Return average
        return self.sum / len(self.queue)

# Example: size = 3
# next(1): queue=[1], sum=1, avg=1/1=1
# next(3): queue=[1,3], sum=4, avg=4/2=2
# next(3): queue=[1,3,3], sum=7, avg=7/3=2.33
# next(4): queue=[3,3,4], sum=10, avg=10/3=3.33 (1 removed)
```

**Time:** O(1) per call
**Space:** O(k) — queue holds at most k elements

#### 2. Implement Queue Using Stacks

**Problem:** Use two stacks to implement queue.

**Idea:** Use one stack for input, one for output. Transfer when output is empty.

```python
class MyQueue:
    def __init__(self):
        self.input_stack = []
        self.output_stack = []
    
    def push(self, x):
        self.input_stack.append(x)          # O(1)
    
    def pop(self):
        self.peek()  # Ensure output_stack filled
        return self.output_stack.pop()      # O(1) amortized
    
    def peek(self):
        # Transfer from input to output if needed
        if not self.output_stack:
            while self.input_stack:
                self.output_stack.append(self.input_stack.pop())
        
        return self.output_stack[-1]
    
    def empty(self):
        return not self.input_stack and not self.output_stack

# Example: push(1, 2, 3)
# input_stack: [1, 2, 3]
# output_stack: []
# 
# pop():
#   Transfer: output_stack: [3, 2, 1], input_stack: []
#   Return 1
# output_stack: [3, 2]
```

**Time:** O(1) amortized (each element moves once from input to output)
**Space:** O(n) for two stacks

---

## Part 3: Stack vs Queue

| Feature | Stack | Queue |
|---------|-------|-------|
| Access order | LIFO | FIFO |
| Use case | Undo/redo, expression | Task scheduling, BFS |
| Peek element | Top | Front |
| Add location | Top | Rear |
| Remove location | Top | Front |

---

## Part 4: When to Use

### Use Stack When
- Need LIFO ordering (undo/redo)
- Matching pairs (brackets, tags)
- DFS or recursion simulation
- Expression evaluation
- Backtracking problems

### Use Queue When
- Need FIFO ordering
- BFS (breadth-first search)
- Level-order traversal of trees
- Message processing (in order)
- Rate limiting or task scheduling

---

## Interview Patterns

### Pattern 1: Monotonic Stack
Used to find next greater/smaller element efficiently.

```python
# Find next greater element
def next_greater(arr):
    stack = []
    result = [-1] * len(arr)
    
    for i in range(len(arr) - 1, -1, -1):
        # Pop smaller elements
        while stack and arr[stack[-1]] <= arr[i]:
            stack.pop()
        
        # Remaining top is next greater
        if stack:
            result[i] = arr[stack[-1]]
        
        stack.append(i)
    
    return result

# Example: [1, 3, 2, 4]
# Answer: [3, 4, 4, -1]
```

### Pattern 2: Deque for Sliding Window Maximum

```python
from collections import deque

def max_sliding_window(arr, k):
    dq = deque()
    result = []
    
    for i in range(len(arr)):
        # Remove elements outside window
        while dq and dq[0] < i - k + 1:
            dq.popleft()
        
        # Remove smaller elements (they won't be max)
        while dq and arr[dq[-1]] <= arr[i]:
            dq.pop()
        
        dq.append(i)
        
        if i >= k - 1:
            result.append(arr[dq[0]])
    
    return result

# Example: arr = [1,3,-1,-3,5,3,6,7], k=3
# Answer: [3,3,5,5,6,7]
```

---

## Common Pitfalls

### 1. Empty Check
Always check before peek/pop:

```python
# WRONG
stack.pop()  # May raise IndexError

# RIGHT
if not stack.is_empty():
    stack.pop()
```

### 2. Queue with List
Using `list.pop(0)` is O(n). Use `deque` instead.

```python
# SLOW
queue = []
queue.append(1)
queue.pop(0)  # O(n)

# FAST
from collections import deque
queue = deque()
queue.append(1)
queue.popleft()  # O(1)
```

### 3. Forgetting About Rear in Queue
When using linked list queue, update both front and rear:

```python
# WRONG
def dequeue(self):
    self.front = self.front.next
    # Forgot to update rear!

# RIGHT
def dequeue(self):
    self.front = self.front.next
    if not self.front:
        self.rear = None  # Important!
```

---

## Interview Checklist

- [ ] Chose right implementation (deque for queue, list for stack)
- [ ] Tested with empty structure
- [ ] Tested with single element
- [ ] Explained when to use stack vs queue
- [ ] Discussed time and space complexity
- [ ] Handled edge cases (empty pop/dequeue)
- [ ] Verified LIFO/FIFO behavior

---

## Problems to Practice

### Easy
1. Valid Parentheses
2. Implement Queue Using Stacks
3. Implement Stack Using Queues
4. Min Stack
5. Backspace String Compare

### Medium
1. Evaluate Reverse Polish Notation
2. Daily Temperatures
3. Trapping Rain Water II
4. Sliding Window Maximum
5. Largest Rectangle in Histogram

### Hard
1. Skyline Problem
2. Maximal Rectangle
3. LRU Cache (queue + hash map)

---

## Key Takeaways

1. **Stack:** LIFO, O(1) push/pop, use for matching and undo
2. **Queue:** FIFO, O(1) enqueue/dequeue with deque, use for BFS and scheduling
3. **Deque:** Use for queues (avoid list.pop(0))
4. **Monotonic patterns:** Stack for next greater, deque for sliding window
5. **Always check empty** before accessing

---

## Next Steps

You now understand both fundamental structures. Next up: **Hash Maps** — the key to O(1) lookups.

**Video walkthrough:** 17-min video showing stack operations, queue mechanics, and live trace of valid parentheses problem.

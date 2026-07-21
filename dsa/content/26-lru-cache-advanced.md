# LRU Cache (Advanced Data Structure)

**Read time:** 12 min | **Difficulty:** Hard | **Video:** 18 min

## LRU Cache Design

Combine hash map + doubly linked list for O(1) operations.

```python
class Node:
    def __init__(self, key, value):
        self.key = key
        self.value = value
        self.prev = None
        self.next = None

class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {}  # key -> Node
        self.head = Node(0, 0)  # Dummy head
        self.tail = Node(0, 0)  # Dummy tail
        self.head.next = self.tail
        self.tail.prev = self.head
    
    def add_to_head(self, node):
        """Add node right after head (most recent)"""
        node.prev = self.head
        node.next = self.head.next
        self.head.next.prev = node
        self.head.next = node
    
    def remove_node(self, node):
        """Remove node from linked list"""
        node.prev.next = node.next
        node.next.prev = node.prev
    
    def get(self, key):
        if key not in self.cache:
            return -1
        
        node = self.cache[key]
        self.remove_node(node)
        self.add_to_head(node)
        
        return node.value  # O(1)
    
    def put(self, key, value):
        if key in self.cache:
            node = self.cache[key]
            node.value = value
            self.remove_node(node)
            self.add_to_head(node)
        else:
            if len(self.cache) == self.capacity:
                # Remove least recently used (before tail)
                lru_node = self.tail.prev
                self.remove_node(lru_node)
                del self.cache[lru_node.key]
            
            new_node = Node(key, value)
            self.cache[key] = new_node
            self.add_to_head(new_node)  # O(1)

# Time: O(1) for all operations
# Space: O(capacity)
```

## Why This Design

| Data Structure | Get | Put | Delete |
|---|---|---|---|
| Array | O(1) | O(n) | O(n) |
| Hash Map | O(1) | O(1) | O(1) - no order |
| Linked List | O(n) | O(n) | O(1) - but find slow |
| **Hash Map + DLL** | **O(1)** | **O(1)** | **O(1)** |

---

**Key:** Combine data structures for optimal performance.
